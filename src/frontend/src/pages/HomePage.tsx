import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  Facebook,
  Gift,
  Instagram,
  MapPin,
  Phone,
  Scissors,
  Sparkles,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ServiceCategory } from "../backend";
import BookingHistorySection from "../components/BookingHistorySection";
import LoyaltyWidget from "../components/LoyaltyWidget";
import ReviewForm from "../components/ReviewForm";
import StylistPortfolioModal from "../components/StylistPortfolioModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";
import {
  DEMO_COMPLETED_BOOKINGS,
  DEMO_UPCOMING_BOOKINGS,
  useSalonStore,
} from "../hooks/useSalonStore";

const SAMPLE_SERVICES = [
  {
    id: "1",
    name: "Precision Haircut",
    price: BigInt(50000),
    durationMinutes: BigInt(30),
    category: ServiceCategory.trending,
    description: "Expert cut tailored to your face shape and style",
  },
  {
    id: "2",
    name: "Luxury Hair Color",
    price: BigInt(150000),
    durationMinutes: BigInt(90),
    category: ServiceCategory.popular,
    description: "Premium color treatment with Balayage, Ombre or Full Color",
  },
  {
    id: "3",
    name: "Radiance Facial",
    price: BigInt(80000),
    durationMinutes: BigInt(60),
    category: ServiceCategory.seasonal,
    description: "Deep cleansing facial with gold-infused serums",
  },
  {
    id: "4",
    name: "Keratin Treatment",
    price: BigInt(300000),
    durationMinutes: BigInt(120),
    category: ServiceCategory.trending,
    description: "Smooth, frizz-free hair for up to 6 months",
  },
  {
    id: "5",
    name: "Bridal Makeup",
    price: BigInt(500000),
    durationMinutes: BigInt(180),
    category: ServiceCategory.popular,
    description: "Flawless bridal look by our certified makeup artist",
  },
  {
    id: "6",
    name: "Manicure & Pedicure",
    price: BigInt(60000),
    durationMinutes: BigInt(60),
    category: ServiceCategory.classic,
    description: "Classic mani-pedi with luxury nail care products",
  },
];

const SAMPLE_STYLISTS = [
  {
    name: "Priya Sharma",
    role: "Senior Hair Specialist",
    experience: "8 Years",
    bio: "Priya specializes in modern cuts, color techniques and bridal styling. Trained at the London Academy of Hair & Beauty.",
    specialties: ["Balayage", "Bridal", "Keratin"],
    rating: 4.9,
    avatar: "PS",
  },
  {
    name: "Meera Patel",
    role: "Color & Highlights Expert",
    experience: "5 Years",
    bio: "Meera is passionate about transformative hair color. Known for her signature Ombre and highlights work.",
    specialties: ["Ombre", "Highlights", "Color Correction"],
    rating: 4.8,
    avatar: "MP",
  },
  {
    name: "Rahul Verma",
    role: "Master Stylist",
    experience: "10 Years",
    bio: "Rahul brings 10 years of premium styling experience, having worked with celebrities and fashion shows.",
    specialties: ["Editorial", "Updos", "Cuts"],
    rating: 5.0,
    avatar: "RV",
  },
];

const FILTER_CHIPS = [
  { label: "All", value: "all" },
  { label: "\u2728 Trending", value: ServiceCategory.trending },
  { label: "\u{1F342} Seasonal", value: ServiceCategory.seasonal },
  { label: "\u{1F525} Popular", value: ServiceCategory.popular },
  { label: "\u{1F48E} Classic", value: ServiceCategory.classic },
];

function formatPrice(paise: bigint) {
  return `\u20b9${(Number(paise) / 100).toLocaleString("en-IN")}`;
}

