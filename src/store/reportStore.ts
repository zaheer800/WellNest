import { create } from 'zustand'
import type { LabReport } from '@/types/report.types'
import {
  getLabReports,
  getImagingReports,
  getLabParameters,
  getImagingFindings,
  insertLabReport,
  updateLabReport,
  insertLabParameters,
  insertImagingReport,
  updateImagingReport,
  insertImagingFindings,
} from '@/services/supabase'
import { processLabReport } from '@/services/labReportParser'
import { processImagingReport } from '@/services/imagingReportParser'
import { checkCriticalValues } from '@/services/criticalValueChecker'
import { supabase, invokeFunction } from '@/services/supabase'

export type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'failed' | 'rate_limited'

interface ReportState {
  labReports: any[]
  imagingReports: any[]
  selectedReport: any | null
  selectedParameters: any[]
  selectedFindings: any[]
  criticalParameters: any[]
  loading: boolean
  processingStatus: ProcessingStatus
  processingError: string | null
}

interface ReportActions {
  fetchLabReports: (patientId: string) => Promise<void>
  fetchImagingReports: (patientId: string) => Promise<void>
  processReport: (patientId: string, fileUrl: string, pipeline: 'lab' | 'imaging', userAge?: number, userGender?: string, filePath?: string) => Promise<void>
  selectReport: (report: any | null) => void
  fetchReportDetails: (reportId: string, pipeline: 'lab' | 'imaging') => Promise<void>
  deleteReport: (reportId: string, pipeline: 'lab' | 'imaging') => Promise<void>
  clearProcessingState: () => void
}

