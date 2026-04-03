"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  XCircle,
  CalendarDays,
  Plus,
  Ban,
  Sparkles,
} from "lucide-react";

export default function AdminRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [bookingsError, setBookingsError] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState("");
  const [requestedTourId, setRequestedTourId] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [savingDateAction, setSavingDateAction] = useState(false);

  const isAdmin =
    session?.user?.role === "admin" ||
    session?.user?.email?.toLowerCase() === "admin@wanderlust.com";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tourId = params.get("tourId") || "";
    setRequestedTourId(tourId);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/packages");
    }
  }, [status, isAdmin, router]);

  const fetchData = async () => {
    try {
      const [bookingsResult, toursResult] = await Promise.allSettled([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tours`),
      ]);

      if (bookingsResult.status === "fulfilled") {
        setBookings(bookingsResult.value.data || []);
        setBookingsError("");
      } else {
        setBookings([]);
        const statusCode = bookingsResult.reason?.response?.status;
        const message =
          bookingsResult.reason?.response?.data?.error ||
          bookingsResult.reason?.message ||
          "Unknown error";
        setBookingsError(
          statusCode
            ? `Booking request API failed (${statusCode}): ${message}`
            : `Booking request API failed: ${message}`,
        );
      }

      if (toursResult.status === "fulfilled") {
        const toursData = toursResult.value.data || [];
        setTours(toursData);

        if (
          requestedTourId &&
          toursData.some((tour) => tour._id === requestedTourId)
        ) {
          setSelectedTour(requestedTourId);
        } else if (!selectedTour && toursData.length > 0) {
          setSelectedTour(toursData[0]._id);
        }
      } else {
        const message =
          toursResult.reason?.response?.data?.error ||
          toursResult.reason?.message ||
          "Failed to load tours";
        toast.error(message);
      }
    } catch (error) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      fetchData();
    }
  }, [status, isAdmin, requestedTourId]);

  const updateStatus = async (id, nextStatus) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/bookings/${id}/status`,
        {
          status: nextStatus,
        },
      );
      toast.success(`Booking ${nextStatus.toLowerCase()}`);
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === id
            ? {
                ...booking,
                status: nextStatus,
                statusUpdatedAt: new Date().toISOString(),
                statusNote:
                  nextStatus === "Confirmed"
                    ? "Your booking has been approved by admin"
                    : "Your booking has been declined by admin",
              }
            : booking,
        ),
      );
    } catch (error) {
      const message =
        error?.response?.data?.error || "Failed to update booking";
      toast.error(message);
    }
  };

  const selectedTourData = tours.find((tour) => tour._id === selectedTour);
  const selectedDates = selectedTourData?.availableDates || [];

  const persistDates = async (dates, successMessage) => {
    if (!selectedTourData) return;
    setSavingDateAction(true);
    try {
      const normalized = [...new Set(dates)].sort();
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/tours/${selectedTour}/available-dates`,
        { availableDates: normalized },
      );

      setTours((prev) =>
        prev.map((tour) =>
          tour._id === selectedTour
            ? { ...tour, availableDates: normalized }
            : tour,
        ),
      );

      toast.success(successMessage);
    } catch (error) {
      const statusCode = error?.response?.status;
      const serverError = error?.response?.data?.error;
      const serverDetail = error?.response?.data?.detail;
      const fallback = error?.message || "Failed to update available dates";
      const message = serverError
        ? `${serverError}${serverDetail ? ` (${serverDetail})` : ""}`
        : fallback;

      toast.error(
        statusCode ? `Update failed (${statusCode}): ${message}` : message,
      );
    } finally {
      setSavingDateAction(false);
    }
  };

  const addDate = async () => {
    if (!selectedTour) {
      toast.error("Please select a tour first");
      return;
    }
    if (!dateInput) {
      toast.error("Please select a date");
      return;
    }
    if (selectedDates.includes(dateInput)) {
      toast.error("Date already added");
      return;
    }
    await persistDates([...selectedDates, dateInput], "Travel date assigned");
    setDateInput("");
  };

  const removeDate = async (date) => {
    const confirmDisable = window.confirm(
      `Disable ${date} for ${selectedTourData?.title}?`,
    );
    if (!confirmDisable) return;

    await persistDates(
      selectedDates.filter((d) => d !== date),
      "Travel date disabled",
    );
  };

  const clearAllDates = async () => {
    if (!selectedDates.length) return;
    const confirmClear = window.confirm(
      `Disable all dates for ${selectedTourData?.title}?`,
    );
    if (!confirmClear) return;
    await persistDates([], "All dates disabled for this tour");
  };

  const formatDate = (isoDate) => {
    try {
      return new Date(isoDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoDate;
    }
  };

  const filteredBookings =
    statusFilter === "All"
      ? bookings
      : bookings.filter((booking) => booking.status === statusFilter);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Approve booking requests and publish available tour dates.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CalendarDays size={18} className="text-teal-600" /> Tour
            Availability
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Assign upcoming travel dates for each tour. Clients will only see
            and select active dates.
          </p>
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <select
              value={selectedTour}
              onChange={(e) => setSelectedTour(e.target.value)}
              className="flex-1 p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm">
              {tours.map((tour) => (
                <option key={tour._id} value={tour._id}>
                  {tour.title}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateInput}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDateInput(e.target.value)}
              className="p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm"
            />
            <button
              onClick={addDate}
              disabled={savingDateAction || !selectedTour}
              className="px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-70 inline-flex items-center justify-center gap-1.5">
              <Plus size={15} /> Assign Date
            </button>
          </div>

          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles size={14} className="text-teal-600" /> Active Dates
            </h3>
            <button
              onClick={clearAllDates}
              disabled={savingDateAction || selectedDates.length === 0}
              className="text-xs text-red-600 hover:text-red-700 font-semibold disabled:opacity-50">
              Disable All
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            {selectedDates.length > 0 ? (
              selectedDates.map((date) => (
                <div
                  key={date}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-100">
                  <span>{formatDate(date)}</span>
                  <button
                    onClick={() => removeDate(date)}
                    disabled={savingDateAction}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    title="Disable date">
                    <Ban size={12} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No available dates published yet.
              </p>
            )}
          </div>
          {savingDateAction && (
            <p className="text-xs text-slate-500 mt-2">Saving changes...</p>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900">
                Booking Requests
              </h2>
              <div className="flex items-center gap-2">
                {["Pending", "Confirmed", "Rejected", "All"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setStatusFilter(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                      statusFilter === item
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
            {bookingsError && (
              <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {bookingsError}
              </p>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Tour
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Start Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">
                      {booking.tourTitle}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <p className="font-medium text-slate-800">
                        {booking.userName || "Traveler"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {booking.userEmail || booking.user}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {formatDate(booking.startDate)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          booking.status === "Confirmed"
                            ? "bg-green-50 text-green-700"
                            : booking.status === "Rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                        }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {booking.status === "Pending" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              updateStatus(booking._id, "Confirmed")
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-100 rounded-md text-xs font-bold hover:bg-green-100 transition">
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button
                            onClick={() =>
                              updateStatus(booking._id, "Rejected")
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 border border-red-100 rounded-md text-xs font-bold hover:bg-red-100 transition">
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-right text-xs text-slate-400">
                          No actions
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-slate-500">
                      No {statusFilter.toLowerCase()} booking requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
