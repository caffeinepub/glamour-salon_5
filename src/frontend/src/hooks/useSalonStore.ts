import { useCallback, useEffect, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  stylistName: string;
  rating: number;
  comment: string;
  photoUrl?: string;
  date: string;
  userId: string;
  userName?: string;
}

export interface DemoBooking {
  id: string;
  serviceId: string;
  stylistId: string;
  timestamp: number; // ms
  status: "pending" | "confirmed" | "completed" | "cancelled";
  advancePayment: number;
}

interface LoyaltyData {
  points: number;
  completedBookings: number;
  rewardAvailable: boolean;
}

interface SalonStore {
  loyalty: LoyaltyData;
  cancellationCounts: Record<string, number>; // userId -> count
  reviews: Review[];
  checkIns: Record<string, boolean>; // bookingId -> checked in
  // Actions
  addPoints: (pts: number) => void;
  markRewardUsed: () => void;
  recordCancellation: (userId: string) => void;
  addReview: (review: Review) => void;
  checkIn: (bookingId: string) => void;
  getCancellationCount: (userId: string) => number;
  getReviewsForStylist: (stylistName: string) => Review[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

const POINTS_GOAL = 50;

// ─── Seed demo reviews ───────────────────────────────────────────────────────

const DEMO_REVIEWS: Review[] = [
  {
    id: "rev-1",
    stylistName: "Priya Sharma",
    rating: 5,
    comment:
      "Absolutely stunning Balayage! Priya understood exactly what I wanted. Will definitely come back!",
    date: "2026-03-10",
    userId: "demo-user-1",
    userName: "Riya K.",
  },
  {
    id: "rev-2",
    stylistName: "Priya Sharma",
    rating: 4,
    comment:
      "Great haircut, really professional. The salon ambiance is luxurious!",
    date: "2026-03-15",
    userId: "demo-user-2",
    userName: "Ananya M.",
  },
  {
    id: "rev-3",
    stylistName: "Meera Patel",
    rating: 5,
    comment:
      "Best Ombre I've ever had! Meera is a true color artist. Highly recommend!",
    date: "2026-03-12",
    userId: "demo-user-3",
    userName: "Shreya T.",
  },
  {
    id: "rev-4",
    stylistName: "Rahul Verma",
    rating: 5,
    comment:
      "Rahul styled my hair for a photoshoot and it was magazine-worthy. Exceptional talent!",
    date: "2026-03-18",
    userId: "demo-user-4",
    userName: "Kavya R.",
  },
];

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSalonStore(): SalonStore {
  const [loyalty, setLoyalty] = useState<LoyaltyData>(() =>
    readLS("salon_loyalty", {
      points: 30,
      completedBookings: 3,
      rewardAvailable: false,
    }),
  );
  const [cancellationCounts, setCancellationCounts] = useState<
    Record<string, number>
  >(() => readLS("salon_cancellations", {}));
  const [reviews, setReviews] = useState<Review[]>(() => {
    const stored = readLS<Review[]>("salon_reviews", []);
    // Seed demo reviews if empty
    if (stored.length === 0) {
      writeLS("salon_reviews", DEMO_REVIEWS);
      return DEMO_REVIEWS;
    }
    return stored;
  });
  const [checkIns, setCheckIns] = useState<Record<string, boolean>>(() =>
    readLS("salon_checkins", {}),
  );

  const addPoints = useCallback((pts: number) => {
    setLoyalty((prev) => {
      const next = {
        points: prev.points + pts,
        completedBookings: prev.completedBookings + 1,
        rewardAvailable: prev.points + pts >= POINTS_GOAL,
      };
      writeLS("salon_loyalty", next);
      return next;
    });
  }, []);

  const markRewardUsed = useCallback(() => {
    setLoyalty((prev) => {
      const next = { ...prev, points: 0, rewardAvailable: false };
      writeLS("salon_loyalty", next);
      return next;
    });
  }, []);

  const recordCancellation = useCallback((userId: string) => {
    setCancellationCounts((prev) => {
      const next = { ...prev, [userId]: (prev[userId] ?? 0) + 1 };
      writeLS("salon_cancellations", next);
      return next;
    });
  }, []);

  const addReview = useCallback((review: Review) => {
    setReviews((prev) => {
      const next = [review, ...prev];
      writeLS("salon_reviews", next);
      return next;
    });
  }, []);

  const checkIn = useCallback((bookingId: string) => {
    setCheckIns((prev) => {
      const next = { ...prev, [bookingId]: true };
      writeLS("salon_checkins", next);
      return next;
    });
  }, []);

  const getCancellationCount = useCallback(
    (userId: string) => cancellationCounts[userId] ?? 0,
    [cancellationCounts],
  );

  const getReviewsForStylist = useCallback(
    (stylistName: string) =>
      reviews.filter((r) => r.stylistName === stylistName),
    [reviews],
  );

  return {
    loyalty,
    cancellationCounts,
    reviews,
    checkIns,
    addPoints,
    markRewardUsed,
    recordCancellation,
    addReview,
    checkIn,
    getCancellationCount,
    getReviewsForStylist,
  };
}

// Upcoming demo bookings (25 min from now = shows "I'm Arriving" button)
export const DEMO_UPCOMING_BOOKINGS: DemoBooking[] = [
  {
    id: "bk-001",
    serviceId: "Precision Haircut",
    stylistId: "Priya Sharma",
    timestamp: Date.now() + 25 * 60 * 1000, // 25 min from now
    status: "confirmed",
    advancePayment: 5000,
  },
  {
    id: "bk-002",
    serviceId: "Luxury Hair Color",
    stylistId: "Meera Patel",
    timestamp: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
    status: "confirmed",
    advancePayment: 15000,
  },
];

export const DEMO_COMPLETED_BOOKINGS: DemoBooking[] = [
  {
    id: "bk-003",
    serviceId: "Keratin Treatment",
    stylistId: "Rahul Verma",
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    status: "completed",
    advancePayment: 30000,
  },
  {
    id: "bk-004",
    serviceId: "Radiance Facial",
    stylistId: "Priya Sharma",
    timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
    status: "completed",
    advancePayment: 8000,
  },
];
