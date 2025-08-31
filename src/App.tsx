// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Bike,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Calendar,
  MapPin,
  LogOut,
} from "lucide-react";

/* =========================================
   CONFIG / CONSTANTS
========================================= */
const TEAM_PIN = "4242";
const SERVICE_FEE = 1.0;

const CATEGORIES = [
  { id: "featured", label: "Featured" },
  { id: "snacks", label: "Snacks" },
  { id: "drinks", label: "Drinks" },
];

type Item = {
  id: string;
  name: string;
  price: number;
  category: "snacks" | "drinks";
  desc: string;
  image: string;
  featured?: boolean;
};

// Your 5 products (images must exist at /public/products/*.jpg)
const MENU: Item[] = [
  {
    id: "drpepper-can",
    name: "Dr Pepper (12oz Can)",
    price: 2.0,
    category: "drinks",
    desc: "Cold can from the case.",
    image: "/products/drpepper.jpg",
    featured: true,
  },
  {
    id: "oreos-snack",
    name: "Oreos (Snack Pack)",
    price: 2.5,
    category: "snacks",
    desc: "Mini sleeve of Oreos.",
    image: "/products/oreo.jpg",
    featured: true,
  },
  {
    id: "hot-cheetos",
    name: "Hot Cheetos (Snack Bag)",
    price: 2.99,
    category: "snacks",
    desc: "Spicy, crunchy, elite.",
    image: "/products/cheetos.jpg",
    featured: true,
  },
  {
    id: "trident-spearmint",
    name: "Trident Gum — Spearmint (14ct)",
    price: 1.5,
    category: "snacks",
    desc: "Fresh breath on deck.",
    image: "/products/trident.jpg",
  },
  {
    id: "nerds-gummy",
    name: "Nerds Gummy Clusters (3oz)",
    price: 2.99,
    category: "snacks",
    desc: "Rainbow clusters. Crunch then chew.",
    image: "/products/nerds.jpg",
  },
];

