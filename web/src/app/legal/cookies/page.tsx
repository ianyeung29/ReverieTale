import { LegalLayout, Section, S } from "@/components/LegalLayout";
import { OPERATOR_NAME, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata = { title: "Cookies Notice" };

export default function CookiesPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Cookies Notice"
      intro="This notice explains what cookies ReverieTale actually uses today — deliberately short, because we don't use more than we need."
    >
      <Section title="1. What we use">
        <p style={S.p}>
          ReverieTale sets exactly one cookie: a session cookie that keeps you signed in. It&apos;s strictly necessary — without it,
          the site can&apos;t tell you&apos;re logged in between page loads. It contains a random session identifier, not your
          password or other personal data directly, and it&apos;s cleared when you sign out.
        </p>
      </Section>
      <Section title="2. What we don't use">
        <p style={S.p}>
          {OPERATOR_NAME} does not currently use analytics cookies, advertising/tracking cookies, or third-party social-media
          cookies. There&apos;s no Google Analytics, no ad pixel, and no cross-site tracking. Because we only use a strictly
          necessary cookie, we don&apos;t show a cookie-consent banner — one isn&apos;t required for cookies that are essential to
          the service functioning.
        </p>
      </Section>
      <Section title="3. If that changes">
        <p style={S.p}>
          If we add analytics or advertising cookies in the future, we&apos;ll update this notice to describe them, add a consent
          banner where required, and give you a way to opt out of anything non-essential.
        </p>
      </Section>
      <Section title="4. Your browser controls">
        <p style={S.p}>
          You can clear or block cookies at any time through your browser&apos;s settings. Blocking the session cookie will sign
          you out and prevent staying signed in.
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
