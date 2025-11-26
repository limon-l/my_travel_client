"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Globe, Shield, Users, Star } from "lucide-react";

export default function Home() {
  const [dbTours, setDbTours] = useState([]);

  const constantPackages = [
    {
      title: "The Royal Europe",
      price: 2499,
      img: "https://www.bennysroyaltours.com/tours/gorgeous-europe-tour/media_19ba67d827d8643617ac5992e9da2705d5a550643.png?width=750&format=png&optimize=medium",
      days: "10 Days",
      rating: 5.0,
      shortDesc: "10 Days All Inclusive",
    },
    {
      title: "Bali Honeymoon Special",
      price: 1299,
      img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
      days: "7 Days",
      rating: 4.9,
      shortDesc: "7 Days Romantic Getaway",
    },
    {
      title: "Swiss Alps Adventure",
      price: 3100,
      img: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800",
      days: "8 Days",
      rating: 4.8,
      shortDesc: "8 Days Hiking & Skiing",
    },
    {
      title: "Maldives Luxury Escape",
      price: 4500,
      img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800",
      days: "5 Days",
      rating: 5.0,
      shortDesc: "5 Days Overwater Villa",
    },
    {
      title: "Kyoto Cultural Walk",
      price: 1800,
      img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800",
      days: "9 Days",
      rating: 4.7,
      shortDesc: "9 Days Cherry Blossoms",
    },
    {
      title: "African Safari Elite",
      price: 5200,
      img: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800",
      days: "12 Days",
      rating: 4.9,
      shortDesc: "12 Days Big Five",
    },
  ];

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours`);
        if (res.ok) {
          const data = await res.json();
          setDbTours(data);
        }
      } catch (e) {
        console.error("Background fetch failed", e);
      }
    };
    fetchTours();
  }, []);

  const getDetailsLink = (title) => {
    const match = dbTours.find((t) => t.title === title);
    return match ? `/tours/${match._id}` : "/packages";
  };

  return (
    <main className="flex flex-col min-h-screen">
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-teal-100/50 rounded-full blur-3xl opacity-60 translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-3xl opacity-60 -translate-x-1/3 translate-y-1/4"></div>

        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-teal-50 text-teal-700 text-xs font-bold tracking-wider uppercase mb-6 border border-teal-100">
            Explore the Unseen
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8 leading-tight">
            Travel{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-600 to-indigo-600">
              Beyond
            </span>{" "}
            <br /> Boundaries.
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Curated tours for the modern adventurer. We handle the logistics, so
            you can focus on making memories that last a lifetime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/packages"
              className="btn-primary px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-teal-200">
              Start Exploring <ArrowRight size={20} />
            </Link>
            <Link
              href="/about"
              className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 px-8 py-4 rounded-full font-bold text-lg transition">
              How it Works
            </Link>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { name: "Airbnb", color: "hover:text-[#FF5A5F]" },
              { name: "Booking.com", color: "hover:text-[#003580]" },
              { name: "Expedia", color: "hover:text-[#00355F]" },
              { name: "TripAdvisor", color: "hover:text-[#34E0A1]" },
            ].map((brand) => (
              <span
                key={brand.name}
                className={`
                  text-xl font-semibold text-slate-300 cursor-default
                  transition-all duration-300 ease-out transform
                  hover:scale-110 hover:font-bold hover:opacity-100
                  ${brand.color}
                `}>
                {brand.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Choose Wanderlust?
            </h2>
            <div className="h-1 w-20 bg-teal-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Global Coverage",
                desc: "Access to exclusive spots in 190+ countries.",
              },
              {
                icon: Shield,
                title: "100% Secure",
                desc: "Your payments and data are protected by top-tier security.",
              },
              {
                icon: Users,
                title: "Expert Guides",
                desc: "Travel with locals who know the hidden gems.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300">
                <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-6">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Signature Packages
              </h2>
              <p className="text-slate-500">
                Our exclusive, hand-picked premium destinations.
              </p>
            </div>
            <Link
              href="/packages"
              className="hidden md:flex text-teal-600 font-bold items-center gap-1 hover:gap-3 transition-all">
              View All <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {constantPackages.map((pkg, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl overflow-hidden pro-card relative hover:shadow-xl transition duration-300 border border-slate-100">
                <div className="aspect-4/3 bg-gray-200 overflow-hidden relative">
                  <Image
                    src={pkg.img}
                    alt={pkg.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-teal-800 shadow-sm">
                    {pkg.days}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition line-clamp-1">
                      {pkg.title}
                    </h3>
                    <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                      <Star size={14} fill="currentColor" /> {pkg.rating}
                    </div>
                  </div>

                  <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10">
                    {pkg.shortDesc}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-bold">
                        From
                      </span>
                      <div className="text-lg font-bold text-teal-700">
                        ${pkg.price}
                      </div>
                    </div>
                    <Link
                      href={getDetailsLink(pkg.title)}
                      className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition">
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/packages"
              className="btn-primary w-full py-3 rounded-lg block">
              View All Packages
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-teal-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold text-center mb-16">
            Stories from our Travelers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:bg-white/15 transition">
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, x) => (
                    <Star key={x} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-teal-50 mb-6 italic leading-relaxed">
                  Absolutely the best vacation of my life. The detailed
                  itinerary and support from Wanderlust was unmatched.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-200"></div>
                  <div>
                    <div className="font-bold">Sarah Jenkins</div>
                    <div className="text-xs text-teal-300">
                      Travelled to Bali
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-slate-900 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[80px] opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20"></div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">
              Ready for your next adventure?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto relative z-10">
              Join thousands of travelers who have found their perfect getaway.
              Sign up today for exclusive deals.
            </p>
            <div className="relative z-10">
              <Link
                href="/register"
                className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-teal-50 transition inline-block">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