const CATEGORY_COLORS: Record<string, string> = {
  trending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  popular: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  seasonal: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  classic: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const { login, loginStatus, identity, clear } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const isLoggedIn = loginStatus === "success";

  const store = useSalonStore();
  const userId = identity?.getPrincipal().toString() ?? "demo-user";
  const cancellationCount = store.getCancellationCount(userId);
  const isRepeatCanceller = cancellationCount >= 2;

  const filteredServices =
    activeFilter === "all"
      ? SAMPLE_SERVICES
      : SAMPLE_SERVICES.filter((s) => s.category === activeFilter);

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-gold/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a
              href="/"
              className="font-serif-display text-2xl gold-text font-bold tracking-wide"
            >
              Glamour Salon
            </a>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-widest uppercase text-foreground/70">
              <a
                href="#services"
                className="hover:text-gold transition-colors"
                data-ocid="nav.services.link"
              >
                Services
              </a>
              <a
                href="#stylists"
                className="hover:text-gold transition-colors"
                data-ocid="nav.stylists.link"
              >
                Stylists
              </a>
              <a
                href="#rewards"
                className="hover:text-gold transition-colors"
                data-ocid="nav.rewards.link"
              >
                Rewards
              </a>
              <a
                href="#booking"
                className="hover:text-gold transition-colors"
                data-ocid="nav.booking.link"
              >
                Book Now
              </a>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-gold hover:text-gold-light transition-colors"
                  data-ocid="nav.admin.link"
                >
                  Admin
                </Link>
              )}
            </div>
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  {/* Loyalty points pill */}
                  <a
                    href="#rewards"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/40 bg-gold/10 text-gold text-xs font-medium hover:bg-gold/20 transition-all"
                    data-ocid="nav.loyalty.link"
                  >
                    <Star className="w-3.5 h-3.5 fill-gold" />
                    {store.loyalty.points} pts
                    {store.loyalty.rewardAvailable && (
                      <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                    )}
                  </a>
                  <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-xs font-bold text-background">
                    {userId.slice(0, 2).toUpperCase()}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clear}
                    className="text-foreground/60 hover:text-foreground text-xs uppercase tracking-wider"
                    data-ocid="nav.logout.button"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => login()}
                  disabled={loginStatus === "logging-in"}
                  className="gold-gradient text-background font-semibold uppercase tracking-wider text-xs px-6 hover:opacity-90"
                  data-ocid="nav.login.button"
                >
                  {loginStatus === "logging-in" ? "Signing in..." : "Sign In"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/assets/generated/salon-hero.dim_1600x800.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <p className="text-gold uppercase tracking-[0.4em] text-sm font-medium mb-6">
              Premium Salon Experience
            </p>
            <h1 className="font-serif-display text-5xl sm:text-7xl font-bold text-foreground leading-none mb-6">
              Experience
              <span className="block gold-text">Pure Glamour</span>
            </h1>
            <p className="text-foreground/70 text-lg mb-10 leading-relaxed max-w-lg">
              Where luxury meets artistry. Expert stylists. Premium products.
              Unforgettable transformations.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#booking">
                <Button
                  size="lg"
                  className="gold-gradient text-background font-bold uppercase tracking-[0.2em] px-10 py-6 text-sm hover:opacity-90 hover:shadow-gold transition-all"
                  data-ocid="hero.book_now.button"
                >
                  Book Now
                </Button>
              </a>
              <a href="#services">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gold/50 text-foreground hover:bg-gold/10 uppercase tracking-[0.2em] px-10 py-6 text-sm"
                  data-ocid="hero.services.button"
                >
                  Our Services
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t border-gold/20 bg-background/60 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-center gap-8 sm:gap-16">
            {[
              ["500+", "Happy Clients"],
              ["15+", "Expert Stylists"],
              ["10+", "Years of Excellence"],
              ["4.9\u2605", "Average Rating"],
            ].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="font-serif-display text-xl font-bold text-gold">
                  {val}
                </div>
                <div className="text-xs uppercase tracking-widest text-foreground/50">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loyalty Widget */}
      <LoyaltyWidget
        loyalty={store.loyalty}
        markRewardUsed={store.markRewardUsed}
      />

      {/* Services */}
      <section id="services" className="py-24 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold uppercase tracking-[0.4em] text-xs mb-4">
            What We Offer
          </p>
          <h2 className="font-serif-display text-4xl sm:text-5xl font-bold uppercase tracking-wider text-foreground">
            Our Luxury Services
          </h2>
          <div className="w-24 h-px gold-gradient mx-auto mt-6" />
        </motion.div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {FILTER_CHIPS.map((chip) => (
            <button
              type="button"
              key={chip.value}
              onClick={() => setActiveFilter(chip.value)}
              data-ocid="services.filter.tab"
              className={`px-5 py-2 rounded-full text-sm font-medium uppercase tracking-wider transition-all ${
                activeFilter === chip.value
                  ? "gold-gradient text-background shadow-gold"
                  : "border border-gold/30 text-foreground/60 hover:border-gold/60 hover:text-foreground"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          data-ocid="services.list"
        >
          {filteredServices.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              data-ocid={`services.item.${i + 1}`}
              className="group relative bg-card border border-border rounded-lg p-6 hover:border-gold/40 hover:shadow-gold transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className={`text-xs uppercase tracking-wider px-3 py-1 rounded-full border ${
                    CATEGORY_COLORS[service.category]
                  }`}
                >
                  {service.category}
                </span>
                <div className="flex items-center gap-1 text-foreground/50 text-sm">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{Number(service.durationMinutes)}min</span>
                </div>
              </div>
              <h3 className="font-serif-display text-xl font-semibold text-foreground mb-2 group-hover:text-gold transition-colors">
                {service.name}
              </h3>
              <p className="text-foreground/60 text-sm mb-6 leading-relaxed">
                {service.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-serif-display text-2xl font-bold text-gold">
                  {formatPrice(service.price)}
                </span>
                <a href="#booking">
                  <Button
                    size="sm"
                    className="gold-gradient text-background uppercase tracking-wider text-xs hover:opacity-90"
                    data-ocid="services.book.button"
                  >
                    Book
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stylists */}
      <section id="stylists" className="py-24 px-4 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold uppercase tracking-[0.4em] text-xs mb-4">
              Our Team
            </p>
            <h2 className="font-serif-display text-4xl sm:text-5xl font-bold uppercase tracking-wider text-foreground">
              Meet Our Elite Stylists
            </h2>
            <div className="w-24 h-px gold-gradient mx-auto mt-6" />
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SAMPLE_STYLISTS.map((stylist, i) => {
              const stylistReviews = store.getReviewsForStylist(stylist.name);
              const avgRating =
                stylistReviews.length > 0
                  ? stylistReviews.reduce((s, r) => s + r.rating, 0) /
                    stylistReviews.length
                  : stylist.rating;
              const latestReview = stylistReviews[0];

              return (
                <motion.div
                  key={stylist.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  data-ocid={`stylists.item.${i + 1}`}
                  className="bg-card border border-border rounded-lg p-8 hover:border-gold/40 hover:shadow-gold transition-all duration-300 group text-center"
                >
                  <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center text-2xl font-bold text-background mx-auto mb-6">
                    {stylist.avatar}
                  </div>
                  <h3 className="font-serif-display text-xl font-bold text-foreground mb-1 group-hover:text-gold transition-colors">
                    {stylist.name}
                  </h3>
                  <p className="text-gold text-sm uppercase tracking-wider mb-1">
                    {stylist.role}
                  </p>
                  <p className="text-foreground/50 text-xs mb-4">
                    {stylist.experience} Experience
                  </p>
                  <div className="flex justify-center gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={`star-${star}`}
                        className={`w-4 h-4 ${
                          star <= Math.round(avgRating)
                            ? "fill-gold text-gold"
                            : "text-foreground/20"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-foreground/50 ml-2">
                      {avgRating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-foreground/30 text-xs mb-4">
                    {stylistReviews.length} review
                    {stylistReviews.length !== 1 ? "s" : ""}
                  </p>

                  {/* Latest review snippet */}
                  {latestReview && (
                    <div className="mb-4 p-3 rounded-lg bg-background/40 border border-border text-left">
                      <p className="text-foreground/50 text-xs leading-relaxed line-clamp-2 italic">
                        "{latestReview.comment}"
                      </p>
                      <p className="text-foreground/30 text-xs mt-1">
                        — {latestReview.userName ?? "Client"}
                      </p>
                    </div>
                  )}

                  <p className="text-foreground/60 text-sm leading-relaxed mb-4">
                    {stylist.bio}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {stylist.specialties.map((s) => (
                      <span
                        key={s}
                        className="text-xs px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/20"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <StylistPortfolioModal
                    stylist={stylist}
                    reviews={stylistReviews}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gold/40 text-gold hover:bg-gold/10 uppercase tracking-wider text-xs"
                      data-ocid="stylists.portfolio.button"
                    >
                      View Portfolio
                    </Button>
                  </StylistPortfolioModal>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="booking" className="py-24 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold uppercase tracking-[0.4em] text-xs mb-4">
            Reserve Your Spot
          </p>
          <h2 className="font-serif-display text-4xl sm:text-5xl font-bold uppercase tracking-wider text-foreground">
            Book Your Session
          </h2>
          <div className="w-24 h-px gold-gradient mx-auto mt-6" />
        </motion.div>
        <div className="max-w-2xl mx-auto bg-card border border-gold/30 rounded-xl p-8 shadow-gold-lg">
          {/* No-Show Policy notice */}
          <div className="mb-6 p-4 rounded-lg border border-gold/20 bg-gold/5">
            <p className="text-xs uppercase tracking-wider text-gold/70 mb-1 font-medium">
              No-Show Policy
            </p>
            <p className="text-foreground/60 text-sm leading-relaxed">
              Booking requires{" "}
              <strong className="text-gold">
                {isRepeatCanceller ? "100%" : "10%"} advance payment
              </strong>
              .
              {isRepeatCanceller
                ? " Due to previous cancellations, full advance is required."
                : " Repeat no-shows require 100% advance for future bookings."}
            </p>
          </div>

          {/* Repeat canceller warning */}
          {isRepeatCanceller && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 p-4 rounded-lg border border-red-500/40 bg-red-500/10"
              data-ocid="booking.canceller_warning"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="text-red-400 font-semibold text-sm">
                  100% Advance Payment Required
                </p>
                <p className="text-foreground/50 text-xs mt-0.5">
                  You have {cancellationCount} previous cancellations on record.
                </p>
              </div>
            </motion.div>
          )}

          <p className="text-foreground/70 text-center mb-8 leading-relaxed">
            Experience luxury first-hand. Secure your appointment with an
            advance payment.
          </p>
          {!isLoggedIn ? (
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-gold mx-auto mb-4 opacity-60" />
              <p className="text-foreground/60 mb-6">
                Please sign in to book your appointment
              </p>
              <Button
                onClick={() => login()}
                size="lg"
                className="gold-gradient text-background font-bold uppercase tracking-wider"
                data-ocid="booking.signin.button"
              >
                Sign In to Book
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Scissors className="w-12 h-12 text-gold mx-auto mb-4 opacity-60" />
              <p className="text-foreground/60 mb-6">
                You're signed in! Full booking flow with Stripe payment coming
                soon.
              </p>
              <Button
                size="lg"
                className="gold-gradient text-background font-bold uppercase tracking-wider"
                data-ocid="booking.start.button"
              >
                Start Booking
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Booking History — only shown when logged in */}
      {isLoggedIn && (
        <BookingHistorySection
          upcomingBookings={DEMO_UPCOMING_BOOKINGS}
          completedBookings={DEMO_COMPLETED_BOOKINGS}
          checkIns={store.checkIns}
          checkIn={store.checkIn}
          addPoints={store.addPoints}
          addReview={store.addReview}
          reviews={store.reviews}
          userId={userId}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-gold/30 bg-card/30 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="font-serif-display text-3xl gold-text font-bold mb-4">
                Glamour Salon
              </div>
              <p className="text-foreground/50 leading-relaxed max-w-sm">
                Where luxury meets artistry. Premium salon services tailored to
                bring out your best self.
              </p>
              <div className="flex gap-4 mt-6">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center text-gold/70 hover:bg-gold/10 hover:text-gold transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center text-gold/70 hover:bg-gold/10 hover:text-gold transition-all"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-serif-display text-sm uppercase tracking-widest text-gold mb-4">
                Services
              </h4>
              <ul className="space-y-2 text-sm text-foreground/50">
                {[
                  "Haircuts",
                  "Hair Color",
                  "Facials",
                  "Keratin Treatment",
                  "Bridal",
                ].map((s) => (
                  <li key={s}>
                    <a
                      href="#services"
                      className="hover:text-gold transition-colors"
                    >
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-serif-display text-sm uppercase tracking-widest text-gold mb-4">
                Contact
              </h4>
              <ul className="space-y-3 text-sm text-foreground/50">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gold/50" /> +91 98765 43210
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold/50" /> MG Road, Bangalore
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gold/10 pt-8 text-center text-foreground/30 text-sm">
            \u00a9 {new Date().getFullYear()} Glamour Salon. Built with
            \u2764\ufe0f using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold/50 hover:text-gold transition-colors"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
