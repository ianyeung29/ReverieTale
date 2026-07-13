import { LegalLayout, Section, S } from "@/components/LegalLayout";
import { OPERATOR_NAME, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata = { title: "Blocked Content Policy" };

export default function BlockedContentPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Blocked Content Policy"
      intro={`${OPERATOR_NAME} is a private, single-player experience — companions and stories are created by users but aren't shared media the way a social feed is. The following is nonetheless strictly prohibited anywhere on the platform, including in private chat.`}
    >
      <Section title="1. Prohibited content">
        <p style={S.p}>a) <strong style={S.strong}>Illegal content:</strong> anything involving illegal drugs, weapons, or activity that advocates unlawful acts.</p>
        <p style={S.p}>b) <strong style={S.strong}>Hate speech and discrimination:</strong> content that promotes hatred, discrimination, or harassment based on race, ethnicity, nationality, religion, gender, sexual orientation, disability, or any other protected characteristic.</p>
        <p style={S.p}>c) <strong style={S.strong}>Violence and self-harm:</strong> content that glorifies or encourages violence, suicide, self-harm, or terrorism.</p>
        <p style={S.p}>d) <strong style={S.strong}>Child exploitation:</strong> zero tolerance for CSAM or any content that exploits, endangers, or resembles a minor — see our <a href="/legal/underage" style={S.link}>Underage Policy</a>.</p>
        <p style={S.p}>e) <strong style={S.strong}>Non-consensual intimate imagery and deepfakes:</strong> zero tolerance for content intended to depict a real, identifiable person in a sexual or intimate context without their consent.</p>
        <p style={S.p}>f) <strong style={S.strong}>Impersonation:</strong> deceptive or harmful impersonation of a real individual, public figure, or celebrity.</p>
        <p style={S.p}>g) <strong style={S.strong}>Privacy and copyright infringement:</strong> sharing another person&apos;s private information without consent, or content that infringes someone&apos;s copyright or trademark.</p>
      </Section>
      <Section title="2. You're responsible for your content">
        <p style={S.p}>
          You&apos;re solely responsible for the input you send a companion and the output you receive. Companions respond based
          on the conversation you lead — we don&apos;t control or endorse the specific things a companion says. See our{" "}
          <a href="/guidelines" style={S.link}>Community Guidelines</a> for the full conduct rules.
        </p>
      </Section>
      <Section title="3. Moderation">
        <p style={S.p}>
          New and edited companions go through a hybrid moderation gate — a hard filter, an automated classifier, and (for
          anything ambiguous) a human — before they&apos;re public. Readers can also report a companion or story directly from
          its page, and hide any companion from their own Browse/Home without affecting anyone else. See{" "}
          <a href="/guidelines" style={S.link}>Community Guidelines</a> for how each of these works.
        </p>
      </Section>
      <Section title="4. Reporting">
        <p style={S.p}>
          We have a zero-tolerance policy for CSAM. Beyond removing it and the account responsible, we report known CSAM to the
          National Center for Missing &amp; Exploited Children (NCMEC) or other appropriate authorities.
        </p>
      </Section>
      <Section title="5. Contact">
        <p style={S.p}>
          To report a violation of this policy: <a href={`mailto:${SUPPORT_EMAIL}`} style={S.link}>{SUPPORT_EMAIL}</a>, or use the
          in-app report/hide controls on any companion or story.
        </p>
      </Section>
      <Section title="6. Enforcement">
        <p style={S.p}>We may suspend or terminate the account of anyone who violates this policy.</p>
      </Section>
    </LegalLayout>
  );
}
