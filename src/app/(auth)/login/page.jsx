"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock, Mail } from "lucide-react";

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
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 pt-28 pb-12">
        <div className="mb-8 animate-in slide-in-from-bottom-5 fade-in duration-700">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-slate-500 text-lg">
            Enter your credentials to continue your journey.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 animate-in slide-in-from-bottom-6 fade-in duration-1000">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition">
                <Mail size={20} />
              </div>
              <input
                type="email"
                required
                placeholder="name@company.com"
                className="pl-12 w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all duration-300 text-slate-900 placeholder-slate-400 font-medium"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-sm font-bold text-slate-700">
                Password
              </label>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition">
                <Lock size={20} />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="pl-12 w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all duration-300 text-slate-900 placeholder-slate-400 font-medium"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/20 hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-3">
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-10 animate-in slide-in-from-bottom-7 fade-in duration-1000 delay-100">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="mt-8 w-full flex items-center justify-center gap-3 bg-white border border-slate-200 p-4 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 text-slate-700 font-bold shadow-sm">
            <Image
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              width={24}
              height={24}
              alt="Google"
              unoptimized
            />
            Sign in with Google
          </button>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don,t have an account?{" "}
            <Link
              href="/register"
              className="text-teal-600 font-bold hover:underline transition">
              Create free account
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-teal-900/30 z-10 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-20"></div>

        <Image
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021"
          alt="Travel"
          fill
          className="object-cover animate-in zoom-in-110 duration-[20s]"
          priority
        />

        <div className="absolute bottom-0 left-0 right-0 p-16 z-30 text-white">
          <blockquote className="text-3xl font-medium leading-relaxed mb-6 font-serif">
            The world is a book and those who do not travel read only one page.
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="w-12 h-0.5 bg-teal-400"></div>
            <p className="text-sm font-bold uppercase tracking-widest text-teal-400">
              Augustine of Hippo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
