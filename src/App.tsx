import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import CartDock from "./components/CartDock";
import CheckoutModal from "./components/CheckoutModal";
import {
  Bike,
  Search,
  Filter,
  MapPin,
  Calendar,
} from "lucide-react";
import { currency, shortId } from "./utils";

// ===============================
// CONFIG
// ===============================
const TEAM_PIN = "4242";
const SERVICE_FEE = 1.0;

// ===============================
// MENU (your real items)
// ===============================
const MENU = [
  { id: "drpepper-can", name: "Dr Pepper (12oz Can)", price: 2.0, category: "drinks", desc: "Cold can from the case.", tags: ["cold"], image: "/products/drpepper.jpg" },
  { id: "oreos-snack", name: "Oreos (Snack Pack)", price: 2.5, category: "snacks", desc: "Mini sleeve of Oreos.", image: "/products/oreo.jpg" },
  { id: "hot-cheetos", name: "Hot Cheetos (Snack Bag)", price: 2.99, category: "snacks", desc: "Spicy, crunchy, elite.", tags: ["best-seller"], image: "/products/cheetos.jpg" },
  { id: "trident-spearmint", name: "Trident Gum — Spearmint (14ct)", price: 1.5, category: "snacks", desc: "Fresh breath on deck.", image: "/products/trident.jpg" },
  { id: "nerds-gummy", name: "Nerds Gummy Clusters (3oz)", price: 2.99, category: "snacks", desc: "Rainbow clusters. Crunch then chew.", image: "/products/nerds.jpg" },
];

// ===============================
// UTILITIES
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
// MAIN APP
// ===============================
export default function OakSnack() {
  const [cart, setCart] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orders, setOrders] = useState<any[]>(loadOrders());
  const [runnerMode, setRunnerMode] = useState(false);
  const [pinPrompt, setPinPrompt] = useState("");

  useEffect(() => saveOrders(orders), [orders]);

  const subtotal = useMemo(() => cart.reduce((s, it) => s + it.price * it.qty, 0), [cart]);
  const total = useMemo(() => subtotal + (cart.length ? SERVICE_FEE : 0), [subtotal, cart]);

  // Add to cart (does not open checkout anymore)
  function addToCart(item: any) {
    setCart((c) => {
      const idx = c.findIndex((ci) => ci.id === item.id);
      if (idx >= 0) {
        const copy = [...c];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...c, { ...item, qty: 1 }];
    });
  }

  function updateQty(key: string, delta: number) {
    setCart((c) =>
      c.map((it) => (it.id === key ? { ...it, qty: Math.max(1, it.qty + delta) } : it))
    );
  }

  function removeLine(key: string) {
    setCart((c) => c.filter((it) => it.id !== key));
  }

  function handlePlaceOrder(info: any) {
    const order = {
      id: shortId(),
      items: cart,
      subtotal,
      fee: SERVICE_FEE,
      total,
      status: "pending",
      customer: info,
    };
    setOrders((o) => [...o, order]);
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
            <section id="menu" className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {MENU.map((m) => (
                <div key={m.id} className="border rounded-2xl p-4 bg-white shadow hover:shadow-md">
                  <img src={m.image} alt={m.name} className="h-32 w-full object-cover rounded-lg mb-2" />
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-sm text-slate-600">{m.desc}</div>
                  <div className="mt-1 text-indigo-600 font-semibold">{currency(m.price)}</div>
                  <button
                    onClick={() => addToCart(m)}
                    className="mt-3 w-full rounded-xl bg-indigo-600 text-white py-2"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </section>
          </main>
        </>
      ) : (
        <RunnerDashboard orders={orders} setOrders={setOrders} onExit={() => setRunnerMode(false)} />
      )}

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
          onPlace={handlePlaceOrder}
        />
      )}
    </div>
  );
}

// ===============================
// RUNNER DASHBOARD
// ===============================
function RunnerDashboard({ orders, setOrders, onExit }: any) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Runner Dashboard</h2>
        <button className="rounded-xl border px-3 py-1" onClick={onExit}>
          Exit
        </button>
      </div>
      {orders.length === 0 ? (
        <div className="text-slate-500">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o: any) => (
            <div key={o.id} className="border rounded-xl p-4 bg-white shadow">
              <div className="font-semibold">Order #{o.id}</div>
              <div className="text-sm text-slate-600">
                {o.items.map((it: any) => `${it.name} x${it.qty}`).join(", ")}
              </div>
              <div className="text-sm font-medium">Total: {currency(o.total)}</div>
              <div className="text-sm">Customer: {o.customer?.name} ({o.customer?.grade})</div>
              <select
                value={o.status}
                onChange={(e) =>
                  setOrders((prev: any) =>
                    prev.map((ord: any) =>
                      ord.id === o.id ? { ...ord, status: e.target.value } : ord
                    )
                  )
                }
                className="mt-2 rounded border px-2 py-1"
              >
                <option value="pending">Pending</option>
                <option value="delivering">Delivering</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
