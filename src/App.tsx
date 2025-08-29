import React, { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
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
  LogIn,
} from "lucide-react";

// ===============================
// OakwoodDash — SANDBOX (Junk Food + Images)
// Same UI as baseline; only MENU differs. Safe to experiment.
// ===============================

// CONFIG
const TEAM_PIN = "4242"; // Runner dashboard PIN — change for production
const SERVICE_FEE = 1.0; // USD per order (service)
const PER_SLOT_CAPACITY = 12; // Max orders accepted per slot

const SLOTS = [
  { id: "ASAP", label: "ASAP (next available)" },
  { id: "NUTRITION", label: "Nutrition Break" },
  { id: "LUNCH", label: "Lunch" },
  { id: "CUSTOM", label: "Choose a time…" },
];

// Keep categories identical to baseline for layout stability
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
// MENU — Costco/Junk Food selection (with simple image URLs)
// ===============================
// Note: Images use placehold.co so you see thumbnails without importing assets.
// You can replace URLs with your own later.
const MENU = [
  // DRINKS
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
    id: "coke-can",
    name: "Coke (12oz Can)",
    price: 5.0,
    category: "drinks",
    desc: "Classic Coca-Cola.",
    tags: ["cold"],
    image: "https://placehold.co/400x240?text=Coke",
  },
  {
    id: "dietcoke-can",
    name: "Diet Coke (12oz Can)",
    price: 5.0,
    category: "drinks",
    desc: "Zero sugar vibe.",
    image: "https://placehold.co/400x240?text=Diet+Coke",
  },
  {
    id: "sprite-can",
    name: "Sprite (12oz Can)",
    price: 5.0,
    category: "drinks",
    desc: "Lemon-lime.",
    image: "https://placehold.co/400x240?text=Sprite",
  },
  {
    id: "gatorade-bottle",
    name: "Gatorade (Assorted)",
    price: 4.0,
    category: "drinks",
    desc: "Assorted flavors from the case.",
    options: [
      { key: "flavor", label: "Flavor", choices: ["Blue", "Red", "Yellow", "Orange"] },
    ],
    image: "https://placehold.co/400x240?text=Gatorade",
  },

  // SNACKS
  {
    id: "hot-cheetos",
    name: "Hot Cheetos (Snack Bag)",
    price: 4.0,
    category: "snacks",
    desc: "Spicy, crunchy, elite.",
    tags: ["best-seller"],
    image: "https://placehold.co/400x240?text=Hot+Cheetos",
  },
  {
    id: "doritos",
    name: "Doritos (Snack Bag)",
    price: 4.0,
    category: "snacks",
    desc: "Your choice of flavor.",
    options: [
      { key: "flavor", label: "Flavor", choices: ["Nacho Cheese", "Cool Ranch"] },
    ],
    image: "https://placehold.co/400x240?text=Doritos",
  },
  {
    id: "takis",
    name: "Takis (Snack Bag)",
    price: 4.0,
    category: "snacks",
    desc: "Rolled heat.",
    image: "https://placehold.co/400x240?text=Takis",
  },
  {
    id: "lays-classic",
    name: "Lays Classic (Snack Bag)",
    price: 3.5,
    category: "snacks",
    desc: "OG potato chips.",
    image: "https://placehold.co/400x240?text=Lays",
  },
  {
    id: "oreos-snack",
    name: "Oreos (Snack Pack)",
    price: 3.5,
    category: "snacks",
    desc: "Mini sleeve of Oreos.",
    image: "https://placehold.co/400x240?text=Oreos",
  },
  {
    id: "skittles-fun",
    name: "Skittles (Fun Size)",
    price: 2.0,
    category: "snacks",
    desc: "Taste the rainbow.",
    image: "https://placehold.co/400x240?text=Skittles",
  },
  {
    id: "kitkat",
    name: "KitKat Bar",
    price: 2.5,
    category: "snacks",
    desc: "Break time upgrade.",
    image: "https://placehold.co/400x240?text=KitKat",
  },
  {
    id: "reeses",
    name: "Reese's Peanut Butter Cups",
    price: 2.5,
    category: "snacks",
    desc: "Two cups, unlimited vibes.",
    image: "https://placehold.co/400x240?text=Reese%27s",
  },
  {
    id: "rice-krispies",
    name: "Rice Krispies Treat",
    price: 2.5,
    category: "snacks",
    desc: "Chewy marshmallow square.",
    image: "https://placehold.co/400x240?text=Rice+Krispies",
  },
  {
    id: "costco-muffin",
    name: "Costco Muffin",
    price: 4.0,
    category: "snacks",
    desc: "Massive. Pick a flavor.",
    options: [
      { key: "flavor", label: "Flavor", choices: ["Blueberry", "Chocolate", "Poppyseed"] },
    ],
    image: "https://placehold.co/400x240?text=Costco+Muffin",
  },
  {
    id: "brownie-bites",
    name: "Brownie Bites (Pack)",
    price: 3.0,
    category: "snacks",
    desc: "Shareable mini brownies.",
    image: "https://placehold.co/400x240?text=Brownie+Bites",
  },
];

