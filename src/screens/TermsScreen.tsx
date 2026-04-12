import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermsScreen() {
  const navigate = useNavigate()

  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-teal" />
          <h1 className="text-base font-bold text-gray-900">Terms of Service</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-8 text-gray-700">

        {/* Intro */}
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Effective date: 12 April 2026 &nbsp;·&nbsp; Version 1.0</p>
          <p className="text-sm leading-relaxed">
            These Terms of Service ("Terms") govern your access to and use of WellNest ("the Service"),
            operated at <span className="font-medium text-brand-teal">wellnest.zakapedia.in</span>.
            By accessing or using the Service, you agree to be legally bound by these Terms. If you do
            not agree, you must discontinue use of the Service immediately.
          </p>
        </div>

        {/* Medical Disclaimer Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 space-y-1">
          <p className="text-sm font-bold text-amber-800">Important Medical Disclaimer</p>
          <p className="text-sm text-amber-700 leading-relaxed">
            WellNest is a personal health record management and wellness tracking application. It is{' '}
            <strong>not</strong> a licensed medical device, clinical diagnostic tool, or substitute for
            professional medical advice, diagnosis, or treatment. The information and AI-generated
            insights within this application are provided for informational and organisational purposes
            only and must not be relied upon as medical guidance. Always consult a qualified and
            registered healthcare professional before making any medical decision. In the event of a
            medical emergency, contact your local emergency services immediately — do not rely on
            this application.
          </p>
        </div>

        <Section title="1. Description of Service">
          <p>
            WellNest is a personal health management platform that enables users to record and track
            medications, symptoms, appointments, lab reports, imaging results, dietary compliance,
            exercise, and lifestyle metrics. It provides AI-assisted analysis of health data for
            personal reference and facilitates controlled sharing with authorised family members
            and healthcare professionals.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>
            To use the Service, you must be at least 13 years of age. Users between the ages of 13
            and 18 may only use the Service under the supervision of a parent or legal guardian, who
            accepts these Terms on their behalf. By using the Service, you represent and warrant that
            you meet these requirements.
          </p>
        </Section>

        <Section title="3. Account Responsibilities">
          <ul className="list-disc list-inside space-y-1.5">
            <li>You are solely responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You agree to provide accurate, current, and complete information during registration and to keep it updated.</li>
            <li>You must notify us immediately at <a href="mailto:info@zakapedia.in" className="text-brand-teal font-medium">info@zakapedia.in</a> if you suspect any unauthorised access to or use of your account.</li>
            <li>You may not share your account with or transfer it to any other person.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
          </ul>
        </Section>

        <Section title="4. Health Data and Ownership">
          <ul className="list-disc list-inside space-y-1.5">
            <li>You retain full ownership of all health and personal data you enter into the Service.</li>
            <li>You are solely responsible for the accuracy and completeness of information you record.</li>
            <li>WellNest does not verify, validate, or endorse the accuracy of any health data you enter.</li>
            <li>You may export or request deletion of your data at any time in accordance with our Privacy Policy.</li>
          </ul>
        </Section>

        <Section title="5. AI-Generated Content">
          <p>
            Certain features of the Service use artificial intelligence to generate visit preparations,
            report summaries, medication insights, and health scores. You acknowledge that:
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2">
            <li>AI-generated content is informational only and does not constitute medical advice.</li>
            <li>Such content may contain inaccuracies, omissions, or errors and should always be reviewed by a qualified healthcare professional.</li>
            <li>WellNest makes no warranties regarding the accuracy, completeness, or fitness for purpose of AI-generated outputs.</li>
          </ul>
        </Section>

        <Section title="6. Sharing with Family and Healthcare Professionals">
          <p>
            The Service allows you to invite family members and doctors to view portions of your
            health profile. By using this feature:
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2">
            <li>You expressly consent to the data sections you permit being accessible to the invited person.</li>
            <li>You are solely responsible for verifying the identity of individuals you invite.</li>
            <li>You may revoke any granted access at any time through the Family or Doctor settings in the app.</li>
            <li>WellNest is not responsible for any actions taken by authorised contacts based on data they access.</li>
          </ul>
        </Section>

        <Section title="7. Acceptable Use">
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc list-inside space-y-1.5 mt-2">
            <li>Violate any applicable local, national, or international law or regulation.</li>
            <li>Attempt to gain unauthorised access to any other user's data or the Service's infrastructure.</li>
            <li>Upload, transmit, or distribute malicious code, viruses, or harmful software.</li>
            <li>Misrepresent your identity or affiliation when inviting others to access your health data.</li>
            <li>Use the Service in any manner that could disable, overburden, or impair its operation.</li>
          </ul>
        </Section>

        <Section title="8. Intellectual Property">
          <p>
            All content, design, software, and technology underlying the Service — excluding your
            personal health data — is the intellectual property of WellNest and is protected by
            applicable copyright, trademark, and other laws. You may not reproduce, distribute, or
            create derivative works from any part of the Service without our express written consent.
          </p>
        </Section>

        <Section title="9. Service Availability and Modifications">
          <p>
            We strive to maintain continuous availability of the Service but do not guarantee
            uninterrupted access. We reserve the right to modify, suspend, or discontinue any part
            of the Service at any time, with or without notice. We shall not be liable to you or any
            third party for any modification, suspension, or discontinuation of the Service.
          </p>
        </Section>

        <Section title="10. Disclaimer of Warranties">
          <p>
            The Service is provided on an "as is" and "as available" basis without warranties of any
            kind, either express or implied. We expressly disclaim all warranties, including but not
            limited to implied warranties of merchantability, fitness for a particular purpose, and
            non-infringement. We do not warrant that the Service will be error-free, secure, or
            continuously available.
          </p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p>
            To the fullest extent permitted by applicable law, WellNest and its operators, directors,
            and contributors shall not be liable for any indirect, incidental, special, consequential,
            or punitive damages arising from or related to your use of or inability to use the Service,
            including but not limited to health decisions made in reliance on information or
            AI-generated content within the application, even if advised of the possibility of such damages.
          </p>
        </Section>

        <Section title="12. Governing Law">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India,
            without regard to its conflict of law principles. Any disputes arising under these Terms
            shall be subject to the exclusive jurisdiction of the courts located in India.
          </p>
        </Section>

        <Section title="13. Changes to These Terms">
          <p>
            We reserve the right to revise these Terms at any time. Revised Terms will be posted with
            an updated effective date. Your continued use of the Service following the posting of
            revised Terms constitutes your acceptance. We will provide notice of material changes
            through the application.
          </p>
        </Section>

        <Section title="14. Contact Us">
          <p>
            For questions, concerns, or legal notices regarding these Terms of Service, please contact:
          </p>
          <div className="mt-3 bg-gray-50 rounded-2xl px-5 py-4 space-y-1">
            <p className="text-sm font-bold text-gray-800">WellNest — Legal</p>
            <a href="mailto:info@zakapedia.in" className="text-sm text-brand-teal font-medium">info@zakapedia.in</a>
            <p className="text-sm text-gray-500">wellnest.zakapedia.in</p>
          </div>
        </Section>

        <p className="text-xs text-gray-400 text-center pt-4 border-t border-gray-100">
          © {new Date().getFullYear()} WellNest. All rights reserved.
        </p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      <div className="text-sm leading-relaxed space-y-2">{children}</div>
    </div>
  )
}
