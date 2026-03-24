import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Car,
  CheckCircle,
  LayoutDashboard,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { BookingStatus } from "../backend";
import {
  useAddInventoryItem,
  useAllBookings,
  useDailyEarnings,
  useDeleteInventoryItem,
  useEarningsByCategory,
  useInventoryItems,
  useIsAdmin,
  useLowStockItems,
  useUpdateBookingStatus,
} from "../hooks/useQueries";
import { useSalonStore } from "../hooks/useSalonStore";

// Sample fallback data for demo
const DEMO_EARNINGS_BY_CAT = [
  { name: "Trending", value: 450000 },
  { name: "Popular", value: 320000 },
  { name: "Seasonal", value: 180000 },
  { name: "Classic", value: 90000 },
];

const DEMO_LOW_STOCK = [
  {
    name: "Shampoo",
    quantity: BigInt(3),
    threshold: BigInt(5),
    category: "Hair Care",
  },
  {
    name: "Hair Color",
    quantity: BigInt(2),
    threshold: BigInt(5),
    category: "Color",
  },
  {
    name: "Keratin",
    quantity: BigInt(1),
    threshold: BigInt(3),
    category: "Treatment",
  },
];

// Demo bookings with repeat canceller & arriving flags
const DEMO_ADMIN_BOOKINGS = [
  {
    serviceId: "Haircut",
    stylistId: "Priya Sharma",
    timestamp: BigInt(Date.now() + 25 * 60 * 1000),
    status: BookingStatus.confirmed,
    advancePayment: BigInt(5000),
    customer: { toString: () => "demo-repeat-user" },
  },
  {
    serviceId: "Hair Color",
    stylistId: "Meera Patel",
    timestamp: BigInt(Date.now() - 3600000),
    status: BookingStatus.confirmed,
    advancePayment: BigInt(15000),
    customer: { toString: () => "demo-user-2" },
  },
  {
    serviceId: "Keratin",
    stylistId: "Rahul Verma",
    timestamp: BigInt(Date.now() - 7200000),
    status: BookingStatus.completed,
    advancePayment: BigInt(30000),
    customer: { toString: () => "demo-user-3" },
  },
  {
    serviceId: "Facial",
    stylistId: "Priya Sharma",
    timestamp: BigInt(Date.now() - 86400000),
    status: BookingStatus.pending,
    advancePayment: BigInt(8000),
    customer: { toString: () => "demo-repeat-user" },
  },
];

const GOLD_SHADES = ["#C6A15A", "#E8C675", "#A07C3A", "#D4B06A", "#8B6522"];

function formatRupees(paise: bigint | number) {
  const amount = typeof paise === "bigint" ? Number(paise) : paise;
  return `\u20b9${(amount / 100).toLocaleString("en-IN")}`;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  confirmed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/40",
  completed: "bg-foreground/10 text-foreground/60 border-foreground/20",
};

