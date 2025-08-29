import { currency, shortId } from "./utils";
import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import MenuCard from "./components/MenuCard";
import {
  Bike,
  Search,
  Filter,
  Calendar,
  MapPin,
} from "lucide-react";

// ===============================
// OakwoodDash — SANDBOX (Junk Food + Images)
// ===============================

// CONFIG
const TEAM_PIN = "4242";
const SERVICE_FEE = 1.0;
const PER_SLOT_CAPACITY = 12;

const SLOTS = [
  { id: "HS_LUNCH", label: "High School Lunch" },
];

const CATEGORIES = [
  { id: "featured", label: "Featured" },
  { id: "hot", label: "Hot Food" },
  { id: "snacks", label: "Snacks" },
  { id: "drinks", label: "Drinks" },
  { id: "breakfast", label: "Breakfast" },
];

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
// MENU (sample items — add more later)
// ===============================
const MENU = [
  // DRINKS
  {
    id: "drpepper-can",
    name: "Dr Pepper (12oz Can)",
    price: 5.0,
    category: "drinks",
    desc: "Cold can from the case.",
    tags: ["popular", "cold"],
    image: "https://placehold.co/400x240?text=Dr+Pepper",
  },
  {
    id: "coke-can",
    name: "Coke (12oz Can)",
    price: 5.0,
    category: "drinks",
    desc: "Classic Coca-Cola.",
    tags: ["cold"],
    image: "https://placehold.co/400x240?text=Coke",
  },
  // SNACKS
  {
    id: "hot-cheetos",
    name: "Hot Cheetos (Snack Bag)",
    price: 4.0,
    category: "snacks",
    desc: "Spicy, crunchy, elite.",
    tags: ["best-seller"],
    image: "https://placehold.co/400x240?text=Hot+Cheetos",
  },
  {
    id: "doritos",
    name: "Doritos (Snack Bag)",
    price: 4.0,
    category: "snacks",
    desc: "Your choice of flavor.",
    options: [
      { key: "flavor", label: "Flavor", choices: ["Nacho Cheese", "Cool Ranch"] },
    ],
    image: "https://placehold.co/400x240?text=Doritos",
  },
];

// ===============================
// UTILITIES (local + tiny storage)
// ===============================
function slotLabel(id: string) {
  return SLOTS.find((s) => s.id === id)?.label || id;
}
const LS_ORDERS = "owdash_orders_v1_sandbox_images";
function loadOrders() {
  try { const raw = localStorage.getItem(LS_ORDERS); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function saveOrders(orders: any[]) { localStorage.setItem(LS_ORDERS, JSON.stringify(orders)); }

// ===============================
// MAIN APP
// ===============================
export default function OakwoodDashSandboxImages() {
  const [cart, setCart] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("featured");
  const [orders, setOrders] = useState<any[]>(loadOrders());
  const [runnerMode, setRunnerMode] = useState(false);
  const [pinPrompt, setPinPrompt] = useState("");

  useEffect(() => saveOrders(orders), [orders]);

  // Filter menu by search + category
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MENU.filter((m) => {
      const matchesText =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.desc?.toLowerCase().includes(q) ||
        (m.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchesCat = tab === "featured" ? true : m.category === tab;
      return matchesText && matchesCat;
    });
  }, [query, tab]);

  // 👉 Add items to cart (this is the one you needed “above the return”)
  function addToCart(item: any, selected: any = {}) {
    setCart((c) => {
      const key = `${item.id}-${JSON.stringify(selected)}`;
      const idx = c.findIndex((ci: any) => ci.key === key);
      if (idx >= 0) {
        const copy = [...c];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...c, { key, id: item.id, name: item.name, price: item.price, options: selected, qty: 1 }];
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-slate-800">
      {/* HEADER */}
      <Header
        cartCount={cart.reduce((n, i) => n + i.qty, 0)}
        onOpenCheckout={() => alert("Checkout coming soon")}
        runnerMode={runnerMode}
        onRunnerToggle={() => setRunnerMode((m) => !m)}
        onRunnerAuth={(pin: string) => {
          if (pin === TEAM_PIN) { setRunnerMode(true); setPinPrompt(""); }
          else { alert("Incorrect PIN"); }
        }}
        pinPrompt={pinPrompt}
        setPinPrompt={setPinPrompt}
      />

      {/* HERO */}
      <Hero
        onStartOrder={() => {
          document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* MAIN */}
      <main className="container mx-auto px-4 pb-28">
        <HowItWorks />

        {/* MENU + SEARCH */}
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

          {/* Tabs */}
          <TabsSimple value={tab} onChange={setTab} tabs={CATEGORIES} />

          {/* Menu grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={addToCart} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// ===============================
// SIMPLE TABS
// ===============================
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
          className={`px-3 py-2 text-sm ${
            value === t.id ? "bg-indigo-600 text-white" : "hover:bg-slate-50"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ===============================
// HOW IT WORKS
// ===============================
function HowItWorks() {
  const steps = [
    { icon: <Search className="h-5 w-5" />, title: "Pick your items", text: "Browse the menu and add to cart." },
    { icon: <Calendar className="h-5 w-5" />, title: "Choose a time", text: "ASAP, Nutrition, Lunch, or custom slot." },
    { icon: <MapPin className="h-5 w-5" />, title: "Drop a location", text: "Tell us where on campus to meet you." },
    { icon: <Bike className="h-5 w-5" />, title: "We deliver", text: "We queue, pick up, and deliver to you fast." },
  ];
  return (
    <section id="how" className="container mx-auto px-4 mt-12">
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

// ===============================
// FOOTER
// ===============================
function Footer() {
  return (
    <footer className="mt-20 border-t bg-white/70">
      <div className="container mx-auto px-4 py-8 text-sm text-slate-600">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            © {new Date().getFullYear()} OakwoodDash — Student-run. Not affiliated with Oakwood School.
          </div>
          <div className="flex items-center gap-4">
            <a href="#how" className="hover:text-indigo-600">How it works</a>
            <a href="#menu" className="hover:text-indigo-600">Menu</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
