import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

// Helper to fetch data
async function getTours() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours`, {
      cache: "no-store", // Important for dynamic data
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export default async function ToursPage() {
  // 1. Protect the route
  const session = await getServerSession();
  if (!session) {
    redirect("/login?callbackUrl=/tours");
  }

  const tours = await getTours();

  return (
    <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto pb-20">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Upcoming Tours</h1>
          <p className="text-gray-500 mt-2">
            Exclusive packages for our members.
          </p>
        </div>
        {/* Search Bar (UI Only) */}
        <input
          type="text"
          placeholder="Search destinations..."
          className="mt-4 md:mt-0 p-2 border rounded-lg w-full md:w-64"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tours.map((tour) => (
          <div
            key={tour._id}
            className="bg-white border rounded-xl overflow-hidden hover:shadow-xl transition duration-300 group">
            <div className="h-48 bg-gray-200 overflow-hidden">
              <img
                src={tour.image || "https://placehold.co/600x400"}
                alt={tour.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg line-clamp-1">{tour.title}</h3>
                <span className="text-teal-700 font-bold text-sm">
                  ${tour.price}
                </span>
              </div>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                {tour.shortDesc}
              </p>
              <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
                <span>{tour.priority}</span>
                <span>{tour.date}</span>
              </div>
              <Link
                href={`/tours/${tour._id}`}
                className="block w-full text-center bg-gray-900 text-white py-2 rounded-lg text-sm hover:bg-teal-600 transition">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
