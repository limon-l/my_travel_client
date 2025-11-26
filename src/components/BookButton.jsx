"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Check, X, Calendar, CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function BookButton({
  tourId,
  title,
  image,
  price,
  duration,
  isBooked: initialBookedStatus,
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDateInput, setShowDateInput] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [isBooked, setIsBooked] = useState(initialBookedStatus);

  useEffect(() => {
    setIsBooked(initialBookedStatus);
  }, [initialBookedStatus]);

  const getEndDate = (start, days) => {
    if (!start) return "";
    const date = new Date(start);
    date.setDate(date.getDate() + days);
    return date.toDateString();
  };

  const handleBooking = async () => {
    if (!session) {
      toast.error("Please login to book a package");
      router.push("/login");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a start date");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
        userId: session.user.id,
        tourId,
        tourTitle: title,
        tourImage: image,
        price,
        startDate: selectedDate,
        duration: duration || 5,
      });

      toast.success("Trip Booked Successfully! ✈️");
      setShowDateInput(false);
      setSelectedDate("");
      setIsBooked(true);
      router.refresh();
    } catch (error) {
      const msg = error.response?.data?.error || "Booking failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (isBooked) {
    return (
      <button
        disabled
        className="w-full bg-slate-100 text-slate-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200">
        Already Booked <CheckCircle size={18} className="text-green-500" />
      </button>
    );
  }

  return (
    <div className="relative w-full">
      <button
        onClick={() => setShowDateInput(true)}
        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-600 transition shadow-lg shadow-slate-900/10">
        Book Now
      </button>

      {showDateInput && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowDateInput(false)}></div>
          <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 absolute bottom-full mb-2 left-0 w-72 z-50 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Calendar size={16} className="text-teal-600" /> Select Date
              </span>
              <button
                onClick={() => setShowDateInput(false)}
                className="text-slate-400 hover:text-red-500 transition">
                <X size={18} />
              </button>
            </div>

            <input
              type="date"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm mb-3 focus:outline-none focus:border-teal-500 text-slate-600"
              min={new Date().toISOString().split("T")[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            {selectedDate && (
              <div className="bg-teal-50 p-2 rounded-lg mb-3 text-center border border-teal-100">
                <p className="text-[10px] uppercase text-teal-600 font-bold">
                  Return Date
                </p>
                <p className="text-xs font-bold text-teal-800">
                  {getEndDate(selectedDate, duration || 5)}
                </p>
              </div>
            )}

            <button
              onClick={handleBooking}
              disabled={loading}
              className="w-full bg-teal-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-teal-700 transition disabled:opacity-70">
              {loading ? "Processing..." : "Confirm Booking"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
