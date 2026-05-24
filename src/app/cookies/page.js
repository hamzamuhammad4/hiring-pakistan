// src/app/cookies/page.js
import Link from "next/link";

export const metadata = {
  title: "Cookie Policy - Hiring Pakistan",
  description: "Learn about how Hiring Pakistan uses cookies and similar technologies to enhance your browsing experience",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Cookie Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-gray-500 mt-2">Understanding how we use cookies to improve your experience</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          
          {/* Table of Contents */}
          <div className="bg-gray-50 p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <a href="#what-are-cookies" className="text-cyan-600 hover:underline">1. What Are Cookies?</a>
              <a href="#how-we-use" className="text-cyan-600 hover:underline">2. How We Use Cookies</a>
              <a href="#types-of-cookies" className="text-cyan-600 hover:underline">3. Types of Cookies We Use</a>
              <a href="#third-party" className="text-cyan-600 hover:underline">4. Third-Party Cookies</a>
              <a href="#managing-cookies" className="text-cyan-600 hover:underline">5. Managing Cookies</a>
              <a href="#changes" className="text-cyan-600 hover:underline">6. Changes to This Policy</a>
              <a href="#contact" className="text-cyan-600 hover:underline">7. Contact Us</a>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            
            {/* Section 1 */}
            <section id="what-are-cookies">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. What Are Cookies?</h2>
              <p className="text-gray-600 mb-3">Cookies are small text files that are placed on your computer, smartphone, or other device when you visit a website. They are widely used to make websites work more efficiently, enhance user experience, and provide valuable information to website owners.</p>
              <p className="text-gray-600">Cookies are not harmful and cannot be used to run programs or deliver viruses to your device. They are uniquely assigned to you and can only be read by a web server in the domain that issued the cookie.</p>
            </section>

            {/* Section 2 */}
            <section id="how-we-use">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. How We Use Cookies</h2>
              <p className="text-gray-600 mb-3">At Hiring Pakistan, we use cookies for the following purposes:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Essential Operations:</strong> To enable core functionality such as user authentication, account management, and secure access to your profile.</li>
                <li><strong>Performance & Analytics:</strong> To understand how visitors interact with our platform, which pages are most popular, and how we can improve user experience.</li>
                <li><strong>Preferences:</strong> To remember your settings, language preferences, and customized view options.</li>
                <li><strong>Security:</strong> To help detect and prevent fraudulent activity, unauthorized access, and potential threats.</li>
                <li><strong>Personalization:</strong> To show you relevant job recommendations and tailored content based on your interests and browsing behavior.</li>
                <li><strong>Session Management:</strong> To keep you logged in during your visit and across multiple browsing sessions.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="types-of-cookies">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-cyan-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Strictly Necessary Cookies</h3>
                  <p className="text-gray-600">These cookies are essential for the operation of our platform. They enable you to navigate the website and use its core features, such as accessing secure areas, logging into your account, and submitting job applications. Without these cookies, our services cannot be provided.</p>
                  <p className="text-gray-500 text-sm mt-2">Examples: Session cookies, authentication cookies, security tokens</p>
                </div>

                <div className="border-l-4 border-cyan-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Performance & Analytics Cookies</h3>
                  <p className="text-gray-600">These cookies collect information about how visitors use our platform, such as which pages are visited most often, how users navigate the site, and any error messages encountered. This helps us improve the performance and design of our platform.</p>
                  <p className="text-gray-500 text-sm mt-2">Examples: Google Analytics, page load time metrics, user behavior tracking</p>
                </div>

                <div className="border-l-4 border-cyan-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Functional Cookies</h3>
                  <p className="text-gray-600">These cookies allow our platform to remember choices you make (such as your username, language preference, or region) and provide enhanced, more personalized features. The information collected may be anonymized and cannot track your browsing activity on other websites.</p>
                  <p className="text-gray-500 text-sm mt-2">Examples: Language preferences, saved job filters, dashboard layout settings</p>
                </div>

                <div className="border-l-4 border-cyan-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Targeting/Advertising Cookies</h3>
                  <p className="text-gray-600">These cookies are used to deliver content that is more relevant to you and your interests. They may be used to deliver targeted job recommendations, limit the number of times you see an advertisement, and measure the effectiveness of our marketing campaigns.</p>
                  <p className="text-gray-500 text-sm mt-2">Examples: Job recommendation cookies, marketing campaign tracking</p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="third-party">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Third-Party Cookies</h2>
              <p className="text-gray-600 mb-3">We also use cookies and similar technologies from trusted third-party service providers to enhance our platform:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Google Analytics:</strong> To analyze website traffic and user behavior patterns.</li>
                <li><strong>Firebase:</strong> For authentication, database performance, and real-time updates.</li>
                <li><strong>Payment Processors:</strong> To securely process transactions and prevent fraud.</li>
                <li><strong>Social Media Platforms:</strong> To enable sharing of job postings and content.</li>
              </ul>
              <p className="text-gray-600 mt-3">These third parties have their own privacy policies and cookie policies, which we encourage you to review.</p>
            </section>

            {/* Section 5 */}
            <section id="managing-cookies">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Managing Cookies</h2>
              <p className="text-gray-600 mb-3">You have the right to control how cookies are used on your device. You can manage cookies through your browser settings:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Google Chrome</h3>
                  <p className="text-gray-600 text-sm">Settings → Privacy and Security → Cookies and other site data</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Mozilla Firefox</h3>
                  <p className="text-gray-600 text-sm">Options → Privacy & Security → Cookies and Site Data</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Safari</h3>
                  <p className="text-gray-600 text-sm">Preferences → Privacy → Cookies and website data</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Microsoft Edge</h3>
                  <p className="text-gray-600 text-sm">Settings → Site permissions → Cookies and site data</p>
                </div>
              </div>

              <p className="text-gray-600 mb-3">You can typically set your browser to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Accept all cookies</li>
                <li>Reject all cookies (except essential ones)</li>
                <li>Notify you when a cookie is being sent</li>
                <li>Delete existing cookies from your device</li>
                <li>Block third-party cookies</li>
              </ul>
              
              <div className="bg-amber-50 p-4 rounded-lg mt-3">
                <p className="text-amber-800 text-sm">⚠️ <strong>Important Note:</strong> Disabling cookies may affect your experience on our platform. Essential features such as logging in, submitting applications, and saving job preferences may not work properly without cookies.</p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="changes">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Changes to This Cookie Policy</h2>
              <p className="text-gray-600">We may update this Cookie Policy from time to time to reflect changes in technology, legal requirements, or our business practices. Any changes will be posted on this page with an updated "Last updated" date. We encourage you to review this policy periodically to stay informed about how we use cookies.</p>
            </section>

            {/* Section 7 */}
            <section id="contact">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Contact Us</h2>
              <p className="text-gray-600 mb-3">If you have questions, concerns, or requests regarding this Cookie Policy, please contact us:</p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-gray-700"><strong>Email:</strong> <a href="mailto:info.hiringpakistan@gmail.com" className="text-cyan-600 hover:underline">info.hiringpakistan@gmail.com</a></p>
                <p className="text-gray-700"><strong>Phone:</strong> +92 348 2350367</p>
               
              </div>
            </section>

            {/* Cookie Consent Notice */}
            <div className="bg-cyan-50 p-4 rounded-lg text-center text-sm text-cyan-800">
              <p>By continuing to use Hiring Pakistan, you consent to our use of cookies as described in this Cookie Policy.</p>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/privacy" className="text-cyan-600 hover:underline">Privacy Policy</Link>
          <span className="text-gray-300">|</span>
          <Link href="/terms" className="text-cyan-600 hover:underline">Terms of Service</Link>
          <span className="text-gray-300">|</span>
          <Link href="/contact" className="text-cyan-600 hover:underline">Contact Us</Link>
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