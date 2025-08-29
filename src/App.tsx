import MenuCard from "./components/MenuCard";
import Hero from "./components/Hero";
import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import {
  Bike,
  Clock,
  Search,
  Filter,
  Plus,
  Minus,
  Trash2,
  Shield,
  Package,
  CheckCircle,
  Loader2,
  MapPin,
  Calendar,
  ShoppingCart
} from "lucide-react";

// ===============================
// OakwoodDash — SANDBOX (Junk Food + Images)
// ===============================

// CONFIG
const TEAM_PIN = "4242";
const SERVICE_FEE = 1.0;
const PER_SLOT_CAPACITY = 12;

const SLOTS = [
  { id: "ASAP", label: "ASAP (next available)" },
  { id: "NUTRITION", label: "Nutrition Break" },
  { id: "LUNCH", label: "Lunch" },
  { id: "CUSTOM", label: "Choose a time…" },
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
// MENU
// ===============================
const MENU = [
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
    id: "hot-cheetos",
    name: "Hot Cheetos (Snack Bag)",
    price: 4.0,
    category: "snacks",
    desc: "Spicy, crunchy, elite.",
    tags: ["best-seller"],
    image: "https://placehold.co/400x240?text=Hot+Cheetos",
  },
  // ... keep the rest of your MENU items here
];

// ===============================
// UTILITIES
// ===============================
function currency(n: number) {
  return `$${n.toFixed(2)}`;
}
function shortId() {
  const s = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `OW-${s}`;
}
function slotLabel(id: string) {
  return SLOTS.find((s) => s.id === id)?.label || id;
}
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
  const [cart, setCart] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("featured");
  const [showCheckout, setShowCheckout] = useState(false);
  const [orders, setOrders] = useState<any[]>(loadOrders());
  const [runnerMode, setRunnerMode] = useState(false);
  const [pinPrompt, setPinPrompt] = useState("");
  const [statusLookup, setStatusLookup] = useState("");
  const [statusResult, setStatusResult] = useState<any | null>(null);

  useEffect(() => saveOrders(orders), [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MENU.filter((m) => {
      const matchesText =
        !q || m.name.toLowerCase().includes(q) || m.desc?.toLowerCase().includes(q) ||
        (m.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchesCat = tab === "featured" ? true : m.category === tab;
      return matchesText && matchesCat;
    });
  }, [query, tab]);

  const subtotal = useMemo(() => cart.reduce((s, it) => s + it.price * it.qty, 0), [cart]);
  const total = useMemo(() => subtotal + (cart.length ? SERVICE_FEE : 0), [subtotal, cart]);

  // ===============================
  // RETURN STRUCTURE
  // ===============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-slate-800">
      {/* HEADER ALWAYS AT TOP */}
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

      {/* HERO */}
      <Hero 
        onStartOrder={() => {
          document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* REST OF THE APP */}
      <main className="container mx-auto px-4 pb-28">
        <HowItWorks />
        {/* Menu, Status, Cart, etc go here */}
      </main>
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
