// src/app/terms/page.js
import Link from "next/link";

export const metadata = {
  title: "Terms of Service - Hiring Pakistan",
  description: "Read our comprehensive terms of service to understand the rules and guidelines for using Hiring Pakistan",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-gray-500 mt-2">Please read these terms carefully before using our platform.</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          
          {/* Table of Contents */}
          <div className="bg-gray-50 p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <a href="#acceptance" className="text-cyan-600 hover:underline">1. Acceptance of Terms</a>
              <a href="#eligibility" className="text-cyan-600 hover:underline">2. Eligibility</a>
              <a href="#accounts" className="text-cyan-600 hover:underline">3. User Accounts</a>
              <a href="#jobseekers" className="text-cyan-600 hover:underline">4. For Job Seekers</a>
              <a href="#employers" className="text-cyan-600 hover:underline">5. For Employers</a>
              <a href="#payments" className="text-cyan-600 hover:underline">6. Payments & Credits</a>
              <a href="#prohibited" className="text-cyan-600 hover:underline">7. Prohibited Activities</a>
              <a href="#content" className="text-cyan-600 hover:underline">8. User Content</a>
              <a href="#intellectual" className="text-cyan-600 hover:underline">9. Intellectual Property</a>
              <a href="#termination" className="text-cyan-600 hover:underline">10. Termination</a>
              <a href="#disclaimers" className="text-cyan-600 hover:underline">11. Disclaimers</a>
              <a href="#limitation" className="text-cyan-600 hover:underline">12. Limitation of Liability</a>
              <a href="#indemnification" className="text-cyan-600 hover:underline">13. Indemnification</a>
              <a href="#governing" className="text-cyan-600 hover:underline">14. Governing Law</a>
              <a href="#changes" className="text-cyan-600 hover:underline">15. Changes to Terms</a>
              <a href="#contact" className="text-cyan-600 hover:underline">16. Contact Us</a>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            
            {/* Section 1 */}
            <section id="acceptance">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 mb-3">By accessing or using Hiring Pakistan's website, mobile application, or any of our services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our platform.</p>
              <p className="text-gray-600">These terms constitute a legally binding agreement between you and Hiring Pakistan. Your continued use of our platform signifies your acceptance of any updates or modifications to these terms.</p>
            </section>

            {/* Section 2 */}
            <section id="eligibility">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Eligibility</h2>
              <p className="text-gray-600 mb-3">To use our platform, you must meet the following criteria:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Be at least 16 years of age (for job seekers) or 18 years of age (for employers)</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Provide accurate and complete information during registration</li>
                <li>Not be prohibited from using our services under applicable laws</li>
                <li>For employers: have a legitimate business entity registered in Pakistan or authorized to operate in Pakistan</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="accounts">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. User Accounts</h2>
              <p className="text-gray-600 mb-3">When you create an account with us, you agree to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security and confidentiality of your login credentials</li>
                <li>Notify us immediately of any unauthorized access to your account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Not create multiple accounts for the purpose of circumventing our policies</li>
                <li>Not share your account credentials with any third party</li>
              </ul>
              <p className="text-gray-600 mt-3">We reserve the right to suspend or terminate accounts that violate these terms.</p>
            </section>

            {/* Section 4 */}
            <section id="jobseekers">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. For Job Seekers</h2>
              <p className="text-gray-600 mb-3">As a job seeker using our platform, you agree to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Provide accurate and truthful information in your profile and applications</li>
                <li>Only apply to jobs for which you genuinely qualify and are interested in</li>
                <li>Not submit fraudulent, misleading, or虚假 job applications</li>
                <li>Respect the intellectual property rights of employers</li>
                <li>Not attempt to bypass employer screening processes</li>
                <li>Not use the platform to harass, spam, or improperly contact employers</li>
              </ul>
              <p className="text-gray-600 mt-3">⚠️ <strong>Note:</strong> Hiring Pakistan is a free platform for job seekers. We do not charge job seekers for creating profiles, applying to jobs, or any other basic features.</p>
            </section>

            {/* Section 5 */}
            <section id="employers">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. For Employers</h2>
              <p className="text-gray-600 mb-3">As an employer using our platform, you agree to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Provide accurate job descriptions, requirements, and company information</li>
                <li>Not post fake, misleading, or non-existent job opportunities</li>
                <li>Not discriminate against applicants based on race, religion, gender, age, disability, or any other protected characteristic</li>
                <li>Respond to applications in a timely and professional manner</li>
                <li>Respect the privacy of applicant information</li>
                <li>Not use the platform to collect applicant data for purposes other than legitimate hiring</li>
                <li>Comply with all applicable labor laws and regulations</li>
                <li>Pay any applicable fees for premium services and credit purchases</li>
              </ul>
              <p className="text-gray-600 mt-3">Employers who violate these terms may have their accounts suspended and job postings removed without refund.</p>
            </section>

            {/* Section 6 */}
            <section id="payments">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Payments & Credits</h2>
              <p className="text-gray-600 mb-3">For employers using our paid services:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Credit Purchase:</strong> Credits can be purchased through our platform using available payment methods.</li>
                <li><strong>Non-Refundable:</strong> All credit purchases are final and non-refundable except as required by law.</li>
                <li><strong>No Expiration:</strong> Purchased credits do not expire and remain in your account until used.</li>
                <li><strong>Credit Usage:</strong> One credit is deducted each time you view a candidate's CV.</li>
                <li><strong>Plan Changes:</strong> You may upgrade or downgrade your subscription plan at any time.</li>
                <li><strong>Billing Disputes:</strong> Any billing disputes must be reported within 30 days of the transaction date.</li>
                <li><strong>Taxes:</strong> You are responsible for any applicable taxes on your purchases.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="prohibited">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Prohibited Activities</h2>
              <p className="text-gray-600 mb-3">You may not use our platform for any of the following:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Posting fraudulent, misleading, or deceptive job listings</li>
                <li>Harassing, abusing, or threatening other users</li>
                <li>Impersonating any person or entity</li>
                <li>Uploading malware, viruses, or other harmful code</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Scraping, crawling, or collecting user data without permission</li>
                <li>Posting inappropriate, offensive, or illegal content</li>
                <li>Using the platform for illegal activities or to facilitate human trafficking</li>
                <li>Circumventing any technical restrictions or security measures</li>
                <li>Reselling or redistributing our services without authorization</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="content">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. User Content</h2>
              <p className="text-gray-600 mb-3">By submitting content to our platform, you grant us a non-exclusive, worldwide, royalty-free license to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Display, store, and distribute your content on our platform</li>
                <li>Use your content to improve our services and algorithms</li>
                <li>Share your content with employers (for job applications) or candidates (for job postings)</li>
              </ul>
              <p className="text-gray-600 mt-3">You retain ownership of your content. You are solely responsible for the content you submit and must have the right to share it.</p>
              <p className="text-gray-600 mt-2">We reserve the right to remove any content that violates these terms or is otherwise objectionable.</p>
            </section>

            {/* Section 9 */}
            <section id="intellectual">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Intellectual Property</h2>
              <p className="text-gray-600 mb-3">All content and materials on our platform, including but not limited to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Software, code, and underlying technology</li>
                <li>Logos, trademarks, and brand elements</li>
                <li>Design, layout, and user interface</li>
                <li>Text, graphics, and images (excluding user-submitted content)</li>
              </ul>
              <p className="text-gray-600 mt-3">are the property of Hiring Pakistan and are protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express permission.</p>
            </section>

            {/* Section 10 */}
            <section id="termination">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Termination</h2>
              <p className="text-gray-600 mb-3">We may terminate or suspend your account immediately, without prior notice, for any of the following reasons:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Violation of these Terms of Service</li>
                <li>Fraudulent or illegal activity</li>
                <li>Request by law enforcement or government agency</li>
                <li>Extended periods of inactivity (2+ years)</li>
                <li>Technical or security issues affecting the platform</li>
              </ul>
              <p className="text-gray-600 mt-3">Upon termination, your right to use the platform will immediately cease. You may lose access to your data, and we are not obligated to maintain or provide any of your content.</p>
            </section>

            {/* Section 11 */}
            <section id="disclaimers">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">11. Disclaimers</h2>
              <p className="text-gray-600 mb-3">Our platform is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties or representations about:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>The accuracy or reliability of job listings or candidate profiles</li>
                <li>That you will secure employment or find suitable candidates</li>
                <li>Uninterrupted or error-free service</li>
                <li>The security of your data against unauthorized access</li>
                <li>The suitability of any employer or candidate for your needs</li>
              </ul>
              <p className="text-gray-600 mt-3">Hiring Pakistan is a platform that connects job seekers and employers. We do not guarantee employment outcomes or hiring results. You are responsible for conducting your own due diligence.</p>
            </section>

            {/* Section 12 */}
            <section id="limitation">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">12. Limitation of Liability</h2>
              <p className="text-gray-600 mb-3">To the maximum extent permitted by law, Hiring Pakistan and its affiliates, officers, directors, employees, and agents shall not be liable for:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                <li>Any conduct or content of any third party on the platform</li>
                <li>Unauthorized access, alteration, or deletion of your content</li>
                <li>Any bugs, viruses, or other harmful code</li>
              </ul>
              <p className="text-gray-600 mt-3">In no event shall our total liability exceed the amount you paid us, if any, during the six months preceding the claim.</p>
            </section>

            {/* Section 13 */}
            <section id="indemnification">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">13. Indemnification</h2>
              <p className="text-gray-600">You agree to indemnify, defend, and hold harmless Hiring Pakistan and its affiliates from any claims, damages, losses, liabilities, costs, and expenses arising from:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mt-2">
                <li>Your use of the platform</li>
                <li>Your violation of these terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Your content or conduct</li>
              </ul>
            </section>

            {/* Section 14 */}
            <section id="governing">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">14. Governing Law</h2>
              <p className="text-gray-600">These terms shall be governed by and construed in accordance with the laws of Pakistan. Any disputes arising from these terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts located in Karachi, Pakistan.</p>
            </section>

            {/* Section 15 */}
            <section id="changes">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">15. Changes to Terms</h2>
              <p className="text-gray-600">We reserve the right to modify these terms at any time. We will notify you of material changes by:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mt-2">
                <li>Posting the updated terms on this page with a new "Last updated" date</li>
                <li>Sending an email notification to registered users</li>
                <li>Displaying a notice on our platform</li>
              </ul>
              <p className="text-gray-600 mt-3">Your continued use of the platform after any changes constitutes acceptance of the new terms. If you do not agree, you must stop using our services.</p>
            </section>

            {/* Section 16 */}
            <section id="contact">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">16. Contact Us</h2>
              <p className="text-gray-600 mb-3">If you have questions, concerns, or requests regarding these Terms of Service, please contact us:</p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-gray-700"><strong>Email:</strong> <a href="mailto:info.hiringpakistan@gmail.com" className="text-cyan-600 hover:underline">info.hiringpakistan@gmail.com</a></p>
                <p className="text-gray-700"><strong>Phone:</strong> +92 348 2350367</p>
              
              </div>
            </section>

            {/* Footer Note */}
            <div className="bg-cyan-50 p-4 rounded-lg text-center text-sm text-cyan-800">
              <p>By using Hiring Pakistan, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
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