"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { User, Mail, MapPin, Calendar, Save, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    hometown: "",
    dob: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.id) {
        try {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/users/${session.user.id}`
          );
          setFormData({
            name: res.data.name || "",
            email: res.data.email || "",
            hometown: res.data.hometown || "",
            dob: res.data.dob || "",
          });
        } catch (error) {
          toast.error("Failed to load profile");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUser();
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${session.user.id}`,
        {
          name: formData.name,
          hometown: formData.hometown,
          dob: formData.dob,
        }
      );
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <Loader2 className="animate-spin text-teal-600 w-12 h-12" />
      </div>
    );

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 h-32 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="relative w-24 h-24 rounded-full border-4 border-white bg-white">
                <Image
                  src={`https://ui-avatars.com/api/?name=${formData.name}&background=0d9488&color=fff`}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>

          <div className="pt-16 px-8 pb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              My Profile
            </h1>
            <p className="text-slate-500 text-sm mb-8">
              Manage your personal information
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-10 p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hometown
                  </label>
                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <input
                      type="text"
                      value={formData.hometown}
                      onChange={(e) =>
                        setFormData({ ...formData, hometown: e.target.value })
                      }
                      className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) =>
                        setFormData({ ...formData, dob: e.target.value })
                      }
                      className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-teal-700 transition flex items-center gap-2 disabled:opacity-70">
                  {saving ? "Saving..." : "Save Changes"}
                  {!saving && <Save size={18} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
