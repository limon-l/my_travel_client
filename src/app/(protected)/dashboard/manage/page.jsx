"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Search, Package, AlertCircle } from "lucide-react";

export default function ManageProducts() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tours`);
        setTours(res.data);
      } catch (err) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    const previousTours = [...tours];
    setTours(tours.filter((t) => t._id !== id));
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/tours/${id}`);
      toast.success("Package deleted successfully");
    } catch (err) {
      setTours(previousTours);
      toast.error("Failed to delete");
    }
  };

  const filteredTours = tours.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="min-h-screen pt-32 flex justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Inventory Management
          </h1>
          <p className="text-slate-500">
            Manage your tour packages and pricing.
          </p>
        </div>

        <div className="bg-white p-4 rounded-t-2xl border border-slate-200 border-b-0 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search packages..."
              className="pl-10 w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link
            href="/dashboard/add"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition shadow-sm">
            <Plus size={16} /> Add Package
          </Link>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-b-2xl overflow-hidden">
          {filteredTours.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Package Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredTours.map((tour) => (
                    <tr
                      key={tour._id}
                      className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 shrink-0 relative rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                            <Image
                              src={tour.image || "https://placehold.co/100x100"}
                              alt={tour.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-900">
                              {tour.title}
                            </div>
                            <div className="text-xs text-slate-500 truncate max-w-[180px]">
                              {tour.location || "Global"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            tour.priority === "VIP"
                              ? "bg-purple-50 text-purple-700 border-purple-100"
                              : tour.priority === "Premium"
                              ? "bg-teal-50 text-teal-700 border-teal-100"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>
                          {tour.priority || "Standard"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                        ${tour.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {tour.duration || 5} Days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(tour._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="bg-slate-50 p-4 rounded-full mb-3 text-slate-400">
                <Package size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                No packages found
              </h3>
              <p className="text-slate-500 text-sm mt-1 mb-6">
                {search
                  ? "Try adjusting your search."
                  : "Get started by creating your first tour package."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
