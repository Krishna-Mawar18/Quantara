import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/Tech Logo - New Group.png" alt="Quantara" className="h-8 w-auto" />
            <span className="text-lg font-semibold text-zinc-900">Quantara</span>
          </Link>
          <Link href="/auth/login" className="text-sm text-violet-600 hover:underline">
            Sign in
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-zinc-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 mb-8">Last updated: April 1, 2026</p>

        <div className="prose prose-zinc max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">1. Information We Collect</h2>
            <p className="text-zinc-600 leading-relaxed mb-3">
              We collect information you provide directly to us when you:
            </p>
            <ul className="list-disc pl-6 text-zinc-600 space-y-2">
              <li>Create an account (name, email, password)</li>
              <li>Upload datasets for analysis</li>
              <li>Make a subscription payment</li>
              <li>Contact us for support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-zinc-600 leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-zinc-600 space-y-2">
              <li>Provide, maintain, and improve the Service</li>
              <li>Process your subscription payments</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Detect and prevent fraudulent activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">3. Data Storage and Security</h2>
            <p className="text-zinc-600 leading-relaxed">
              Your data is stored securely using industry-standard encryption. We use Amazon Web Services (AWS) for cloud storage and Firebase for authentication. We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">4. Data Sharing</h2>
            <p className="text-zinc-600 leading-relaxed">
              We do not sell, trade, or rent your personal data to third parties. We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-zinc-600 space-y-2 mt-3">
              <li>Payment processors (Razorpay) to process subscriptions</li>
              <li>Cloud service providers (AWS, Firebase) to host the Service</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">5. Your Data Rights</h2>
            <p className="text-zinc-600 leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-zinc-600 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">6. Cookies</h2>
            <p className="text-zinc-600 leading-relaxed">
              We use essential cookies to maintain your session and authentication state. We do not use tracking cookies for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">7. Children&apos;s Privacy</h2>
            <p className="text-zinc-600 leading-relaxed">
              The Service is not intended for users under the age of 16. We do not knowingly collect personal information from children under 16.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">8. Changes to This Policy</h2>
            <p className="text-zinc-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">9. Contact Us</h2>
            <p className="text-zinc-600 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:krishnamawar176@gmail.com" className="text-violet-600 hover:underline">
                krishnamawar176@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-zinc-200 py-8">
        <div className="max-w-3xl mx-auto px-6 text-center text-xs text-zinc-400">
          &copy; 2026 Quantara. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
