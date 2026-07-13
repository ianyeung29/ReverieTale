import { LegalLayout, Section, S } from "@/components/LegalLayout";
import { OPERATOR_NAME, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata = { title: "Content Removal Policy" };

export default function ContentRemovalPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Content Removal Policy"
      intro={`All content on ${OPERATOR_NAME} — companion portraits, stories, chat replies — is AI-generated. Any resemblance to an actual person is unintentional. This policy explains what happens if AI-generated content ends up resembling someone real.`}
    >
      <Section title="1. Requesting removal">
        <p style={S.p}>
          If you believe content on {OPERATOR_NAME} resembles you or another real person, contact{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} style={S.link}>{SUPPORT_EMAIL}</a> with a description of the content and a link or
          other way to locate it. We review every request.
        </p>
      </Section>
      <Section title="2. Verification">
        <p style={S.p}>
          To keep this process from being abused, we may ask for reasonable evidence of your identity or your relationship to the
          person depicted before acting on a request.
        </p>
      </Section>
      <Section title="3. Outcome">
        <p style={S.p}>Once a request is verified, we remove the specified content in a timely manner.</p>
      </Section>
      <Section title="4. Privacy">
        <p style={S.p}>
          Removal requests are handled confidentially. We don&apos;t share details of a request with third parties except where
          required by law.
        </p>
      </Section>
      <Section title="5. Contact">
        <p style={S.p}>
          Questions about this policy: <a href={`mailto:${SUPPORT_EMAIL}`} style={S.link}>{SUPPORT_EMAIL}</a>.
        </p>
      </Section>
    </LegalLayout>
  );
}
