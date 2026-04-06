"use client";

import Link from "next/link";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function Footer() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <footer ref={ref} className={`bg-gradient-to-b from-[#a06cd5]/30 via-[#dac3e8] to-[#ffc9ff] border-t border-[#bd68ee] py-16 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className={`transition-all duration-500 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center gap-2 mb-4">
              <img src="/Tech Logo - New Group.png" alt="Quantara" className="h-12 w-auto" />
              <span className="text-2xl font-semibold text-zinc-900">Quantara</span>
            </div>
            <p className="text-sm text-zinc-500">AI-powered data intelligence for everyone.</p>
          </div>
          <div className={`transition-all duration-500 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <h4 className="text-lg font-semibold text-zinc-900 mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link href="#features" className="hover:text-zinc-900 transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-zinc-900 transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-zinc-900 transition-colors">Changelog</Link></li>
            </ul>
          </div>
          <div className={`transition-all duration-500 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <h4 className="text-lg font-semibold text-zinc-900 mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link href="#" className="hover:text-zinc-900 transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-zinc-900 transition-colors">API</Link></li>
              <li><Link href="#" className="hover:text-zinc-900 transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div className={`transition-all duration-500 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <h4 className="text-lg font-semibold text-zinc-900 mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link href="/privacy" className="hover:text-zinc-900 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-zinc-900 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[#bd68ee]">
          <p className="text-sm text-zinc-400">&copy; 2026 Quantara. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
