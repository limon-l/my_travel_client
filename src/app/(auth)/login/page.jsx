"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { Map, ArrowRight, Lock, Mail } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result.error) {
      toast.error("Invalid email or password");
    } else {
      toast.success("Welcome back!");
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 py-12">
        <div className="mb-10">
          <Link href="/" className="flex items-center gap-2 group w-fit mb-8">
            <div className="bg-teal-600 text-white p-1.5 rounded-lg group-hover:bg-teal-700 transition">
              <Map size={20} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Wanderlust<span className="text-teal-600">.</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back
          </h1>
          <p className="text-slate-500">
            Please enter your details to access your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                placeholder="name@company.com"
                className="pl-10 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition text-slate-900 placeholder-slate-400"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="pl-10 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition text-slate-900 placeholder-slate-400"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white p-3.5 rounded-xl font-semibold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 disabled:opacity-70 flex justify-center items-center gap-2">
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="mt-6 w-full flex items-center justify-center gap-3 bg-white border border-slate-200 p-3 rounded-xl hover:bg-slate-50 transition text-slate-700 font-medium">
            <Image
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              width={20}
              height={20}
              alt="Google"
              unoptimized
            />
            Sign in with Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          Don,t have an account?{" "}
          <Link
            href="/register"
            className="text-teal-600 font-semibold hover:underline">
            Create free account
          </Link>
        </p>
      </div>
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-teal-900/20 z-10 mix-blend-multiply"></div>
        <Image
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021"
          alt="Travel"
          fill
          className="object-cover opacity-90"
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 p-12 z-20 text-white bg-gradient-to-t from-black/80 to-transparent">
          <blockquote className="text-2xl font-medium leading-relaxed mb-4">
            The world is a book and those who do not travel read only one page.
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-8 h-0.5 bg-teal-400"></div>
            <p className="text-sm font-bold uppercase tracking-widest text-teal-400">
              Augustine of Hippo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
