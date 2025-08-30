import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import MenuCard from "./components/MenuCard";
import CartDock from "./components/CartDock";
import CheckoutModal from "./components/CheckoutModal";
import { currency, shortId } from "./utils";

// ===============================
// CONFIG
// ===============================
const TEAM_PIN = "4242";
const SERVICE_FEE = 1.0;

// Helper to build public paths robustly
const imgPath = (file: string) => `${import.meta.env.BASE_URL}products/${file}`;

// ===============================
// MENU (real items + images in /public/products)
// ===============================
const MENU = [
  { id: "drpepper-can", name: "Dr Pepper (12oz Can)", price: 2.0, category: "drinks", desc: "Cold can from the case.", tags: ["cold"], image: imgPath("drpepper.jpg") },
  { id: "oreos-snack", name: "Oreos (Snack Pack)", price: 2.5, category: "snacks", desc: "Mini sleeve of Oreos.", image: imgPath("oreo.jpg") },
  { id: "hot-cheetos", name: "Hot Cheetos (Snack Bag)", price: 2.99, category: "snacks", desc: "Spicy, crunchy, elite.", tags: ["best-seller"], image: imgPath("cheetos.jpg") },
  { id: "trident-spearmint", name: "Trident Gum — Spearmint (14ct)", price: 1.5, category: "snacks", desc: "Fresh breath on deck.", image: imgPath("trident.jpg") },
  { id: "nerds-gummy", name: "Nerds Gummy Clusters (3oz)", price: 2.99, category: "snacks", desc: "Rainbow clusters. Crunch then chew.", image: imgPath("nerds.jpg") },
];

// Keep only categories we actually have
const CATEGORIES = [
  { id: "featured", label: "Featured" },
  { id: "snacks", label: "Snacks" },
  { id: "drinks", label: "Drinks" },
];

