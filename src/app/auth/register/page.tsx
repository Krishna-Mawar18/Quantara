"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register, loginWithGoogle, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(name, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(
        message.includes("email-already-in-use")
          ? "An account with this email already exists"
          : message.includes("weak-password")
          ? "Password should be at least 6 characters"
          : message
      );
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-400 via-fuchsia-200 to-orange-300 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#ffc2d1,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,#bde0fe,transparent_50%)]" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-300/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-300/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 bg-gradient-to-br from-violet-300 via-pink-200 to-orange-200 rounded-4xl p-8 shadow-xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 text-zinc-900">
            <img src="/Tech Logo - New Group.png" alt="Quantara" className="h-10 w-auto" />
            <span className="text-2xl font-semibold">Quantara</span>
          </Link>
          <h1 className="mt-6 text-3xl font-semibold text-zinc-900 tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-zinc-500">
            Start analyzing your data in minutes
          </p>
        </div>

        <div className="p-8">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl bg-white text-black hover:bg-white hover:text-violet-600 hover:shadow-lg hover:shadow-violet-500 transition-all duration-300"
            size="lg"
            onClick={handleGoogle}
            isLoading={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative my-6">
            <div className="relative flex justify-center text-xs ">
              <span className=" px-3 text-black">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            <Input
              id="name"
              className="bg-white text-black border-pink-200 focus:border-violet-800 hover:border-violet-500 focus:ring-violet-100/50"
              type="text"
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              id="email"
              type="email"
              className="bg-white text-black border-pink-200 focus:border-violet-800 hover:border-violet-500 focus:ring-violet-100/50"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              type="password"
              className="bg-white text-black border-pink-200 focus:border-violet-800 hover:border-violet-500 focus:ring-violet-100/50"
              label="Password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="w-full rounded-xl bg-violet-600 text-white hover:bg-white hover:text-violet-600 hover:shadow-lg hover:shadow-violet-500 transition-all duration-300"
              size="lg"
              isLoading={isLoading}
            >
              Create Account
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
          <p className="mt-4 text-xs text-black text-center">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-1000">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-violet-600 font-medium hover:underline hover:bold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
