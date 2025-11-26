import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Star, Tag, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import BookButton from "@/components/BookButton";
import { authOptions } from "@/lib/auth";

async function getTour(id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

async function checkIsBooked(userId, tourId) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/bookings/${userId}`,
      {
        cache: "no-store",
      }
    );
    if (!res.ok) return false;
    const bookings = await res.json();
    return bookings.some((b) => b.tour?._id === tourId || b.tour === tourId);
  } catch (error) {
    return false;
  }
}

export default async function TourDetails({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const session = await getServerSession(authOptions);

  const tourData = getTour(id);
  const bookingStatusData = session
    ? checkIsBooked(session.user.id, id)
    : Promise.resolve(false);

  const [tour, isBooked] = await Promise.all([tourData, bookingStatusData]);

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Tour not found</h2>
          <Link
            href="/packages"
            className="text-teal-600 hover:underline mt-2 inline-block">
            Return to Packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-6xl mx-auto px-4 sm:px-6">
      <Link
        href="/packages"
        className="inline-flex items-center text-slate-500 mb-8 hover:text-teal-600 transition font-medium">
        <ArrowLeft size={18} className="mr-2" /> Back to Packages
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        <div className="h-[400px] lg:h-[500px] w-full rounded-3xl overflow-hidden shadow-lg relative bg-gray-200">
          <Image
            src={tour.image || "https://placehold.co/600x400"}
            alt={tour.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-5 py-2 rounded-full text-teal-800 font-bold shadow-sm text-lg">
            ${tour.price}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-teal-100">
              {tour.priority || "Standard"} Package
            </span>
            <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-100 flex items-center gap-1">
              <Star size={12} fill="currentColor" /> 5.0 Rating
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {tour.title}
          </h1>

          <div className="flex flex-wrap gap-6 text-sm text-slate-500 mb-8 border-y border-slate-100 py-6">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-teal-500" />
              <span className="font-medium text-slate-700">
                {tour.duration || 5} Days
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-teal-500" />
              <span className="font-medium text-slate-700">
                {tour.location || "Global Destination"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-teal-500" />
              <span className="font-medium text-slate-700">
                Availability: Year Round
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
            <h4 className="font-bold text-slate-900 mb-3">
              Package Highlights
            </h4>
            <p className="text-slate-600 leading-relaxed mb-4">
              {tour.shortDesc}
            </p>
            <ul className="grid grid-cols-2 gap-2 text-sm text-slate-500">
              <li className="flex items-center gap-2">✓ Professional Guide</li>
              <li className="flex items-center gap-2">✓ Luxury Hotel</li>
              <li className="flex items-center gap-2">✓ All Transport</li>
              <li className="flex items-center gap-2">✓ Daily Breakfast</li>
            </ul>
          </div>

          <BookButton
            tourId={tour._id}
            title={tour.title}
            image={tour.image}
            price={tour.price}
            duration={tour.duration}
            isBooked={isBooked}
          />
        </div>
      </div>

      <div className="max-w-4xl">
        <h3 className="text-2xl font-bold mb-6 text-slate-900 border-b border-slate-100 pb-4">
          Detailed Itinerary & Description
        </h3>
        <div className="prose prose-lg prose-slate text-slate-600 max-w-none">
          <p className="whitespace-pre-wrap leading-loose">
            {tour.fullDesc || tour.shortDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
