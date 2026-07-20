import { LegalLayout, Section, S } from "@/components/LegalLayout";
import { OPERATOR_NAME, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata = { title: "Cookies Notice" };

export default function CookiesPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Cookies Notice"
      intro="This notice explains what cookies ReverieTale uses and how you control optional analytics."
    >
      <Section title="1. What we use">
        <p style={S.p}>
          ReverieTale sets a session cookie that keeps you signed in. It&apos;s strictly necessary — without it,
          the site can&apos;t tell you&apos;re logged in between page loads. It contains a random session identifier, not your
          password or other personal data directly, and it&apos;s cleared when you sign out.
        </p>
      </Section>
      <Section title="2. Optional analytics cookies">
        <p style={S.p}>
          With your permission, {OPERATOR_NAME} uses Google Analytics to measure aggregate visits and feature-flow milestones,
          such as starting a scene, first chat, signup, and checkout. Google Analytics may set its <code>_ga</code> cookie to distinguish sessions. We do not load it until you choose
          &ldquo;Accept analytics&rdquo; in the cookie prompt. Declining does not affect the core service.
        </p>
      </Section>
      <Section title="3. What we don't use">
        <p style={S.p}>
          We do not use advertising cookies, retargeting pixels, or Google advertising-personalization signals. We also do not
          send chat content, account information, payment data, character identifiers, or URL query strings to Google Analytics.
        </p>
      </Section>
      <Section title="4. Your browser controls">
        <p style={S.p}>
            You can clear or block cookies and other site data at any time through your browser&apos;s settings. Clearing
            ReverieTale&apos;s site data resets your analytics choice. Blocking the session cookie will sign you out and
            prevent staying signed in.
        </p>
      </Section>
      <Section title="5. Contact">
        <p style={S.p}>
          Questions about this notice: <a href={`mailto:${SUPPORT_EMAIL}`} style={S.link}>{SUPPORT_EMAIL}</a>.
        </p>
      </Section>
    </LegalLayout>
  );
}
