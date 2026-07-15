import { LegalLayout, Section, S } from "@/components/LegalLayout";
import { OPERATOR_NAME, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata = { title: "DMCA Policy" };

export default function DmcaPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="DMCA Policy"
      intro={`${OPERATOR_NAME} respects the intellectual property rights of others and expects users to do the same. This policy explains how to report suspected copyright infringement and how we respond.`}
    >
      <Section title="1. Filing a notice of infringement">
        <p style={S.p}>
          If you believe in good faith that material on {OPERATOR_NAME} infringes your copyright, send a written notice to{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} style={S.link}>{SUPPORT_EMAIL}</a> including:
        </p>
        <ul style={S.ul}>
          <li>A physical or electronic signature of the copyright owner or someone authorized to act on their behalf;</li>
          <li>A description of the copyrighted work you claim has been infringed, and enough information for us to locate the material on ReverieTale;</li>
          <li>Your address, telephone number, and email address;</li>
          <li>A statement that you have a good-faith belief the use is not authorized by the copyright owner, its agent, or the law; and</li>
          <li>A statement, made under penalty of perjury, that the information above is accurate and that you are the copyright owner or authorized to act on their behalf.</li>
        </ul>
      </Section>
      <Section title="2. Our response">
        <p style={S.p}>
          On receiving a complete notice, we will review it, take down or disable access to the identified material within a few
          days where the notice is valid, and notify the account associated with the content so they can respond.
        </p>
      </Section>
      <Section title="3. Counter-notification">
        <p style={S.p}>
          If you believe content was removed in error, you may send a counter-notice to the same address. We will forward it to
          the original complainant and, absent notice that they have filed a court action, may restore the content after 10–14
          days.
        </p>
      </Section>
      <Section title="4. Repeat infringers">
        <p style={S.p}>We may suspend or terminate the account of anyone found to be a repeat infringer.</p>
      </Section>
      <Section title="5. Contact">
        <p style={S.p}>
          Notices and counter-notices: <a href={`mailto:${SUPPORT_EMAIL}`} style={S.link}>{SUPPORT_EMAIL}</a>.
        </p>
      </Section>
    </LegalLayout>
  );
}
