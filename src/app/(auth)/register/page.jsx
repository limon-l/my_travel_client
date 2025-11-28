"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    dob: "",
    hometown: "",
    password: "",
    confirmPass: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.password !== data.confirmPass) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      await axios.post(`${apiUrl}/register`, {
        name: data.name,
        email: data.email,
        dob: data.dob,
        hometown: data.hometown,
        password: data.password,
      });

      toast.success("Registration successful! Please login.");
      router.push("/login");
    } catch (err) {
      console.error("Registration Error:", err);
      const msg =
        err.response?.data?.error || "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setData({ ...data, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            required
          />
          <input
            name="email"
            type="email"
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 ml-1">
                Date of Birth
              </label>
              <input
                name="dob"
                type="date"
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 ml-1">Hometown</label>
              <input
                name="hometown"
                onChange={handleChange}
                placeholder="City"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                required
              />
            </div>
          </div>

          <input
            name="password"
            type="password"
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            required
          />
          <input
            name="confirmPass"
            type="password"
            onChange={handleChange}
            placeholder="Confirm Password"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition disabled:opacity-70">
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>
        <div className="mt-6">
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or sign up with
              </span>
            </div>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 p-3 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium">
            <Image
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              width={20}
              height={20}
              alt="Google"
              unoptimized
            />
            Continue with Google
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-600 font-bold">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
