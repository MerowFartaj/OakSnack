import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import MenuCard from "./components/MenuCard";
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
  LogOut
} from "lucide-react";
import { currency, shortId } from "./utils";

/** =============================
 *  BASIC CONFIG
 *  ============================= */
const SERVICE_FEE = 1.0;
const TEAM_PIN = "4242";

// categories we actually use
const CATEGORIES = [
  { id: "featured", label: "Featured" },
  { id: "snacks", label: "Snacks" },
  { id: "drinks", label: "Drinks" },
];

// single fixed slot for now (can expand later)
const DELIVERY_SLOT = { id: "HS_LUNCH", label: "High School Lunch" };

const LOCATIONS = [
  "Main Quad",
  "Library Patio",
  "Arts Building",
  "Science Building",
  "Gym Entrance",
  "Front Gate",
  "College Counseling",
];

/** =============================
 *  MENU (your latest prices / images in public/products)
 *  ============================= */
const MENU = [
  // Drinks
  {
    id: "drpepper-can",
    name: "Dr Pepper (12oz Can)",
    price: 2.0,
    category: "drinks",
    desc: "Cold can from the case.",
    tags: ["cold"],
    image: "/products/drpepper.jpg",
  },
  // Snacks
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
    tags: ["best-seller"],
    image: "/products/cheetos.jpg",
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

/** =============================
 *  PERSISTENCE KEYS
 *  ============================= */
const LS_ORDERS = "oaksnack_orders_v1";
const LS_INVENTORY = "oaksnack_inventory_v1";
const LS_REVENUE = "oaksnack_revenue_v1";

/** =============================
 *  HELPERS (localStorage)
 *  ============================= */
function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key: string, val: any) {
  localStorage.setItem(key, JSON.stringify(val));
}

/** =============================
 *  MAIN APP
 *  ============================= */
