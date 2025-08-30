import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import MenuCard from "./components/MenuCard";
import CartDock from "./components/CartDock";
import RunnerPage from "./components/RunnerPage";

import {
  Bike,
  Search,
  Filter,
  Package,
  CheckCircle,
  Loader2,
  MapPin,
  Calendar,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
} from "lucide-react";

import { currency, shortId } from "./utils";

// ===============================
// CONFIG
// ===============================
const TEAM_PIN = "4242";
const SERVICE_FEE = 1.0;

// Only one slot for now
const SLOTS = [{ id: "HSLUNCH", label: "High School Lunch (for now)" }];

const CATEGORIES = [
  { id: "featured", label: "Featured" },
  { id: "snacks", label: "Snacks" },
  { id: "drinks", label: "Drinks" },
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
// MENU (from your sheet, with new prices)
// ===============================
const MENU = [
  // Drinks
  {
    id: "drpepper-can",
    name: "Dr Pepper (12oz Can)",
    price: 2.0, // ✅ updated
    category: "drinks",
    desc: "Cold can from the case.",
    tags: ["cold"],
    image: "https://upload.wikimedia.org/wikipedia/commons/0/09/Dr_Pepper_can_12oz.jpg",
  },
  // Snacks
  {
    id: "oreos-snack",
    name: "Oreos (Snack Pack)",
    price: 2.5, // ✅ updated
    category: "snacks",
    desc: "Mini sleeve of Oreos.",
    image: "https://images-na.ssl-images-amazon.com/images/I/71vDgC8p6ML._SL1500_.jpg",
  },
  {
    id: "hot-cheetos",
    name: "Hot Cheetos (Snack Bag)",
    price: 2.99, // ✅ updated
    category: "snacks",
    desc: "Spicy, crunchy, elite.",
    tags: ["best-seller"],
    image: "https://www.fritolay.com/sites/fritolay.com/files/styles/product_image/public/flamin-hot-cheetos.jpg",
  },
  {
    id: "trident-spearmint",
    name: "Trident Gum — Spearmint (14ct)",
    price: 1.5, // ✅ updated
    category: "snacks",
    desc: "Fresh breath on deck.",
    image: "https://m.media-amazon.com/images/I/81n0VtUJm8L._AC_SL1500_.jpg",
  },
  {
    id: "nerds-gummy",
    name: "Nerds Gummy Clusters (3oz)",
    price: 2.99, // ✅ updated
    category: "snacks",
    desc: "Rainbow clusters. Crunch then chew.",
    image: "https://m.media-amazon.com/images/I/81cHf2rsCXL._AC_SL1500_.jpg",
  },
];

// ===============================
// PERSISTENCE
// ===============================
const LS_ORDERS = "owdash_orders_v1";
const LS_INV = "owdash_inventory_v1";

const DEFAULT_STOCK: Record<string, number> = {
  "oreos-snack": 30,
  "hot-cheetos": 50,
  "drpepper-can": 12,
  "trident-spearmint": 15,
  "nerds-gummy": 12,
};

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
function loadInventory() {
  try {
    const raw = localStorage.getItem(LS_INV);
    return raw ? JSON.parse(raw) : DEFAULT_STOCK;
  } catch {
    return DEFAULT_STOCK;
  }
}
function saveInventory(inv: Record<string, number>) {
  localStorage.setItem(LS_INV, JSON.stringify(inv));
}

// ===============================
// APP
// ===============================
export default function OakwoodDash() {
  const [cart, setCart] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("featured");
  const [showCheckout, setShowCheckout] = useState(false);
  const [orders, setOrders] = useState<any[]>(loadOrders());

  const [runnerMode, setRunnerMode] = useState(false);
  const [pinPrompt, setPinPrompt] = useState("");

  const [inventory, setInventory] = useState<Record<string, number>>(loadInventory());
  useEffect(() => saveOrders(orders), [orders]);
  useEffect(() => saveInventory(inventory), [inventory]);

  // Filter menu
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = MENU.filter((m) => {
      const matchesText =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.desc?.toLowerCase().includes(q) ||
        (m.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchesCat = tab === "featured" ? true : m.category === tab;
      return matchesText && matchesCat;
    });
    // Feature: sort with in-stock first
    return arr.sort((a, b) => (stockLeft(b.id) > 0 ? 1 : 0) - (stockLeft(a.id) > 0 ? 1 : 0));
  }, [query, tab, inventory]);

  // Totals
  const subtotal = useMemo(
    () => cart.reduce((s, it) => s + it.price * it.qty, 0),
    [cart]
  );
  const total = useMemo(
    () => subtotal + (cart.length ? SERVICE_FEE : 0),
    [subtotal, cart]
  );

  // Helpers
  function stockLeft(id: string) {
    return Math.max(0, inventory[id] ?? 0);
  }
  function inCartCount(id: string) {
    return cart.filter((l) => l.id === id).reduce((n, l) => n + l.qty, 0);
  }

  // Add + quantity update with stock checks
  function addToCart(item: any, selected: any = {}) {
    const available = stockLeft(item.id) - inCartCount(item.id);
    if (available <= 0) {
      alert("Sorry, that item is out of stock.");
      return;
    }
    setCart((c) => {
      const key = `${item.id}-${JSON.stringify(selected)}`;
      const idx = c.findIndex((ci) => ci.key === key);
      if (idx >= 0) {
        // cap to available
        const nextQty = Math.min(c[idx].qty + 1, stockLeft(item.id) - (inCartCount(item.id) - c[idx].qty));
        const copy = [...c];
        copy[idx] = { ...copy[idx], qty: nextQty };
        return copy;
      }
      return [
        ...c,
        {
          key,
          id: item.id,
          name: item.name,
          price: item.price,
          options: selected,
          qty: 1,
        },
      ];
    });
  }
  function updateQty(key: string, delta: number) {
    setCart((c) => {
      const copy = c.map((it) =>
        it.key === key ? { ...it, qty: Math.max(1, it.qty + delta) } : it
      );
      // Enforce stock cap when increasing
      const line = copy.find((l) => l.key === key);
      if (line && delta > 0) {
        const others = copy.filter((l) => l.id === line.id && l.key !== key);
        const othersQty = others.reduce((n, l) => n + l.qty, 0);
        const maxForLine = Math.max(1, stockLeft(line.id) - othersQty);
        line.qty = Math.min(line.qty, maxForLine);
      }
      return copy.filter((it) => it.qty > 0);
    });
  }
  function removeLine(key: string) {
    setCart((c) => c.filter((it) => it.key !== key));
  }

  // Place order: save + auto-decrement inventory + clear cart
  function handlePlaceOrder(payload: any) {
    if (!cart || cart.length === 0) return;
    const id = shortId();
    const today = new Date();
    const order = {
      id,
      createdAt: today.toISOString(),
      items: cart,
      subtotal,
      fee: SERVICE_FEE,
      total,
      customer: payload.customer,
      slot: payload.slot, // { id, label }
      location: payload.location,
      notes: payload.notes,
      payment: payload.payment,
      status: "Queued",
    };
    // Save order
    setOrders((prev) => [order, ...prev]);
    // Decrement inventory
    setInventory((prev) => {
      const next = { ...prev };
      for (const line of cart) {
        next[line.id] = Math.max(0, (next[line.id] ?? 0) - line.qty);
      }
      return next;
    });
    // Reset UI
    setCart([]);
    setShowCheckout(false);
    alert(`Thanks! Your order ID is ${id}.`);
  }

  function setOrderStatus(id: string, status: string) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  // ===============================
  // Runner Page (full page)
  // ===============================
  if (runnerMode) {
    return (
      <RunnerPage
        onExit={() => setRunnerMode(false)}
        orders={orders}
        onSetStatus={setOrderStatus}
        menu={MENU}
        inventory={inventory}
        onAdjustInventory={(id, delta) =>
          setInventory((p) => ({ ...p, [id]: Math.max(0, (p[id] ?? 0) + delta) }))
        }
      />
    );
  }

  // ===============================
  // Customer Site
  // ===============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-slate-800">
      <Header
        cartCount={cart.reduce((n, i) => n + i.qty, 0)}
        onOpenCheckout={() => setShowCheckout(true)}
        runnerMode={false}
        onRunnerToggle={() => {}}
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

      <Hero
        onStartOrder={() => {
          document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      <main className="container mx-auto px-4 pb-28">
        <HowItWorks />

        {/* Status Lookup (kept for later) */}
        <section id="status" className="mt-12">
          <div className="rounded-2xl border bg-white/90 shadow-lg">
            <div className="p-4 border-b flex items-center gap-2 text-slate-700 font-semibold">
              <Package className="h-5 w-5" /> Check your order status
            </div>
            <div className="p-4 text-sm text-slate-500">
              (Coming soon) — Lookup by Order ID or email.
            </div>
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
          </div>

          <TabsSimple value={tab} onChange={setTab} tabs={CATEGORIES} />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {filtered.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                stockLeft={stockLeft(item.id)}
                onAdd={addToCart}
              />
            ))}
          </div>
        </section>
      </main>

      <CartDock
        cart={cart}
        subtotal={subtotal}
        fee={cart.length ? SERVICE_FEE : 0}
        total={total}
        onQty={updateQty}
        onRemove={removeLine}
        onCheckout={() => setShowCheckout(true)}
      />

      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          total={total}
          fee={SERVICE_FEE}
          subtotal={subtotal}
          cart={cart}
          onPlace={(payload: any) =>
            handlePlaceOrder({
              ...payload,
              slot: { id: SLOTS[0].id, label: SLOTS[0].label }, // fixed slot
            })
          }
        />
      )}

      <Footer />
    </div>
  );
}

