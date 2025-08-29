import React, { useEffect, useMemo, useState } from "react";

// Split components
import Header from "./components/Header";
import Hero from "./components/Hero";
import MenuCard from "./components/MenuCard";
import CartDock from "./components/CartDock";
import CheckoutModal from "./components/CheckoutModal";

// Utils
import { currency, shortId } from "./utils";

// Icons used in this file (others live inside split components)
import { Search, Filter, Package, Calendar, MapPin, Bike } from "lucide-react";

// ===============================
// CONFIG
// ===============================
const TEAM_PIN = "4242";           // Runner dashboard PIN
const SERVICE_FEE = 1.0;           // USD flat fee per order
const PER_SLOT_CAPACITY = 12;      // Not enforced yet, just displayed

// One slot for now (you asked to keep only HS Lunch)
const SLOTS = [
  { id: "HS_LUNCH", label: "High School Lunch" },
];

// Categories (for tabs/filtering)
const CATEGORIES = [
  { id: "featured", label: "Featured" },
  { id: "hot", label: "Hot Food" },
  { id: "snacks", label: "Snacks" },
  { id: "drinks", label: "Drinks" },
  { id: "breakfast", label: "Breakfast" },
];

// Delivery locations
const LOCATIONS = [
  "Main Quad",
  "Library Patio",
  "Arts Building",
  "Science Building",
  "Gym Entrance",
  "Front Gate",
  "College Counseling",
];

// ===============================
// MENU (sample; add more as you like)
// ===============================
// Real starter menu (prices from your sheet)
const MENU = [
  {
    id: "oreos-pack",
    name: "Oreos (Snack Pack)",
    price: 2.50,
    category: "snacks",
    desc: "Mini sleeve of Oreos.",
    tags: ["popular"],
    image: "https://placehold.co/400x240?text=Oreos",
    stock: 30, // starting stock
  },
  {
    id: "hot-cheetos",
    name: "Hot Cheetos (Snack Bag)",
    price: 3.80,
    category: "snacks",
    desc: "Spicy, crunchy, elite.",
    tags: ["best-seller"],
    image: "https://placehold.co/400x240?text=Hot+Cheetos",
    stock: 50,
  },
  {
    id: "drpepper-can",
    name: "Dr Pepper (12oz Can)",
    price: 2.00,
    category: "drinks",
    desc: "Cold can from the case.",
    tags: ["cold"],
    image: "https://placehold.co/400x240?text=Dr+Pepper",
    stock: 12,
  },
  {
    id: "trident-spearmint",
    name: "Trident Spearmint (14ct Pack)",
    price: 1.50,
    category: "snacks",
    desc: "Sugar-free gum, 14 pieces.",
    image: "https://placehold.co/400x240?text=Trident+Spearmint",
    stock: 15,
    // Reference: https://www.costco.com/trident-sugar-free-gum-spearmint-14-count-15-pack.product.100385472.html
  },
  {
    id: "nerds-gummy-clusters",
    name: "Nerds Gummy Clusters (3oz Pouch)",
    price: 3.50,
    category: "snacks",
    desc: "Rainbow share pouch.",
    image: "https://placehold.co/400x240?text=Nerds+Gummy+Clusters",
    stock: 12,
    // Reference: https://www.costco.com/nerds-candy-gummy-clusters-rainbow-share-pouch-3-oz-12-count.product.4000112558.html
  },
];

