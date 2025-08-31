// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import MenuCard, { Item } from "./components/MenuCard";
import CartDock from "./components/CartDock";
import CheckoutModal from "./components/CheckoutModal";
import {
  Bike, Filter, Minus, Plus, Search, Trash2, Package, CheckCircle,
  Loader2, MapPin, Calendar, ShoppingCart, LogOut
} from "lucide-react";
import { currency, shortId } from "./utils";

// ===============================
// CONFIG
// ===============================
const TEAM_PIN = "4242";
const SERVICE_FEE = 1.0;

// LocalStorage keys
const LS_ORDERS = "oakSnack_orders_v1";
const LS_INV    = "oakSnack_inv_v1";
const LS_REV    = "oakSnack_rev_v1";
const LS_REVH   = "oakSnack_rev_hist_v1";

// Categories
const CATEGORIES = [
  { id: "featured", label: "Featured" },
  { id: "snacks",   label: "Snacks"   },
  { id: "drinks",   label: "Drinks"   },
];

// MENU (images live under /public/products/*)
const MENU: Item[] = [
  {
    id: "drpepper-can",
    name: "Dr Pepper (12oz Can)",
    price: 2.0,
    category: "drinks",
    desc: "Cold can from the case.",
    image: "/products/drpepper.jpg",
    tags: ["cold"],
  },
  {
    id: "oreos-snack",
    name: "Oreos (Snack Pack)",
    price: 2.5,
    category: "snacks",
    desc: "Mini sleeve of Oreos.",
    image: "/products/oreo.jpg",
  },
  {
    id: "hot-cheetos",
    name: "Hot Cheetos (Snack Bag)",
    price: 2.99,
    category: "snacks",
    desc: "Spicy, crunchy, elite.",
    image: "/products/cheetos.jpg",
    tags: ["best-seller"],
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

// Initial stock
const START_STOCK: Record<string, number> = {
  "drpepper-can": 12,
  "oreos-snack": 30,
  "hot-cheetos": 50,
  "trident-spearmint": 15,
  "nerds-gummy": 12,
};

// helpers
function loadJSON<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; }
  catch { return fallback; }
}
function saveJSON<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

type RevPoint = { t: number; total: number };

