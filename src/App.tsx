// src/components/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import Header from "./Header";
import Hero from "./Hero";
import MenuCard, { Item } from "./MenuCard";
import {
  Bike,
  Filter,
  Minus,
  Plus,
  Search,
  Trash2,
  Package,
  CheckCircle,
  Loader2,
  MapPin,
  Calendar,
  ShoppingCart,
  LogOut,
} from "lucide-react";
import { currency, shortId } from "../utils";
import CheckoutModal from "./CheckoutModal";

/* =========================================================
   CONFIG
   ========================================================= */
const SERVICE_FEE = 1.0;
const TEAM_PIN = "4242";
const LS_ORDERS = "oakSnack_orders_v1";
const LS_INVENTORY = "oakSnack_inventory_v1";
const LS_REVENUE = "oakSnack_revenue_v1";
const LS_REV_HIST = "oakSnack_rev_hist_v1";

const CATEGORIES = [
  { id: "featured", label: "Featured" },
  { id: "snacks", label: "Snacks" },
  { id: "drinks", label: "Drinks" },
];

// MENU — images are served from /public/products
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

/* =========================================================
   UTILS (local JSON helpers so we don’t rely on anything else)
   ========================================================= */
function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/* =========================================================
   SMALL CHART (inline SVG sparkline)
   ========================================================= */
function Sparkline({
  data,
  width = 420,
  height = 100,
}: {
  data: number[];
  width?: number;
  height?: number;
}) {
  if (!data || data.length < 2) {
    return <div className="text-slate-500 text-sm">Graph appears after a few updates.</div>;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = Math.max(1, max - min);
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / rng) * height;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height}>
      <polyline fill="none" stroke="#4f46e5" strokeWidth="2" points={pts.join(" ")} />
    </svg>
  );
}

/* =========================================================
   MAIN APP
   ========================================================= */