function EarningsSection() {
  const { data: dailyEarnings, isLoading: earningsLoading } =
    useDailyEarnings();
  const { data: earningsByCat, isLoading: catLoading } =
    useEarningsByCategory();

  const chartData =
    earningsByCat && earningsByCat.length > 0
      ? earningsByCat.map(([cat, val]) => ({ name: cat, value: Number(val) }))
      : DEMO_EARNINGS_BY_CAT;

  const totalEarnings = dailyEarnings ?? BigInt(1040000);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl p-8 border border-gold/40"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.15 0.02 75), oklch(0.12 0.01 70))",
        }}
      >
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #C6A15A, transparent)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5 text-gold" />
          <span className="text-sm uppercase tracking-widest text-foreground/60">
            Today's Total Earnings
          </span>
        </div>
        {earningsLoading ? (
          <div
            className="flex items-center gap-2"
            data-ocid="earnings.loading_state"
          >
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
            <span className="text-foreground/50">Loading...</span>
          </div>
        ) : (
          <div
            className="font-serif-display text-5xl font-bold gold-text"
            data-ocid="earnings.card"
          >
            {formatRupees(totalEarnings)}
          </div>
        )}
        <p className="text-foreground/40 text-sm mt-2">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card
          className="bg-card border-border"
          data-ocid="earnings.bar_chart.card"
        >
          <CardHeader className="pb-2">
            <CardTitle className="font-serif-display text-lg text-foreground flex items-center gap-2">
              <span className="w-1 h-5 gold-gradient rounded-full inline-block" />
              Earnings by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {catLoading ? (
              <div
                className="h-48 flex items-center justify-center"
                data-ocid="barchart.loading_state"
              >
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.22 0.01 75)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "oklch(0.60 0 0)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.60 0 0)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      `\u20b9${(v / 100).toLocaleString("en-IN")}`
                    }
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: "oklch(0.12 0 0)",
                      border: "1px solid oklch(0.72 0.10 75 / 0.4)",
                      borderRadius: "8px",
                      color: "oklch(0.96 0.01 75)",
                    }}
                    formatter={(value: number) => [
                      formatRupees(value),
                      "Earnings",
                    ]}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={GOLD_SHADES[index % GOLD_SHADES.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card
          className="bg-card border-border"
          data-ocid="earnings.pie_chart.card"
        >
          <CardHeader className="pb-2">
            <CardTitle className="font-serif-display text-lg text-foreground flex items-center gap-2">
              <span className="w-1 h-5 gold-gradient rounded-full inline-block" />
              Revenue Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {catLoading ? (
              <div
                className="h-48 flex items-center justify-center"
                data-ocid="piechart.loading_state"
              >
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={GOLD_SHADES[index % GOLD_SHADES.length]}
                        stroke="oklch(0.12 0 0)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      background: "oklch(0.12 0 0)",
                      border: "1px solid oklch(0.72 0.10 75 / 0.4)",
                      borderRadius: "8px",
                      color: "oklch(0.96 0.01 75)",
                    }}
                    formatter={(value: number) => [
                      formatRupees(value),
                      "Earnings",
                    ]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span
                        style={{ color: "oklch(0.70 0 0)", fontSize: "12px" }}
                      >
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LowStockSection() {
  const { data: lowStockItems, isLoading, refetch } = useLowStockItems();
  const items =
    lowStockItems && lowStockItems.length > 0 ? lowStockItems : DEMO_LOW_STOCK;

  return (
    <Card className="bg-card border-border" data-ocid="lowstock.card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-serif-display text-lg text-foreground flex items-center gap-2">
          <Package className="w-5 h-5 text-gold" />
          Low Stock Alerts
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          className="text-foreground/50 hover:text-foreground"
          data-ocid="lowstock.refresh.button"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div
            className="flex items-center gap-2 py-4"
            data-ocid="lowstock.loading_state"
          >
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
            <span className="text-foreground/50">Checking inventory...</span>
          </div>
        ) : items.length === 0 ? (
          <div
            className="flex items-center gap-3 py-4"
            data-ocid="lowstock.success_state"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">
              All stock levels healthy
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                data-ocid={`lowstock.item.${i + 1}`}
                className="flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/5"
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <AlertTriangle
                      className="w-6 h-6 text-red-500 animate-blink-pulse"
                      aria-label="Low stock warning"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-foreground/50">
                      Qty:{" "}
                      <span className="text-red-400 font-bold">
                        {Number(item.quantity)}
                      </span>{" "}
                      &bull; Threshold: {Number(item.threshold)}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                  \u26a0\ufe0f LOW STOCK
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BookingsSection() {
  const { data: bookings, isLoading } = useAllBookings();
  const { mutate: updateStatus, isPending } = useUpdateBookingStatus();
  const store = useSalonStore();

  const displayBookings =
    bookings && bookings.length > 0 ? bookings : DEMO_ADMIN_BOOKINGS;

  const isRepeatCanceller = (userId: string) =>
    store.getCancellationCount(userId) >= 2;

  const isArrivingSoon = (bookingId: string) => store.checkIns[bookingId];

  // Check if a booking is within 30 min in future
  const isImminent = (ts: bigint) => {
    const diff = Number(ts) - Date.now();
    return diff > 0 && diff <= 35 * 60 * 1000;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-serif-display text-lg text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gold" />
          Bookings Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div
            className="flex items-center gap-2 p-6"
            data-ocid="bookings.loading_state"
          >
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
            <span className="text-foreground/50">Loading bookings...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table data-ocid="bookings.table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                    Service
                  </TableHead>
                  <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                    Stylist
                  </TableHead>
                  <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                    Date
                  </TableHead>
                  <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                    Advance
                  </TableHead>
                  <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                    Flags
                  </TableHead>
                  <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayBookings.map((booking, i) => {
                  const customerId =
                    typeof booking.customer === "object" &&
                    booking.customer !== null
                      ? (
                          booking.customer as { toString: () => string }
                        ).toString()
                      : String(booking.customer);
                  const repeater = isRepeatCanceller(customerId);
                  // Seed demo repeat canceller
                  const isDemoRepeater = customerId === "demo-repeat-user";
                  const arriving =
                    isArrivingSoon(booking.serviceId) ||
                    isImminent(booking.timestamp as bigint);

                  return (
                    <TableRow
                      key={`booking-${i}-${booking.serviceId}`}
                      className="border-border hover:bg-accent/5"
                      data-ocid={`bookings.item.${i + 1}`}
                    >
                      <TableCell className="font-medium text-foreground">
                        {booking.serviceId}
                      </TableCell>
                      <TableCell className="text-foreground/70">
                        {booking.stylistId}
                      </TableCell>
                      <TableCell className="text-foreground/50 text-sm">
                        {new Date(Number(booking.timestamp)).toLocaleDateString(
                          "en-IN",
                        )}
                      </TableCell>
                      <TableCell className="text-gold font-semibold">
                        {formatRupees(booking.advancePayment)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border uppercase tracking-wider font-medium ${
                            STATUS_STYLES[booking.status] ?? ""
                          }`}
                        >
                          {booking.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          {/* Arriving Soon indicator */}
                          {arriving && (
                            <div
                              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 w-fit"
                              data-ocid={`bookings.arriving.${i + 1}`}
                            >
                              <Car className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                              <span className="text-amber-400 text-xs font-medium">
                                Arriving
                              </span>
                            </div>
                          )}
                          {/* Repeat canceller badge */}
                          {(repeater || isDemoRepeater) && (
                            <div
                              className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/30 w-fit"
                              data-ocid={`bookings.repeat_canceller.${i + 1}`}
                            >
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                              <span className="text-red-400 text-xs font-medium">
                                Repeat Canceller
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {booking.status === BookingStatus.pending && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isPending}
                              onClick={() => {
                                updateStatus({
                                  bookingId: booking.serviceId,
                                  status: BookingStatus.confirmed,
                                });
                                toast.success("Booking confirmed");
                              }}
                              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 h-7 px-2"
                              data-ocid="bookings.confirm.button"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {booking.status !== BookingStatus.cancelled &&
                            booking.status !== BookingStatus.completed && (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isPending}
                                onClick={() => {
                                  updateStatus({
                                    bookingId: booking.serviceId,
                                    status: BookingStatus.cancelled,
                                  });
                                  toast.error("Booking cancelled");
                                }}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 px-2"
                                data-ocid="bookings.cancel.button"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InventorySection() {
  const { data: inventory, isLoading } = useInventoryItems();
  const { mutate: addItem, isPending: adding } = useAddInventoryItem();
  const { mutate: deleteItem } = useDeleteInventoryItem();

  const DEMO_INVENTORY = [
    {
      name: "Shampoo",
      quantity: BigInt(3),
      threshold: BigInt(5),
      category: "Hair Care",
    },
    {
      name: "Hair Color",
      quantity: BigInt(2),
      threshold: BigInt(5),
      category: "Color",
    },
    {
      name: "Conditioner",
      quantity: BigInt(10),
      threshold: BigInt(4),
      category: "Hair Care",
    },
    {
      name: "Keratin",
      quantity: BigInt(1),
      threshold: BigInt(3),
      category: "Treatment",
    },
  ];

  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    threshold: "",
    category: "",
  });
  const items = inventory && inventory.length > 0 ? inventory : DEMO_INVENTORY;

  const handleAdd = () => {
    if (!newItem.name || !newItem.quantity) return;
    addItem({
      name: newItem.name,
      quantity: BigInt(Number(newItem.quantity)),
      threshold: BigInt(Number(newItem.threshold) || 5),
      category: newItem.category || "General",
    });
    setNewItem({ name: "", quantity: "", threshold: "", category: "" });
    toast.success(`${newItem.name} added to inventory`);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-serif-display text-lg text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-gold" />
            Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div
              className="flex items-center gap-2 p-6"
              data-ocid="inventory.loading_state"
            >
              <Loader2 className="w-5 h-5 animate-spin text-gold" />
            </div>
          ) : (
            <Table data-ocid="inventory.table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                    Item
                  </TableHead>
                  <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                    Category
                  </TableHead>
                  <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                    Qty
                  </TableHead>
                  <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                    Threshold
                  </TableHead>
                  <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, i) => {
                  const isLow = Number(item.quantity) <= Number(item.threshold);
                  return (
                    <TableRow
                      key={item.name}
                      className="border-border hover:bg-accent/5"
                      data-ocid={`inventory.item.${i + 1}`}
                    >
                      <TableCell className="font-medium text-foreground">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-foreground/60">
                        {item.category}
                      </TableCell>
                      <TableCell
                        className={`font-bold ${
                          isLow ? "text-red-400" : "text-emerald-400"
                        }`}
                      >
                        {Number(item.quantity)}
                      </TableCell>
                      <TableCell className="text-foreground/50">
                        {Number(item.threshold)}
                      </TableCell>
                      <TableCell>
                        {isLow ? (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 animate-blink-pulse" />
                            <span className="text-xs text-red-400 uppercase tracking-wider font-bold">
                              Low
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs text-emerald-400 uppercase tracking-wider">
                              OK
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            deleteItem(item.name);
                            toast.success(`${item.name} removed`);
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 px-2"
                          data-ocid="inventory.delete_button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-serif-display text-base text-foreground flex items-center gap-2">
            <Plus className="w-4 h-4 text-gold" />
            Add Inventory Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-foreground/60 mb-1 block">
                Name
              </Label>
              <Input
                value={newItem.name}
                onChange={(e) =>
                  setNewItem((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Shampoo"
                className="bg-background border-border text-foreground"
                data-ocid="inventory.name.input"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-foreground/60 mb-1 block">
                Quantity
              </Label>
              <Input
                type="number"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem((p) => ({ ...p, quantity: e.target.value }))
                }
                placeholder="10"
                className="bg-background border-border text-foreground"
                data-ocid="inventory.quantity.input"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-foreground/60 mb-1 block">
                Threshold
              </Label>
              <Input
                type="number"
                value={newItem.threshold}
                onChange={(e) =>
                  setNewItem((p) => ({ ...p, threshold: e.target.value }))
                }
                placeholder="5"
                className="bg-background border-border text-foreground"
                data-ocid="inventory.threshold.input"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-foreground/60 mb-1 block">
                Category
              </Label>
              <Input
                value={newItem.category}
                onChange={(e) =>
                  setNewItem((p) => ({ ...p, category: e.target.value }))
                }
                placeholder="Hair Care"
                className="bg-background border-border text-foreground"
                data-ocid="inventory.category.input"
              />
            </div>
          </div>
          <Button
            onClick={handleAdd}
            disabled={adding || !newItem.name}
            className="gold-gradient text-background font-semibold uppercase tracking-wider text-xs"
            data-ocid="inventory.add.button"
          >
            {adding ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Add Item
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();

  if (checkingAdmin) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-gold mx-auto mb-4" />
          <p className="text-foreground/50 uppercase tracking-widest text-sm">
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="admin.error_state"
      >
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-foreground/50 mb-6">
            You don't have admin privileges to view this page.
          </p>
          <Link to="/">
            <Button
              className="gold-gradient text-background font-semibold uppercase tracking-wider"
              data-ocid="admin.go_home.button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <nav className="sticky top-0 z-50 border-b border-gold/30 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-foreground/50 hover:text-gold transition-colors"
                data-ocid="admin.nav.home.link"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="font-serif-display text-xl gold-text font-bold">
                Glamour Salon
              </div>
              <span className="text-xs uppercase tracking-widest text-foreground/40 border border-gold/20 px-3 py-1 rounded-full">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-2 text-foreground/50 text-sm">
              <LayoutDashboard className="w-4 h-4 text-gold" />
              <span className="hidden sm:block uppercase tracking-wider text-xs">
                Dashboard
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-foreground mb-1">
            Admin <span className="gold-text">Dashboard</span>
          </h1>
          <p className="text-foreground/40 text-sm uppercase tracking-widest">
            Manage your salon operations
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Today's Bookings",
              value: "12",
              icon: Calendar,
              color: "text-gold",
            },
            {
              label: "Active Stylists",
              value: "3",
              icon: Users,
              color: "text-emerald-400",
            },
            {
              label: "Low Stock Items",
              value: "3",
              icon: Package,
              color: "text-red-400",
            },
            {
              label: "Monthly Revenue",
              value: "\u20b92.4L",
              icon: TrendingUp,
              color: "text-blue-400",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-lg p-4 hover:border-gold/30 transition-colors"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <div
                className={`font-serif-display text-2xl font-bold ${stat.color}`}
              >
                {stat.value}
              </div>
              <div className="text-xs text-foreground/40 uppercase tracking-wider mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <Tabs
          defaultValue="overview"
          className="space-y-6"
          data-ocid="admin.tabs"
        >
          <TabsList className="bg-card border border-border rounded-lg p-1 h-auto flex-wrap gap-1">
            {[
              { value: "overview", label: "Overview" },
              { value: "inventory", label: "Inventory" },
              { value: "bookings", label: "Bookings" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs uppercase tracking-wider data-[state=active]:bg-gold/20 data-[state=active]:text-gold rounded-md"
                data-ocid={`admin.${tab.value}.tab`}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <EarningsSection />
            <LowStockSection />
          </TabsContent>

          <TabsContent value="inventory">
            <InventorySection />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsSection />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-gold/10 mt-16 py-6 text-center text-foreground/20 text-xs">
        \u00a9 {new Date().getFullYear()} Glamour Salon Admin. Built with
        \u2764\ufe0f using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold/40 hover:text-gold transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
