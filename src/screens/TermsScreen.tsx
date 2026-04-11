import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermsScreen() {
  const navigate = useNavigate()

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

        <div>
          <p className="text-xs text-gray-400 mb-1">Last updated: April 2026</p>
          <p className="text-sm leading-relaxed">
            Welcome to WellNest. By accessing or using WellNest at{' '}
            <span className="font-medium text-brand-teal">wellnest.zakapedia.in</span>, you agree
            to be bound by these Terms of Service. Please read them carefully.
          </p>
        </div>

        <Section title="1. About WellNest">
          <p>
            WellNest is a personal health management application that helps you track medications,
            symptoms, appointments, lab reports, and lifestyle metrics. It provides AI-assisted
            insights to help you understand your health data and communicate with your care team.
          </p>
          <p className="mt-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-amber-800">
            <strong>Medical Disclaimer:</strong> WellNest is not a medical device and does not
            provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare
            professional for medical decisions. Do not rely solely on WellNest in an emergency —
            call your local emergency services immediately.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>
            You must be at least 13 years old to use WellNest. By using the app, you confirm that
            you meet this requirement. If you are under 18, you should use WellNest only with the
            involvement of a parent or guardian.
          </p>
        </Section>

        <Section title="3. Your Account">
          <ul className="list-disc list-inside space-y-1.5">
            <li>You are responsible for maintaining the confidentiality of your account.</li>
            <li>You agree to provide accurate and current information during registration.</li>
            <li>You must notify us immediately if you suspect unauthorised access to your account.</li>
            <li>One person may not maintain multiple accounts.</li>
          </ul>
        </Section>

        <Section title="4. Health Data">
          <ul className="list-disc list-inside space-y-1.5">
            <li>You own all health data you enter into WellNest.</li>
            <li>You are responsible for the accuracy of information you enter.</li>
            <li>You control what data is shared with family members and doctors you invite.</li>
            <li>You may export or delete your data at any time through your profile settings.</li>
          </ul>
        </Section>

        <Section title="5. Sharing with Others">
          <p>
            WellNest allows you to invite family members and doctors to view portions of your health
            data. By sending an invite:
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2">
            <li>You consent to the invited person accessing the data sections you permit.</li>
            <li>You are responsible for ensuring invites are sent to the correct people.</li>
            <li>You can revoke any granted access at any time from the Family or Doctor screens.</li>
          </ul>
        </Section>

        <Section title="6. AI-Generated Content">
          <p>
            WellNest uses AI to generate visit preparations, report summaries, and health insights.
            These are informational aids only and:
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2">
            <li>Should not replace professional medical advice.</li>
            <li>May contain errors or omissions — always verify with your healthcare provider.</li>
            <li>Are generated based on the data you have entered and may not reflect your complete health picture.</li>
          </ul>
        </Section>

        <Section title="7. Acceptable Use">
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1.5 mt-2">
            <li>Use WellNest for any unlawful purpose.</li>
            <li>Attempt to gain unauthorised access to other users' data.</li>
            <li>Upload malicious code or interfere with the app's operation.</li>
            <li>Misrepresent your identity when inviting doctors or family members.</li>
          </ul>
        </Section>

        <Section title="8. Service Availability">
          <p>
            We aim to keep WellNest available at all times but do not guarantee uninterrupted
            access. We may perform maintenance, updates, or face outages beyond our control. We
            are not liable for any loss resulting from service unavailability.
          </p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, WellNest and its developers shall not be liable
            for any indirect, incidental, or consequential damages arising from your use of the
            application, including but not limited to health decisions made based on app content.
          </p>
        </Section>

        <Section title="10. Changes to Terms">
          <p>
            We may update these Terms from time to time. Continued use of WellNest after changes
            are posted constitutes your acceptance of the revised Terms. We will notify you of
            material changes via the app.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>For questions about these Terms, contact us at:</p>
          <div className="mt-2 bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-sm font-medium text-gray-800">WellNest Support</p>
            <p className="text-sm text-brand-teal mt-0.5">wellnest.zakapedia.in</p>
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