export default function OakSnackApp() {
  // cart + UI
  const [cart, setCart] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("featured");
  const [showCheckout, setShowCheckout] = useState(false);

  // orders, inventory, revenue
  const [orders, setOrders] = useState<any[]>(() => loadJSON<any[]>(LS_ORDERS, []));
  const [inventory, setInventory] = useState<Record<string, number>>(() => {
    // default stock, can be changed in runner page
    const def: Record<string, number> = {
      "oreos-snack": 30,
      "hot-cheetos": 50,
      "drpepper-can": 12,
      "trident-spearmint": 15,
      "nerds-gummy": 12,
    };
    const fromLS = loadJSON<Record<string, number>>(LS_INVENTORY, def);
    // include any new SKUs with 0 by default
    MENU.forEach(m => { if (fromLS[m.id] === undefined) fromLS[m.id] = 0; });
    return fromLS;
  });
  const [revenue, setRevenue] = useState<number>(() => loadJSON<number>(LS_REVENUE, 0));

  // runner page
  const [runnerMode, setRunnerMode] = useState(false);
  const [pinPrompt, setPinPrompt] = useState("");

  // status lookup (kept for future section)
  const [statusLookup, setStatusLookup] = useState("");
  const [statusResult, setStatusResult] = useState<any | null>(null);

  // persist
  useEffect(() => saveJSON(LS_ORDERS, orders), [orders]);
  useEffect(() => saveJSON(LS_INVENTORY, inventory), [inventory]);
  useEffect(() => saveJSON(LS_REVENUE, revenue), [revenue]);

  // search + filter
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

  // totals
  const subtotal = useMemo(() => cart.reduce((s, it) => s + it.price * it.qty, 0), [cart]);
  const total = useMemo(() => subtotal + (cart.length ? SERVICE_FEE : 0), [subtotal, cart]);

  /** =============================
   *  CART ACTIONS
   *  ============================= */
  function addToCart(item: any, selected: any = {}) {
    // Enforce stock (based on cart + inventory)
    const already = cart.filter((c) => c.id === item.id).reduce((n, l) => n + l.qty, 0);
    const left = (inventory[item.id] ?? 0) - already;
    if (left <= 0) {
      alert("Sorry, this item is out of stock.");
      return;
    }

    const key = `${item.id}-${JSON.stringify(selected)}`;
    setCart((c) => {
      const idx = c.findIndex((ci) => ci.key === key);
      if (idx >= 0) {
        // check if this increment would exceed stock
        const nextQty = c[idx].qty + 1;
        if (already + 1 > (inventory[item.id] ?? 0)) return c;
        const copy = [...c];
        copy[idx] = { ...copy[idx], qty: nextQty };
        return copy;
      }
      return [...c, { key, id: item.id, name: item.name, price: item.price, options: selected, qty: 1 }];
    });
  }
  function updateQty(key: string, delta: number) {
    setCart((c) =>
      c
        .map((it) => (it.key === key ? { ...it, qty: Math.max(1, it.qty + delta) } : it))
        .filter((it) => it.qty > 0)
    );
  }
  function removeLine(key: string) {
    setCart((c) => c.filter((it) => it.key !== key));
  }

  /** =============================
   *  CHECKOUT / ORDERS
   *  ============================= */
  function handlePlaceOrder(payload: any) {
    if (!cart || cart.length === 0) return;

    // double-check stock before placing
    for (const line of cart) {
      const available = inventory[line.id] ?? 0;
      if (line.qty > available) {
        alert(`Not enough stock for ${line.name}. Left: ${available}`);
        return;
      }
    }

    const id = shortId();
    const createdAt = new Date().toISOString();

    // new order
    const order = {
      id,
      createdAt,
      items: cart.map((l) => ({ ...l })),
      subtotal,
      fee: SERVICE_FEE,
      total,
      customer: payload.customer, // { name, grade, email }
      slot: { ...DELIVERY_SLOT },
      location: payload.location,
      notes: payload.notes,
      payment: payload.payment,
      status: "Queued",
      canceled: false,
    };

    // apply inventory + revenue
    setInventory((inv) => {
      const copy = { ...inv };
      cart.forEach((l) => {
        copy[l.id] = Math.max(0, (copy[l.id] ?? 0) - l.qty);
      });
      return copy;
    });
    setRevenue((r) => r + order.total);

    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setShowCheckout(false);
    setStatusResult(order);
    alert(`Order placed! Your ID is ${id}`);
  }

  function lookupStatus(token: string) {
    const byId = orders.find((o) => o.id.toUpperCase() === token.toUpperCase());
    if (byId) return setStatusResult(byId);
    const byEmail = orders.find((o) => o.customer.email?.toLowerCase() === token.toLowerCase());
    if (byEmail) return setStatusResult(byEmail);
    setStatusResult(null);
  }

  function setOrderStatus(id: string, status: string) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  function toggleCanceled(id: string) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const nowCanceled = !o.canceled;
        // revenue & inventory adjustments
        if (nowCanceled) {
          setRevenue((r) => r - o.total);
          // restock
          setInventory((inv) => {
            const copy = { ...inv };
            o.items.forEach((it: any) => {
              copy[it.id] = (copy[it.id] ?? 0) + it.qty;
            });
            return copy;
          });
        } else {
          // uncancel: take revenue again & remove stock again (if available)
          // if not available, block uncancel
          let ok = true;
          setInventory((inv) => {
            const test = { ...inv };
            o.items.forEach((it: any) => {
              if ((test[it.id] ?? 0) < it.qty) ok = false;
            });
            if (!ok) return inv;
            o.items.forEach((it: any) => {
              test[it.id] = test[it.id] - it.qty;
            });
            return ok ? test : inv;
          });
          if (ok) setRevenue((r) => r + o.total);
        }
        return { ...o, canceled: nowCanceled };
      })
    );
  }

  function deleteOrder(id: string) {
    const o = orders.find((x) => x.id === id);
    if (!o) return;
    // if not canceled yet, treat as cancel then delete: restock + refund
    if (!o.canceled) {
      setRevenue((r) => r - o.total);
      setInventory((inv) => {
        const copy = { ...inv };
        o.items.forEach((it: any) => {
          copy[it.id] = (copy[it.id] ?? 0) + it.qty;
        });
        return copy;
      });
    }
    setOrders((prev) => prev.filter((x) => x.id !== id));
  }

  /** =============================
   *  UI
   *  ============================= */
  if (runnerMode) {
    return (
      <RunnerPage
        onExit={() => setRunnerMode(false)}
        revenue={revenue}
        onSetRevenue={setRevenue}
        inventory={inventory}
        setInventory={setInventory}
        orders={orders}
        onSetStatus={setOrderStatus}
        onToggleCanceled={toggleCanceled}
        onDelete={deleteOrder}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-slate-800">
      <Header
        cartCount={cart.reduce((n, i) => n + i.qty, 0)}
        onOpenCheckout={() => setShowCheckout(true)}
        runnerMode={runnerMode}
        onRunnerToggle={() => setRunnerMode((m) => !m)}
        onRunnerAuth={(pin: string) => {
          if (pin === TEAM_PIN) { setRunnerMode(true); setPinPrompt(""); }
          else { alert("Incorrect PIN"); }
        }}
        pinPrompt={pinPrompt}
        setPinPrompt={setPinPrompt}
      />

      <Hero onStartOrder={() => {
        document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
      }}/>

      <main className="container mx-auto px-4 pb-28">
        {/* How it works */}
        <HowItWorks />

        {/* Status Lookup */}
        <section id="status" className="mt-12">
          <div className="rounded-2xl border bg-white/90 shadow-lg">
            <div className="p-4 border-b flex items-center gap-2 text-slate-700 font-semibold">
              <Package className="h-5 w-5"/> Check your order status
            </div>
            <div className="p-4 flex flex-col md:flex-row items-center gap-3">
              <input
                className="w-full md:w-auto flex-1 rounded-xl border px-3 py-2"
                placeholder="Enter Order ID (e.g., OW-ABC123) or your email"
                value={statusLookup}
                onChange={(e) => setStatusLookup(e.target.value)}
              />
              <button onClick={() => lookupStatus(statusLookup)} className="rounded-xl px-4 py-2 bg-indigo-600 text-white">Lookup</button>
            </div>
            {statusResult && (
              <div className="px-4 pb-4">
                <OrderStatusCard order={statusResult} />
              </div>
            )}
          </div>
        </section>

        {/* Menu + filters */}
        <section id="menu" className="mt-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3 w-full">
              <div className="relative w-full md:w-96">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="pl-9 w-full rounded-xl border px-3 py-2"
                  placeholder="Search the store…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <span className="hidden md:inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm text-slate-600">
                <Filter className="h-4 w-4"/>Filters
              </span>
            </div>
            <div className="text-sm text-slate-600">
              Service fee: <strong>{currency(SERVICE_FEE)}</strong>
            </div>
          </div>

          <TabsSimple value={tab} onChange={setTab} tabs={CATEGORIES} />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {filtered.map((item) => (
      <MenuCard key={item.id} item={item} onAdd={(selected) => addToCart(item, selected)} />
            ))}
          </div>
        </section>
      </main>

      <CartDock
        cart={cart}
        subtotal={subtotal}
        total={total}
        fee={cart.length ? SERVICE_FEE : 0}
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

      <Footer />
    </div>
  );
}

