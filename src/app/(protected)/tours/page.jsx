"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Loader2,
  Plane,
  ChevronDown,
  Users,
  CheckCircle2,
  ImageOff,
} from "lucide-react";
import toast from "react-hot-toast";

export default function DestinationsPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState([]);
  const [openGroups, setOpenGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const isAdmin =
    session?.user?.role === "admin" ||
    session?.user?.email?.toLowerCase() === "admin@wanderlust.com";

  useEffect(() => {
    const fetchBookedPackages = async () => {
      if (session?.user?.id) {
        try {
          const endpoint = isAdmin
            ? `${process.env.NEXT_PUBLIC_API_URL}/admin/bookings`
            : `${process.env.NEXT_PUBLIC_API_URL}/bookings/${session.user.id}`;

          const res = await axios.get(endpoint);
          setBookings(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error("Failed to load destination data");
        } finally {
          setLoading(false);
        }
      } else if (status === "unauthenticated") {
        setLoading(false);
      }
    };
    fetchBookedPackages();
  }, [session, status, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const grouped = bookings.reduce((acc, booking) => {
      if (booking.status !== "Confirmed") return acc;
      const key = booking.tour?._id || booking.tour || booking.tourTitle;
      if (!acc[key]) {
        acc[key] = true;
      }
      return acc;
    }, {});
    setOpenGroups(grouped);
  }, [bookings, isAdmin]);

  const getDisplayStatus = (rawStatus) => {
    if (rawStatus === "Pending") return "Booked";
    return rawStatus || "Booked";
  };

  const groupedConfirmedBookings = bookings
    .filter((booking) => booking.status === "Confirmed")
    .reduce((acc, booking) => {
      const key = booking.tour?._id || booking.tour || booking.tourTitle;
      if (!acc[key]) {
        acc[key] = {
          tourId: booking.tour?._id || booking.tour,
          tourTitle: booking.tourTitle,
          tourImage: booking.tourImage,
          travelers: [],
        };
      }
      acc[key].travelers.push(booking);
      return acc;
    }, {});

  const groupedList = Object.values(groupedConfirmedBookings).sort(
    (a, b) => b.travelers.length - a.travelers.length,
  );

  const toggleGroup = (key) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading)
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <Loader2 className="animate-spin text-teal-600 w-12 h-12" />
      </div>
    );

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen pt-32 text-center px-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Please Login to View Your Destinations
        </h2>
        <Link
          href="/login"
          className="inline-block bg-teal-600 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-700 transition">
          Login Now
        </Link>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Confirmed Destinations
            </h1>
            <p className="text-slate-500">
              Package-wise confirmed travelers with dropdown details.
            </p>
          </div>

          {groupedList.length > 0 ? (
            <div className="space-y-4">
              {groupedList.map((group) => {
                const groupKey = group.tourId || group.tourTitle;
                const isOpen = openGroups[groupKey];

                return (
                  <div
                    key={groupKey}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleGroup(groupKey)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition text-left">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 relative shrink-0 border border-slate-200">
                          {group.tourImage ? (
                            <Image
                              src={group.tourImage}
                              alt={group.tourTitle}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400">
                              <ImageOff size={16} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-lg font-bold text-slate-900 truncate">
                            {group.tourTitle}
                          </h2>
                          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                            <Users size={14} /> {group.travelers.length}{" "}
                            travelers confirmed
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-100 p-4 sm:p-5 bg-slate-50/60">
                        <div className="space-y-2">
                          {group.travelers.map((traveler) => (
                            <div
                              key={traveler._id}
                              className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {traveler.userName || "Traveler"}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {traveler.userEmail || traveler.user}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-slate-500">
                                  {new Date(
                                    traveler.startDate,
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 font-bold">
                                  <CheckCircle2 size={12} /> Confirmed
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
              <Users className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                No confirmed packages yet
              </h3>
              <p className="text-slate-500 text-sm">
                Confirm booking requests from the admin dashboard to see them
                here.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            My Destinations
          </h1>
          <p className="text-slate-500">
            Track your bookings from request to confirmation.
          </p>
        </div>

        {bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-2xl border border-teal-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-teal-400 to-indigo-500"></div>

                <div className="relative h-56 bg-gray-200">
                  {booking.tourImage ? (
                    <Image
                      src={booking.tourImage}
                      alt={booking.tourTitle}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                      <ImageOff size={30} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">
                      {getDisplayStatus(booking.status)} Trip
                    </p>
                    <h3 className="text-xl font-bold shadow-black drop-shadow-md">
                      {booking.tourTitle}
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="bg-teal-50 p-2 rounded-lg text-teal-600">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">
                          Start Date
                        </p>
                        <p className="font-semibold text-sm">
                          {new Date(booking.startDate).toDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-bold uppercase">
                        Total Paid
                      </p>
                      <p className="font-bold text-teal-700 text-lg">
                        ${booking.totalPrice}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Plane size={16} className="text-indigo-500" />
                    <span>
                      Status:{" "}
                      <span
                        className={`font-bold ${
                          booking.status === "Confirmed"
                            ? "text-green-600"
                            : booking.status === "Rejected"
                              ? "text-red-600"
                              : "text-amber-600"
                        }`}>
                        {getDisplayStatus(booking.status)}
                      </span>
                    </span>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs text-slate-400">
                      Booking ID: {booking._id.slice(-6)}
                    </span>
                    <Link
                      href="/dashboard/bookings"
                      className="text-teal-600 text-sm font-bold hover:underline">
                      Manage Booking
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No destinations booked yet
            </h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              You haven,t added any packages to your itinerary yet. Visit the
              packages page to start your journey.
            </p>
            <Link
              href="/packages"
              className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">
              Browse Packages
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