// ===============================
// HOW IT WORKS
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

// ===============================
// CHECKOUT MODAL (same UX, simplified)
// ===============================
function CheckoutModal({ onClose, cart, subtotal, fee, total, onPlace }: any) {
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("9");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState("Cash");
  const [placing, setPlacing] = useState(false);

  function place() {
    if (!cart || cart.length === 0) return;
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
    setPlacing(true);
    setTimeout(() => {
      onPlace({
        location,
        customer: { name, grade, email },
        notes,
        payment,
      });
      setPlacing(false);
    }, 500);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-50 w-[95%] max-w-3xl rounded-2xl bg-white shadow-xl p-6 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">Checkout</div>
          <div className="text-indigo-600 font-semibold">{currency(total)}</div>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div>
            <div className="font-semibold mb-2">Delivery details</div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="rounded-xl border px-3 py-2"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <select
                  className="rounded-xl border px-3 py-2"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  {["9", "10", "11", "12"].map((g) => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </select>
              </div>
              <input
                className="rounded-xl border px-3 py-2 w-full"
                placeholder="Email (for status lookup)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2 items-center">
                <label className="text-sm">Delivery spot</label>
                <select
                  className="rounded-xl border px-3 py-2"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 items-center">
                <label className="text-sm">Pay with</label>
                <select
                  className="rounded-xl border px-3 py-2"
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                >
                  {["Cash", "Apple Pay (in-person)", "Venmo"].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className="rounded-xl border px-3 py-2 w-full"
                placeholder="Notes (allergies, extra sauce, etc.)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="text-[11px] text-slate-500">
                Student-run service. On-campus delivery only. Please be respectful to
                Student Store staff. 🙏
              </div>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Order summary</div>
            <div className="space-y-3">
              <div className="rounded-xl border bg-white divide-y">
                {cart.map((line: any) => (
                  <div
                    key={line.key}
                    className="p-3 text-sm flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="font-medium">
                        {line.name} <span className="text-slate-500">×{line.qty}</span>
                      </div>
                      {line.options &&
                        Object.keys(line.options).length > 0 && (
                          <div className="text-xs text-slate-500">
                            {Object.entries(line.options)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" • ")}
                          </div>
                        )}
                    </div>
                    <div className="text-slate-700">
                      {currency(line.price * line.qty)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <span>{currency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Service fee</span>
                <span>{currency(fee)}</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-base">
                <span>Total</span>
                <span>{currency(total)}</span>
              </div>
              <button
                className={`w-full rounded-xl px-3 py-2 flex items-center gap-2 justify-center ${
                  placing ? "bg-slate-300 text-slate-600" : "bg-indigo-600 text-white"
                }`}
                disabled={placing}
                onClick={place}
              >
                {placing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                {placing ? "Placing…" : "Place order"}
              </button>
              <button className="w-full rounded-xl px-3 py-2 border" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
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
    <div className="inline-grid grid-cols-3 rounded-xl border bg-white overflow-hidden">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-2 text-sm ${
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
// FOOTER
// ===============================
function Footer() {
  return (
    <footer className="mt-20 border-t bg-white/70">
      <div className="container mx-auto px-4 py-8 text-sm text-slate-600">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} OakwoodDash — Student-run.</div>
          <div className="flex items-center gap-4">
            <a href="#how" className="hover:text-indigo-600">
              How it works
            </a>
            <a href="#menu" className="hover:text-indigo-600">
              Menu
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
