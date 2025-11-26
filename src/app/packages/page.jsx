"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Star, CheckCircle, Loader2 } from "lucide-react";
import BookButton from "@/components/BookButton";

export default function PackagesPage() {
  const { data: session } = useSession();
  const [packages, setPackages] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const toursRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tours`
        );
        const toursData = await toursRes.json();
        setPackages(toursData);

        if (session?.user?.id) {
          const bookingRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/bookings/${session.user.id}`
          );
          const bookingData = await bookingRes.json();
          setUserBookings(bookingData.map((b) => b.tour?._id || b.tour));
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session]);

  if (loading)
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <Loader2 className="animate-spin text-teal-600 w-12 h-12" />
      </div>
    );

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            All Packages
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Choose from our exclusive list of {packages.length} premium
            destinations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => {
            const isBooked = userBookings.includes(pkg._id);

            return (
              <div
                key={pkg._id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
                <div className="relative h-64 bg-gray-200">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  {isBooked && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                      <span className="bg-white/90 text-teal-800 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg backdrop-blur-md">
                        <CheckCircle size={16} className="text-green-600" />{" "}
                        Booked
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-teal-700 shadow-sm uppercase z-20">
                    {pkg.priority || "Standard"}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">
                        {pkg.title}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                        <Star size={14} fill="currentColor" /> 5.0
                      </div>
                    </div>
                    <div className="text-teal-600 font-bold text-lg">
                      ${pkg.price}
                    </div>
                  </div>

                  <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-3">
                    {pkg.shortDesc}
                  </p>

                  <div className="space-y-3 mt-auto">
                    <BookButton
                      tourId={pkg._id}
                      title={pkg.title}
                      image={pkg.image}
                      price={pkg.price}
                      duration={pkg.duration}
                      isBooked={isBooked}
                    />
                    <Link
                      href={`/tours/${pkg._id}`}
                      className="block w-full text-center text-sm text-slate-500 hover:text-teal-600 font-medium transition">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