export default function OakSnackApp() {
  // cart & ui
  const [cart, setCart] = useState<
    { id: string; name: string; price: number; qty: number }[]
  >([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("featured");
  const [showCheckout, setShowCheckout] = useState(false);

  // orders + inventory + revenue
  const [orders, setOrders] = useState<any[]>(() => loadJSON<any[]>(LS_ORDERS, []));
  const [inventory, setInventory] = useState<Record<string, number>>(() => {
    const def: Record<string, number> = {
      "drpepper-can": 12,
      "oreos-snack": 30,
      "hot-cheetos": 50,
      "trident-spearmint": 15,
      "nerds-gummy": 12,
    };
    const fromLS = loadJSON<Record<string, number>>(LS_INVENTORY, def);
    // Ensure every SKU exists
    MENU.forEach((m) => {
      if (fromLS[m.id] === undefined) fromLS[m.id] = 0;
    });
    return fromLS;
  });
  const [revenue, setRevenue] = useState<number>(() => loadJSON<number>(LS_REVENUE, 0));
  const [revenueHistory, setRevenueHistory] = useState<number[]>(
    () => loadJSON<number[]>(LS_REV_HIST, [loadJSON<number>(LS_REVENUE, 0)])
  );

  // runner
  const [runnerMode, setRunnerMode] = useState(false);
  const [pinPrompt, setPinPrompt] = useState("");

  // persist
  useEffect(() => saveJSON(LS_ORDERS, orders), [orders]);
  useEffect(() => saveJSON(LS_INVENTORY, inventory), [inventory]);
  useEffect(() => saveJSON(LS_REVENUE, revenue), [revenue]);
  useEffect(() => saveJSON(LS_REV_HIST, revenueHistory), [revenueHistory]);

  // search & filter
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MENU.filter((m) => {
      const matchesText =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.desc?.toLowerCase().includes(q) ||
        (m.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchesCat = tab === "featured" ? true : m.category === tab;
      // hide items that are completely out of stock on non-featured tabs? (keep visible everywhere)
      return matchesText && matchesCat;
    });
  }, [query, tab]);

  // totals
  const subtotal = useMemo(
    () => cart.reduce((s, it) => s + it.price * it.qty, 0),
    [cart]
  );
  const total = useMemo(() => subtotal + (cart.length ? SERVICE_FEE : 0), [subtotal, cart]);

  /* ---------------- CART ACTIONS ---------------- */
  function addToCart(item: Item) {
    // check inventory
    const have = inventory[item.id] ?? 0;
    const inCart = cart.find((c) => c.id === item.id)?.qty ?? 0;
    if (inCart >= have) {
      alert("This item is out of stock.");
      return;
    }

    setCart((c) => {
      const idx = c.findIndex((x) => x.id === item.id);
      const next = [...c];
      if (idx === -1) next.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
      else next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
      return next;
    });
  }
  function changeQty(id: string, delta: number) {
    setCart((c) => {
      const idx = c.findIndex((x) => x.id === id);
      if (idx === -1) return c;
      const have = inventory[id] ?? 0;
      const nextQty = Math.max(0, Math.min(have, c[idx].qty + delta));
      const next = [...c];
      if (nextQty === 0) next.splice(idx, 1);
      else next[idx] = { ...next[idx], qty: nextQty };
      return next;
    });
  }
  function removeLine(id: string) {
    setCart((c) => c.filter((x) => x.id !== id));
  }

  /* ---------------- CHECKOUT ---------------- */
  function handleConfirm(info: { name: string; grade: string; slot: string; location: string }) {
    if (cart.length === 0) return;

    const orderId = shortId();
    const totalCost = total;

    // update inventory
    setInventory((inv) => {
      const next = { ...inv };
      cart.forEach((l) => {
        next[l.id] = Math.max(0, (next[l.id] ?? 0) - l.qty);
      });
      return next;
    });

    // save order
    setOrders((o) => [
      ...o,
      {
        id: orderId,
        items: cart.map((l) => ({ id: l.id, name: l.name, qty: l.qty, price: l.price })),
        total: totalCost,
        status: "Queued",
        ...info,
        createdAt: Date.now(),
      },
    ]);

    // revenue + graph
    setRevenue((prev) => {
      const next = prev + totalCost;
      setRevenueHistory((h) => [...h, next]);
      return next;
    });

    setCart([]);
    setShowCheckout(false);
  }

  /* ---------------- RUNNER HELPERS ---------------- */
  function setOrderStatus(id: string, status: string) {
    setOrders((o) => o.map((ord) => (ord.id === id ? { ...ord, status } : ord)));
  }
  function deleteOrder(id: string) {
    setOrders((o) => o.filter((ord) => ord.id !== id));
  }

  /* =========================================================
     RENDER
     ========================================================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-slate-800">
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

      {!runnerMode && (
        <>
          <Hero
            onStartOrder={() => {
              document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          <main id="menu" className="container mx-auto px-4 pb-28">
            {/* How it works kept as-is */}
            <section className="mt-10">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    className="w-full rounded-xl border bg-white pl-9 pr-3 py-2"
                    placeholder="Search the student store..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <button className="rounded-xl border px-3 py-2 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
              </div>

              <div className="mt-4 inline-flex rounded-2xl border bg-white p-1">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    className={`px-4 py-2 rounded-xl ${
                      tab === c.id ? "bg-indigo-600 text-white" : "text-slate-700"
                    }`}
                    onClick={() => setTab(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((item) => {
                  const stock = inventory[item.id] ?? 0;
                  const cartQty = cart.find((c) => c.id === item.id)?.qty ?? 0;
                  return (
                    <MenuCard
                      key={item.id}
                      item={item}
                      stock={stock}
                      cartQty={cartQty}
                      onAdd={addToCart}
                    />
                  );
                })}
              </div>
            </section>
          </main>

          {/* Cart Dock */}
          <div className="fixed bottom-4 left-0 right-0 z-20">
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-3xl rounded-2xl border bg-white shadow-xl">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" /> Your Cart
                    </div>
                    <div className="text-sm text-slate-600">
                      Subtotal: <span className="font-semibold">{currency(subtotal)}</span> •
                      Service: {currency(cart.length ? SERVICE_FEE : 0)} •{" "}
                      <span className="font-semibold">Total: {currency(total)}</span>
                    </div>
                  </div>

                  <div className="mt-3 divide-y">
                    {cart.length === 0 ? (
                      <div className="text-sm text-slate-500 py-3">
                        Cart is empty. Add something tasty 👀
                      </div>
                    ) : (
                      cart.map((line) => (
                        <div
                          key={line.id}
                          className="py-3 flex items-start justify-between gap-3"
                        >
                          <div>
                            <div className="font-medium">{line.name}</div>
                            <div className="text-sm text-slate-600">
                              {currency(line.price)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded-lg border px-2 py-1"
                              onClick={() => changeQty(line.id, -1)}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <div className="w-8 text-center">{line.qty}</div>
                            <button
                              className="rounded-lg border px-2 py-1"
                              onClick={() => changeQty(line.id, +1)}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              className="rounded-lg px-2 py-1"
                              onClick={() => removeLine(line.id)}
                            >
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
                      onClick={() => setShowCheckout(true)}
                      className={`rounded-xl px-3 py-2 flex items-center gap-2 ${
                        cart.length === 0
                          ? "bg-slate-200 text-slate-500"
                          : "bg-indigo-600 text-white"
                      }`}
                    >
                      <Bike className="h-4 w-4" /> Checkout &amp; Deliver
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CheckoutModal
            open={showCheckout}
            onClose={() => setShowCheckout(false)}
            subtotal={subtotal}
            fee={cart.length ? SERVICE_FEE : 0}
            total={total}
            onConfirm={handleConfirm}
          />
        </>
      )}

      {/* ================= RUNNER DASHBOARD ================= */}
      {runnerMode && (
        <main className="container mx-auto px-4 py-6">
          <div className="flex justify-end">
            <button className="rounded-xl border px-3 py-2" onClick={() => setRunnerMode(false)}>
              Exit Runner
            </button>
          </div>

          <h1 className="text-2xl font-semibold mt-2">Runner Dashboard</h1>

          <div className="mt-4 grid lg:grid-cols-2 gap-4">
            {/* Inventory */}
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="font-semibold">Inventory</div>
              <div className="mt-3 space-y-3">
                {MENU.map((m) => (
                  <div key={m.id} className="flex items-center justify-between">
                    <div>{m.name}</div>
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-lg border px-2 py-1"
                        onClick={() =>
                          setInventory((inv) => ({
                            ...inv,
                            [m.id]: Math.max(0, (inv[m.id] ?? 0) - 1),
                          }))
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        className="w-16 rounded-lg border px-2 py-1 text-center"
                        value={inventory[m.id] ?? 0}
                        onChange={(e) =>
                          setInventory((inv) => ({
                            ...inv,
                            [m.id]: Math.max(0, parseInt(e.target.value || "0", 10)),
                          }))
                        }
                      />
                      <button
                        className="rounded-lg border px-2 py-1"
                        onClick={() =>
                          setInventory((inv) => ({
                            ...inv,
                            [m.id]: (inv[m.id] ?? 0) + 1,
                          }))
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Orders */}
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="font-semibold">Orders</div>
              <div className="mt-3 space-y-3">
                {orders.length === 0 ? (
                  <div className="text-sm text-slate-500">No orders yet.</div>
                ) : (
                  orders.map((o) => (
                    <div key={o.id} className="rounded-xl border p-3">
                      <div className="font-semibold">{o.id}</div>
                      <div className="text-sm">
                        {o.items.map((it: any) => `${it.qty}× ${it.name}`).join(", ")}
                      </div>
                      <div className="text-sm text-slate-600">Total: {currency(o.total)}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <select
                          className="rounded-xl border px-2 py-1"
                          value={o.status}
                          onChange={(e) => setOrderStatus(o.id, e.target.value)}
                        >
                          <option>Queued</option>
                          <option>Picked Up</option>
                          <option>Delivering</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                        <button
                          className="rounded-xl border px-2 py-1"
                          onClick={() => deleteOrder(o.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Revenue */}
          <RunnerRevenuePanel
            revenue={revenue}
            setRevenue={setRevenue}
            revenueHistory={revenueHistory}
            setRevenueHistory={setRevenueHistory}
          />
        </main>
      )}
    </div>
  );
}

/* ================= Revenue Panel ================= */
function RunnerRevenuePanel({
  revenue,
  setRevenue,
  revenueHistory,
  setRevenueHistory,
}: {
  revenue: number;
  setRevenue: React.Dispatch<React.SetStateAction<number>>;
  revenueHistory: number[];
  setRevenueHistory: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  const [manualDelta, setManualDelta] = useState(0);

  return (
    <div className="mt-4 rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Revenue</div>
        <div className="text-2xl font-bold">{currency(revenue)}</div>
      </div>

      <div className="mt-3">
        <Sparkline data={revenueHistory} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          type="number"
          min={0}
          step="0.5"
          className="w-24 rounded-xl border px-2 py-1"
          value={manualDelta}
          onChange={(e) => setManualDelta(parseFloat(e.target.value || "0"))}
        />
        <button
          className="rounded-xl border px-3 py-1"
          onClick={() => {
            const next = revenue + manualDelta;
            setRevenue(next);
            setRevenueHistory((h) => [...h, Math.max(0, next)]);
          }}
        >
          Add
        </button>
        <button
          className="rounded-xl border px-3 py-1"
          onClick={() => {
            const next = Math.max(0, revenue - manualDelta);
            setRevenue(next);
            setRevenueHistory((h) => [...h, next]);
          }}
        >
          Subtract
        </button>
      </div>
    </div>
  );
}
