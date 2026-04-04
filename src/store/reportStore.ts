import { create } from 'zustand'
import type { LabReport, LabParameter} from '@/types/report.types'
import { getLabReports } from '@/services/supabase'

interface ReportState {
  labReports: LabReport[]
  imagingReports: any[]
  selectedReport: LabReport | null
  loading: boolean
  error: string | null
}

interface ReportActions {
  fetchLabReports: (patientId: string) => Promise<void>
  fetchImagingReports: (patientId: string) => Promise<void>
  uploadLabReport: (patientId: string, file: File) => Promise<void>
  uploadImagingReport: (patientId: string, file: File) => Promise<void>
  selectReport: (report: LabReport | null) => void
  deleteReport: (reportId: string) => Promise<void>
}

type ReportStore = ReportState & ReportActions

export const useReportStore = create<ReportStore>((set) => ({
  labReports: [],
  imagingReports: [],
  selectedReport: null,
  loading: false,
  error: null,

  fetchLabReports: async (patientId) => {
    set({ loading: true, error: null })
    try {
      const reports = await getLabReports(patientId)
      set({ labReports: reports })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load lab reports' })
    } finally {
      set({ loading: false })
    }
  },

  fetchImagingReports: async (patientId) => {
    set({ loading: true, error: null })
    try {
      // TODO: Implement fetch from supabase
      // const reports = await getImagingReports(patientId)
      // set({ imagingReports: reports })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load imaging reports' })
    } finally {
      set({ loading: false })
    }
  },

  uploadLabReport: async (patientId, file) => {
    set({ loading: true, error: null })
    try {
      // TODO: Implement lab report upload with Claude processing
      // 1. Upload file to storage
      // 2. Call detect-report-type edge function
      // 3. Call process-lab-report edge function
      // 4. Store results in lab_reports and lab_parameters tables
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to upload lab report' })
    } finally {
      set({ loading: false })
    }
  },

  uploadImagingReport: async (patientId, file) => {
    set({ loading: true, error: null })
    try {
      // TODO: Implement imaging report upload with Claude processing
      // 1. Upload file to storage
      // 2. Call detect-report-type edge function
      // 3. Call process-imaging-report edge function
      // 4. Store results in imaging_reports and imaging_findings tables
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to upload imaging report' })
    } finally {
      set({ loading: false })
    }
  },

  selectReport: (report) => {
    set({ selectedReport: report })
  },

  deleteReport: async (reportId) => {
    set({ loading: true, error: null })
    try {
      // TODO: Implement delete from supabase
      set((state) => ({
        labReports: state.labReports.filter((r) => r.id !== reportId),
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete report' })
    } finally {
      set({ loading: false })
    }
  },
}))