/* =========================================
   SMALL HELPERS (self-contained)
========================================= */
const currency = (n: number) => `$${n.toFixed(2)}`;
const shortId = () => `OW-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const loadJSON = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const saveJSON = (key: string, val: unknown) => {
  localStorage.setItem(key, JSON.stringify(val));
};

/* =========================================
   TYPES
========================================= */
type CartLine = {
  key: string;
  id: string;
  name: string;
  price: number;
  qty: number;
};

type Order = {
  id: string;
  items: CartLine[];
  name: string;
  grade: string;
  location: string;
  instructions?: string;
  slot: "High School Lunch";
  total: number;
  status: "queued" | "picked" | "delivering" | "delivered" | "canceled";
  createdAt: number;
};

/* =========================================
   STORAGE KEYS
========================================= */
const LS_ORDERS = "oakSnack_orders_v1";
const LS_INV = "oakSnack_inv_v1";
const LS_REV = "oakSnack_rev_v1";

/* =========================================
   HEADER
========================================= */
function Header({
  cartCount,
  onOpenCheckout,
  runnerMode,
  onRunnerToggle,
  onRunnerAuth,
  pinPrompt,
  setPinPrompt,
}: {
  cartCount: number;
  onOpenCheckout: () => void;
  runnerMode: boolean;
  onRunnerToggle: () => void;
  onRunnerAuth: (pin: string) => void;
  pinPrompt: string;
  setPinPrompt: (v: string) => void;
}) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-slate-200/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-inner grid place-items-center text-white font-bold">
            OS
          </div>
          <div>
            <div className="font-extrabold text-lg leading-5">OakSnack</div>
            <div className="text-xs text-slate-500 -mt-0.5">Student Store Delivery — by students, for students</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a
            href="#menu"
            className="hover:text-indigo-600"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Menu
          </a>
          <a
            href="#how"
            className="hover:text-indigo-600"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("how")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            How it works
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <input
              className="rounded-xl border px-2 py-1 text-sm"
              placeholder="Runner PIN"
              value={pinPrompt}
              onChange={(e) => setPinPrompt(e.target.value)}
            />
            <button
              className="rounded-xl border px-3 py-1 text-sm"
              onClick={() => onRunnerAuth(pinPrompt)}
              title="Enter runner mode with PIN"
            >
              Enter
            </button>
          </div>
          <button
            onClick={onOpenCheckout}
            className="rounded-xl px-3 py-2 bg-indigo-600 text-white flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart
            {cartCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-indigo-50 px-2 text-xs text-indigo-700">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

/* =========================================
   HERO
========================================= */
function Hero({ onStartOrder }: { onStartOrder: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-indigo-200 blur-3xl opacity-70" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-blue-200 blur-3xl opacity-70" />
      </div>
      <div className="container mx-auto px-4 py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Skip the line.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                Get your food fast.
              </span>
            </h1>
            <p className="mt-4 text-slate-600 max-w-xl">
              OakSnack is a student-run preorder + delivery service for the Student Store. Order during class breaks and
              we’ll grab it while you chill with friends.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-xl px-4 py-2 bg-indigo-600 text-white flex items-center gap-2" onClick={onStartOrder}>
                <ShoppingCart className="h-5 w-5" /> Start an order
              </button>
              <a href="#how" className="rounded-xl px-4 py-2 border bg-white flex items-center gap-2">
                <Bike className="h-5 w-5" /> How it works
              </a>
            </div>
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
              Independent student service • On-campus only • Safe & fast
            </div>
          </div>
          <div className="md:pl-8">
            <div className="border rounded-3xl bg-white shadow-xl">
              <div className="p-4 border-b font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Popular right now
              </div>
              <div className="p-4 text-sm text-slate-500">Add popular items here later.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================
   MENUCARD
========================================= */
function MenuCard({
  item,
  stock,
  cartQty,
  onAdd,
}: {
  item: Item;
  stock: number;
  cartQty: number;
  onAdd: (it: Item) => void;
}) {
  const out = stock - cartQty <= 0;
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-40 object-cover"
          onError={(e) => {
            // graceful fallback if image missing
            (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image";
          }}
        />
        {out && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
            Out of stock
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="font-semibold">{item.name}</div>
        <div className="text-sm text-slate-600">{item.desc}</div>
        <div className="mt-auto flex items-center justify-between">
          <div className="font-semibold">{currency(item.price)}</div>
          <button
            className={`rounded-xl px-3 py-1 text-sm ${
              out ? "bg-slate-200 text-slate-500" : "bg-indigo-600 text-white"
            }`}
            onClick={() => !out && onAdd(item)}
            disabled={out}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   CART DOCK
========================================= */
function CartDock({
  cart,
  subtotal,
  fee,
  total,
  onQty,
  onRemove,
  onCheckout,
}: {
  cart: CartLine[];
  subtotal: number;
  fee: number;
  total: number;
  onQty: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
  onCheckout: () => void;
}) {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white shadow-xl">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Your Cart
              </div>
              <div className="text-sm text-slate-600">
                Subtotal: <span className="font-semibold">{currency(subtotal)}</span> • Service: {currency(fee)} •{" "}
                <span className="font-semibold">Total: {currency(total)}</span>
              </div>
            </div>

            <div className="mt-3 divide-y">
              {cart.length === 0 ? (
                <div className="text-sm text-slate-500 py-3">Cart is empty. Add something tasty 👀</div>
              ) : (
                cart.map((line) => (
                  <div key={line.key} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{line.name}</div>
                      <div className="text-sm text-slate-600">{currency(line.price)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg border px-2 py-1" onClick={() => onQty(line.key, -1)}>
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="w-8 text-center">{line.qty}</div>
                      <button className="rounded-lg border px-2 py-1" onClick={() => onQty(line.key, +1)}>
                        <Plus className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg px-2 py-1" onClick={() => onRemove(line.key)}>
                        <Trash2 className="h-4 w-4 text-slate-500" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 flex justify-end">
              <button
                disabled={cart.length === 0}
                onClick={onCheckout}
                className={`rounded-xl px-3 py-2 flex items-center gap-2 ${
                  cart.length === 0 ? "bg-slate-200 text-slate-500" : "bg-indigo-600 text-white"
                }`}
              >
                <Bike className="h-4 w-4" /> Checkout & Deliver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   CHECKOUT MODAL (with Special Instructions)
========================================= */
function CheckoutModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    grade: string;
    location: string;
    instructions?: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [location, setLocation] = useState("");
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setGrade("");
      setLocation("");
      setInstructions("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/50 grid place-items-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="p-4 border-b font-semibold">Checkout Info</div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-slate-600">Name</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">Grade</label>
            <select
              className="w-full rounded-xl border px-3 py-2"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="">Select grade…</option>
              <option>9th</option>
              <option>10th</option>
              <option>11th</option>
              <option>12th</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-600">Meet location</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Main Quad"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">Special instructions (optional)</label>
            <textarea
              className="w-full rounded-xl border px-3 py-2"
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Anything we should know?"
            />
          </div>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button className="rounded-xl border px-3 py-2" onClick={onClose}>
            Cancel
          </button>
          <button
            className="rounded-xl bg-indigo-600 text-white px-3 py-2"
            onClick={() => {
              if (!name || !grade || !location) {
                alert("Please fill name, grade, and location.");
                return;
              }
              onSubmit({ name, grade, location, instructions: instructions.trim() || undefined });
            }}
          >
            Place order
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   RUNNER PAGE (inventory + orders + revenue + simple chart)
========================================= */
function RunnerPage({
  orders,
  inventory,
  setInventory,
  onSetStatus,
  onDelete,
  revenue,
  setRevenue,
  onExit,
}: {
  orders: Order[];
  inventory: Record<string, number>;
  setInventory: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  onSetStatus: (id: string, status: Order["status"]) => void;
  onDelete: (id: string) => void;
  revenue: number;
  setRevenue: React.Dispatch<React.SetStateAction<number>>;
  onExit: () => void;
}) {
  // simple daily revenue map (no deps)
  const daily = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      if (o.status === "delivered") {
        const d = new Date(o.createdAt);
        const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
          .getDate()
          .toString()
          .padStart(2, "0")}`;
        map.set(key, (map.get(key) || 0) + o.total);
      }
    });
    // last 7 days
    const out: { day: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
        .getDate()
        .toString()
        .padStart(2, "0")}`;
      out.push({ day: key.slice(5), total: Math.round((map.get(key) || 0) * 100) / 100 });
    }
    return out;
  }, [orders]);

  // simple SVG bar chart (no libraries)
  const max = Math.max(1, ...daily.map((d) => d.total));
  const barW = 36;
  const gap = 12;
  const width = daily.length * barW + (daily.length - 1) * gap + 40;
  const height = 160;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-xl font-bold">Runner Dashboard</div>
        <button className="rounded-xl border px-3 py-2 flex items-center gap-2" onClick={onExit}>
          <LogOut className="h-4 w-4" /> Exit
        </button>
      </div>

      <div className="container mx-auto px-4 grid md:grid-cols-3 gap-4 pb-16">
        {/* Inventory editor */}
        <div className="rounded-2xl border bg-white shadow-sm p-4 md:col-span-1">
          <div className="font-semibold mb-2">Inventory</div>
          <div className="space-y-2">
            {MENU.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-2">
                <div className="text-sm">
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-slate-500">{currency(m.price)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg border px-2 py-1"
                    onClick={() =>
                      setInventory((prev) => ({ ...prev, [m.id]: Math.max(0, (prev[m.id] || 0) - 1) }))
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    className="w-14 text-center rounded-lg border px-2 py-1"
                    value={inventory[m.id] ?? 0}
                    onChange={(e) =>
                      setInventory((prev) => ({ ...prev, [m.id]: Math.max(0, parseInt(e.target.value || "0")) }))
                    }
                  />
                  <button
                    className="rounded-lg border px-2 py-1"
                    onClick={() => setInventory((prev) => ({ ...prev, [m.id]: (prev[m.id] || 0) + 1 }))}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-2xl border bg-white shadow-sm p-4 md:col-span-2">
          <div className="font-semibold mb-2">Orders</div>
          {orders.length === 0 ? (
            <div className="text-sm text-slate-500">No orders yet.</div>
          ) : (
            <div className="space-y-3">
              {orders
                .slice()
                .reverse()
                .map((o) => (
                  <div key={o.id} className="border rounded-xl p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold">{o.id}</div>
                      <div className="text-sm text-slate-500">
                        {new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div className="text-sm">
                      {o.name} • {o.grade} • <MapPin className="inline h-4 w-4 -mt-0.5" /> {o.location}
                      {o.instructions ? (
                        <div className="text-xs text-slate-500 mt-1">Notes: {o.instructions}</div>
                      ) : null}
                    </div>
                    <div className="mt-2 text-sm">
                      {o.items.map((l) => (
                        <div key={l.key} className="flex justify-between">
                          <div>
                            {l.qty} × {l.name}
                          </div>
                          <div>{currency(l.price * l.qty)}</div>
                        </div>
                      ))}
                      <div className="flex justify-between font-semibold mt-1">
                        <div>Total</div>
                        <div>{currency(o.total)}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <select
                        className="rounded-xl border px-2 py-1 text-sm"
                        value={o.status}
                        onChange={(e) => onSetStatus(o.id, e.target.value as Order["status"])}
                      >
                        <option value="queued">Queued</option>
                        <option value="picked">Picked up</option>
                        <option value="delivering">Delivering</option>
                        <option value="delivered">Delivered</option>
                        <option value="canceled">Canceled</option>
                      </select>
                      <button
                        className="rounded-xl border px-3 py-1 text-sm"
                        onClick={() => onDelete(o.id)}
                        title="Delete order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Revenue + Chart */}
        <div className="rounded-2xl border bg-white shadow-sm p-4 md:col-span-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Revenue</div>
            <div className="text-2xl font-bold">{currency(revenue)}</div>
          </div>
          <div className="mt-2 text-sm text-slate-500">
            You can manually adjust revenue if a refund/cancel happens.
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button className="rounded-xl border px-3 py-1" onClick={() => setRevenue((r) => Math.max(0, r - 1))}>
              - $1
            </button>
            <button className="rounded-xl border px-3 py-1" onClick={() => setRevenue((r) => r + 1)}>
              + $1
            </button>
          </div>

          {/* Simple SVG chart (last 7 days) */}
          <div className="mt-4 overflow-x-auto">
            <svg width={width} height={height} className="bg-slate-50 rounded-xl border">
              {/* y axis labels */}
              <text x={4} y={14} fontSize="10" fill="#64748b">
                {currency(max)}
              </text>
              <text x={4} y={height - 6} fontSize="10" fill="#64748b">
                $0
              </text>
              {daily.map((d, i) => {
                const x = 30 + i * (barW + gap);
                const h = Math.round(((d.total / max) * (height - 40)) * 100) / 100;
                const y = height - 20 - h;
                return (
                  <g key={d.day}>
                    <rect x={x} y={y} width={barW} height={h} fill="#6366F1" rx="6" />
                    <text x={x + barW / 2} y={height - 4} fontSize="10" fill="#64748b" textAnchor="middle">
                      {d.day.slice(5)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   HOW IT WORKS (steps)
========================================= */
function HowItWorks() {
  const steps = [
    { icon: <Search className="h-5 w-5" />, title: "Pick your items", text: "Browse the menu and add to cart." },
    { icon: <Calendar className="h-5 w-5" />, title: "Choose a time", text: "Default: High School Lunch." },
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

/* =========================================
   MAIN APP
========================================= */
export default function App() {
  // cart
  const [cart, setCart] = useState<CartLine[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<string>("featured");

  // orders, inventory, revenue
  const [orders, setOrders] = useState<Order[]>(() => loadJSON<Order[]>(LS_ORDERS, []));
  const [inventory, setInventory] = useState<Record<string, number>>(() =>
    loadJSON<Record<string, number>>(LS_INV, {
      "drpepper-can": 12,
      "oreos-snack": 30,
      "hot-cheetos": 50,
      "trident-spearmint": 15,
      "nerds-gummy": 12,
    })
  );
  const [revenue, setRevenue] = useState<number>(() => loadJSON<number>(LS_REV, 0));

  // runner mode
  const [runnerMode, setRunnerMode] = useState(false);
  const [pinPrompt, setPinPrompt] = useState("");

  // checkout modal
  const [showCheckout, setShowCheckout] = useState(false);

  // persist
  useEffect(() => saveJSON(LS_ORDERS, orders), [orders]);
  useEffect(() => saveJSON(LS_INV, inventory), [inventory]);
  useEffect(() => saveJSON(LS_REV, revenue), [revenue]);

  // filtered menu
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MENU.filter((m) => {
      const matchesText = !q || m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q);
      const matchesCat = tab === "featured" ? (m.featured || false) : m.category === tab;
      return matchesText && matchesCat;
    });
  }, [query, tab]);

  // totals
  const subtotal = useMemo(() => cart.reduce((s, it) => s + it.price * it.qty, 0), [cart]);
  const total = useMemo(() => subtotal + (cart.length ? SERVICE_FEE : 0), [subtotal, cart]);

  // add/remove/qty
  const addToCart = (it: Item) => {
    const inCartQty = cart.filter((l) => l.id === it.id).reduce((s, l) => s + l.qty, 0);
    const available = (inventory[it.id] ?? 0) - inCartQty;
    if (available <= 0) {
      alert("This item is out of stock.");
      return;
    }
    setCart((prev) => {
      const i = prev.findIndex((p) => p.id === it.id);
      if (i === -1) return [...prev, { key: shortId(), id: it.id, name: it.name, price: it.price, qty: 1 }];
      const copy = [...prev];
      copy[i] = { ...copy[i], qty: copy[i].qty + 1 };
      return copy;
    });
  };
  const onQty = (key: string, delta: number) => {
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.key === key);
      if (idx === -1) return prev;
      const copy = [...prev];
      const next = { ...copy[idx], qty: copy[idx].qty + delta };
      if (next.qty <= 0) copy.splice(idx, 1);
      else copy[idx] = next;
      return copy;
    });
  };
  const onRemove = (key: string) => setCart((prev) => prev.filter((l) => l.key !== key));

  // place order (from checkout)
  const placeOrder = ({
    name,
    grade,
    location,
    instructions,
  }: {
    name: string;
    grade: string;
    location: string;
    instructions?: string;
  }) => {
    if (cart.length === 0) return;

    // verify stock again
    for (const line of cart) {
      const available = (inventory[line.id] ?? 0);
      if (line.qty > available) {
        alert(`Not enough stock for ${line.name}.`);
        return;
      }
    }

    const id = shortId();
    const order: Order = {
      id,
      items: cart,
      name,
      grade,
      location,
      instructions,
      slot: "High School Lunch",
      total,
      status: "queued",
      createdAt: Date.now(),
    };

    // decrement inventory
    const nextInv = { ...inventory };
    for (const line of cart) {
      nextInv[line.id] = Math.max(0, (nextInv[line.id] ?? 0) - line.qty);
    }

    setOrders((prev) => [...prev, order]);
    setInventory(nextInv);
    setRevenue((r) => r + total);
    setCart([]);
    setShowCheckout(false);
    alert(`Order ${id} placed!`);
  };

// =============================
// runner actions
// =============================
const setOrderStatus = (id: string, status: Order["status"]) => {
  setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
};
const deleteOrder = (id: string) => {
  setOrders(prev => prev.filter(o => o.id !== id));
};

// =============================
// RENDER
// =============================
return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-slate-800">
    <Header
      cartCount={cart.reduce((n, i) => n + i.qty, 0)}
      onOpenCheckout={() => setShowCheckout(true)}
      runnerMode={runnerMode}
      onRunnerToggle={() => setRunnerMode(m => !m)}
    onRunnerAuth={(pin: string) => {
  if (pin.trim() === TEAM_PIN) {
    setRunnerMode(true);
    setPinPrompt("");
  } else {
    alert("Incorrect PIN");
  }
}}
      pinPrompt={pinPrompt}
      setPinPrompt={setPinPrompt}
    />

    {runnerMode ? (
      <RunnerPage
        orders={orders}
        inventory={inventory}
        setInventory={setInventory}
        onSetStatus={setOrderStatus}
        onDelete={deleteOrder}
        revenue={revenue}
        setRevenue={setRevenue}
        onExit={() => setRunnerMode(false)}
      />
    ) : (
      <>
        {/* hero */}
        <Hero
          onStartOrder={() =>
            document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })
          }
        />

        {/* steps moved ABOVE the menu */}
        <HowItWorks />

        {/* menu */}
        <main className="container mx-auto px-4 pb-48 md:pb-56">
          <section id="menu" className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2 top-2.5 text-slate-400" />
                <input
                  className="rounded-xl border pl-8 pr-3 py-2 w-64"
                  placeholder="Search snacks…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    className={`rounded-xl px-3 py-1 text-sm ${
                      tab === c.id ? "bg-indigo-600 text-white" : "bg-white border"
                    }`}
                    onClick={() => setTab(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* grid */}
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((m) => {
                const inCartQty = cart
                  .filter((l) => l.id === m.id)
                  .reduce((s, l) => s + l.qty, 0);
                const stock = inventory[m.id] ?? 0;
                return (
                  <MenuCard
                    key={m.id}
                    item={m}
                    stock={stock}
                    cartQty={inCartQty}
                    onAdd={() => addToCart(m)}
                  />
                );
              })}
              {filtered.length === 0 && (
                <div className="text-sm text-slate-500">
                  No items match that search/category.
                </div>
              )}
            </div>
          </section>
        </main>

        {/* cart dock & checkout */}
        <CartDock
          cart={cart}
          subtotal={subtotal}
          fee={cart.length ? SERVICE_FEE : 0}
          total={total}
          onQty={onQty}
          onRemove={onRemove}
          onCheckout={() => setShowCheckout(true)}
        />

        <CheckoutModal
          open={showCheckout}
          onClose={() => setShowCheckout(false)}
          onSubmit={placeOrder}
        />
      </>
    )}
  </div>
);
}
