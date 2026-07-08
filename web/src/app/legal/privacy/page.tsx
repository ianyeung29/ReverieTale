import { LegalLayout, Section, S } from "@/components/LegalLayout";
import { GOVERNING_LAW, MIN_AGE, OPERATOR_NAME, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata = { title: "Privacy Notice · Reverie" };

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Privacy Notice"
      intro={`${OPERATOR_NAME} ("we", "us", "our") is operated by an individual based in ${GOVERNING_LAW}. This notice describes what we actually collect and why — grounded in what the app does today, not a generic template.`}
    >
      <Section title="1. Information we collect">
        <p style={S.p}><strong style={S.strong}>Account data:</strong> your email address, and an optional public display name if you create companions. Signing in currently only requires your email (or a Google sign-in) — there is no password to store.</p>
        <p style={S.p}><strong style={S.strong}>Age confirmation:</strong> your confirmation that you meet our minimum age requirement ({MIN_AGE}+). See our <a href="/legal/underage" style={S.link}>Underage Policy</a> — this is currently a self-attestation, not third-party identity verification.</p>
        <p style={S.p}><strong style={S.strong}>Content you create:</strong> companion definitions (name, personality, backstory, tags, portraits), stories, and chat messages. Chat and story content is used to generate responses and is retained so a conversation can continue with memory of what you&apos;ve shared.</p>
        <p style={S.p}><strong style={S.strong}>Interaction data:</strong> ratings you give, stories you bookmark, companions you hide from your own browsing, and reports you file. Reporter identity on a report is visible to moderators only, never to the person reported.</p>
        <p style={S.p}><strong style={S.strong}>Payment data:</strong> if you purchase credits, payment is handled by our payment processor directly — we do not store your full card number. We keep a record of the transaction (amount, credit balance, timestamp) to maintain your account balance and for accounting.</p>
        <p style={S.p}><strong style={S.strong}>Technical data:</strong> a single session cookie that keeps you signed in. See our <a href="/legal/cookies" style={S.link}>Cookies Notice</a> — we don&apos;t run analytics or ad tracking.</p>
      </Section>
      <Section title="2. How we use it">
        <ul style={S.ul}>
          <li>To operate your account and let you create, read, and chat with companions;</li>
          <li>To generate AI responses and portraits (see Section 3 below);</li>
          <li>To run moderation — both automated checks and, where flagged, human review of reported content;</li>
          <li>To maintain your credit balance and process purchases;</li>
          <li>To respond to support requests, reports, and complaints; and</li>
          <li>To keep the service secure and prevent abuse.</li>
        </ul>
      </Section>
      <Section title="3. AI processing">
        <p style={S.p}>
          Generating a companion&apos;s replies and portraits requires sending relevant text (your message, the companion&apos;s
          definition, recent conversation context) to a third-party AI model provider, and — for portraits — a description to a
          third-party image-generation provider. These providers process that content to return a response; we don&apos;t control
          their internal retention practices beyond our agreement with them. We don&apos;t send your email address, password, or
          payment information to these providers.
        </p>
      </Section>
      <Section title="4. Who we share data with">
        <p style={S.p}>We share data only with the service providers needed to run Reverie: hosting/database infrastructure, the AI model and image-generation providers described above, and (once payments are live) a payment processor. We do not sell your data, and we don&apos;t share it with advertisers — we don&apos;t have any.</p>
        <p style={S.p}>We may disclose information if required by law, to investigate a report of illegal content (including reporting CSAM to NCMEC or law enforcement, see our <a href="/legal/blocked-content" style={S.link}>Blocked Content Policy</a>), or to protect the rights or safety of our users or the public.</p>
      </Section>
      <Section title="5. Retention">
        <p style={S.p}>We keep your account and content for as long as your account exists. If you ask us to delete your account, we&apos;ll delete your personal data (email, password) and disable access; some records (e.g., transaction history, moderation records tied to a report) may be retained longer where needed for legal, accounting, or safety reasons.</p>
      </Section>
      <Section title="6. Your rights">
        <p style={S.p}>You can ask us to:</p>
        <ul style={S.ul}>
          <li>Send you a copy of the personal data we hold about you;</li>
          <li>Correct inaccurate data;</li>
          <li>Delete your account and associated personal data; or</li>
          <li>Stop using your data for a purpose you object to.</li>
        </ul>
        <p style={S.p}>
          To exercise any of these, email <a href={`mailto:${SUPPORT_EMAIL}`} style={S.link}>{SUPPORT_EMAIL}</a>. We&apos;ll respond
          within a reasonable time. We handle these requests directly rather than through a dedicated privacy office or appointed
          representative — {OPERATOR_NAME} doesn&apos;t currently have either.
        </p>
      </Section>
      <Section title="7. Children">
        <p style={S.p}>Reverie is rated {MIN_AGE}+. We don&apos;t knowingly collect data from anyone under {MIN_AGE}. See our <a href="/legal/underage" style={S.link}>Underage Policy</a>.</p>
      </Section>
      <Section title="8. Security">
        <p style={S.p}>Passwords are stored as salted hashes, not plain text. No online service can guarantee perfect security, but we take reasonable measures to protect your data against unauthorized access.</p>
      </Section>
      <Section title="9. International users">
        <p style={S.p}>Reverie is operated from the United States and data is processed there. If you access the service from elsewhere, you understand your data will be transferred to and processed in the United States.</p>
      </Section>
      <Section title="10. Changes to this notice">
        <p style={S.p}>We may update this notice as the service changes. We&apos;ll update the revision date above when we do; significant changes will be called out on the site.</p>
      </Section>
      <Section title="11. Contact">
        <p style={S.p}>
          Questions or requests regarding your data: <a href={`mailto:${SUPPORT_EMAIL}`} style={S.link}>{SUPPORT_EMAIL}</a>.
        </p>
      </Section>
    </LegalLayout>
  );
}
