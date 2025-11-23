import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <section className="relative h-[85vh] flex items-center justify-center bg-gray-900 text-white">
        <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073')] bg-cover bg-center"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <span className="text-teal-400 tracking-widest uppercase text-sm font-bold mb-2 block">
            Explore the World
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Life is Short and The World is Wide
          </h1>
          <div className="flex gap-4 justify-center">
            <Link
              href="/tours"
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-full transition font-medium">
              View Tours
            </Link>
            <Link
              href="/register"
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-full transition font-medium">
              Join Us
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">
            Our Premium Services
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {["Hotel Booking", "Flight Service", "Tour Guide"].map((item, i) => (
            <div
              key={i}
              className="p-8 border rounded-2xl hover:shadow-lg transition text-center">
              <div className="h-12 w-12 bg-teal-100 rounded-full mx-auto mb-4"></div>
              <h3 className="font-bold text-xl mb-2">{item}</h3>
              <p className="text-gray-500 text-sm">
                Premium quality service guaranteed for all our registered
                members.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-teal-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Popular Destinations</h2>
          <p>Access our full catalog by logging in.</p>
        </div>
      </section>
    </main>
  );
}
