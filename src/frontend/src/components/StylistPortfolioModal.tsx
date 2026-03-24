import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Star } from "lucide-react";
import type { Review } from "../hooks/useSalonStore";

interface Stylist {
  name: string;
  role: string;
  experience: string;
  bio: string;
  specialties: string[];
  rating: number;
  avatar: string;
}

interface Props {
  stylist: Stylist;
  reviews: Review[];
  children: React.ReactNode;
}

export default function StylistPortfolioModal({
  stylist,
  reviews,
  children,
}: Props) {
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : stylist.rating;

  const reviewsWithPhotos = reviews.filter((r) => r.photoUrl);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="max-w-2xl bg-card border-gold/40 p-0 overflow-hidden"
        data-ocid="portfolio.dialog"
      >
        {/* Header */}
        <div
          className="p-8 border-b border-gold/20"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.14 0.03 75), oklch(0.10 0.01 70))",
          }}
        >
          <DialogHeader>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center text-2xl font-bold text-background flex-shrink-0">
                {stylist.avatar}
              </div>
              <div>
                <DialogTitle className="font-serif-display text-2xl text-foreground">
                  {stylist.name}
                </DialogTitle>
                <p className="text-gold text-sm uppercase tracking-wider mt-0.5">
                  {stylist.role}
                </p>
                <p className="text-foreground/50 text-xs mt-1">
                  {stylist.experience} Experience
                </p>
              </div>
            </div>
          </DialogHeader>

          <p className="text-foreground/60 text-sm leading-relaxed mt-4">
            {stylist.bio}
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            {stylist.specialties.map((s) => (
              <span
                key={s}
                className="text-xs px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/20"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <ScrollArea className="max-h-[420px]">
          <div className="p-6 space-y-6">
            {/* Rating summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={`pf-star-${star}`}
                      className={`w-5 h-5 ${
                        star <= Math.round(avgRating)
                          ? "fill-gold text-gold"
                          : "text-foreground/20"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-serif-display text-xl font-bold text-gold">
                  {avgRating.toFixed(1)}
                </span>
              </div>
              <span className="text-foreground/40 text-sm">
                {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Photo gallery */}
            {reviewsWithPhotos.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-gold/70 mb-3">
                  Client Photos
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {reviewsWithPhotos.map((r) => (
                    <div
                      key={r.id}
                      className="aspect-square rounded-lg overflow-hidden border border-gold/20 bg-background/40"
                    >
                      <img
                        src={r.photoUrl}
                        alt={`Review by ${r.userName ?? "client"}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews list */}
            <div>
              <p className="text-xs uppercase tracking-widest text-gold/70 mb-3 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                Client Reviews
              </p>
              {reviews.length === 0 ? (
                <p className="text-foreground/30 text-sm italic">
                  No reviews yet
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-4 rounded-lg bg-background/30 border border-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold">
                            {(review.userName ?? "U")[0]}
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {review.userName ?? "Client"}
                          </span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={`rev-s-${s}`}
                              className={`w-3.5 h-3.5 ${
                                s <= review.rating
                                  ? "fill-gold text-gold"
                                  : "text-foreground/20"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-foreground/60 text-sm leading-relaxed">
                        "{review.comment}"
                      </p>
                      <p className="text-foreground/30 text-xs mt-2">
                        {new Date(review.date).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