type ReportStore = ReportState & ReportActions

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const useReportStore = create<ReportStore>((set, get) => ({
  labReports: [],
  imagingReports: [],
  selectedReport: null,
  selectedParameters: [],
  selectedFindings: [],
  criticalParameters: [],
  loading: false,
  processingStatus: 'idle',
  processingError: null,

  fetchLabReports: async (patientId) => {
    set({ loading: true })
    try {
      const reports = await getLabReports(patientId)
      set({ labReports: reports })
    } finally {
      set({ loading: false })
    }
  },

  fetchImagingReports: async (patientId) => {
    set({ loading: true })
    try {
      const reports = await getImagingReports(patientId)
      set({ imagingReports: reports })
    } finally {
      set({ loading: false })
    }
  },

  processReport: async (patientId, fileUrl, pipeline, userAge, userGender, filePath) => {
    set({ processingStatus: 'processing', processingError: null, criticalParameters: [] })
    const today = new Date().toISOString().split('T')[0]

    if (pipeline === 'lab') {
      // ── Step 1: create pending record ──────────────────────────────
      let reportRow: any
      try {
        reportRow = await insertLabReport({
          patient_id: patientId,
          report_date: today,
          report_type: 'pending',
          image_url: fileUrl,
          file_path: filePath,
          processing_status: 'processing',
        })
      } catch {
        set({ processingStatus: 'failed', processingError: 'Could not save report. Please try again.' })
        return
      }

      // ── Step 2: call process-lab-report (Sonnet — includes type detection) ──
      let parsed: Awaited<ReturnType<typeof processLabReport>>
      try {
        parsed = await processLabReport(reportRow.id, { fileUrl, age: userAge, gender: userGender })
      } catch (err: any) {
        await updateLabReport(reportRow.id, { processing_status: 'failed' })
        if (err?.message === 'RATE_LIMIT') {
          set({ processingStatus: 'rate_limited', processingError: 'Too many requests — please wait a minute and try again.' })
        } else if (err?.message === 'SESSION_EXPIRED') {
          set({ processingStatus: 'failed', processingError: 'Your session expired. Please sign out and sign in again, then retry.' })
        } else {
          set({ processingStatus: 'failed', processingError: 'We could not read this report automatically. Please enter values manually.' })
        }
        return
      }

      // ── Step 3: save parameters ─────────────────────────────────────
      const anomalyCount = parsed.parameters.filter((p) =>
        ['abnormal_low', 'abnormal_high', 'critical_low', 'critical_high'].includes(p.status)
      ).length

      try {
        await insertLabParameters(
          parsed.parameters.map((p) => ({
            report_id: reportRow.id,
            patient_id: patientId,
            report_date: today,
            parameter_name: p.parameter_name,
            parameter_category: p.category,
            value: p.value,
            unit: p.unit,
            reference_min: p.reference_min,
            reference_max: p.reference_max,
            status: p.status,
            plain_language_explanation: p.plain_language,
          }))
        )
      } catch {
        // Parameters failed but report exists — mark failed so user knows
        await updateLabReport(reportRow.id, { processing_status: 'failed' })
        set({ processingStatus: 'failed', processingError: 'Report processed but results could not be saved. Please try again.' })
        return
      }

      // ── Step 4: update report with final metadata ───────────────────
      await updateLabReport(reportRow.id, {
        report_type: parsed.detected_type,
        detected_type: parsed.detected_type,
        detection_confidence: parsed.detection_confidence,
        ai_summary: parsed.suggested_label,
        anomaly_count: anomalyCount,
        processing_status: 'completed',
        processed_at: new Date().toISOString(),
      })

      // Refresh lab reports list
      const updatedReports = await getLabReports(patientId)
      set({ labReports: updatedReports })

      // ── Step 5: check critical values (Haiku) — wait 12s to stay under 5 RPM ──
      const criticalParams = parsed.parameters.filter((p) =>
        p.status === 'critical_low' || p.status === 'critical_high'
      )
      if (criticalParams.length > 0) {
        await delay(12000)
        try {
          const criticalResult = await checkCriticalValues(patientId, reportRow.id, criticalParams as any)
          if (criticalResult.critical_found) {
            set({ criticalParameters: criticalResult.critical_parameters })
          }
        } catch {
          // Non-fatal — raw critical values are still shown via parameters
        }
      }

      // ── Step 6: generate condition connections (Haiku) — wait 12s ──────────
      if (parsed.parameters.length > 0) {
        await delay(12000)
        try {
          await invokeFunction('generate-condition-connections', {
            patient_id: patientId,
            all_findings: { lab_parameters: parsed.parameters },
            age: userAge,
            gender: userGender,
          })
        } catch {
          // Non-fatal
        }
      }

      set({ processingStatus: 'completed' })

    } else {
      // ── IMAGING pipeline ─────────────────────────────────────────────

      // ── Step 1: create pending record ──────────────────────────────
      let reportRow: any
      try {
        reportRow = await insertImagingReport({
          patient_id: patientId,
          report_date: today,
          imaging_type: 'pending',
          image_url: fileUrl,
          file_path: filePath,
          processing_status: 'processing',
        })
      } catch {
        set({ processingStatus: 'failed', processingError: 'Could not save report. Please try again.' })
        return
      }

      // ── Step 2: call process-imaging-report (Sonnet) ─────────────────
      let parsed: Awaited<ReturnType<typeof processImagingReport>>
      try {
        parsed = await processImagingReport(reportRow.id, { fileUrl, age: userAge, gender: userGender })
      } catch (err: any) {
        await updateImagingReport(reportRow.id, { processing_status: 'failed' })
        if (err?.message === 'RATE_LIMIT') {
          set({ processingStatus: 'rate_limited', processingError: 'Too many requests — please wait a minute and try again.' })
        } else if (err?.message === 'SESSION_EXPIRED') {
          set({ processingStatus: 'failed', processingError: 'Your session expired. Please sign out and sign in again, then retry.' })
        } else {
          set({ processingStatus: 'failed', processingError: 'We could not read this report automatically. Please try again.' })
        }
        return
      }

      // ── Step 3: save findings ────────────────────────────────────────
      try {
        await insertImagingFindings(
          parsed.abnormal_findings.map((f) => ({
            imaging_report_id: reportRow.id,
            patient_id: patientId,
            report_date: today,
            location: f.location,
            spinal_level: f.spinal_level,
            spinal_region: f.spinal_region,
            finding_type: f.finding_type,
            severity: f.severity,
            laterality: f.laterality,
            description: f.description,
            plain_language: f.plain_language,
            nerves_affected: f.nerves_affected,
            linked_symptoms: f.linked_symptoms,
          }))
        )
      } catch {
        await updateImagingReport(reportRow.id, { processing_status: 'failed' })
        set({ processingStatus: 'failed', processingError: 'Report processed but findings could not be saved. Please try again.' })
        return
      }

      // ── Step 4: update report ────────────────────────────────────────
      await updateImagingReport(reportRow.id, {
        imaging_type: parsed.imaging_type ?? parsed.detected_type,
        body_region: parsed.body_region,
        detected_type: parsed.detected_type,
        detection_confidence: parsed.detection_confidence,
        ai_summary: parsed.overall_summary,
        normal_findings: parsed.normal_findings,
        abnormal_findings: parsed.abnormal_findings,
        critical_findings: parsed.critical_findings,
        surgical_urgency: parsed.surgical_urgency,
        follow_up_recommended: parsed.follow_up_recommended,
        follow_up_timeline: parsed.follow_up_timeline,
        processing_status: 'completed',
        processed_at: new Date().toISOString(),
      })

      // Refresh imaging reports list
      const updatedReports = await getImagingReports(patientId)
      set({ imagingReports: updatedReports })

      // ── Step 5: generate condition connections (Haiku) — wait 12s ──
      await delay(12000)
      try {
        await supabase.functions.invoke('generate-condition-connections', {
          body: {
            patient_id: patientId,
            all_findings: { imaging_findings: parsed.abnormal_findings },
            age: userAge,
            gender: userGender,
          },
        })
      } catch {
        // Non-fatal
      }

      set({ processingStatus: 'completed' })
    }
  },

  selectReport: (report) => {
    set({ selectedReport: report, selectedParameters: [], selectedFindings: [] })
  },

  fetchReportDetails: async (reportId, pipeline) => {
    set({ loading: true })
    try {
      if (pipeline === 'lab') {
        const params = await getLabParameters(reportId)
        set({ selectedParameters: params })
      } else {
        const findings = await getImagingFindings(reportId)
        set({ selectedFindings: findings })
      }
    } finally {
      set({ loading: false })
    }
  },

  deleteReport: async (reportId, pipeline) => {
    const table = pipeline === 'lab' ? 'lab_reports' : 'imaging_reports'
    const { error } = await supabase.from(table).delete().eq('id', reportId)
    if (error) throw error
    if (pipeline === 'lab') {
      set((s) => ({ labReports: s.labReports.filter((r) => r.id !== reportId) }))
    } else {
      set((s) => ({ imagingReports: s.imagingReports.filter((r) => r.id !== reportId) }))
    }
  },

  clearProcessingState: () => {
    set({ processingStatus: 'idle', processingError: null, criticalParameters: [] })
  },
}))
