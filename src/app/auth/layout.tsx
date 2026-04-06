import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quantara - Data Intelligence Platform",
  description:
    "Convert raw datasets into actionable business insights with automated analytics, visualizations, and AI-generated insights.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
