// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import MenuCard, { Item } from "./components/MenuCard";
import {
  Bike, Filter, Minus, Plus, Search, Trash2, Package, CheckCircle, Loader2,
  MapPin, Calendar, ShoppingCart, LogOut
} from "lucide-react";
import { currency, shortId } from "./utils";

// ===============================
// CONFIG
// ===============================
const TEAM_PIN = "4242";
const SERVICE_FEE = 1.0;

// LocalStorage keys
const LS_ORDERS = "oakSnack_orders_v1";
const LS_INV     = "oakSnack_inv_v1";
const LS_REV     = "oakSnack_rev_v1";

// Categories
const CATEGORIES = [
  { id: "featured", label: "Featured" },
  { id: "snacks",   label: "Snacks"   },
  { id: "drinks",   label: "Drinks"   },
];

// MENU (uses images from /public/products/*.jpg)
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

// ===============================
// Small helpers
// ===============================
function loadJSON<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; }
  catch { return fallback; }
}
function saveJSON<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ===============================
// MAIN APP
// ===============================
export default function OakSnackApp() {
  // cart + UI
  const [cart, setCart]   = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab]     = useState("featured");
  const [showCheckout, setShowCheckout] = useState(false);

  // orders, inventory, revenue
  const [orders, setOrders] = useState<any[]>(() => loadJSON<any[]>(LS_ORDERS, []));
  const [inventory, setInventory] = useState<Record<string, number>>(() =>
    loadJSON<Record<string, number>>(LS_INV, { ...START_STOCK })
  );
  const [revenue, setRevenue] = useState<number>(() => loadJSON<number>(LS_REV, 0));

  // runner page
  const [runnerMode, setRunnerMode] = useState(false);
  const [pinPrompt, setPinPrompt] = useState("");

  // persist
  useEffect(() => saveJSON(LS_ORDERS, orders), [orders]);
  useEffect(() => saveJSON(LS_INV, inventory), [inventory]);
  useEffect(() => saveJSON(LS_REV, revenue), [revenue]);

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
    // block if no stock remaining
    const inCart = cart.find((l) => l.id === item.id)?.qty ?? 0;
    const remaining = (inventory[item.id] ?? 0) - inCart;
    if (remaining <= 0) {
      alert("This item is out of stock.");
      return;
    }
    setCart((c) => {
      const idx = c.findIndex((l) => l.id === item.id);
      if (idx === -1) {
        return [...c, { id: item.id, name: item.name, price: item.price, qty: 1, selected }];
      } else {
        const copy = [...c];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
    });
  }
  function setQty(key: string, delta: number) {
    setCart((c) => {
      const idx = c.findIndex((l) => l.id === key);
      if (idx === -1) return c;
      const copy = [...c];
      const nextQty = copy[idx].qty + delta;
      if (nextQty <= 0) copy.splice(idx, 1);
      else copy[idx] = { ...copy[idx], qty: nextQty };
      return copy;
    });
  }
  function removeLine(key: string) {
    setCart((c) => c.filter((l) => l.id !== key));
  }

  // checkout
  function checkout(form: { name: string; grade: string; slot: string; location: string }) {
    if (cart.length === 0) return;
    // decrement inventory
    const newInv = { ...inventory };
    cart.forEach((l) => {
      newInv[l.id] = Math.max(0, (newInv[l.id] ?? 0) - l.qty);
    });
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

  // simple checkout modal UI
  const CheckoutModal = () =>
    !showCheckout ? null : (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
        <div className="w-full max-w-lg rounded-2xl bg-white p-5">
          <div className="text-lg font-semibold">Checkout & Deliver</div>
          <form
            className="mt-4 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget as HTMLFormElement);
              checkout({
                name: String(fd.get("name") || ""),
                grade: String(fd.get("grade") || ""),
                slot:  String(fd.get("slot")  || "High School Lunch"),
                location: String(fd.get("location") || "Main Quad"),
              });
            }}
          >
            <input name="name" className="rounded-xl border p-2" placeholder="Your name" required />
            <input name="grade" className="rounded-xl border p-2" placeholder="Grade" required />
            <input
              name="slot"
              className="rounded-xl border p-2"
              defaultValue="High School Lunch"
              placeholder="Time slot"
              required
            />
            <input name="location" className="rounded-xl border p-2" placeholder="Pickup location" required />
            <div className="flex items-center justify-between mt-2 text-sm text-slate-600">
              <div>Subtotal: <strong>{currency(subtotal)}</strong></div>
              <div>Service: {currency(cart.length ? SERVICE_FEE : 0)}</div>
              <div>Total: <strong>{currency(total)}</strong></div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setShowCheckout(false)} className="rounded-xl border px-3 py-2">
                Cancel
              </button>
              <button type="submit" className="rounded-xl bg-indigo-600 text-white px-3 py-2">
                Confirm order
              </button>
            </div>
          </form>
        </div>
      </div>
    );

  // simple cart dock
  const CartDock = () => (
    <div className="fixed bottom-4 left-0 right-0 z-30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white shadow-xl">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Your Cart
              </div>
              <div className="text-sm text-slate-600">
                Subtotal: <span className="font-semibold">{currency(subtotal)}</span> • Service: {currency(cart.length ? SERVICE_FEE : 0)} •{" "}
                <span className="font-semibold">Total: {currency(total)}</span>
              </div>
            </div>
            <div className="mt-3 divide-y">
              {cart.length === 0 ? (
                <div className="text-sm text-slate-500 py-3">Cart is empty. Add something tasty 👀</div>
              ) : (
                cart.map((line) => (
                  <div key={line.id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{line.name}</div>
                      <div className="text-sm text-slate-600">{currency(line.price)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg border px-2 py-1" onClick={() => setQty(line.id, -1)}>
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="w-8 text-center">{line.qty}</div>
                      <button className="rounded-lg border px-2 py-1" onClick={() => setQty(line.id, +1)}>
                        <Plus className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg px-2 py-1" onClick={() => removeLine(line.id)}>
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
                  <div className="w-10 text-center">{inventory[m.id] ?? 0}</div>
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
        <div className="font-semibold">Revenue</div>
        <div className="text-2xl mt-1">{currency(revenue)}</div>
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
        onRunnerAuth={(pin: string) => {
          if (pin === TEAM_PIN) setRunnerMode(true);
          else alert("Incorrect PIN");
        }}
        pinPrompt={pinPrompt}
        setPinPrompt={setPinPrompt}
      />

      <Hero onStartOrder={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })} />

      <main id="menu" className="container mx-auto px-4 pb-28">
        {/* How it works & status lookup could be here if you kept them */}

        {/* Search + tabs */}
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
                onAdd={(selected?: any) => addToCart(item, selected)}
              />
            );
          })}
        </div>
      </main>

      <CheckoutModal />
      <CartDock />
    </div>
  );
}