// ===============================
// APP
// ===============================
export default function OakSnackApp() {
  // cart + UI
  const [cart, setCart]   = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab]     = useState("featured");
  const [showCheckout, setShowCheckout] = useState(false);

  // orders, inventory, revenue
  const [orders, setOrders] = useState<any[]>(() => loadJSON<any[]>(LS_ORDERS, []));
  const [inventory, setInventory] = useState<Record<string, number>>(
    () => loadJSON<Record<string, number>>(LS_INV, { ...START_STOCK })
  );
  const [revenue, setRevenue] = useState<number>(() => loadJSON<number>(LS_REV, 0));
  const [revHist, setRevHist] = useState<RevPoint[]>(() => loadJSON<RevPoint[]>(LS_REVH, []));

  // runner page
  const [runnerMode, setRunnerMode] = useState(false);
  const [pinPrompt, setPinPrompt] = useState("");

  // persist
  useEffect(() => saveJSON(LS_ORDERS, orders), [orders]);
  useEffect(() => saveJSON(LS_INV, inventory), [inventory]);
  useEffect(() => saveJSON(LS_REV, revenue), [revenue]);
  useEffect(() => saveJSON(LS_REVH, revHist), [revHist]);

  // search + filter
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MENU.filter((m: Item) => {
      const matchesText =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.desc?.toLowerCase().includes(q) ||
        (m.tags?.some((t) => t.toLowerCase().includes(q)) ?? false);
      const matchesCat = tab === "featured" ? true : m.category === tab;
      return matchesText && matchesCat;
    });
  }, [query, tab]);

  // totals
  const subtotal = useMemo(() => cart.reduce((s, it) => s + it.price * it.qty, 0), [cart]);
  const total = useMemo(() => subtotal + (cart.length ? SERVICE_FEE : 0), [subtotal, cart]);

  // cart ops
  function addToCart(item: Item, selected?: any) {
    const inCart = cart.find((l) => l.id === item.id)?.qty ?? 0;
    const remaining = (inventory[item.id] ?? 0) - inCart;
    if (remaining <= 0) {
      alert("This item is out of stock.");
      return;
    }
    setCart((c) => {
      const idx = c.findIndex((l) => l.id === item.id);
      if (idx === -1) return [...c, { id: item.id, name: item.name, price: item.price, qty: 1, selected }];
      const cp = [...c]; cp[idx] = { ...cp[idx], qty: cp[idx].qty + 1 }; return cp;
    });
  }
  function setQty(key: string, delta: number) {
    setCart((c) => {
      const idx = c.findIndex((l) => l.id === key);
      if (idx === -1) return c;
      const cp = [...c]; const q = cp[idx].qty + delta;
      if (q <= 0) cp.splice(idx, 1); else cp[idx] = { ...cp[idx], qty: q }; return cp;
    });
  }
  function removeLine(key: string) {
    setCart((c) => c.filter((l) => l.id !== key));
  }

  // checkout
  function handleConfirmOrder(form: { name: string; grade: string; slot: string; location: string }) {
    if (cart.length === 0) return;

    // decrement inventory
    const newInv = { ...inventory };
    cart.forEach((l) => { newInv[l.id] = Math.max(0, (newInv[l.id] ?? 0) - l.qty); });
    setInventory(newInv);

    const id = shortId();
    const order = {
      id,
      createdAt: Date.now(),
      lines: cart,
      subtotal,
      fee: SERVICE_FEE,
      total,
      status: "queued",
      customer: form,
    };
    setOrders((o) => [order, ...o]);
    setRevenue((r) => r + total);
    setRevHist((h) => [...h, { t: Date.now(), total }]);
    setCart([]);
    setShowCheckout(false);
    alert(`Order placed! Your ID is ${id}`);
  }

  // runner actions
  function setOrderStatus(id: string, status: string) {
    setOrders((o) => o.map((ord) => (ord.id === id ? { ...ord, status } : ord)));
  }
  function deleteOrder(id: string) {
    setOrders((o) => o.filter((ord) => ord.id !== id));
  }

  // revenue manual adjust
  const [revAdjust, setRevAdjust] = useState<string>("0");
  function applyRevAdjustment(sign: 1 | -1) {
    const amt = Number(revAdjust || "0");
    if (Number.isNaN(amt) || amt === 0) return;
    setRevenue((r) => r + sign * amt);
    // optional to record manual adjustments as history points
    setRevHist((h) => [...h, { t: Date.now(), total: sign * amt }]);
    setRevAdjust("0");
  }

  // simple mini chart (last 20 points)
  function RevenueChart({ points }: { points: RevPoint[] }) {
    const data = points.slice(-20);
    const width = 320, height = 80, pad = 6;
    const max = Math.max(1, ...data.map((d) => Math.abs(d.total)));
    const step = (width - pad * 2) / Math.max(1, data.length - 1);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20">
        <rect x="0" y="0" width={width} height={height} fill="white" />
        {data.map((d, i) => {
          const x = pad + i * step;
          const y = height - pad - (Math.abs(d.total) / max) * (height - pad * 2);
          const barW = Math.max(2, step * 0.6);
          return (
            <rect key={i} x={x - barW / 2} y={y} width={barW} height={height - pad - y} rx="2" />
          );
        })}
      </svg>
    );
  }

  // runner dashboard
  const RunnerPage = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold">Runner Dashboard</div>
        <button className="rounded-xl border px-3 py-2" onClick={() => setRunnerMode(false)}>
          Exit Runner
        </button>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        {/* Inventory */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="font-semibold mb-3">Inventory</div>
          <div className="space-y-2">
            {MENU.map((m) => (
              <div key={m.id} className="flex items-center justify-between">
                <div>{m.name}</div>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg border px-2 py-1" onClick={() => setInventory((inv) => ({ ...inv, [m.id]: Math.max(0, (inv[m.id] ?? 0) - 1) }))}>-</button>
                  <input
                    value={inventory[m.id] ?? 0}
                    onChange={(e) =>
                      setInventory((inv) => ({ ...inv, [m.id]: Math.max(0, Number(e.target.value || 0)) }))
                    }
                    className="w-16 text-center rounded-lg border px-2 py-1"
                    type="number"
                    min={0}
                  />
                  <button className="rounded-lg border px-2 py-1" onClick={() => setInventory((inv) => ({ ...inv, [m.id]: (inv[m.id] ?? 0) + 1 }))}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="font-semibold mb-3">Orders</div>
          {orders.length === 0 ? (
            <div className="text-sm text-slate-500">No orders yet.</div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="rounded-xl border p-3">
                  <div className="flex justify-between">
                    <div className="font-semibold">{o.id}</div>
                    <div className="text-sm text-slate-600">{o.customer?.name} • {o.customer?.grade}</div>
                  </div>
                  <div className="text-sm text-slate-600">
                    {o.lines.map((l: any) => `${l.qty}× ${l.name}`).join(" • ")}
                  </div>
                  <div className="text-sm mt-1">Total: <strong>{currency(o.total)}</strong></div>
                  <div className="mt-2 flex items-center gap-2">
                    <select
                      className="rounded-lg border px-2 py-1"
                      value={o.status}
                      onChange={(e) => setOrderStatus(o.id, e.target.value)}
                    >
                      <option value="queued">Queued</option>
                      <option value="picking-up">Picking up</option>
                      <option value="delivering">Delivering</option>
                      <option value="delivered">Delivered</option>
                      <option value="canceled">Canceled</option>
                    </select>
                    <button className="rounded-lg px-2 py-1 text-red-600" onClick={() => deleteOrder(o.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue */}
      <div className="mt-6 rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Revenue</div>
            <div className="text-2xl mt-1">{currency(revenue)}</div>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={revAdjust}
              onChange={(e) => setRevAdjust(e.target.value)}
              type="number"
              step="0.01"
              className="rounded-lg border px-2 py-1 w-28"
              placeholder="Adjust"
            />
            <button className="rounded-lg border px-2 py-1" onClick={() => applyRevAdjustment(+1)}>Add</button>
            <button className="rounded-lg border px-2 py-1" onClick={() => applyRevAdjustment(-1)}>Subtract</button>
          </div>
        </div>

        <div className="mt-3">
          <RevenueChart points={revHist} />
        </div>
      </div>
    </div>
  );

  // ===============================
  // RENDER
  // ===============================
  if (runnerMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-slate-800">
        <Header
          cartCount={cart.reduce((n, i) => n + i.qty, 0)}
          onOpenCheckout={() => setShowCheckout(true)}
          runnerMode={true}
          onRunnerToggle={() => setRunnerMode(false)}
          onRunnerAuth={() => {}}
          pinPrompt={pinPrompt}
          setPinPrompt={setPinPrompt}
        />
        <RunnerPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-slate-800">
      <Header
        cartCount={cart.reduce((n, i) => n + i.qty, 0)}
        onOpenCheckout={() => setShowCheckout(true)}
        runnerMode={false}
        onRunnerToggle={() => setRunnerMode((m) => !m)}
        onRunnerAuth={(pin: string) => { if (pin === TEAM_PIN) setRunnerMode(true); else alert("Incorrect PIN"); }}
        pinPrompt={pinPrompt}
        setPinPrompt={setPinPrompt}
      />

      <Hero onStartOrder={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })} />

      <main id="menu" className="container mx-auto px-4 pb-28">
        {/* Search + filters */}
        <div className="mt-8 flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the student store…"
                className="w-full outline-none"
              />
            </div>
          </div>
          <button className="rounded-xl border bg-white px-3 py-2 flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setTab(c.id)}
              className={`rounded-xl px-4 py-2 ${tab === c.id ? "bg-indigo-600 text-white" : "bg-white border"}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {filtered.map((item: Item) => {
            const stock = inventory[item.id] ?? 0;
            const cartQty = cart.find((l) => l.id === item.id)?.qty ?? 0;
            return (
              <MenuCard
                key={item.id}
                item={item}
                stock={stock}
                cartQty={cartQty}
                onAdd={() => addToCart(item)}
              />
            );
          })}
        </div>
      </main>

      <CheckoutModal
        open={showCheckout}
        subtotal={subtotal}
        fee={cart.length ? SERVICE_FEE : 0}
        total={total}
        onClose={() => setShowCheckout(false)}
        onConfirm={handleConfirmOrder}
      />

      <CartDock
        cart={cart}
        subtotal={subtotal}
        fee={cart.length ? SERVICE_FEE : 0}
        total={total}
        onQty={(key: string, delta: number) => setQty(key, delta)}
        onRemove={(key: string) => removeLine(key)}
        onCheckout={() => setShowCheckout(true)}
      />
    </div>
  );
}
