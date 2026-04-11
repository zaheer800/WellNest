import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyScreen() {
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
          <Shield className="w-5 h-5 text-brand-teal" />
          <h1 className="text-base font-bold text-gray-900">Privacy Policy</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-8 text-gray-700">

        <div>
          <p className="text-xs text-gray-400 mb-1">Last updated: April 2026</p>
          <p className="text-sm leading-relaxed">
            WellNest ("we", "our", or "us") is committed to protecting your personal and health
            information. This Privacy Policy explains how we collect, use, store, and protect your
            data when you use the WellNest application at{' '}
            <span className="font-medium text-brand-teal">wellnest.zakapedia.in</span>.
          </p>
        </div>

        <Section title="1. Information We Collect">
          <p>We collect the following categories of information:</p>
          <ul className="list-disc list-inside space-y-1.5 mt-2">
            <li><strong>Account information:</strong> your name, email address, and profile details you provide during onboarding.</li>
            <li><strong>Health data:</strong> medications, water intake, symptoms, posture logs, exercise records, diet compliance, lab reports, imaging scans, and appointment records you voluntarily enter.</li>
            <li><strong>Usage data:</strong> app interactions, session timestamps, and device information for performance monitoring.</li>
            <li><strong>Emergency contacts:</strong> names and phone numbers of contacts you add for emergency SOS purposes.</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc list-inside space-y-1.5">
            <li>To provide, personalise, and improve the WellNest experience.</li>
            <li>To generate AI-powered health insights, visit preparations, and report summaries.</li>
            <li>To share health updates with family members or doctors you explicitly invite.</li>
            <li>To send reminders for medications, appointments, and follow-up tasks.</li>
            <li>To calculate your daily health score and track progress over time.</li>
          </ul>
        </Section>

        <Section title="3. Data Sharing">
          <p>
            We do <strong>not</strong> sell, rent, or trade your personal or health data to any third party.
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2">
            <li><strong>Family &amp; doctors:</strong> only the sections you explicitly permit are visible to people you invite. You can revoke access at any time.</li>
            <li><strong>AI processing:</strong> health data sent for AI analysis is processed via Anthropic's API and is not used to train third-party models.</li>
            <li><strong>Infrastructure:</strong> your data is stored securely in Supabase (PostgreSQL) with row-level security. No data leaves our infrastructure except as described above.</li>
          </ul>
        </Section>

        <Section title="4. Data Security">
          <p>We implement the following security measures:</p>
          <ul className="list-disc list-inside space-y-1.5 mt-2">
            <li>All data is encrypted in transit (HTTPS/TLS) and at rest.</li>
            <li>Authentication uses one-time passwords (OTP) and OAuth 2.0 — no passwords are stored.</li>
            <li>Row-level security policies ensure users can only access their own data.</li>
            <li>Doctors and family members access only the specific data you grant them.</li>
          </ul>
        </Section>

        <Section title="5. Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1.5 mt-2">
            <li><strong>Access</strong> all personal data we hold about you.</li>
            <li><strong>Correct</strong> inaccurate information via your Profile settings.</li>
            <li><strong>Delete</strong> your account and all associated data at any time.</li>
            <li><strong>Export</strong> your health records on request.</li>
            <li><strong>Revoke</strong> access granted to family members or doctors at any time.</li>
          </ul>
        </Section>

        <Section title="6. Data Retention">
          <p>
            Your data is retained for as long as your account is active. If you delete your account,
            all personal data is permanently removed within 30 days. Anonymised, aggregated data
            may be retained for analytical purposes and cannot be linked back to you.
          </p>
        </Section>

        <Section title="7. Children's Privacy">
          <p>
            WellNest is not intended for use by children under the age of 13. We do not knowingly
            collect personal information from children. If you believe a child has provided us with
            personal data, please contact us and we will delete it promptly.
          </p>
        </Section>

        <Section title="8. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. When we do, we will update the
            "Last updated" date above and notify you via the app. Continued use of WellNest after
            changes constitutes your acceptance of the revised policy.
          </p>
        </Section>

        <Section title="9. Contact Us">
          <p>
            If you have questions, concerns, or requests regarding your data, please contact us at:
          </p>
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
