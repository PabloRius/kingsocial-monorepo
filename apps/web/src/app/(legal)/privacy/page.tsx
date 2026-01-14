import { LegalLayout } from "@/components/LegalLayout";

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="January 14, 2026">
      <section>
        <h2>1. Introduction</h2>
        <p>
          KingSocial, The Platform is committed to protecting the privacy of our
          university community. This policy explains how we collect, use, and
          safeguard your data in accordance with the{" "}
          <strong>UK General Data Protection Regulation (GDPR)</strong>.
        </p>
      </section>

      <section>
        <h2>2. Data We Collect</h2>
        <ul className="list-disc pl-5">
          <li>
            <strong>Identity Data:</strong> Name, email address, and profile
            picture provided via Next-Auth (Google or Microsoft Entra ID).
          </li>
          <li>
            <strong>Profile Data:</strong> Biography, degree, year of study, and
            interests.
          </li>
          <li>
            <strong>Content Data:</strong> Marketplace listings, chat messages,
            and community posts.
          </li>
          <li>
            <strong>Persona Data:</strong> Mathematical vector embeddings
            derived from your biography for peer matching.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. AI and Vector Embeddings</h2>
        <p>
          To facilitate peer discovery, KingSocial utilizes Artificial
          Intelligence to convert your biography into high-dimensional vector
          embeddings.
        </p>
        <ul className="list-disc pl-5">
          <li>These vectors are stored securely in MongoDB Atlas.</li>
          <li>
            Embeddings are used solely for calculating semantic similarity
            between users and marketplace items.
          </li>
          <li>
            You may update or clear your biography at any time, which triggers
            an automatic recalculation or deletion of your vector data.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Your Rights (GDPR)</h2>
        <p>Under the GDPR, you have the following rights:</p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Right to Access:</strong> You can view all data stored in
            your profile at any time.
          </li>
          <li>
            <strong>Right to Rectification:</strong> You can update your
            personal information via the settings dashboard.
          </li>
          <li>
            <strong>Right to Erasure:</strong> You can delete your account,
            which will permanently purge your PII, marketplace items, and AI
            embeddings from our database.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Third-Party Services</h2>
        <p>We utilize the following trusted processors:</p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Authentication:</strong> Google & Microsoft Entra ID.
          </li>
          <li>
            <strong>Database:</strong> MongoDB Atlas (Encrypted at rest).
          </li>
          <li>
            <strong>AI Inference:</strong> Hugging Face API (Data is processed
            but not stored for model training).
          </li>
        </ul>
      </section>
    </LegalLayout>
  );
}