// UTILITIES
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
const LS_ORDERS = "owdash_orders_v1_sandbox_images"; // separate key
function loadOrders() {
  try { const raw = localStorage.getItem(LS_ORDERS); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function saveOrders(orders: any[]) { localStorage.setItem(LS_ORDERS, JSON.stringify(orders)); }

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
      const matchesText = !q || m.name.toLowerCase().includes(q) || m.desc?.toLowerCase().includes(q) || (m.tags||[]).some((t)=>t.toLowerCase().includes(q));
      const matchesCat = tab === "featured" ? true : m.category === tab;
      return matchesText && matchesCat;
    });
  }, [query, tab]);

  const subtotal = useMemo(() => cart.reduce((sum, it) => sum + it.price * it.qty, 0), [cart]);
  const total = useMemo(() => subtotal + (cart.length ? SERVICE_FEE : 0), [subtotal, cart]);

  function addToCart(item: any, selected: any = {}) {
    setCart((c) => {
      const key = `${item.id}-${JSON.stringify(selected)}`;
      const idx = c.findIndex((ci) => ci.key === key);
      if (idx >= 0) { const copy = [...c]; copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 }; return copy; }
      return [...c, { key, id: item.id, name: item.name, price: item.price, options: selected, qty: 1 }];
    });
  }
  function updateQty(key: string, delta: number) {
    setCart((c) => c.map((it) => (it.key === key ? { ...it, qty: Math.max(1, it.qty + delta) } : it)).filter((it)=>it.qty>0));
  }
  function removeLine(key: string) { setCart((c) => c.filter((it) => it.key !== key)); }

  function dayKeyOf(dateStr: string) { try { return new Date(dateStr).toDateString(); } catch { return ""; } }
  function ordersInSlot(slot: string, dayKey: string) { return orders.filter((o) => o.slot.id === slot && o.dayKey === dayKey).length; }
  function slotCapacityInfo(slotId: string, dateStr: string) {
    const count = ordersInSlot(slotId, dayKeyOf(dateStr));
    const left = Math.max(0, PER_SLOT_CAPACITY - count);
    return { count, left, capacity: PER_SLOT_CAPACITY };
  }

  function handlePlaceOrder(payload: any) {
    const id = shortId();
    const today = new Date();
    const order = {
      id,
      createdAt: today.toISOString(),
      dayKey: dayKeyOf(today.toISOString()),
      items: cart,
      subtotal,
      fee: SERVICE_FEE,
      total,
      customer: payload.customer,
      slot: payload.slot, // { id, label, time? }
      location: payload.location,
      notes: payload.notes,
      payment: payload.payment,
      status: "Queued",
    };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setShowCheckout(false);
    setStatusResult(order);
  }
  function lookupStatus(token: string) {
    const byId = orders.find((o) => o.id.toUpperCase() === token.toUpperCase());
    if (byId) return setStatusResult(byId);
    const byEmail = orders.find((o) => o.customer.email?.toLowerCase() === token.toLowerCase());
    if (byEmail) return setStatusResult(byEmail);
    setStatusResult(null);
  }
  function setOrderStatus(id: string, status: string) { setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o))); }

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

      <Hero onStartOrder={() => { document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" }); }} />

      <main className="container mx-auto px-4 pb-28">
        <HowItWorks />

        {/* Status Lookup */}
        <section id="status" className="mt-12">
          <div className="rounded-2xl border bg-white/90 shadow-lg">
            <div className="p-4 border-b flex items-center gap-2 text-slate-700 font-semibold"><Package className="h-5 w-5"/> Check your order status</div>
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

        {/* Menu + Cart */}
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
              <span className="hidden md:inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm text-slate-600"><Filter className="h-4 w-4"/>Filters</span>
            </div>
            <div className="text-sm text-slate-600">Capacity per slot: <strong>{PER_SLOT_CAPACITY}</strong></div>
          </div>

          <TabsSimple value={tab} onChange={setTab} tabs={CATEGORIES} />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={addToCart} />
            ))}
          </div>
        </section>
      </main>

      <CartDock
        cart={cart}
        subtotal={subtotal}
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
          slotCapacityInfo={slotCapacityInfo}
        />
      )}

      {runnerMode && (
        <RunnerDrawer
          onClose={() => setRunnerMode(false)}
          orders={orders}
          onSetStatus={setOrderStatus}
        />
      )}

      <Footer />
    </div>
  );
}

