"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { Trash2, Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ManageProducts() {
  const { status } = useSession();
  const router = useRouter();
  const [tours, setTours] = useState([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    fetchTours();
  }, [status, router]);

  const fetchTours = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tours`);
      setTours(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/tours/${id}`);
      toast.success("Deleted");
      fetchTours(); // Refresh list
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  if (status === "loading")
    return <div className="pt-32 text-center">Loading...</div>;

  return (
    <div className="pt-24 pb-20 max-w-5xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Manage Packages</h1>
      <div className="bg-white shadow-sm border rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tours.map((tour) => (
              <tr key={tour._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {tour.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-teal-600 font-bold">
                  ${tour.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {tour.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-4">
                  <Link
                    href={`/tours/${tour._id}`}
                    className="text-indigo-600 hover:text-indigo-900">
                    <Eye size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(tour._id)}
                    className="text-red-600 hover:text-red-900">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tours.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No tours found. Add one?
          </div>
        )}
      </div>
    </div>
  );
}
