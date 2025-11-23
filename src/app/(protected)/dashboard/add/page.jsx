"use client";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function AddProduct() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm();

  // Client-side protection check
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading")
    return <div className="pt-32 text-center">Loading...</div>;

  const onSubmit = async (data) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/tours`, data);
      toast.success("Tour added successfully!");
      reset(); // clear form
    } catch (err) {
      toast.error("Failed to add tour.");
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-2xl mx-auto px-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Add New Tour Package
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              {...register("title")}
              className="w-full p-2 border rounded-md mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              {...register("image")}
              className="w-full p-2 border rounded-md mt-1"
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                {...register("price")}
                className="w-full p-2 border rounded-md mt-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                {...register("date")}
                className="w-full p-2 border rounded-md mt-1"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              {...register("priority")}
              className="w-full p-2 border rounded-md mt-1">
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Short Description
            </label>
            <input
              {...register("shortDesc")}
              className="w-full p-2 border rounded-md mt-1"
              maxLength={100}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Description
            </label>
            <textarea
              {...register("fullDesc")}
              rows={5}
              className="w-full p-2 border rounded-md mt-1"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition font-bold">
            Add Package
          </button>
        </form>
      </div>
    </div>
  );
}
