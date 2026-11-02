import type { Metadata } from "next";
import { BRAND } from "@/config/brand";
import { SALES_EMAIL } from "@/config/charter";

/**
 * DRAFT privacy policy for the marketing site and the Founding Charter reservation / inquiry forms.
 * Not legal advice. Every <Review> marker must be resolved by counsel before launch; then set DRAFT = false.
 * See docs/PRIVACY_REVIEW.md.
 */
const DRAFT = true;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${BRAND.name} handles information submitted through this website and the Founding Charter reservation form.`,
  robots: DRAFT ? { index: false, follow: false } : undefined,
  alternates: { canonical: "/privacy" },
};

function Review({ children }: { children: React.ReactNode }) {
  if (!DRAFT) return null;
  return (
    <span className="mx-0.5 rounded bg-butter-soft px-1.5 py-0.5 text-[13px] font-semibold text-butter-deep">
      [Legal review: {children}]
    </span>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-12 scroll-mt-24 font-display text-2xl font-semibold tracking-tight text-[#16203A]">
      {children}
    </h2>
  );
}

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 [&_li]:mt-2 [&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-ink-2 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-ink-2">
      {DRAFT && (
        <div role="note" className="rounded-2xl bg-butter-soft p-4 text-[14px] text-ink ring-1 ring-butter/60">
          <strong>Draft for legal review.</strong> This policy is not yet in effect. Highlighted items need confirmation from counsel or
          the business before launch.
        </div>
      )}
      <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight text-[#16203A] sm:text-5xl">Privacy Policy</h1>
      <p className="text-[14px] text-ink-3">
        Effective date: <Review>insert date on publication</Review>
      </p>

      <p>
        This policy explains how {BRAND.name} <Review>full legal entity name, state of organization and mailing address</Review>{" "}
        (&ldquo;{BRAND.name},&rdquo; &ldquo;we&rdquo; or &ldquo;us&rdquo;) collects and uses information through this website, including the
        Founding Charter reservation form and the Sponsor and Enterprise inquiry forms. It does not cover the {BRAND.name} product once you
        become a customer; customer data, including any client data you import, will be governed by your customer agreement and data
        processing terms <Review>confirm a separate customer privacy notice / DPA will exist</Review>.
      </p>

      <H2 id="collect">Information we collect</H2>
      <p>
        <strong className="text-ink">Information you give us.</strong> When you reserve a Founding Charter seat or send an inquiry, we
        collect:
      </p>
      <ul>
        <li>Your full name and, if you provide it, your title</li>
        <li>Your agency or firm name and, if you provide it, its website</li>
        <li>Your work email address</li>
        <li>The CRM you use, the tier or account type you selected and, for inquiries, approximate team size and any note you add</li>
        <li>A record that you agreed to be contacted, the wording you agreed to, and the date and time</li>
        <li>Which button you used to open the form (for example &ldquo;pricing&rdquo; or &ldquo;hero&rdquo;)</li>
      </ul>
      <p>
        Please don&rsquo;t include information about your own clients (for example names, account details, policy numbers or health
        information) in these forms. We don&rsquo;t need it to respond, and the forms aren&rsquo;t designed to receive it.
      </p>
      <p>
        <strong className="text-ink">Information collected automatically.</strong> Our hosting provider, Vercel, records standard
        request logs, such as IP address, browser type, the pages requested and timestamps.{" "}
        <Review>confirm Vercel log contents and retention for our plan</Review> To prevent spam and repeated submissions, we store a
        one-way, keyed hash of your IP address with your request. We don&rsquo;t store the IP address itself, and the hash is used only
        to limit how many requests come from the same connection. The form also measures how long it was open before you submitted it,
        to filter out automated submissions; that timing isn&rsquo;t stored.
      </p>
      <p>
        <strong className="text-ink">Cookies and browser storage.</strong> We don&rsquo;t use advertising cookies. If a reservation
        can&rsquo;t be sent (for example, if your connection drops), the form keeps a copy of what you typed in your own browser&rsquo;s
        local storage so you can try again; it&rsquo;s deleted when the request goes through, and you can clear it at any time. The
        interactive product preview also stores sample data only in your browser. We do not currently use a third-party analytics
        service; if we add one, we&rsquo;ll update this policy first.{" "}
        <Review>update if an analytics or tag manager vendor is installed; assess cookie-consent requirements</Review>
      </p>
      <p>
        <strong className="text-ink">Bot protection.</strong> If we turn on Cloudflare Turnstile to block automated submissions,
        Cloudflare will process limited technical information from your browser to run that check.{" "}
        <Review>keep this paragraph only if Turnstile is enabled; link Cloudflare&rsquo;s Turnstile privacy terms</Review>
      </p>

      <H2 id="use">How we use information</H2>
      <ul>
        <li>To respond to your reservation or inquiry, confirm fit and terms, and schedule conversations</li>
        <li>To run the Founding Charter program, including onboarding and setup if you become a customer</li>
        <li>To protect the site and our forms against spam, fraud and abuse</li>
        <li>To comply with legal obligations</li>
      </ul>
      <p>
        We may send you emails about your reservation and the charter program. We won&rsquo;t add you to general marketing emails without
        your permission, and every marketing email will include a way to unsubscribe.{" "}
        <Review>confirm email practices and CAN-SPAM / other applicable rules</Review> We don&rsquo;t sell your personal information or
        share it for cross-context behavioral advertising.
      </p>
      <p>
        <Review>
          if the site is offered to people in the EU/UK, add legal bases (consent, legitimate interests, steps prior to a contract)
        </Review>
      </p>

      <H2 id="share">How we share information</H2>
      <p>We share information only as needed to operate the program:</p>
      <ul>
        <li>
          With service providers that operate the site on our behalf, under terms that limit their use of the information:{" "}
          <strong className="text-ink">Vercel</strong> (website hosting) and <strong className="text-ink">Neon</strong> (the database
          that stores reservation records, located in the United States), plus an email delivery provider if we enable reservation
          notification emails. <Review>confirm each provider&rsquo;s data processing terms are accepted; name the email provider if enabled</Review>
        </li>
        <li>If required by law, or to protect the rights, safety and security of {BRAND.name}, our users or others</li>
        <li>As part of a merger, acquisition or sale of assets, subject to this policy</li>
      </ul>

      <H2 id="retention">How long we keep it</H2>
      <p>
        We keep reservation and inquiry records for as long as needed to respond and to run the charter program, and then for{" "}
        <Review>set a retention period, e.g. 24 months after last contact</Review> unless you ask us to delete them sooner or the law
        requires us to keep them longer. If you become a customer, records may move into your customer account.
      </p>

      <H2 id="rights">Your choices and rights</H2>
      <p>
        You can ask us to access, correct or delete the information you submitted, or to stop contacting you, by emailing{" "}
        <a href={`mailto:${SALES_EMAIL}`} className="font-semibold text-cobalt hover:underline">
          {SALES_EMAIL}
        </a>
        . We&rsquo;ll verify the request comes from you and respond within the time required by applicable law.{" "}
        <Review>confirm which US state privacy laws apply (e.g. California) and add required disclosures and request methods</Review>
      </p>

      <H2 id="security">Security</H2>
      <p>
        We use reasonable administrative, technical and physical safeguards. Form submissions are sent over encrypted connections
        (HTTPS), database credentials are kept in our hosting provider&rsquo;s encrypted settings rather than in our code, and access to
        reservation records is limited to the people who need it to follow up. No method of transmission or storage is completely
        secure. <Review>confirm Neon&rsquo;s encryption-at-rest statement before adding it, and document who has database access</Review>
      </p>

      <H2 id="children">Children</H2>
      <p>
        This site is intended for businesses and professionals. It is not directed to children, and we don&rsquo;t knowingly collect
        personal information from anyone under 16. <Review>confirm age threshold</Review>
      </p>

      <H2 id="location">Where information is processed</H2>
      <p>
        We are based in the United States. Reservation records are stored in a database in the eastern United States, and the site is
        served by Vercel&rsquo;s global network. <Review>confirm Vercel function region and any international transfer language</Review>
      </p>

      <H2 id="changes">Changes to this policy</H2>
      <p>
        If we change this policy, we&rsquo;ll post the updated version here with a new effective date. If changes are material, we&rsquo;ll
        take reasonable steps to let you know.
      </p>

      <H2 id="contact">Contact us</H2>
      <p>
        Questions or requests:{" "}
        <a href={`mailto:${SALES_EMAIL}`} className="font-semibold text-cobalt hover:underline">
          {SALES_EMAIL}
        </a>{" "}
        <Review>mailbox must be verified and monitored; add mailing address</Review>
      </p>
    </article>
  );
}