// ===============================
// LOCAL STORAGE (orders)
// ===============================
const LS_ORDERS = "owdash_orders_v1_sandbox_images";
function loadOrders() {
  try {
    const raw = localStorage.getItem(LS_ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveOrders(orders: any[]) {
  localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
}

// ===============================
// MAIN APP
// ===============================
export default function OakwoodDashSandboxImages() {
  // Cart & UI state
  const [cart, setCart] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("featured");

  // Checkout / runner
  const [showCheckout, setShowCheckout] = useState(false);
  const [orders, setOrders] = useState<any[]>(loadOrders());
  const [runnerMode, setRunnerMode] = useState(false);
  const [pinPrompt, setPinPrompt] = useState("");

  // Status lookup (optional — UI added below)
  const [statusLookup, setStatusLookup] = useState("");
  const [statusResult, setStatusResult] = useState<any | null>(null);

  useEffect(() => saveOrders(orders), [orders]);

  // Filtered menu
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MENU.filter((m) => {
      const matchesText =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.desc?.toLowerCase().includes(q) ||
        (m.tags || []).some((t: string) => t.toLowerCase().includes(q));
      const matchesCat = tab === "featured" ? true : m.category === tab;
      return matchesText && matchesCat;
    });
  }, [query, tab]);

  // Totals
  const subtotal = useMemo(() => cart.reduce((s, it) => s + it.price * it.qty, 0), [cart]);
  const total = useMemo(() => subtotal + (cart.length ? SERVICE_FEE : 0), [subtotal, cart]);

  // Cart ops
  function addToCart(item: any, selected: any = {}) {
    setCart((c) => {
      const key = `${item.id}-${JSON.stringify(selected)}`;
      const idx = c.findIndex((ci) => ci.key === key);
      if (idx >= 0) {
        const copy = [...c];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
    }
      return [...c, { key, id: item.id, name: item.name, price: item.price, options: selected, qty: 1 }];
    });
  }
  function updateQty(key: string, delta: number) {
    setCart((c) =>
      c
        .map((it) => (it.key === key ? { ...it, qty: Math.max(1, it.qty + delta) } : it))
        .filter((it) => it.qty > 0)
    );
  }
  function removeLine(key: string) {
    setCart((c) => c.filter((it) => it.key !== key));
  }

  // Orders
  function handlePlaceOrder(payload: any) {
    const id = shortId();
    const today = new Date();
    const order = {
      id,
      createdAt: today.toISOString(),
      dayKey: today.toDateString(),
      items: cart,
      subtotal,
      fee: SERVICE_FEE,
      total,
      customer: payload.customer,
      slot: payload.slot,     // { id, label, time? }
      location: payload.location,
      notes: payload.notes,
      payment: payload.payment,
      status: "Queued",
    };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setShowCheckout(false);
    setStatusResult(order); // show the just-placed order in status box
  }

  function lookupStatus(token: string) {
    const byId = orders.find((o) => o.id.toUpperCase() === token.toUpperCase());
    if (byId) return setStatusResult(byId);
    const byEmail = orders.find((o) => o.customer.email?.toLowerCase() === token.toLowerCase());
    if (byEmail) return setStatusResult(byEmail);
    setStatusResult(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-slate-800">
      {/* Header */}
      <Header
        cartCount={cart.reduce((n, i) => n + i.qty, 0)}
        onOpenCheckout={() => setShowCheckout(true)}
        runnerMode={runnerMode}
        onRunnerToggle={() => setRunnerMode((m) => !m)}
        onRunnerAuth={(pin: string) => {
          if (pin === TEAM_PIN) {
            setRunnerMode(true);
            setPinPrompt("");
          } else {
            alert("Incorrect PIN");
          }
        }}
        pinPrompt={pinPrompt}
        setPinPrompt={setPinPrompt}
      />

      {/* Hero */}
      <Hero
        onStartOrder={() => {
          document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      <main className="container mx-auto px-4 pb-28">
        {/* How it works */}
        <HowItWorks />

        {/* Status lookup */}
        <section id="status" className="mt-12">
          <div className="rounded-2xl border bg-white/90 shadow-lg">
            <div className="p-4 border-b flex items-center gap-2 text-slate-700 font-semibold">
              <Package className="h-5 w-5" /> Check your order status
            </div>
            <div className="p-4 flex flex-col md:flex-row items-center gap-3">
              <input
                className="w-full md:w-auto flex-1 rounded-xl border px-3 py-2"
                placeholder="Enter Order ID (e.g., OW-ABC123) or your email"
                value={statusLookup}
                onChange={(e) => setStatusLookup(e.target.value)}
              />
              <button
                onClick={() => lookupStatus(statusLookup)}
                className="rounded-xl px-4 py-2 bg-indigo-600 text-white"
              >
                Lookup
              </button>
            </div>
            {statusResult && (
              <div className="px-4 pb-4">
                <OrderStatusCard order={statusResult} />
              </div>
            )}
          </div>
        </section>

        {/* Menu */}
        <section id="menu" className="mt-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3 w-full">
              <div className="relative w-full md:w-96">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="pl-9 w-full rounded-xl border px-3 py-2"
                  placeholder="Search the student store…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <span className="hidden md:inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm text-slate-600">
                <Filter className="h-4 w-4" />
                Filters
              </span>
            </div>
            <div className="text-sm text-slate-600">
              Capacity per slot: <strong>{PER_SLOT_CAPACITY}</strong>
            </div>
          </div>

          <TabsSimple value={tab} onChange={setTab} tabs={CATEGORIES} />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={addToCart} />
            ))}
          </div>
        </section>
      </main>

      {/* Cart dock */}
      <CartDock
        cart={cart}
        subtotal={subtotal}
        fee={SERVICE_FEE}
        total={total}
        onQty={updateQty}
        onRemove={removeLine}
        onCheckout={() => setShowCheckout(true)}
      />

      {/* Checkout modal */}
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          total={total}
          fee={SERVICE_FEE}
          subtotal={subtotal}
          cart={cart}
          onPlace={handlePlaceOrder}
          slots={SLOTS}         // single slot for now
          locations={LOCATIONS}
        />
      )}
    </div>
  );
}

