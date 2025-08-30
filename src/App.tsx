import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import CartDock from "./components/CartDock";
import AdminDashboard from "./components/AdminDashboard";
import { currency, shortId } from "./utils";
import { Search, Calendar, MapPin, Bike } from "lucide-react";

const TEAM_PIN = "4242";
const SERVICE_FEE = 0;

const CATEGORIES = [
  { id: "featured", label: "Featured" },
  { id: "snacks", label: "Snacks" },
  { id: "drinks", label: "Drinks" },
];

const MENU = [
  {
    id: "drpepper-can",
    name: "Dr Pepper (12oz Can)",
    price: 2.0,
    category: "drinks",
    desc: "Cold can from the case.",
    image: "/products/drpepper.jpg",
    stock: 12,
  },
  {
    id: "oreos-snack",
    name: "Oreos (Snack Pack)",
    price: 2.5,
    category: "snacks",
    desc: "Mini sleeve of Oreos.",
    image: "/products/oreo.jpg",
    stock: 30,
  },
  {
    id: "hot-cheetos",
    name: "Hot Cheetos (Snack Bag)",
    price: 2.99,
    category: "snacks",
    desc: "Spicy, crunchy, elite.",
    image: "/products/cheetos.jpg",
    stock: 50,
  },
  {
    id: "trident-spearmint",
    name: "Trident Gum — Spearmint (14ct)",
    price: 1.5,
    category: "snacks",
    desc: "Fresh breath on deck.",
    image: "/products/trident.jpg",
    stock: 15,
  },
  {
    id: "nerds-gummy",
    name: "Nerds Gummy Clusters (3oz)",
    price: 2.99,
    category: "snacks",
    desc: "Rainbow clusters. Crunch then chew.",
    image: "/products/nerds.jpg",
    stock: 12,
  },
];

type OrderStatus =
  | "new"
  | "preparing"
  | "out-for-delivery"
  | "delivered"
  | "canceled"
  | "refunded";

type OrderItem = { id: string; name: string; qty: number; price: number };
type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
  email?: string | null;
};

const LS_ORDERS = "owdash_orders_v2";
const LS_STOCK = "owdash_stock_v1";
const LS_ADJ = "owdash_revenue_adjustments_v1";

