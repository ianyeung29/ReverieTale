import { LegalLayout, Section, S } from "@/components/LegalLayout";
import { GOVERNING_LAW, MIN_AGE, OPERATOR_NAME, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalLayout eyebrow="Legal" title="Terms of Service">
      <p style={S.sub}>Welcome to {OPERATOR_NAME}.</p>
      <p style={S.sub}>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of {OPERATOR_NAME} (the &quot;Service&quot;). By
        creating an account or using the Service, you agree to these Terms and to the other policies linked throughout this page
        and listed at <a href="/legal" style={S.link}>/legal</a> (together, the &quot;Policies&quot;). If you don&apos;t agree,
        don&apos;t use the Service.
      </p>
      <p style={S.sub}>The Service is operated by an individual based in {GOVERNING_LAW}, not a registered company.</p>

      <Section title="Key points up front">
        <ul style={S.ul}>
          <li><strong style={S.strong}>Entertainment only.</strong> ReverieTale is fiction. It isn&apos;t therapy, counseling, or emotional support. If you&apos;re struggling, please reach out to a real, qualified professional.</li>
          <li><strong style={S.strong}>Companions aren&apos;t real.</strong> Every companion is an AI character. They don&apos;t have real feelings, intentions, or the ability to keep promises in the real world. Anything a companion says that resembles a real-world offer or plan is fictional.</li>
          <li><strong style={S.strong}>AI output isn&apos;t guaranteed to be accurate.</strong> Companions can produce inconsistent, wrong, or unexpected output. Use your own judgment.</li>
        </ul>
      </Section>

      <Section title="1. The Service">
        <p style={S.p}>
          ReverieTale lets you create and chat with AI companions, and write interactive stories starring them. Some features
          require an account; some require credits (see Section 6). We may add, change, or remove features or companions at any
          time.
        </p>
      </Section>

      <Section title="2. Eligibility and accounts">
        <p style={S.p}>
          You must be {MIN_AGE} or older, or the age of majority where you live if higher, to use ReverieTale — see our{" "}
          <a href="/legal/underage" style={S.link}>Underage Policy</a>. By using the Service you confirm you meet this
          requirement.
        </p>
        <p style={S.p}>
          If you are under 18, you may only use the Service with the involvement and consent of a parent or legal guardian, who
          agrees to be bound by these Terms on your behalf and takes responsibility for your use of the Service, including any
          purchases made through your account.
        </p>
        <p style={S.p}>
          You&apos;re responsible for everything that happens under your account. Keep your login credentials to yourself —
          accounts aren&apos;t transferable. Keep your email and any account details accurate and up to date.
        </p>
        <p style={S.p}>
          We can suspend or terminate an account, with or without notice, if we believe in good faith it violates these Terms or
          any Policy.
        </p>
      </Section>

      <Section title="3. Your content">
        <p style={S.p}>
          &quot;Content&quot; means anything you input (messages, prompts, companion details, story setup) and anything
          generated in response. You keep ownership of what you write. To make the Service work, you grant us a license to use,
          store, process, and display your Content as needed to operate, moderate, and improve ReverieTale — including using
          de-identified or aggregated content to improve moderation and the underlying models. We won&apos;t sell your Content or
          share it with advertisers.
        </p>
        <p style={S.p}>
          You&apos;re responsible for your Content and for making sure it complies with these Terms, our{" "}
          <a href="/guidelines" style={S.link}>Community Guidelines</a>, and applicable law. Companions respond based on the
          conversation you lead — we don&apos;t control or endorse specific outputs.
        </p>
      </Section>

      <Section title="4. Conduct">
        <p style={S.p}>
          Using ReverieTale means agreeing to our <a href="/guidelines" style={S.link}>Community Guidelines</a> and our{" "}
          <a href="/legal/blocked-content" style={S.link}>Blocked Content Policy</a>, which set out what&apos;s never allowed —
          including anything resembling a minor, non-consensual intimate imagery, hate speech, and illegal content. You also
          agree not to:
        </p>
        <ul style={S.ul}>
          <li>Reverse-engineer, scrape, or attempt to extract the Service&apos;s underlying models or source code;</li>
          <li>Circumvent or attempt to bypass moderation, security, or rate limits;</li>
          <li>Use the Service for any commercial purpose without our written permission; or</li>
          <li>Impersonate another person or misrepresent your affiliation with anyone.</li>
        </ul>
      </Section>

      <Section title="5. Moderation">
        <p style={S.p}>
          New and edited companions pass through a hybrid gate — an automated hard filter, a classifier, and human review for
          anything ambiguous — before they&apos;re public. We may review reported content, remove content, or restrict an
          account that violates our Policies. We have a zero-tolerance policy for CSAM and report known instances to NCMEC or
          other appropriate authorities; see our <a href="/legal/underage" style={S.link}>Underage Policy</a>.
        </p>
      </Section>

      <Section title="6. Credits and subscriptions">
        <p style={S.p}>
          Some actions on ReverieTale — sending a chat message, writing a story chapter, generating a portrait — cost credits, at
          rates shown in the app before you spend them.
        </p>
        <p style={S.p}>
          <strong style={S.strong}>Credit packs.</strong> You can buy credits in one-off packs; they don&apos;t expire and carry
          no recurring charge.
        </p>
        <p style={S.p}>
          <strong style={S.strong}>Subscriptions.</strong> We intend to also offer a subscription plan that grants a recurring
          allotment of credits each billing period, in addition to the ability to buy extra credit packs any time your
          subscription allotment runs low. Subscription plans will renew automatically until cancelled, and you&apos;ll be able
          to cancel from your account settings — full pricing, billing cadence, and cancellation mechanics will be posted here
          and confirmed at checkout once this plan is available. As of this revision, subscriptions are not yet live; only
          one-off credit packs are.
        </p>
      </Section>

      <Section title="7. Refunds">
        <p style={S.p}>
          Credits already spent on a message, chapter, or portrait are not refundable. If you believe you were charged in error,
          or purchased credits you haven&apos;t used within 48 hours of purchase, contact{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} style={S.link}>{SUPPORT_EMAIL}</a> — we review these requests case by case. We
          don&apos;t refund credits or subscription time consumed before an account was restricted or terminated for violating
          our Policies. See our <a href="/legal/complaints" style={S.link}>Complaint Policy</a> for how we handle disputes and
          chargebacks.
        </p>
      </Section>

      <Section title="8. No guarantee of accuracy">
        <p style={S.p}>
          Companions are AI-generated and can be inconsistent, incomplete, or simply wrong. We do our best to keep the
          experience good, but we don&apos;t promise that any output will be accurate, original, or exactly what you expected.
        </p>
      </Section>

      <Section title="9. Disclaimer and limitation of liability">
        <p style={{ ...S.p, textTransform: "uppercase", fontSize: 12.5, letterSpacing: ".01em" }}>
          The Service is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of any kind, express or
          implied, including merchantability, fitness for a particular purpose, and non-infringement. We don&apos;t warrant that
          the Service will be uninterrupted, error-free, or secure. To the fullest extent permitted by law, {OPERATOR_NAME} will
          not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the
          Service, even if advised of the possibility of such damages.
        </p>
      </Section>

      <Section title="10. Third-party links">
        <p style={S.p}>
          The Service may link to third-party sites. We don&apos;t endorse them and aren&apos;t responsible for their content,
          policies, or practices.
        </p>
      </Section>

      <Section title="11. Governing law">
        <p style={S.p}>
          These Terms are governed by the laws of {GOVERNING_LAW}, without regard to its conflict-of-law rules. Any dispute
          arising from these Terms or the Service will be resolved in the state or federal courts located in New York.
        </p>
      </Section>

      <Section title="12. Changes to these Terms">
        <p style={S.p}>
          We may update these Terms from time to time. We&apos;ll update the &quot;Last revised&quot; date above when we do; if
          you keep using the Service after a change takes effect, that means you accept the update. If you disagree with a
          change, stop using the Service.
        </p>
      </Section>

      <Section title="13. Termination">
        <p style={S.p}>
          You can stop using ReverieTale and close your account at any time. We can suspend or terminate your access, with or
          without notice, for violating these Terms or any Policy, or at our discretion for any other reason.
        </p>
      </Section>

      <Section title="14. Miscellaneous">
        <p style={S.p}>
          If any part of these Terms is found unenforceable, the rest remains in effect. These Terms, along with the other
          Policies linked from <a href="/legal" style={S.link}>/legal</a>, are the entire agreement between you and{" "}
          {OPERATOR_NAME} about your use of the Service.
        </p>
      </Section>

      <Section title="15. Related policies">
        <ul style={S.ul}>
          <li><a href="/legal/privacy" style={S.link}>Privacy Notice</a></li>
          <li><a href="/legal/cookies" style={S.link}>Cookies Notice</a></li>
          <li><a href="/legal/underage" style={S.link}>Underage Policy</a></li>
          <li><a href="/legal/blocked-content" style={S.link}>Blocked Content Policy</a></li>
          <li><a href="/legal/content-removal" style={S.link}>Content Removal Policy</a></li>
          <li><a href="/legal/dmca" style={S.link}>DMCA Policy</a></li>
          <li><a href="/legal/complaints" style={S.link}>Complaint Policy</a></li>
          <li><a href="/legal/2257-exemption" style={S.link}>18 U.S.C. § 2257 Exemption</a></li>
          <li><a href="/guidelines" style={S.link}>Community Guidelines</a></li>
        </ul>
      </Section>

      <Section title="16. Contact">
        <p style={S.p}>
          Questions about these Terms: <a href={`mailto:${SUPPORT_EMAIL}`} style={S.link}>{SUPPORT_EMAIL}</a>.
        </p>
      </Section>
    </LegalLayout>
  );
}