// ===============================
// SUPPORTING UI IN THIS FILE
// ===============================
function HowItWorks() {
  const steps = [
    { icon: <Search className="h-5 w-5" />, title: "Pick your items", text: "Browse the menu and add to cart." },
    { icon: <Calendar className="h-5 w-5" />, title: "Choose a time", text: "High School Lunch (for now)." },
    { icon: <MapPin className="h-5 w-5" />, title: "Drop a location", text: "Tell us where on campus to meet you." },
    { icon: <Bike className="h-5 w-5" />, title: "We deliver", text: "We queue, pick up, and deliver to you fast." },
  ];
  return (
    <section id="how" className="container mx-auto px-4">
      <div className="grid md:grid-cols-4 gap-4">
        {steps.map((s, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border shadow-sm">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold">
              <span className="inline-grid place-items-center h-8 w-8 rounded-xl bg-indigo-50">{s.icon}</span>
              Step {i + 1}
            </div>
            <div className="mt-2 font-semibold">{s.title}</div>
            <div className="text-sm text-slate-600">{s.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TabsSimple({
  value,
  onChange,
  tabs,
}: {
  value: string;
  onChange: (v: string) => void;
  tabs: { id: string; label: string }[];
}) {
  return (
    <div className="inline-grid grid-cols-3 md:grid-cols-5 rounded-xl border bg-white overflow-hidden">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3 py-2 text-sm ${value === t.id ? "bg-indigo-600 text-white" : "hover:bg-slate-50"}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function OrderStatusCard({ order }: { order: any }) {
  const steps = ["Queued", "In Progress", "Ready", "Delivered"];
  const idx = steps.findIndex((s) => s === order.status);
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold text-slate-800 flex items-center gap-2">
          <Package className="h-4 w-4" /> Order <span className="text-indigo-600">{order.id}</span>
        </div>
        <span className="rounded-full bg-indigo-600 text-white text-xs px-2 py-1">{order.status}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {steps.map((s, i) => (
          <div key={s} className={`p-2 rounded-xl border ${i <= idx ? "bg-indigo-50 border-indigo-200" : "bg-slate-50"}`}>
            <div className="font-medium">{s}</div>
            <div className="text-slate-500">{i < idx ? "Done" : i === idx ? "Current" : "Pending"}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-sm text-slate-600 flex flex-wrap gap-3">
        <div>
          <strong>Time:</strong> {order.slot.label}
          {order.slot.time ? ` • ${order.slot.time}` : ""}
        </div>
        <div>
          <strong>Deliver to:</strong> {order.location}
        </div>
        <div>
          <strong>Name:</strong> {order.customer.name} (Grade {order.customer.grade})
        </div>
      </div>
    </div>
  );
}
