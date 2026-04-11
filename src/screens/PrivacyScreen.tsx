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

        {/* Intro */}
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Effective date: 12 April 2026 &nbsp;·&nbsp; Version 1.0</p>
          <p className="text-sm leading-relaxed">
            WellNest ("we", "our", or "us") operates the health management application accessible at{' '}
            <span className="font-medium text-brand-teal">wellnest.zakapedia.in</span> ("the Service").
            This Privacy Policy describes how we collect, use, disclose, and safeguard your information
            when you use the Service. Please read it carefully. If you do not agree with the terms of
            this policy, please discontinue use of the Service.
          </p>
        </div>

        {/* Medical Disclaimer Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 space-y-1">
          <p className="text-sm font-bold text-amber-800">Important Medical Disclaimer</p>
          <p className="text-sm text-amber-700 leading-relaxed">
            WellNest is a personal health record and wellness tracking tool. It is <strong>not</strong> a
            licensed medical device, clinical diagnostic system, or substitute for professional medical
            advice, diagnosis, or treatment. All health information stored in WellNest is for personal
            reference only. Always seek the advice of a qualified healthcare professional regarding any
            medical condition or treatment. Never disregard professional medical advice or delay seeking
            it because of information presented in this application. In a medical emergency, contact
            your local emergency services immediately.
          </p>
        </div>

        <Section title="1. Information We Collect">
          <p>We collect the following categories of information when you use the Service:</p>
          <SubList items={[
            { label: 'Account information', detail: 'Your name, email address, date of birth, height, weight, and other profile details provided during registration or onboarding.' },
            { label: 'Health and medical data', detail: 'Medications and dosage schedules, symptom logs, water intake, exercise records, diet compliance, posture sessions, appointment details, lab reports, imaging scans, AI-generated summaries, and clinical notes.' },
            { label: 'Contact data', detail: 'Emergency contact names and phone numbers you add for SOS functionality.' },
            { label: 'Usage and device data', detail: 'App interactions, session timestamps, browser type, device identifiers, and IP address for performance monitoring and security purposes.' },
            { label: 'Communications', detail: 'Messages sent within the Family Circle feature and notes exchanged between you and invited healthcare professionals.' },
          ]} />
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-1.5 mt-2">
            <li>Provide, operate, and improve the WellNest Service.</li>
            <li>Generate personalised health scores, trends, and AI-assisted visit preparations.</li>
            <li>Display relevant health data to family members and doctors you have explicitly authorised.</li>
            <li>Send in-app reminders for medications, appointments, and follow-up tasks.</li>
            <li>Detect and prevent fraud, abuse, and security incidents.</li>
            <li>Comply with applicable legal obligations.</li>
          </ul>
          <p className="mt-2">
            We do not use your health data for advertising, and we do not sell your data to any third party.
          </p>
        </Section>

        <Section title="3. Sharing and Disclosure of Information">
          <SubList items={[
            { label: 'Authorised contacts', detail: 'Family members and healthcare professionals you invite can only view the specific data sections you permit. You may revoke this access at any time.' },
            { label: 'AI service providers', detail: 'Certain features use Anthropic\'s Claude API to generate health insights. Data submitted for AI processing is governed by Anthropic\'s data handling policies and is not used to train third-party models.' },
            { label: 'Infrastructure providers', detail: 'Your data is stored in Supabase (PostgreSQL) with row-level security policies. Supabase does not independently access or process your data beyond hosting.' },
            { label: 'Legal requirements', detail: 'We may disclose your information if required by law, court order, or to protect the rights, property, or safety of WellNest, its users, or the public.' },
          ]} />
        </Section>

        <Section title="4. Data Security">
          <p>We take the security of your health data seriously and implement the following measures:</p>
          <ul className="list-disc list-inside space-y-1.5 mt-2">
            <li>All data is encrypted in transit using TLS 1.2 or higher.</li>
            <li>Data at rest is encrypted using AES-256 encryption at the infrastructure level.</li>
            <li>Authentication is managed via one-time passwords (OTP) and OAuth 2.0 — no passwords are stored by WellNest.</li>
            <li>Row-level security (RLS) policies in the database ensure strict data isolation between users.</li>
            <li>Access granted to family members and doctors is scoped to permitted sections only.</li>
          </ul>
          <p className="mt-2">
            No method of transmission over the internet or electronic storage is completely secure. While
            we strive to use commercially acceptable means to protect your data, we cannot guarantee
            absolute security.
          </p>
        </Section>

        <Section title="5. Your Rights and Choices">
          <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
          <SubList items={[
            { label: 'Access', detail: 'Request a copy of all personal data we hold about you.' },
            { label: 'Rectification', detail: 'Correct inaccurate or incomplete information via your Profile settings.' },
            { label: 'Erasure', detail: 'Request deletion of your account and all associated data. Data will be permanently removed within 30 days of a verified request.' },
            { label: 'Portability', detail: 'Request an export of your health records in a machine-readable format.' },
            { label: 'Restriction', detail: 'Revoke access granted to any family member or doctor at any time through the app.' },
            { label: 'Objection', detail: 'Object to certain types of processing, including AI-generated analysis.' },
          ]} />
          <p className="mt-2">To exercise any of these rights, contact us at <a href="mailto:info@zakapedia.in" className="text-brand-teal font-medium">info@zakapedia.in</a>.</p>
        </Section>

        <Section title="6. Data Retention">
          <p>
            We retain your personal data for as long as your account remains active. Upon account
            deletion, all identifiable personal and health data is permanently purged within 30 days.
            Aggregated, anonymised analytics data that cannot be linked to any individual may be
            retained for service improvement purposes.
          </p>
        </Section>

        <Section title="7. Children's Privacy">
          <p>
            The Service is not directed to individuals under the age of 13. We do not knowingly collect
            personal information from children. If we become aware that a child under 13 has provided
            personal data without verifiable parental consent, we will take steps to delete that
            information promptly. If you believe this has occurred, please contact us immediately.
          </p>
        </Section>

        <Section title="8. Third-Party Links">
          <p>
            The Service may contain links to external websites or services. This Privacy Policy does
            not apply to those third-party services, and we are not responsible for their privacy
            practices. We encourage you to review the privacy policies of any third-party services
            you access.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            We may update this Privacy Policy periodically to reflect changes in our practices or
            applicable law. When we do, we will revise the effective date at the top of this page
            and notify users via the application. Your continued use of the Service after the
            effective date of any revision constitutes your acceptance of the updated policy.
          </p>
        </Section>

        <Section title="10. Contact Us">
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or your
            personal data, please contact us:
          </p>
          <div className="mt-3 bg-gray-50 rounded-2xl px-5 py-4 space-y-1">
            <p className="text-sm font-bold text-gray-800">WellNest — Data Privacy</p>
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

function SubList({ items }: { items: { label: string; detail: string }[] }) {
  return (
    <ul className="space-y-2 mt-2">
      {items.map((item) => (
        <li key={item.label} className="flex gap-2">
          <span className="text-brand-teal mt-0.5 flex-shrink-0">›</span>
          <span><strong>{item.label}:</strong> {item.detail}</span>
        </li>
      ))}
    </ul>
  )
}
