// pages/ServiceFeePage.tsx
// Computes total revenue (all payments) and total bookings, grouped per service.

import { useEffect, useMemo, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import SidebarComponents from "../components/SidebarComponents";
import Header from "../components/HeaderComponent";
import ServiceCard, { type Service } from "../components/ServiceFeeComponents/ServiceCard";
import { supabase } from "@/lib/supabaseClient";

// -----------------------------
// Helpers
// -----------------------------
const peso = (n: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(isNaN(n) ? 0 : n);

// Build PH-local month window and convert to ISO (UTC) for Supabase filter
function getPHMonthISOWindow(d = new Date()) {
  const startPH = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
  const endPH = new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
  const startISO = new Date(startPH.getTime() - startPH.getTimezoneOffset() * 60000).toISOString();
  const endISO = new Date(endPH.getTime() - endPH.getTimezoneOffset() * 60000).toISOString();
  return { startISO, endISO };
}

type BookingTypeRow = {
  id: string;
  booking_name: string;
  booking_type_description: string | null;
  booking_type_price: number | string;
  booking_type_duration_minutes: number | string;
  booking_type_features: string[] | null;
};

type AppointmentRow = {
  id: string;
  booking_type_id: string | null;
  created_at: string;
};

type PaymentRow = {
  id: string;
  appointment_id: string;
  amount: number | string;
  created_at: string;
};

export default function ServiceFeePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [totalRevenueThisMonth, setTotalRevenueThisMonth] = useState<number>(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErr(null);

    try {
      const { startISO, endISO } = getPHMonthISOWindow();

      // 1) Booking types
      const { data: bt, error: btErr } = await supabase
        .from("booking_types")
        .select(
          "id, booking_name, booking_type_description, booking_type_price, booking_type_duration_minutes, booking_type_features"
        )
        .order("booking_name", { ascending: true });
      if (btErr) throw btErr;
      const bookingTypes = (bt || []) as BookingTypeRow[];

      // 2) Appointments (for total bookings)
      const { data: appts, error: apptErr } = await supabase
        .from("appointments")
        .select("id, booking_type_id, created_at");
      if (apptErr) throw apptErr;
      const appointments = (appts || []) as AppointmentRow[];
      setTotalBookings(appointments.length);

      const bookingsByType: Record<string, number> = {};
      for (const a of appointments) {
        const k = a.booking_type_id || "__none__";
        bookingsByType[k] = (bookingsByType[k] || 0) + 1;
      }

      // 3) Payments (this month only)
      const { data: pays, error: payErr } = await supabase
        .from("payments")
        .select("id, appointment_id, amount, created_at")
        .gte("created_at", startISO)
        .lt("created_at", endISO);
      if (payErr) throw payErr;

      const payments = (pays || []) as PaymentRow[];

      // --- Total revenue this month (sum all amounts) ---
      const totalRevenueMonth = payments.reduce(
        (sum, p) => sum + (Number(p.amount) || 0),
        0
      );
      setTotalRevenueThisMonth(totalRevenueMonth);

      // --- 4) Per-service revenue (this month) ---
      const apptIds = Array.from(new Set(payments.map((p) => p.appointment_id))).filter(Boolean);
      let apptsForPayments: { id: string; booking_type_id: string | null }[] = [];

      if (apptIds.length) {
        const { data: apForPay, error: apForPayErr } = await supabase
          .from("appointments")
          .select("id, booking_type_id")
          .in("id", apptIds);
        if (apForPayErr) throw apForPayErr;
        apptsForPayments = (apForPay || []) as { id: string; booking_type_id: string | null }[];
      }

      const apptToBookingType = new Map(apptsForPayments.map((a) => [a.id, a.booking_type_id]));
      const revenueByTypeThisMonth: Record<string, number> = {};

      for (const p of payments) {
        const btId = apptToBookingType.get(p.appointment_id);
        if (!btId) continue;
        revenueByTypeThisMonth[btId] =
          (revenueByTypeThisMonth[btId] || 0) + (Number(p.amount) || 0);
      }

      // --- 5) Map to Service[] for UI ---
      const serviceList: Service[] = bookingTypes.map((b) => {
        const features = Array.isArray(b.booking_type_features)
          ? b.booking_type_features
          : [];
        return {
          id: b.id,
          title: b.booking_name,
          description: b.booking_type_description || "",
          price: Number(b.booking_type_price) || 0,
          durationMinutes: Number(b.booking_type_duration_minutes) || 0,
          features,
          bookings: bookingsByType[b.id] || 0,
          revenueThisMonth: revenueByTypeThisMonth[b.id] || 0,
        };
      });

      setServices(serviceList);
    } catch (e: any) {
      console.error(e);
      setErr(e.message || "Failed to load service fees.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(
    () => [
      {
        title: "Total Revenue",
        value: peso(totalRevenueThisMonth),
        period: "This month (all payments)",
        icon: "ph:money-bold",
        iconBgColor: "bg-red-100",
        iconTextColor: "text-red-500",
      },
      {
        title: "Total Bookings",
        value: String(totalBookings),
        period: "All time",
        icon: "ph:calendar-bold",
        iconBgColor: "bg-red-100",
        iconTextColor: "text-red-500",
      },
    ],
    [totalRevenueThisMonth, totalBookings]
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-white shadow-md">
        <SidebarComponents />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Service Fees</h1>
                <p className="text-gray-500 mt-1">
                  Manage pricing and track total revenue of your services.
                </p>
              </div>

              <button
                onClick={fetchData}
                className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
              >
                Refresh
              </button>
            </div>

            {/* Loading / Error */}
            {loading && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-600">Loading service data…</p>
              </div>
            )}
            {err && !loading && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
                <p className="text-red-600 font-medium">Error</p>
                <p className="text-gray-600 text-sm mt-1">{err}</p>
              </div>
            )}

            {/* Stats */}
            {!loading && !err && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.map((stat) => (
                  <div
                    key={stat.title}
                    className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${stat.iconBgColor}`}>
                        <Icon icon={stat.icon} className={`h-6 w-6 ${stat.iconTextColor}`} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                        <p className="text-xs text-gray-400">{stat.period}</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Services */}
            {!loading && !err && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onSaved={() => fetchData()}
                  />
                ))}
                {services.length === 0 && (
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-gray-600">
                      No services found in <code>booking_types</code>.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
