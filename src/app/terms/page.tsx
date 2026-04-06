import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-zinc-900 mb-8">Terms of Service</h1>
        <p className="text-sm text-zinc-500 mb-8">Last updated: April 1, 2026</p>

        <div className="prose prose-zinc max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-zinc-600 leading-relaxed">
              By accessing or using Quantara (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">2. Description of Service</h2>
            <p className="text-zinc-600 leading-relaxed">
              Quantara is an AI-powered data analytics platform that allows users to upload datasets, generate visualizations, gain insights, and build predictive models. The Service is provided on a subscription basis with various plan tiers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">3. User Accounts</h2>
            <p className="text-zinc-600 leading-relaxed">
              To use the Service, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when creating your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">4. Data Ownership</h2>
            <p className="text-zinc-600 leading-relaxed">
              You retain all rights to the data you upload to the Service. We do not claim ownership of your data. By uploading data, you grant us a limited license to process and analyze your data solely for the purpose of providing the Service to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">5. Acceptable Use</h2>
            <p className="text-zinc-600 leading-relaxed">
              You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, or impair the Service. You may not attempt to gain unauthorized access to any part of the Service or its related systems.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">6. Subscription and Billing</h2>
            <p className="text-zinc-600 leading-relaxed">
              Certain features of the Service require a paid subscription. Subscriptions are billed monthly through our payment processor, Razorpay. You may cancel your subscription at any time, but no refunds will be provided for partial months.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-zinc-600 leading-relaxed">
              The Service is provided &quot;as is&quot; without warranties of any kind. We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">8. Changes to Terms</h2>
            <p className="text-zinc-600 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the Service. Your continued use of the Service after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">9. Contact</h2>
            <p className="text-zinc-600 leading-relaxed">
              If you have questions about these Terms, please contact us at{" "}
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
