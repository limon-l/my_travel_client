import Image from "next/image";
import { Award, Users, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Redefining Travel
          </h1>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
            Wanderlust isnt just a travel agency; we are architects of memories.
            Founded in 2024, our mission is to make the world accessible,
            luxurious, and personal.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600"
              alt="Team"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Our Philosophy
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              We believe travel changes people. Whether its a solo trip to find
              yourself, or a family vacation to reconnect, every journey
              matters.
            </p>
            <p className="text-slate-500 text-lg leading-relaxed">
              Our team of expert consultants works around the clock to ensure
              your itinerary is seamless. From the moment you click Book to the
              moment you return home, we are with you.
            </p>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200">
              <div>
                <div className="text-3xl font-bold text-teal-600 mb-1">
                  10k+
                </div>
                <div className="text-sm text-slate-400">Happy Travelers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-teal-600 mb-1">98%</div>
                <div className="text-sm text-slate-400">Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-teal-600 mb-1">
                  190+
                </div>
                <div className="text-sm text-slate-400">Destinations</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-6">
              <Award size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Excellence
            </h3>
            <p className="text-slate-500">
              We dont settle for good enough. Every hotel and guide is vetted.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-6">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Community</h3>
            <p className="text-slate-500">
              We support local businesses and sustainable tourism practices.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-6">
              <Globe size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Accessibility
            </h3>
            <p className="text-slate-500">
              Luxury travel at a price point that makes sense for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
