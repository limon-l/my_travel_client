"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Calendar, MapPin, XCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function MyBookings() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (session?.user?.id) {
        try {
          // Backend now returns full booking objects with dates
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/bookings/${session.user.id}`
          );
          setBookings(res.data);
        } catch (err) {
          console.error("Failed to load bookings");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBookings();
  }, [session]);

  const cancelBooking = async (id) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}`);
      setBookings(bookings.filter((b) => b._id !== id));
      toast.success("Booking cancelled successfully");
    } catch (err) {
      toast.error("Failed to cancel");
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading)
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          My Adventures
        </h1>
        <p className="text-slate-500 mb-8">
          Manage your upcoming and past trips.
        </p>

        <div className="space-y-4">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center transition hover:shadow-md">
                <div className="h-24 w-24 sm:h-24 sm:w-24 relative rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  <Image
                    src={booking.tourImage || "https://placehold.co/100x100"}
                    alt={booking.tourTitle || "Tour"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {booking.tourTitle}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                    <div className="flex items-center gap-1 bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md border border-teal-100">
                      <Calendar size={14} />
                      <span className="font-medium">
                        {formatDate(booking.startDate)} -{" "}
                        {formatDate(booking.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span className="text-xs">
                        Booked on {formatDate(booking.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                  <div className="text-xl font-bold text-slate-900">
                    ${booking.totalPrice}
                  </div>
                  <button
                    onClick={() => cancelBooking(booking._id)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider transition bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100">
                    <XCircle size={14} /> Cancel Trip
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
              <MapPin className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-lg font-medium text-slate-900">
                No trips booked
              </h3>
              <p className="text-slate-500 mb-6">
                You haven,t booked any adventures yet.
              </p>
              <Link
                href="/tours"
                className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-full text-white bg-teal-600 hover:bg-teal-700 transition">
                Explore Destinations
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
