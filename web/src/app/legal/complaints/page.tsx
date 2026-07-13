import { LegalLayout, Section, S } from "@/components/LegalLayout";
import { OPERATOR_NAME, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata = { title: "Complaint Policy" };

export default function ComplaintPolicyPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Complaint Policy"
      intro="This policy explains how to file a complaint about anything you encounter on Reverie, and what happens after you do."
    >
      <Section title="1. Submitting a complaint">
        <p style={S.p}>
          Email <a href={`mailto:${SUPPORT_EMAIL}`} style={S.link}>{SUPPORT_EMAIL}</a> with:
        </p>
        <ul style={S.ul}>
          <li>Your name and the email address on your account;</li>
          <li>What happened, including the date/time and, if relevant, a link to the content or account involved; and</li>
          <li>Any screenshots or other evidence that would help us look into it.</li>
        </ul>
      </Section>
      <Section title="2. What happens next">
        <ul style={S.ul}>
          <li><strong style={S.strong}>Acknowledgment:</strong> we&apos;ll confirm we received your complaint within 2 business days.</li>
          <li><strong style={S.strong}>Review:</strong> we look into the details, which may include reaching out to you for more information.</li>
          <li><strong style={S.strong}>Decision:</strong> we aim to reach and communicate an outcome within 14 days. If a complaint is more complex, we&apos;ll tell you it&apos;s taking longer and why.</li>
        </ul>
      </Section>
      <Section title="3. Illegal content">
        <p style={S.p}>
          Complaints involving illegal content — especially anything touching on minors — are prioritized and acted on
          immediately, ahead of the general timeline above. See our{" "}
          <a href="/legal/underage" style={S.link}>Underage Policy</a> and{" "}
          <a href="/legal/blocked-content" style={S.link}>Blocked Content Policy</a>.
        </p>
      </Section>
      <Section title="4. If you&apos;re not satisfied">
        <p style={S.p}>
          If you disagree with how a complaint was resolved, reply and say so — we&apos;ll take a second look with fresh eyes
          before treating a decision as final.
        </p>
      </Section>
      <Section title="5. Payment disputes">
        <p style={S.p}>
          If you have a question about a charge, contact us before filing a chargeback with your bank — we can usually resolve
          billing questions directly and faster. Accounts with a pattern of unwarranted chargebacks may be restricted.
        </p>
      </Section>
    </LegalLayout>
  );
}
