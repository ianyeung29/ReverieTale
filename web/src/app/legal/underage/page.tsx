import { LegalLayout, Section, S } from "@/components/LegalLayout";
import { MIN_AGE, OPERATOR_NAME, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata = { title: "Underage Policy · Reverie" };

export default function UnderagePolicyPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Underage Policy"
      intro={`${OPERATOR_NAME} is rated ${MIN_AGE}+. This policy explains how we keep younger users off the platform and out of the content on it.`}
    >
      <Section title="1. Age gate and registration">
        <p style={S.p}>
          You must be {MIN_AGE} or older, or the age of majority where you live if that&apos;s higher, to create an account or
          use Reverie. Every signup requires an explicit confirmation of age before an account is created. If you are under 18,
          see the parental/guardian consent requirement in our <a href="/legal/terms" style={S.link}>Terms of Service</a>.
        </p>
        <p style={S.p}>
          <strong style={S.strong}>This is currently a self-attestation, not an independent age-verification check.</strong> We
          don&apos;t yet verify age via ID or a third-party estimation service. Providing false information about your age is a
          violation of our <a href="/legal/terms" style={S.link}>Terms of Service</a>, and we may implement stronger
          verification measures in the future as the platform grows.
        </p>
        <p style={S.p}>
          If you believe a younger user has accessed Reverie — including your own child — contact us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} style={S.link}>{SUPPORT_EMAIL}</a> so we can investigate and block further access.
          We are not able to independently verify a user&apos;s age beyond their own attestation, and it remains each user&apos;s
          responsibility to comply with the laws of their own location regarding access to age-restricted content.
        </p>
      </Section>
      <Section title="2. No content resembling minors">
        <p style={S.p}>
          We have a zero-tolerance policy toward any companion, image, story, or chat content that depicts, resembles, or is
          written to resemble a minor — including age-ambiguous characters. This is enforced through:
        </p>
        <ul style={S.ul}>
          <li>A hard filter that blocks obvious violations at the moment a character is created or edited, with no exceptions;</li>
          <li>An automated classifier that reviews everything else, auto-approving clearly-fine content and holding anything ambiguous for a human;</li>
          <li>A human moderator who reviews anything held before it&apos;s ever public; and</li>
          <li>Reader reports, which any signed-in user can file from a companion or story page.</li>
        </ul>
        <p style={S.p}>
          See our <a href="/legal/blocked-content" style={S.link}>Blocked Content Policy</a> and{" "}
          <a href="/guidelines" style={S.link}>Community Guidelines</a> for the full list of what&apos;s never allowed.
        </p>
      </Section>
      <Section title="3. Content responsibility">
        <p style={S.p}>
          You are solely responsible for the input you send to a companion and the stories you write. Companions respond based
          on the conversation you lead — we don&apos;t control or endorse any specific output, and you&apos;re responsible for
          keeping your own use of the Services lawful and within these policies.
        </p>
      </Section>
      <Section title="4. Reporting">
        <p style={S.p}>
          We have a zero-tolerance policy for Child Sexual Abuse Material (CSAM). Attempting to generate it is illegal and a
          violation of every policy on this site. Beyond removing such content and the account responsible, we report known CSAM
          to the National Center for Missing &amp; Exploited Children (NCMEC) or other appropriate authorities.
        </p>
      </Section>
      <Section title="5. Contact">
        <p style={S.p}>
          Questions, or to report a suspected violation: <a href={`mailto:${SUPPORT_EMAIL}`} style={S.link}>{SUPPORT_EMAIL}</a>.
        </p>
      </Section>
    </LegalLayout>
  );
}
