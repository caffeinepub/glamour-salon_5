import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Car, CheckCircle, Clock, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { DemoBooking, useSalonStore } from "../hooks/useSalonStore";
import ReviewForm from "./ReviewForm";

type Store = ReturnType<typeof useSalonStore>;

interface Props {
  upcomingBookings: DemoBooking[];
  completedBookings: DemoBooking[];
  checkIns: Store["checkIns"];
  checkIn: Store["checkIn"];
  addPoints: Store["addPoints"];
  addReview: Store["addReview"];
  reviews: Store["reviews"];
  userId?: string;
}

const THIRTY_MIN = 30 * 60 * 1000;

function formatBookingTime(ms: number) {
  const d = new Date(ms);
  const diff = ms - Date.now();
  if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
    const h = Math.floor(diff / (60 * 60 * 1000));
    const m = Math.floor((diff % (60 * 60 * 1000)) / 60000);
    if (h === 0) return `In ${m} min`;
    return `In ${h}h ${m}m`;
  }
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BookingHistorySection({
  upcomingBookings,
  completedBookings,
  checkIns,
  checkIn,
  addPoints,
  addReview,
  reviews,
  userId = "current-user",
}: Props) {
  const [tab, setTab] = useState<"upcoming" | "completed">("upcoming");

  const handleCheckIn = (bookingId: string) => {
    checkIn(bookingId);
    toast.success("✅ Stylist has been notified! See you soon 🚗", {
      duration: 4000,
    });
  };

  const hasReview = (bookingId: string) =>
    reviews.some((r) => r.id.startsWith(`booking-${bookingId}`));

  return (
    <section id="my-bookings" className="py-16 px-4 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <p className="text-gold uppercase tracking-[0.4em] text-xs mb-2">
            Your Schedule
          </p>
          <h2 className="font-serif-display text-3xl font-bold text-foreground">
            My Bookings
          </h2>
          <div className="w-16 h-px gold-gradient mt-4" />
        </motion.div>

        {/* Tab toggle */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab("upcoming")}
            className={`px-5 py-2 rounded-full text-sm font-medium uppercase tracking-wider transition-all ${
              tab === "upcoming"
                ? "gold-gradient text-background shadow-gold"
                : "border border-gold/30 text-foreground/60 hover:border-gold/60"
            }`}
            data-ocid="bookings.upcoming.tab"
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => setTab("completed")}
            className={`px-5 py-2 rounded-full text-sm font-medium uppercase tracking-wider transition-all ${
              tab === "completed"
                ? "gold-gradient text-background shadow-gold"
                : "border border-gold/30 text-foreground/60 hover:border-gold/60"
            }`}
            data-ocid="bookings.completed.tab"
          >
            Completed
          </button>
        </div>

        {/* Upcoming bookings */}
        {tab === "upcoming" && (
          <div className="space-y-4" data-ocid="bookings.upcoming.list">
            {upcomingBookings.length === 0 ? (
              <div
                className="text-center py-12 text-foreground/30"
                data-ocid="bookings.empty_state"
              >
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No upcoming bookings
              </div>
            ) : (
              upcomingBookings.map((booking, i) => {
                const isCheckedIn = checkIns[booking.id];
                const timeUntil = booking.timestamp - Date.now();
                const canCheckIn = timeUntil > 0 && timeUntil <= THIRTY_MIN;

                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    data-ocid={`bookings.upcoming.item.${i + 1}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card hover:border-gold/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full gold-gradient/30 border border-gold/30 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {booking.serviceId}
                        </p>
                        <p className="text-foreground/50 text-sm">
                          {booking.stylistId}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5 text-gold/60" />
                          <span className="text-xs text-foreground/40">
                            {formatBookingTime(booking.timestamp)}
                          </span>
                          {canCheckIn && !isCheckedIn && (
                            <span className="text-xs text-amber-400 font-medium animate-pulse ml-1">
                              • Appointment soon!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isCheckedIn ? (
                        <div
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30"
                          data-ocid={`bookings.checkin_confirmed.${i + 1}`}
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 text-xs font-medium uppercase tracking-wider">
                            Arriving
                          </span>
                        </div>
                      ) : canCheckIn ? (
                        <Button
                          size="sm"
                          onClick={() => handleCheckIn(booking.id)}
                          className="gold-gradient text-background font-semibold text-xs uppercase tracking-wider animate-pulse"
                          data-ocid={`bookings.arriving.button.${i + 1}`}
                        >
                          <Car className="w-4 h-4 mr-1.5" />
                          I'm Arriving 🚗
                        </Button>
                      ) : (
                        <span className="text-xs text-foreground/30 uppercase tracking-wider border border-border px-3 py-1.5 rounded-full">
                          Confirmed
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Completed bookings */}
        {tab === "completed" && (
          <div className="space-y-4" data-ocid="bookings.completed.list">
            {completedBookings.length === 0 ? (
              <div
                className="text-center py-12 text-foreground/30"
                data-ocid="bookings.completed.empty_state"
              >
                No completed bookings yet
              </div>
            ) : (
              completedBookings.map((booking, i) => {
                const reviewed = hasReview(booking.id);
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    data-ocid={`bookings.completed.item.${i + 1}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {booking.serviceId}
                        </p>
                        <p className="text-foreground/50 text-sm">
                          {booking.stylistId}
                        </p>
                        <p className="text-foreground/30 text-xs mt-1">
                          {new Date(booking.timestamp).toLocaleDateString(
                            "en-IN",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {reviewed ? (
                        <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gold/10 border border-gold/20">
                          <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                          <span className="text-gold text-xs font-medium uppercase tracking-wider">
                            Reviewed
                          </span>
                        </div>
                      ) : (
                        <ReviewForm
                          bookingId={booking.id}
                          stylistName={booking.stylistId}
                          serviceName={booking.serviceId}
                          userId={userId}
                          onSubmit={(rv) => {
                            addPoints(10);
                            addReview({
                              ...rv,
                              id: `booking-${booking.id}-${Date.now()}`,
                              date: new Date().toISOString().slice(0, 10),
                              userId,
                            });
                          }}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gold/40 text-gold hover:bg-gold/10 text-xs uppercase tracking-wider"
                            data-ocid={`bookings.review.button.${i + 1}`}
                          >
                            <Star className="w-3.5 h-3.5 mr-1.5" />
                            Leave Review
                          </Button>
                        </ReviewForm>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>
    </section>
  );
}