// ===============================
// LOCAL STORAGE ORDERS
// ===============================
const LS_ORDERS = "oakSnack_orders_v1";
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
// TABS (inline)
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
          className={`px-3 py-2 text-sm ${value === t.id ? "bg-indigo-600 text-white" : "hover:bg-slate-50"}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ===============================
// RUNNER DASHBOARD (page view)
// ===============================
function RunnerDashboard({ orders, setOrders, onExit }: any) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Runner Dashboard</h2>
        <button className="rounded-xl border px-3 py-1" onClick={onExit}>
          Exit
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="mt-4 text-slate-500">No orders yet.</div>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((o: any) => (
            <div key={o.id} className="rounded-xl border p-4 bg-white shadow">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Order #{o.id}</div>
                <span className="rounded-full bg-indigo-600 text-white text-xs px-2 py-1">{o.status}</span>
              </div>
              <div className="text-sm text-slate-600 mt-1">
                {o.items.map((it: any) => `${it.name} ×${it.qty}`).join(", ")}
              </div>
              <div className="text-sm mt-1">
                Customer: <strong>{o.customer?.name || "-"}</strong>
                {o.customer?.grade ? ` (Grade ${o.customer.grade})` : ""}
              </div>
              <div className="text-sm font-medium mt-1">Total: {currency(o.total)}</div>

              <div className="mt-2">
                <select
                  value={o.status}
                  onChange={(e) =>
                    setOrders((prev: any[]) =>
                      prev.map((ord) => (ord.id === o.id ? { ...ord, status: e.target.value } : ord))
                    )
                  }
                  className="rounded border px-2 py-1"
                >
                  <option value="Queued">Queued</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Ready">Ready</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===============================
// MAIN APP
// ===============================
export default function OakSnack() {
  const [cart, setCart] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>(loadOrders());
  const [runnerMode, setRunnerMode] = useState(false);
  const [pinPrompt, setPinPrompt] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [tab, setTab] = useState("featured");
  const [query, setQuery] = useState("");

  useEffect(() => saveOrders(orders), [orders]);

  // ---- FILTERING ----
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MENU.filter((m) => {
      const text =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.desc?.toLowerCase().includes(q) ||
        (m.tags || []).some((t) => t.toLowerCase().includes(q));
      const cat = tab === "featured" ? true : m.category === tab;
      return text && cat;
    });
  }, [query, tab]);

  // ---- TOTALS ----
  const subtotal = useMemo(() => cart.reduce((s, it) => s + it.price * it.qty, 0), [cart]);
  const total = useMemo(() => subtotal + (cart.length ? SERVICE_FEE : 0), [subtotal, cart]);

  // ---- CART ACTIONS ----
  function addToCart(item: any) {
    setCart((c) => {
      const key = item.id; // simple key since we have no options yet
      const idx = c.findIndex((ci) => ci.key === key);
      if (idx >= 0) {
        const copy = [...c];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...c, { key, id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  }
  function updateQty(key: string, delta: number) {
    setCart((c) =>
      c
        .map((it) => (it.key === key ? { ...it, qty: it.qty + delta } : it))
        .filter((it) => it.qty > 0)
    );
  }
  function removeLine(key: string) {
    setCart((c) => c.filter((it) => it.key !== key));
  }

  // ---- PLACE ORDER ----
  function handlePlaceOrder(payload: any) {
    const order = {
      id: shortId(),
      createdAt: new Date().toISOString(),
      items: cart,
      subtotal,
      fee: SERVICE_FEE,
      total,
      customer: payload, // { name, grade, email, notes, location, slot... }
      status: "Queued",
    };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setShowCheckout(false);
  }

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

      {!runnerMode ? (
        <>
          <Hero onStartOrder={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })} />

          <main className="container mx-auto px-4 pb-28">
            {/* Search + Tabs */}
            <section className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3 w-full">
                <div className="relative w-full md:w-96">
                  <input
                    className="pl-3 w-full rounded-xl border px-3 py-2"
                    placeholder="Search the store…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
              <TabsSimple value={tab} onChange={setTab} tabs={CATEGORIES} />
            </section>

            {/* Menu Grid */}
            <section id="menu" className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onAdd={() => addToCart(item)}
                  // ensure no broken “?”
                  renderImage={(src, alt) => (
                    <img
                      src={src}
                      alt={alt}
                      className="h-36 w-full object-cover rounded-t-2xl bg-slate-100"
                      onError={(e) => {
                        // fallback: try without /products (in case host flattened), else placeholder
                        const el = e.currentTarget as HTMLImageElement;
                        if (!el.dataset.triedAlt) {
                          el.dataset.triedAlt = "1";
                          el.src = `/${alt.toLowerCase().includes("cheeto") ? "cheetos" :
                                   alt.toLowerCase().includes("pepper") ? "drpepper" :
                                   alt.toLowerCase().includes("oreo") ? "oreo" :
                                   alt.toLowerCase().includes("nerd") ? "nerds" :
                                   alt.toLowerCase().includes("trident") ? "trident" : "cheetos"}.jpg`;
                        } else {
                          el.src = `https://placehold.co/400x240?text=${encodeURIComponent(alt)}`;
                        }
                      }}
                    />
                  )}
                />
              ))}
            </section>
          </main>
        </>
      ) : (
        <RunnerDashboard orders={orders} setOrders={setOrders} onExit={() => setRunnerMode(false)} />
      )}

      {/* Cart Dock */}
      <CartDock
        cart={cart}
        subtotal={subtotal}
        fee={cart.length ? SERVICE_FEE : 0}
        total={total}
        onQty={updateQty}
        onRemove={removeLine}
        onCheckout={() => setShowCheckout(true)}
      />

      {/* Checkout */}
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          total={total}
          fee={SERVICE_FEE}
          subtotal={subtotal}
          cart={cart}
          onPlace={handlePlaceOrder}
        />
      )}
    </div>
  );
}