// ===============================
// HEADER
// ===============================
function Header({ cartCount, onOpenCheckout, runnerMode, onRunnerToggle, onRunnerAuth, pinPrompt, setPinPrompt }: any) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-slate-200/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-inner grid place-items-center text-white font-bold">OD</div>
          <div>
            <div className="font-extrabold text-lg leading-5">OakwoodDash</div>
            <div className="text-xs text-slate-500 -mt-0.5">Student Store Delivery — by students, for students</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a
            href="#menu"
            className="hover:text-indigo-600"
            onClick={(e)=>{ e.preventDefault(); document.getElementById('menu')?.scrollIntoView({behavior:'smooth'}); }}
          >
            Menu
          </a>
          <a href="#status" className="hover:text-indigo-600">Status</a>
          <a href="#how" className="hover:text-indigo-600">How it works</a>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <input className="rounded-xl border px-2 py-1 text-sm" placeholder="Runner PIN" value={pinPrompt} onChange={(e)=>setPinPrompt(e.target.value)} />
            <button className="rounded-xl border px-3 py-1 text-sm" onClick={()=>onRunnerAuth(pinPrompt)}><LogIn className="h-4 w-4 inline mr-1"/>Enter</button>
          </div>
          <button onClick={onOpenCheckout} className="rounded-xl px-3 py-2 bg-indigo-600 text-white flex items-center gap-2">
            <ShoppingCart className="h-4 w-4"/>
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