/** =============================
 *  SIMPLE TABS (unchanged look)
 *  ============================= */
function TabsSimple({
  value, onChange, tabs
}: { value: string; onChange: (v: string)=>void; tabs: {id:string;label:string}[] }) {
  return (
    <div className="inline-grid grid-cols-3 rounded-xl border bg-white overflow-hidden">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3 py-2 text-sm ${value===t.id? 'bg-indigo-600 text-white':'hover:bg-slate-50'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** =============================
 *  CART DOCK (Add to cart only adds; checkout opens modal)
 *  ============================= */
function CartDock({
  cart, subtotal, fee, total, onQty, onRemove, onCheckout
}: any) {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white shadow-xl">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold flex items-center gap-2">
                <ShoppingCart className="h-4 w-4"/> Your Cart
              </div>
              <div className="text-sm text-slate-600">
                Subtotal: <span className="font-semibold">{currency(subtotal)}</span> • Service: {currency(fee)} •{" "}
                <span className="font-semibold">Total: {currency(total)}</span>
              </div>
            </div>

            <div className="mt-3 divide-y">
              {(!cart || cart.length === 0) ? (
                <div className="text-sm text-slate-500 py-3">Cart is empty. Add something tasty 👀</div>
              ) : cart.map((line: any) => (
                <div key={line.key} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{line.name}</div>
                    {line.options && Object.keys(line.options).length > 0 && (
                      <div className="text-xs text-slate-500">
                        {Object.entries(line.options).map(([k,v]) => `${k}: ${v}`).join(" • ")}
                      </div>
                    )}
                    <div className="text-sm text-slate-600">{currency(line.price)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg border px-2 py-1" onClick={() => onQty(line.key, -1)}>
                      <Minus className="h-4 w-4"/>
                    </button>
                    <div className="w-8 text-center">{line.qty}</div>
                    <button className="rounded-lg border px-2 py-1" onClick={() => onQty(line.key, +1)}>
                      <Plus className="h-4 w-4"/>
                    </button>
                    <button className="rounded-lg px-2 py-1" onClick={() => onRemove(line.key)}>
                      <Trash2 className="h-4 w-4 text-slate-500"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-end">
              <button
                disabled={!cart || cart.length===0}
                onClick={onCheckout}
                className={`rounded-xl px-3 py-2 flex items-center gap-2 ${(!cart || cart.length===0) ? 'bg-slate-200 text-slate-500' : 'bg-indigo-600 text-white'}`}
              >
                <Bike className="h-4 w-4"/> Checkout & Deliver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** =============================
 *  CHECKOUT MODAL (inline simple)
 *  ============================= */
function CheckoutModal({
  onClose, cart, subtotal, fee, total, onPlace
}: any) {
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("9");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState("Cash");
  const [placing, setPlacing] = useState(false);

  function place() {
    if (!cart || cart.length===0) return;
    if (!name.trim()) { alert("Please enter your name"); return; }
    setPlacing(true);
    setTimeout(() => {
      onPlace({
        slot: DELIVERY_SLOT,
        location,
        customer: { name, grade, email },
        notes,
        payment,
      });
      setPlacing(false);
    }, 300);
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
                <input className="rounded-xl border px-3 py-2" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                <select className="rounded-xl border px-3 py-2" value={grade} onChange={(e)=>setGrade(e.target.value)}>
                  {(["9","10","11","12"]).map((g)=> <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </div>
              <input className="rounded-xl border px-3 py-2 w-full" placeholder="Email (for status lookup)" value={email} onChange={(e) => setEmail(e.target.value)} />
              <div className="grid grid-cols-2 gap-2 items-center">
                <label className="text-sm">Delivery spot</label>
                <select className="rounded-xl border px-3 py-2" value={location} onChange={(e)=>setLocation(e.target.value)}>
                  {LOCATIONS.map((l)=> <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Time slot: <strong>{DELIVERY_SLOT.label}</strong>
              </div>
              <div className="grid grid-cols-2 gap-2 items-center">
                <label className="text-sm">Pay with</label>
                <select className="rounded-xl border px-3 py-2" value={payment} onChange={(e)=>setPayment(e.target.value)}>
                  {['Cash','Apple Pay (in-person)','Venmo'].map((p)=> <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <textarea className="rounded-xl border px-3 py-2 w-full" placeholder="Notes (allergies, extra sauce, etc.)" value={notes} onChange={(e)=>setNotes(e.target.value)} />
              <div className="text-[11px] text-slate-500">
                Student-run service. On-campus delivery only. Please be respectful to Student Store staff. 🙏
              </div>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Order summary</div>
            <div className="space-y-3">
              <div className="rounded-xl border bg-white divide-y">
                {cart.map((line: any) => (
                  <div key={line.key} className="p-3 text-sm flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{line.name} <span className="text-slate-500">×{line.qty}</span></div>
                    </div>
                    <div className="text-slate-700">{currency(line.price * line.qty)}</div>
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
                className={`w-full rounded-xl px-3 py-2 flex items-center gap-2 justify-center ${placing? 'bg-slate-300 text-slate-600':'bg-indigo-600 text-white'}`}
                disabled={placing}
                onClick={place}
              >
                {placing ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle className="h-4 w-4"/>}
                {placing ? "Placing…" : "Place order"}
              </button>
              <button className="w-full rounded-xl px-3 py-2 border" onClick={onClose}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** =============================
 *  ORDER STATUS CARD
 *  ============================= */
function OrderStatusCard({ order }: { order: any }) {
  const steps = ["Queued", "In Progress", "Ready", "Delivered"];
  const idx = steps.findIndex((s) => s === order.status);
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold text-slate-800 flex items-center gap-2">
          <Package className="h-4 w-4"/> Order <span className="text-indigo-600">{order.id}</span>
        </div>
        <span className={`rounded-full text-white text-xs px-2 py-1 ${order.canceled? 'bg-rose-600' : 'bg-indigo-600'}`}>
          {order.canceled ? 'Canceled' : order.status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {steps.map((s, i) => (
          <div key={s} className={`p-2 rounded-xl border ${i <= idx ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50'}`}>
            <div className="font-medium">{s}</div>
            <div className="text-slate-500">{i < idx ? 'Done' : i === idx ? 'Current' : 'Pending'}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-sm text-slate-600 flex flex-wrap gap-3">
        <div><strong>Time:</strong> {DELIVERY_SLOT.label}</div>
        <div><strong>Deliver to:</strong> {order.location}</div>
        <div><strong>Name:</strong> {order.customer.name} (Grade {order.customer.grade})</div>
      </div>
    </div>
  );
}

/** =============================
 *  RUNNER PAGE (full screen)
 *  ============================= */
function RunnerPage({
  onExit,
  revenue, onSetRevenue,
  inventory, setInventory,
  orders, onSetStatus, onToggleCanceled, onDelete
}: any) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const list = useMemo(
    () =>
      orders
        .filter((o: any) => (filter === "All" ? true : o.status === filter))
        .filter((o: any) =>
          !q
            ? true
            : o.id.toLowerCase().includes(q.toLowerCase()) ||
              o.customer.name.toLowerCase().includes(q.toLowerCase())
        ),
    [orders, filter, q]
  );

  function setStock(id: string, next: number) {
    setInventory((inv: any) => ({ ...inv, [id]: Math.max(0, Math.floor(next || 0)) }));
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b bg-white sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-bold text-lg flex items-center gap-2">
            <Bike className="h-5 w-5"/> Runner Dashboard
          </div>
          <button className="rounded-xl border px-3 py-1 flex items-center gap-2" onClick={onExit}>
            <LogOut className="h-4 w-4"/> Exit
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 grid lg:grid-cols-[360px,1fr] gap-6">
        {/* LEFT: Revenue + Inventory */}
        <div className="space-y-6">
          {/* Revenue */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="font-semibold mb-2">Revenue</div>
            <div className="text-3xl font-extrabold">{currency(revenue)}</div>
            <div className="text-xs text-slate-500 mt-1">
              Auto-updates when orders are placed / canceled / deleted.
            </div>
            <div className="mt-3 grid grid-cols-[1fr,auto] gap-2">
              <input
                className="rounded-xl border px-3 py-2"
                type="number"
                step="0.01"
                value={revenue}
                onChange={(e) => onSetRevenue(parseFloat(e.target.value || "0"))}
              />
              <button className="rounded-xl border px-3 py-2" onClick={() => onSetRevenue(0)}>
                Reset
              </button>
            </div>
          </div>

          {/* Inventory */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="font-semibold mb-3">Inventory</div>
            <div className="space-y-3">
              {MENU.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-2">
                  <div className="text-sm">
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-slate-500">Price: {currency(m.price)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg border px-2 py-1" onClick={()=>setStock(m.id, (inventory[m.id] ?? 0) - 1)}>-</button>
                    <input
                      className="w-16 rounded-lg border px-2 py-1 text-center"
                      type="number"
                      value={inventory[m.id] ?? 0}
                      onChange={(e)=>setStock(m.id, parseInt(e.target.value || "0", 10))}
                    />
                    <button className="rounded-lg border px-2 py-1" onClick={()=>setStock(m.id, (inventory[m.id] ?? 0) + 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Orders */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="font-semibold">Orders</div>
            <div className="flex items-center gap-2">
              <input
                className="rounded-xl border px-3 py-2"
                placeholder="Search by ID or name"
                value={q}
                onChange={(e)=>setQ(e.target.value)}
              />
              <select className="rounded-xl border px-3 py-2" value={filter} onChange={(e)=>setFilter(e.target.value)}>
                {['All','Queued','In Progress','Ready','Delivered'].map((s)=> <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {list.length === 0 && (
              <div className="text-sm text-slate-500">No orders right now.</div>
            )}
            {list.map((o: any) => (
              <div key={o.id} className="rounded-2xl border p-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{o.customer.name} <span className="text-slate-500">(G{o.customer.grade})</span></div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full text-white text-xs px-2 py-1 ${o.canceled? 'bg-rose-600' : 'bg-indigo-600'}`}>
                      {o.canceled ? 'Canceled' : o.status}
                    </span>
                    <button className="rounded-xl border px-2 py-1 text-xs" onClick={()=>onDelete(o.id)}>Delete</button>
                  </div>
                </div>
                <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <div>#{o.id}</div>
                  <div>{DELIVERY_SLOT.label}</div>
                  <div>{o.location}</div>
                  <div>{o.payment}</div>
                </div>
                <div className="mt-2 text-sm divide-y">
                  {o.items.map((it: any) => (
                    <div key={it.key} className="py-1 flex items-start justify-between">
                      <div>
                        <div className="font-medium">{it.name} <span className="text-slate-500">×{it.qty}</span></div>
                      </div>
                      <div className="text-slate-700">{currency(it.price * it.qty)}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-sm flex items-center justify-between">
                  <div className="text-slate-600">Total <span className="font-semibold">{currency(o.total)}</span></div>
                  <div className="flex gap-2 flex-wrap">
                    {['Queued','In Progress','Ready','Delivered'].map((s) => (
                      <button
                        key={s}
                        className={`rounded-xl border px-2 py-1 text-sm ${o.status===s? 'bg-indigo-600 text-white':''}`}
                        onClick={() => onSetStatus(o.id, s)}
                        disabled={o.canceled}
                      >
                        {s}
                      </button>
                    ))}
                    <button
                      className={`rounded-xl border px-2 py-1 text-sm ${o.canceled? 'bg-rose-600 text-white' : ''}`}
                      onClick={() => onToggleCanceled(o.id)}
                    >
                      {o.canceled ? 'Uncancel' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

/** =============================
 *  HOW IT WORKS + FOOTER
 *  ============================= */
function HowItWorks() {
  const steps = [
    { icon: <Search className="h-5 w-5" />, title: "Pick your items", text: "Browse the menu and add to cart." },
    { icon: <Calendar className="h-5 w-5" />, title: "Choose a time", text: "We’re running during HS Lunch for now." },
    { icon: <MapPin className="h-5 w-5" />, title: "Drop a location", text: "Tell us where on campus to meet you." },
    { icon: <Bike className="h-5 w-5" />, title: "We deliver", text: "We queue, pick up, and deliver to you fast." },
  ];
  return (
    <section id="how" className="container mx-auto px-4">
      <div className="grid md:grid-cols-4 gap-4">
        {steps.map((s, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border shadow-sm">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold">
              <span className="inline-grid place-items-center h-8 w-8 rounded-xl bg-indigo-50">{s.icon}</span> Step {i + 1}
            </div>
            <div className="mt-2 font-semibold">{s.title}</div>
            <div className="text-sm text-slate-600">{s.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
function Footer() {
  return (
    <footer className="mt-20 border-t bg-white/70">
      <div className="container mx-auto px-4 py-8 text-sm text-slate-600">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} OakSnack — Student-run.</div>
          <div className="flex items-center gap-4">
            <a href="#how" className="hover:text-indigo-600">How it works</a>
            <a href="#menu" className="hover:text-indigo-600">Menu</a>
            <a href="#status" className="hover:text-indigo-600">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
