"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
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

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      await axios.post(`${apiUrl}/register`, {
        name: formData.name,
        email: formData.email,
        dob: formData.dob,
        hometown: formData.hometown,
        password: formData.password,
      });
      toast.success("Registration successful! Please login.");
      router.push("/login");
    } catch (err) {
      toast.error("Registration failed. Email might represent.");
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
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition">
            Register
          </button>
        </form>

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
