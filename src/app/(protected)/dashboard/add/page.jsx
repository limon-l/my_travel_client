"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Image as ImageIcon,
  Type,
  DollarSign,
  Calendar,
  Star,
  AlignLeft,
  FileText,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";

export default function AddProduct() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const imageUrl = watch("image");

  const onSubmit = async (data) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/tours`, data);
      toast.success("Package created successfully!");
      router.push("/dashboard/manage");
      router.refresh();
    } catch (err) {
      toast.error("Failed to create package");
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Link
                href="/dashboard/manage"
                className="hover:text-slate-800 transition">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-medium">Create Package</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Add New Tour</h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/manage"
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition">
              Cancel
            </Link>
            <button
              form="tour-form"
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-900/10 disabled:opacity-70">
              {isSubmitting ? "Publishing..." : "Publish Tour"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <form
              id="tour-form"
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8">
              <section>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <LayoutDashboard size={20} className="text-teal-600" />
                  General Information
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Tour Title
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Type size={18} />
                      </div>
                      <input
                        {...register("title", {
                          required: "Title is required",
                        })}
                        className="pl-10 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition"
                        placeholder="e.g. 7-Day Swiss Alps Adventure"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Short Description
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 text-slate-400">
                        <AlignLeft size={18} />
                      </div>
                      <textarea
                        {...register("shortDesc", {
                          required: true,
                          maxLength: 100,
                        })}
                        rows={2}
                        className="pl-10 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition resize-none"
                        placeholder="Brief summary for the card view (Max 100 chars)"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1 text-right">
                      Recommended: Keep it punchy.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Full Itinerary / Description
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 text-slate-400">
                        <FileText size={18} />
                      </div>
                      <textarea
                        {...register("fullDesc", { required: true })}
                        rows={8}
                        className="pl-10 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition"
                        placeholder="Detailed day-by-day plan, inclusions, exclusions..."
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className="border-t border-slate-100 my-6"></div>

              <section>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <Calendar size={20} className="text-teal-600" />
                  Schedule & Pricing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Price ($)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <DollarSign size={18} />
                      </div>
                      <input
                        type="number"
                        {...register("price", { required: true })}
                        className="pl-10 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      {...register("date", { required: true })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition text-slate-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Tour Category
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Star size={18} />
                      </div>
                      <select
                        {...register("priority")}
                        className="pl-10 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition appearance-none cursor-pointer">
                        <option value="Standard">Standard Package</option>
                        <option value="Premium">Premium Package</option>
                        <option value="VIP">VIP Experience</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <ArrowLeft size={16} className="-rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </form>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-28">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Media
              </h3>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Cover Image URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ImageIcon size={16} />
                  </div>
                  <input
                    {...register("image")}
                    className="pl-9 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="aspect-video w-full rounded-xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 relative flex items-center justify-center">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized={true}
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                    <span className="text-xs">Image Preview</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-4 text-center leading-relaxed">
                Use a high-quality landscape image from Unsplash or similar
                sources for best results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
