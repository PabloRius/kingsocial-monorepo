import { LegalLayout } from "@/components/LegalLayout";

export default function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="January 14, 2026">
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing KingSocial, you agree to be bound by these Terms. This
          platform is a university-centric project designed for academic and
          community purposes.
        </p>
      </section>

      <section>
        <h2>2. Eligibility</h2>
        <p>
          Access is restricted to current students and staff of the affiliated
          institution. You must sign in via Google or Microsoft to verify your
          status.
        </p>
      </section>

      <section>
        <h2>3. Marketplace Disclaimer (P2P)</h2>
        <p>KingSocial provides a venue for Peer-to-Peer (P2P) transactions.</p>
        <ul className="list-disc pl-5">
          <li>
            <strong>No Liability:</strong> KingSocial is not a party to any
            transaction and is not responsible for the quality, safety, or
            legality of items listed.
          </li>
          <li>
            <strong>In-Person Safety:</strong> We strongly recommend meeting in
            well-lit, public campus locations for item exchanges.
          </li>
          <li>
            <strong>No Payments:</strong> The platform does not currently
            process financial transactions. All payments are handled offline
            between the buyer and seller.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Code of Conduct</h2>
        <p>Users agree not to:</p>
        <ul className="list-disc pl-5">
          <li>Harass, bully, or intimidate other students.</li>
          <li>Post fraudulent or illegal marketplace listings.</li>
          <li>Attempt to scrape or mine user data via the discovery engine.</li>
        </ul>
      </section>

      <section>
        <h2>5. Intellectual Property</h2>
        <p>
          You retain ownership of the content you post. However, by posting on
          KingSocial, you grant us a limited license to process and display that
          content (and generate AI embeddings) to provide the service.
        </p>
      </section>

      <section>
        <h2>6. Academic Project Status</h2>
        <p>
          <strong>Disclaimer:</strong> KingSocial is an independent MSc
          dissertation project. It is not an official service of Kingston
          University. The platform is provided "as-is" without warranty of any
          kind.
        </p>
      </section>
    </LegalLayout>
  );
}
