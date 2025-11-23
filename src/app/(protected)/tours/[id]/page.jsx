import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getTour(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function TourDetails({ params }) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const tour = await getTour(params.id);

  if (!tour) return <div className="pt-32 text-center">Tour not found</div>;

  return (
    <div className="pt-24 pb-20 max-w-4xl mx-auto px-4">
      <Link
        href="/tours"
        className="text-gray-500 mb-4 inline-block hover:text-teal-600">
        ← Back to Tours
      </Link>
      <div className="h-80 w-full rounded-2xl overflow-hidden mb-8">
        <img
          src={tour.image || "https://placehold.co/800x400"}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex justify-between items-start">
        <h1 className="text-4xl font-bold mb-4">{tour.title}</h1>
        <div className="bg-teal-50 text-teal-700 px-4 py-2 rounded-lg font-bold text-xl">
          ${tour.price}
        </div>
      </div>
      <div className="flex gap-4 text-sm text-gray-500 mb-8 border-b pb-8">
        <span>📅 {tour.date}</span>
        <span>⭐ {tour.priority}</span>
      </div>
      <div className="prose max-w-none">
        <h3 className="text-xl font-bold mb-2">Description</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{tour.fullDesc}</p>
      </div>
    </div>
  );
}