const loadJSON = <T,>(k: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export default function App() {
  type CartLine = { key: string; id: string; name: string; price: number; qty: number };
  const [cart, setCart] = useState<CartLine[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("featured");

  const [runnerMode, setRunnerMode] = useState(false);
  const [pinPrompt, setPinPrompt] = useState("");

  const [orders, setOrders] = useState<Order[]>(() => loadJSON<Order[]>(LS_ORDERS, []));
  useEffect(() => localStorage.setItem(LS_ORDERS, JSON.stringify(orders)), [orders]);

  const initialStock: Record<string, number> = (() => {
    const fromLS = loadJSON<Record<string, number> | null>(LS_STOCK, null);
    if (fromLS) return fromLS;
    const seed: Record<string, number> = {};
    for (const m of MENU) seed[m.id] = m.stock ?? 0;
    return seed;
  })();
  const [stock, setStock] = useState<Record<string, number>>(initialStock);
  useEffect(() => localStorage.setItem(LS_STOCK, JSON.stringify(stock)), [stock]);

  const [adjustments, setAdjustments] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(LS_ADJ);
      return raw ? Number(raw) : 0;
    } catch {
      return 0;
    }
  });
  useEffect(() => localStorage.setItem(LS_ADJ, String(adjustments)), [adjustments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MENU.filter((m) => {
      const matchText = !q || m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q);
      const matchCat = tab === "featured" ? true : m.category === tab;
      return matchText && matchCat;
    });
  }, [query, tab]);

  const subtotal = useMemo(() => cart.reduce((s, it) => s + it.price * it.qty, 0), [cart]);
  const total = useMemo(() => subtotal + (cart.length ? SERVICE_FEE : 0), [subtotal, cart]);

  const revenueDelivered = useMemo(
    () => orders.filter(o => o.status === "delivered").reduce((s, o) => s + o.total, 0),
    [orders]
  );
  const netRevenue = useMemo(() => revenueDelivered + adjustments, [revenueDelivered, adjustments]);

  const inCartQty = (id: string) => cart.filter(c => c.id === id).reduce((s, c) => s + c.qty, 0);

  const addToCart = (m: (typeof MENU)[number]) => {
    const available = stock[m.id] ?? 0;
    const already = inCartQty(m.id);
    if (available <= already) {
      alert("Out of stock for that item.");
      return;
    }
    setCart(prev => {
      const existing = prev.find(l => l.id === m.id);
      if (existing) return prev.map(l => l.id === m.id ? { ...l, qty: l.qty + 1 } : l);
      return [...prev, { key: `${m.id}`, id: m.id, name: m.name, price: m.price, qty: 1 }];
    });
    setShowCheckout(true);
  };

  const onQty = (key: string, delta: number) => {
    setCart(prev =>
      prev
        .map(l => (l.key === key ? { ...l, qty: Math.max(0, l.qty + delta) } : l))
        .filter(l => l.qty > 0)
    );
  };

  const onRemove = (key: string) => setCart(prev => prev.filter(l => l.key !== key));

  const onCheckout = () => {
    if (cart.length === 0) return;

    for (const line of cart) {
      const available = stock[line.id] ?? 0;
      if (line.qty > available) {
        alert(`Not enough stock for ${line.name}.`);
        return;
      }
    }

    const order: Order = {
      id: shortId(),
      items: cart.map(c => ({ id: c.id, name: c.name, qty: c.qty, price: c.price })),
      total,
      status: "new",
      createdAt: Date.now(),
      email: null,
    };
    setOrders(prev => [order, ...prev]);

    setStock(prev => {
      const next = { ...prev };
      for (const line of cart) next[line.id] = (next[line.id] ?? 0) - line.qty;
      return next;
    });

    setCart([]);
    setShowCheckout(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    alert(`Order placed! Your ID is ${order.id}`);
  };

  // admin actions
  const addAdjustment = (delta: number) => setAdjustments(prev => +(prev + delta).toFixed(2));
  const setOrderStatus = (id: string, status: OrderStatus) =>
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
  const markDelivered = (id: string) => setOrderStatus(id, "delivered");
  const cancelOrder   = (id: string) => setOrderStatus(id, "canceled");
  const refundOrder   = (id: string) => setOrderStatus(id, "refunded");
  const deleteOrder   = (id: string) => setOrders(prev => prev.filter(o => o.id !== id));

  // inventory adjust handlers
  const incStock = (id: string, n = 1) => setStock(prev => ({ ...prev, [id]: (prev[id] ?? 0) + n }));
  const decStock = (id: string, n = 1) => setStock(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) - n) }));
  const setStockTo = (id: string, qty: number) =>
    setStock(prev => ({ ...prev, [id]: Math.max(0, Math.floor(qty)) }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-slate-800">
      <Header
        cartCount={cart.reduce((n, i) => n + i.qty, 0)}
        onOpenCheckout={() => setShowCheckout(true)}
        runnerMode={runnerMode}
        onRunnerToggle={() => setRunnerMode(m => !m)}
        onRunnerAuth={(pin: string) => {
          if (pin === TEAM_PIN) { setRunnerMode(true); setPinPrompt(""); }
          else { alert("Incorrect PIN"); }
        }}
        pinPrompt={pinPrompt}
        setPinPrompt={setPinPrompt}
      />

      {runnerMode ? (
        <AdminDashboard
          products={MENU.map(m => ({ id: m.id, name: m.name }))}
          stock={stock}
          onIncStock={incStock}
          onDecStock={decStock}
          onSetStock={setStockTo}
          revenueDelivered={revenueDelivered}
          adjustments={adjustments}
          netRevenue={netRevenue}
          orders={orders}
          onSetStatus={setOrderStatus}
          onMarkDelivered={markDelivered}
          onCancel={cancelOrder}
          onRefund={refundOrder}
          onDelete={deleteOrder}
          onAdjust={addAdjustment}
        />
      ) : (
        <>
          <Hero onStartOrder={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })} />

          <main className="container mx-auto px-4 pb-36">
            <section id="how" className="mt-10">
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { icon: <Search className="h-5 w-5" />, title: "Pick your items", text: "Browse and add to cart." },
                  { icon: <Calendar className="h-5 w-5" />, title: "Choose a time", text: "High School Lunch (for now)." },
                  { icon: <MapPin className="h-5 w-5" />, title: "Drop a location", text: "Tell us where to meet you." },
                  { icon: <Bike className="h-5 w-5" />, title: "We deliver", text: "We queue, pick up, and deliver fast." },
                ].map((s, i) => (
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

            <section id="menu" className="mt-10">
              <div className="flex items-center gap-3">
                <input
                  className="flex-1 rounded-2xl border px-4 py-2"
                  placeholder="Search the student store…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button className="rounded-2xl border px-4 py-2">Filters</button>
              </div>

              <div className="mt-4 inline-flex rounded-2xl border bg-white p-1">
                {CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setTab(c.id)}
                    className={`px-4 py-2 rounded-xl ${tab === c.id ? "bg-indigo-600 text-white" : ""}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map(m => {
                  const available = stock[m.id] ?? 0;
                  const disabled = available <= 0;
                  return (
                    <div key={m.id} className="rounded-2xl border bg-white overflow-hidden shadow-sm">
                      <div className="aspect-[16/9] bg-slate-100">
                        <img
                          src={m.image}
                          alt={m.name}
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://placehold.co/600x338?text=Image+not+found"; }}
                        />
                      </div>
                      <div className="p-4">
                        <div className="font-semibold">{m.name}</div>
                        <div className="text-sm text-slate-600">{m.desc}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {available > 0 ? `${available} left` : "Out of stock"}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="font-bold text-indigo-700">{currency(m.price)}</div>
                          <button
                            disabled={disabled}
                            onClick={() => addToCart(m)}
                            className={`rounded-xl px-3 py-2 ${disabled ? "bg-slate-200 text-slate-500" : "bg-indigo-600 text-white"}`}
                          >
                            + Add to cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </main>

          <CartDock
            cart={cart}
            subtotal={subtotal}
            fee={cart.length ? SERVICE_FEE : 0}
            total={total}
            onQty={onQty}
            onRemove={onRemove}
            onCheckout={onCheckout}
          />
        </>
      )}
    </div>
  );
}
