import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Gift, Star, Trophy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { useSalonStore } from "../hooks/useSalonStore";

const POINTS_GOAL = 50;

type Store = ReturnType<typeof useSalonStore>;

interface Props {
  loyalty: Store["loyalty"];
  markRewardUsed: Store["markRewardUsed"];
}

export default function LoyaltyWidget({ loyalty, markRewardUsed }: Props) {
  const pct = Math.min((loyalty.points / POINTS_GOAL) * 100, 100);
  const remaining = Math.max(POINTS_GOAL - loyalty.points, 0);
  const bookingsLeft = Math.max(5 - loyalty.completedBookings, 0);

  return (
    <section id="rewards" className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border border-gold/40 p-8"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.14 0.03 75 / 0.9), oklch(0.10 0.01 70))",
          }}
        >
          {/* BG glow */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 80% 50%, oklch(0.72 0.10 75), transparent)",
            }}
          />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-7 h-7 text-background" />
                </div>
                <div>
                  <p className="text-gold uppercase tracking-[0.3em] text-xs mb-1">
                    My Rewards
                  </p>
                  <h2 className="font-serif-display text-2xl font-bold text-foreground">
                    Loyalty Points
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-serif-display text-4xl font-bold gold-text">
                    {loyalty.points}
                  </div>
                  <div className="text-foreground/40 text-xs uppercase tracking-wider">
                    of {POINTS_GOAL} points
                  </div>
                </div>
                <Star className="w-8 h-8 text-gold/40" />
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-foreground/50 mb-2 uppercase tracking-wider">
                <span>{loyalty.points} pts earned</span>
                <span>{remaining} pts to go</span>
              </div>
              <div className="h-3 w-full bg-background/40 rounded-full overflow-hidden border border-gold/20">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full gold-gradient"
                />
              </div>
            </div>

            <p
              className="text-foreground/50 text-sm mb-6"
              data-ocid="rewards.progress.card"
            >
              {loyalty.rewardAvailable
                ? "🎉 Reward unlocked! Use your 50% discount below."
                : `${bookingsLeft} more booking${bookingsLeft !== 1 ? "s" : ""} for 50% off your next service!`}
            </p>

            {/* Reward grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  pts: 10,
                  label: "1st Booking",
                  done: loyalty.completedBookings >= 1,
                },
                {
                  pts: 30,
                  label: "3 Bookings",
                  done: loyalty.completedBookings >= 3,
                },
                {
                  pts: 50,
                  label: "5 Bookings",
                  done: loyalty.completedBookings >= 5,
                },
              ].map((milestone) => (
                <div
                  key={milestone.label}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    milestone.done
                      ? "border-gold/60 bg-gold/10"
                      : "border-border bg-background/20"
                  }`}
                >
                  <div
                    className={`font-serif-display text-2xl font-bold mb-1 ${
                      milestone.done ? "text-gold" : "text-foreground/30"
                    }`}
                  >
                    {milestone.pts} pts
                  </div>
                  <div
                    className={`text-xs uppercase tracking-wider ${
                      milestone.done ? "text-gold/70" : "text-foreground/30"
                    }`}
                  >
                    {milestone.label}
                  </div>
                  {milestone.done && (
                    <div className="text-emerald-400 text-xs mt-1">
                      ✓ Earned
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Reward banner */}
            <AnimatePresence>
              {loyalty.rewardAvailable && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-6 p-5 rounded-xl border border-gold bg-gold/15 flex flex-col sm:flex-row items-center justify-between gap-4"
                  data-ocid="rewards.banner"
                >
                  <div className="flex items-center gap-3">
                    <Gift className="w-8 h-8 text-gold animate-pulse flex-shrink-0" />
                    <div>
                      <p className="font-serif-display text-lg font-bold text-gold">
                        🎉 50% OFF Your Next Service!
                      </p>
                      <p className="text-foreground/60 text-sm">
                        Use at checkout — valid for 30 days
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={markRewardUsed}
                    className="gold-gradient text-background font-bold uppercase tracking-wider text-xs flex-shrink-0"
                    data-ocid="rewards.use_reward.button"
                  >
                    Use Reward
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
