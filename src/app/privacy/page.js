// src/app/privacy/page.js
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - Hiring Pakistan",
  description: "Read our comprehensive privacy policy to understand how we protect your data",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-gray-500 mt-2">At Hiring Pakistan, we take your privacy seriously.</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          
          {/* Table of Contents */}
          <div className="bg-gray-50 p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <a href="#information" className="text-cyan-600 hover:underline">1. Information We Collect</a>
              <a href="#usage" className="text-cyan-600 hover:underline">2. How We Use Your Information</a>
              <a href="#sharing" className="text-cyan-600 hover:underline">3. Information Sharing</a>
              <a href="#security" className="text-cyan-600 hover:underline">4. Data Security</a>
              <a href="#retention" className="text-cyan-600 hover:underline">5. Data Retention</a>
              <a href="#rights" className="text-cyan-600 hover:underline">6. Your Rights</a>
              <a href="#cookies" className="text-cyan-600 hover:underline">7. Cookies & Tracking</a>
              <a href="#children" className="text-cyan-600 hover:underline">8. Children's Privacy</a>
              <a href="#changes" className="text-cyan-600 hover:underline">9. Changes to Policy</a>
              <a href="#contact" className="text-cyan-600 hover:underline">10. Contact Us</a>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            
            {/* Section 1 */}
            <section id="information">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Information We Collect</h2>
              <p className="text-gray-600 mb-3">We collect different types of information depending on how you use our platform:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong className="text-gray-800">Personal Information:</strong> Name, email address, phone number, residential address, and date of birth.</li>
                <li><strong className="text-gray-800">Professional Information:</strong> CV/Resume, cover letter, work experience, education history, skills, certifications, and portfolio links.</li>
                <li><strong className="text-gray-800">Account Information:</strong> Username, password, account preferences, and communication settings.</li>
                <li><strong className="text-gray-800">Company Information:</strong> For employers - company name, registration number, industry, size, website, and location.</li>
                <li><strong className="text-gray-800">Payment Information:</strong> Transaction history, payment method details (processed securely through our payment partners).</li>
                <li><strong className="text-gray-800">Usage Data:</strong> IP address, browser type, device information, pages visited, time spent, and referral source.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section id="usage">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-600 mb-3">We use your information to provide, improve, and personalize our services:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Connect job seekers with potential employers</li>
                <li>Process job applications and company registrations</li>
                <li>Send job alerts, recommendations, and relevant notifications</li>
                <li>Improve our platform's functionality and user experience</li>
                <li>Verify user identity and prevent fraudulent activities</li>
                <li>Process payments and manage credits for employers</li>
                <li>Communicate important updates about your account or applications</li>
                <li>Analyze usage patterns to enhance our services</li>
                <li>Comply with legal obligations and enforce our terms of service</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="sharing">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Information Sharing</h2>
              <p className="text-gray-600 mb-3">We share your information only when necessary:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>With Employers:</strong> When you apply for a job, your CV and application details are shared with the respective employer.</li>
                <li><strong>Service Providers:</strong> We work with trusted third-party services for hosting, payment processing, email delivery, and analytics.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety.</li>
                <li><strong>Business Transfers:</strong> In case of merger or acquisition, your information may be transferred to the new entity.</li>
              </ul>
              <p className="text-gray-600 mt-3 bg-amber-50 p-3 rounded-lg text-sm">⚠️ <strong>Note:</strong> We never sell your personal information to third parties for marketing purposes.</p>
            </section>

            {/* Section 4 */}
            <section id="security">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Data Security</h2>
              <p className="text-gray-600 mb-3">We implement industry-standard security measures to protect your information:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Encryption:</strong> All data transmitted between your browser and our servers is encrypted using SSL/TLS technology.</li>
                <li><strong>Secure Storage:</strong> Your personal information is stored on secure servers with restricted access.</li>
                <li><strong>Access Controls:</strong> Only authorized personnel have access to sensitive data.</li>
                <li><strong>Regular Audits:</strong> We conduct security assessments to identify and address vulnerabilities.</li>
                <li><strong>Password Protection:</strong> Your account password is hashed and never stored in plain text.</li>
              </ul>
              <p className="text-gray-600 mt-3">While we strive to protect your data, no method of transmission over the internet is 100% secure. You are responsible for maintaining the confidentiality of your account credentials.</p>
            </section>

            {/* Section 5 */}
            <section id="retention">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Data Retention</h2>
              <p className="text-gray-600 mb-3">We retain your information for as long as needed:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Active Accounts:</strong> Your data is kept while your account is active.</li>
                <li><strong>Inactive Accounts:</strong> After 2 years of inactivity, we may delete your account data.</li>
                <li><strong>Job Applications:</strong> Application data is retained for 1 year after the job posting closes.</li>
                <li><strong>Transaction Records:</strong> Payment records are retained for 5 years for legal and accounting purposes.</li>
                <li><strong>Legal Requirements:</strong> Some data may be retained longer if required by law.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="rights">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Your Rights</h2>
              <p className="text-gray-600 mb-3">You have the following rights regarding your personal data:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information in your profile.</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data.</li>
                <li><strong>Restriction:</strong> Limit how we use your information in certain circumstances.</li>
                <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format.</li>
                <li><strong>Withdraw Consent:</strong> Opt-out of marketing communications at any time.</li>
              </ul>
              <p className="text-gray-600 mt-3">To exercise these rights, please contact us at <a href="mailto:privacy@hiringpakistan.com" className="text-cyan-600 hover:underline">privacy@hiringpakistan.com</a>.</p>
            </section>

            {/* Section 7 */}
            <section id="cookies">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Cookies & Tracking Technologies</h2>
              <p className="text-gray-600 mb-3">We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Remember your login session and preferences</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Personalize your experience and show relevant job recommendations</li>
                <li>Prevent fraud and enhance security</li>
              </ul>
              <p className="text-gray-600 mt-3">You can control cookies through your browser settings. However, disabling cookies may affect certain features of our platform.</p>
            </section>

            {/* Section 8 */}
            <section id="children">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-600">Our services are not intended for individuals under 16 years of age. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us to have it removed.</p>
            </section>

            {/* Section 9 */}
            <section id="changes">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Changes to This Privacy Policy</h2>
              <p className="text-gray-600">We may update this privacy policy periodically. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy regularly.</p>
            </section>

            {/* Section 10 */}
            <section id="contact">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Contact Us</h2>
              <p className="text-gray-600 mb-3">If you have questions, concerns, or requests regarding this privacy policy, please contact us:</p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-gray-700"><strong>Email:</strong> <a href="mailto:info.hiringpakistan@gmail.com" className="text-cyan-600 hover:underline">info.hiringpakistan@gmail.com</a></p>
                <p className="text-gray-700"><strong>Phone:</strong> +92 348 2350367</p>
            
              </div>
            </section>

            {/* Footer Note */}
            <div className="bg-cyan-50 p-4 rounded-lg text-center text-sm text-cyan-800">
              <p>By using Hiring Pakistan, you acknowledge that you have read and understood this Privacy Policy.</p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-cyan-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}