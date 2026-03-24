import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Review } from "../hooks/useSalonStore";

interface Props {
  bookingId: string;
  stylistName: string;
  serviceName: string;
  onSubmit: (review: Omit<Review, "id" | "date" | "userId">) => void;
  userId?: string;
  children: React.ReactNode;
}

export default function ReviewForm({
  bookingId: _bookingId,
  stylistName,
  serviceName,
  onSubmit,
  userId: _userId = "current-user",
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreview(ev.target?.result as string);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to load photo");
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }
    onSubmit({
      stylistName,
      rating,
      comment: comment.trim(),
      photoUrl: photoPreview ?? undefined,
      userName: "You",
    });
    toast.success("Review submitted! Thank you 🌟");
    setOpen(false);
    setRating(0);
    setComment("");
    setPhotoPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="max-w-md bg-card border-gold/40"
        data-ocid="review.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-serif-display text-xl text-foreground">
            Leave a Review
          </DialogTitle>
          <p className="text-foreground/50 text-sm">
            {serviceName} with {stylistName}
          </p>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Star rating */}
          <div>
            <p className="text-xs uppercase tracking-wider text-foreground/50 mb-3">
              Your Rating
            </p>
            <fieldset className="flex gap-2 border-0 p-0 m-0">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={`rate-${star}`}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform hover:scale-110"
                  aria-label={`${star} star`}
                  data-ocid={`review.star.${star}`}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hover || rating)
                        ? "fill-gold text-gold"
                        : "text-foreground/20"
                    }`}
                  />
                </button>
              ))}
            </fieldset>
          </div>

          {/* Comment */}
          <div>
            <p className="text-xs uppercase tracking-wider text-foreground/50 mb-2">
              Your Experience
            </p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe your experience..."
              rows={3}
              className="bg-background border-border text-foreground resize-none"
              data-ocid="review.comment.textarea"
            />
          </div>

          {/* Photo upload */}
          <div>
            <p className="text-xs uppercase tracking-wider text-foreground/50 mb-2">
              Add a Photo{" "}
              <span className="normal-case text-foreground/30">(optional)</span>
            </p>
            {photoPreview ? (
              <div className="relative inline-block">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border border-gold/30"
                />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive flex items-center justify-center"
                  aria-label="Remove photo"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border border-dashed border-gold/30 text-foreground/50 hover:border-gold/60 hover:text-foreground transition-all text-sm"
                disabled={uploading}
                data-ocid="review.upload_button"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Upload Photo
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSubmit}
              className="flex-1 gold-gradient text-background font-bold uppercase tracking-wider text-xs"
              data-ocid="review.submit.button"
            >
              Submit Review
            </Button>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-foreground/50"
              data-ocid="review.cancel.button"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