// ===============================
// HERO
// ===============================
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
              Skip the line. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Get your food fast.</span>
            </h1>
            <p className="mt-4 text-slate-600 max-w-xl">
              OakwoodDash is a student-run preorder + delivery service for the Student Store.
              Order during class breaks and we’ll grab it for you while you keep chilling with friends.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-xl px-4 py-2 bg-indigo-600 text-white flex items-center gap-2" onClick={onStartOrder}><ShoppingCart className="h-5 w-5"/> Start an order</button>
              <a href="#how" className="rounded-xl px-4 py-2 border bg-white flex items-center gap-2"><Bike className="h-5 w-5"/> How it works</a>
            </div>
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
              <Shield className="h-4 w-4"/> Independent student service • On-campus only • Safe & fast
            </div>
          </div>
          <div className="md:pl-8">
            <div className="border rounded-3xl bg-white shadow-xl">
              <div className="p-4 border-b font-semibold flex items-center gap-2"><Clock className="h-5 w-5"/> Popular right now</div>
              <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                {MENU.slice(0,4).map((m) => (
                  <div key={m.id} className="p-3 rounded-2xl border bg-white hover:shadow-md transition">
                    <div className="h-28 w-full overflow-hidden rounded-xl bg-slate-100 mb-2">
                      {m.image ? (
                        <img src={m.image} alt={m.name} loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-xs text-slate-500">No image</div>
                      )}
                    </div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-slate-500">{currency(m.price)}</div>
                    <div className="mt-1 flex gap-1 flex-wrap">
                      {(m.tags||[]).map((t: string) => (
                        <span key={t} className="rounded-full border px-2 py-0.5 text-xs">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4 text-xs text-slate-500">Heads up: limited slots per break to keep it real. Order early!</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===============================
// HOW IT WORKS
// ===============================
function HowItWorks() {
  const steps = [
    { icon: <Search className="h-5 w-5"/>, title: "Pick your items", text: "Browse the menu and add to cart." },
    { icon: <Calendar className="h-5 w-5"/>, title: "Choose a time", text: "ASAP, Nutrition, Lunch, or a custom time slot." },
    { icon: <MapPin className="h-5 w-5"/>, title: "Drop a location", text: "Tell us where on campus to meet you." },
    { icon: <Bike className="h-5 w-5"/>, title: "We deliver", text: "We queue, pick up, and deliver to you fast." },
  ];
  return (
    <section id="how" className="container mx-auto px-4">
      <div className="grid md:grid-cols-4 gap-4">
        {steps.map((s, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border shadow-sm">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold"><span className="inline-grid place-items-center h-8 w-8 rounded-xl bg-indigo-50">{s.icon}</span> Step {i+1}</div>
            <div className="mt-2 font-semibold">{s.title}</div>
            <div className="text-sm text-slate-600">{s.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ===============================
// SIMPLE TABS
// ===============================
function TabsSimple({ value, onChange, tabs }: { value: string; onChange: (v: string)=>void; tabs: {id:string;label:string}[] }) {
  return (
    <div className="inline-grid grid-cols-3 md:grid-cols-5 rounded-xl border bg-white overflow-hidden">
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

// ===============================
// MENU CARD (with optional image)
// ===============================
function MenuCard({ item, onAdd }: { item: any; onAdd: (item:any, selected?:any)=>void }) {
  const [opts, setOpts] = useState<any>({});
  function setChoice(key: string, val: string) { setOpts((o: any) => ({ ...o, [key]: val })); }
  return (
    <div className="rounded-2xl border shadow-sm hover:shadow-md transition bg-white">
      <div className="h-36 w-full overflow-hidden rounded-t-2xl bg-slate-100">
        {item.image ? (
          <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-sm text-slate-500">No image</div>
        )}
      </div>
      <div className="p-4 border-t flex items-center justify-between">
        <div className="font-semibold">{item.name}</div>
        <div className="text-indigo-600 font-semibold">{currency(item.price)}</div>
      </div>
      <div className="px-4 pb-4">
        <div className="text-sm text-slate-600">{item.desc}</div>
        {item.tags && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.map((t: string) => (
              <span key={t} className="rounded-full border px-2 py-0.5 text-xs">{t}</span>
            ))}
          </div>
        )}
        {item.options?.length ? (
          <div className="mt-3 space-y-3">
            {item.options.map((op: any) => (
              <div key={op.key} className="grid grid-cols-[120px,1fr] items-center gap-2 text-sm">
                <label className="text-slate-700">{op.label}</label>
                <select className="rounded-xl border px-2 py-1" onChange={(e)=>setChoice(op.key, e.target.value)} defaultValue="">
                  <option value="" disabled>{`Choose ${op.label.toLowerCase()}`}</option>
                  {op.choices.map((c: string) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-4 flex gap-2">
          <button className="rounded-xl px-3 py-2 bg-indigo-600 text-white flex items-center gap-2" onClick={() => onAdd(item, opts)}>
            <Plus className="h-4 w-4"/> Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

// ===============================
// CART DOCK
// ===============================
function CartDock({ cart, subtotal, total, onQty, onRemove, onCheckout }: any) {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white shadow-xl">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold flex items-center gap-2"><ShoppingCart className="h-4 w-4"/> Your Cart</div>
              <div className="text-sm text-slate-600">Subtotal: <span className="font-semibold">{currency(subtotal)}</span> • Service: {currency(cart.length ? SERVICE_FEE : 0)} • <span className="font-semibold">Total: {currency(total)}</span></div>
            </div>
            <div className="mt-3 divide-y">
              {(!cart || cart.length === 0) ? (
                <div className="text-sm text-slate-500 py-3">Cart is empty. Add something tasty 👀</div>
              ) : cart.map((line: any) => (
                <div key={line.key} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{line.name}</div>
                    {line.options && Object.keys(line.options).length > 0 && (
                      <div className="text-xs text-slate-500">{Object.entries(line.options).map(([k,v]) => `${k}: ${v}`).join(" • ")}</div>
                    )}
                    <div className="text-sm text-slate-600">{currency(line.price)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg border px-2 py-1" onClick={() => onQty(line.key, -1)}><Minus className="h-4 w-4"/></button>
                    <div className="w-8 text-center">{line.qty}</div>
                    <button className="rounded-lg border px-2 py-1" onClick={() => onQty(line.key, +1)}><Plus className="h-4 w-4"/></button>
                    <button className="rounded-lg px-2 py-1" onClick={() => onRemove(line.key)}><Trash2 className="h-4 w-4 text-slate-500"/></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <button disabled={!cart || cart.length===0} onClick={onCheckout} className={`rounded-xl px-3 py-2 flex items-center gap-2 ${(!cart || cart.length===0) ? 'bg-slate-200 text-slate-500' : 'bg-indigo-600 text-white'}`}>
                <Bike className="h-4 w-4"/> Checkout & Deliver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===============================
// CHECKOUT MODAL
// ===============================
function CheckoutModal({ onClose, cart, subtotal, fee, total, onPlace, slotCapacityInfo }: any) {
  const [slotId, setSlotId] = useState("ASAP");
  const [customTime, setCustomTime] = useState("");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("9");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState("Cash");
  const [placing, setPlacing] = useState(false);

  const capacity = slotCapacityInfo(slotId, new Date().toISOString());

  function place() {
    if (!cart || cart.length===0) return;
    if (!name.trim()) { alert("Please enter your name"); return; }
    setPlacing(true);
    setTimeout(() => {
      onPlace({
        slot: { id: slotId, label: slotLabel(slotId), time: slotId === "CUSTOM" ? customTime : undefined },
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
              <div className="grid grid-cols-2 gap-2 items-center">
                <label className="text-sm">Time slot</label>
                <select className="rounded-xl border px-3 py-2" value={slotId} onChange={(e)=>setSlotId(e.target.value)}>
                  {SLOTS.map((s)=> <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              {slotId === "CUSTOM" && (
                <div className="grid grid-cols-2 gap-2 items-center">
                  <label className="text-sm">Custom time</label>
                  <input className="rounded-xl border px-3 py-2" type="time" value={customTime} onChange={(e)=>setCustomTime(e.target.value)} />
                </div>
              )}
              <div className="text-xs text-slate-600 mt-1">Capacity this slot: <strong>{capacity.left}</strong> of {capacity.capacity} left.</div>
              <div className="grid grid-cols-2 gap-2 items-center">
                <label className="text-sm">Pay with</label>
                <select className="rounded-xl border px-3 py-2" value={payment} onChange={(e)=>setPayment(e.target.value)}>
                  {['Cash','Apple Pay (in-person)','Venmo'].map((p)=> <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <textarea className="rounded-xl border px-3 py-2 w-full" placeholder="Notes (allergies, extra sauce, etc.)" value={notes} onChange={(e)=>setNotes(e.target.value)} />
              <div className="text-[11px] text-slate-500">By placing an order, you agree this is a student-run service, not affiliated with Oakwood School. On-campus delivery only. Please be respectful to Student Store staff. 🙏</div>
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
                      {line.options && Object.keys(line.options).length > 0 && (
                        <div className="text-xs text-slate-500">{Object.entries(line.options).map(([k,v]) => `${k}: ${v}`).join(" • ")}</div>
                      )}
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
              <button className={`w-full rounded-xl px-3 py-2 flex items-center gap-2 justify-center ${placing? 'bg-slate-300 text-slate-600':'bg-indigo-600 text-white'}`} disabled={placing} onClick={place}>
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

// ===============================
// ORDER STATUS CARD
// ===============================
function OrderStatusCard({ order }: { order: any }) {
  const steps = ["Queued", "In Progress", "Ready", "Delivered"];
  const idx = steps.findIndex((s) => s === order.status);
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold text-slate-800 flex items-center gap-2">
          <Package className="h-4 w-4"/> Order <span className="text-indigo-600">{order.id}</span>
        </div>
        <span className="rounded-full bg-indigo-600 text-white text-xs px-2 py-1">{order.status}</span>
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
        <div><strong>Time:</strong> {order.slot.label}{order.slot.time ? ` • ${order.slot.time}` : ''}</div>
        <div><strong>Deliver to:</strong> {order.location}</div>
        <div><strong>Name:</strong> {order.customer.name} (Grade {order.customer.grade})</div>
      </div>
    </div>
  );
}

// ===============================
// RUNNER DRAWER
// ===============================
function RunnerDrawer({ onClose, orders, onSetStatus }: { onClose: ()=>void; orders: any[]; onSetStatus: (id:string, status:string)=>void }) {
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const list = useMemo(() => orders.filter((o)=> (filter==="All" ? true : o.status===filter)).filter((o)=> !q || o.id.toLowerCase().includes(q.toLowerCase()) || o.customer.name.toLowerCase().includes(q.toLowerCase())), [orders, filter, q]);
  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-[92%] sm:w-[540px] md:w-[640px] bg-white h-full shadow-2xl p-4 overflow-auto">
        <div className="flex items-center justify-between">
          <div className="font-bold text-lg flex items-center gap-2"><Bike className="h-5 w-5"/> Runner Dashboard</div>
          <button className="rounded-xl border px-3 py-1" onClick={onClose}>Close</button>
        </div>
        <div className="mt-4 grid grid-cols-[1fr,140px] gap-2">
          <input className="rounded-xl border px-3 py-2" placeholder="Search by ID or name" value={q} onChange={(e)=>setQ(e.target.value)} />
          <select className="rounded-xl border px-3 py-2" value={filter} onChange={(e)=>setFilter(e.target.value)}>
            {['All','Queued','In Progress','Ready','Delivered'].map((s)=> <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="mt-4 space-y-3">
          {list.length === 0 && (
            <div className="text-sm text-slate-500">No orders right now.</div>
          )}
          {list.map((o) => (
            <div key={o.id} className="rounded-2xl border p-3 bg-white">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{o.customer.name} <span className="text-slate-500">(G{o.customer.grade})</span></div>
                <span className="rounded-full bg-indigo-600 text-white text-xs px-2 py-1">{o.status}</span>
              </div>
              <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <div>#{o.id}</div>
                <div>{o.slot.label}{o.slot.time ? ` • ${o.slot.time}` : ''}</div>
                <div>{o.location}</div>
                <div>{o.payment}</div>
              </div>
              <div className="mt-2 text-sm divide-y">
                {o.items.map((it: any) => (
                  <div key={it.key} className="py-1 flex items-start justify-between">
                    <div>
                      <div className="font-medium">{it.name} <span className="text-slate-500">×{it.qty}</span></div>
                      {it.options && Object.keys(it.options).length > 0 && (
                        <div className="text-xs text-slate-500">{Object.entries(it.options).map(([k,v]) => `${k}: ${v}`).join(" • ")}</div>
                      )}
                    </div>
                    <div className="text-slate-700">{currency(it.price * it.qty)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm flex items-center justify-between">
                <div className="text-slate-600">Total <span className="font-semibold">{currency(o.total)}</span></div>
                <div className="flex gap-2 flex-wrap">
                  {['Queued','In Progress','Ready','Delivered'].map((s) => (
                    <button key={s} className={`rounded-xl border px-2 py-1 text-sm ${o.status===s? 'bg-indigo-600 text-white':''}`} onClick={() => onSetStatus(o.id, s)}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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
          <div>
            © {new Date().getFullYear()} OakwoodDash — Student-run. Not affiliated with Oakwood School.
          </div>
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

// ===============================
// LIGHTWEIGHT TESTS (console)
// ===============================
function runTests() {
  function assert(name: string, cond: boolean, details?: any) {
    if (!cond) {
      console.error(`❌ Test failed: ${name}`, details);
    } else {
      console.log(`✅ ${name}`);
    }
  }
  // currency
  assert("currency formats to 2 decimals", currency(1.5) === "$1.50");
  // shortId
  const id = shortId();
  assert("shortId prefix OW-", id.startsWith("OW-"));
  assert("shortId length >= 6 after prefix", id.length >= 6);
  // subtotal and total
  const mockCart = [ { price: 2, qty: 2 }, { price: 3.5, qty: 1 } ];
  const mockSubtotal = mockCart.reduce((s, it)=> s + it.price*it.qty, 0);
  assert("subtotal computes", mockSubtotal === 7.5, { mockSubtotal });
  const mockTotal = mockSubtotal + SERVICE_FEE;
  assert("total adds fee when cart not empty", mockTotal === 8.5, { mockTotal });
  // slot label
  assert("slotLabel returns readable label", slotLabel("LUNCH").toLowerCase().includes("lunch"));
}
runTests();
