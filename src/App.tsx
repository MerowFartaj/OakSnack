import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import MenuCard from "./components/MenuCard";
import CheckoutModal from "./components/CheckoutModal";
import RunnerPage from "./components/RunnerPage";
import {
  Bike,
  Search,
  ShoppingCart,
} from "lucide-react";
import { currency, shortId, loadJSON, saveJSON } from "./utils";

// ===============================
// INVENTORY CONFIG
// ===============================
const START_STOCK: Record<string, number> = {
  "drpepper-can": 12,
  "oreos-snack": 30,
  "hot-cheetos": 50,
  "trident-spearmint": 15,
  "nerds-gummy": 12,
};

const LS_ORDERS = "oakSnack_orders_v1";
const LS_INV = "oakSnack_inv_v1";
const LS_REV = "oakSnack_rev_v1";

// ===============================
// MENU
// ===============================
const MENU = [
  {
    id: "drpepper-can",
    name: "Dr Pepper (12oz Can)",
    price: 2.0,
    category: "drinks",
    desc: "Cold can from the case.",
    image: "/products/drpepper.jpg",
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

// ===============================
// MAIN APP
// ===============================
export default function OakSnackApp() {
  const [cart, setCart] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("featured");
  const [showCheckout, setShowCheckout] = useState(false);

  const [orders, setOrders] = useState<any[]>(() => loadJSON(LS_ORDERS, []));
  const [inventory, setInventory] = useState<Record<string, number>>(
    () => loadJSON(LS_INV, START_STOCK)
  );
  const [revenue, setRevenue] = useState<number>(() => loadJSON(LS_REV, 0));

  const [runnerMode, setRunnerMode] = useState(false);
  const [pinPrompt, setPinPrompt] = useState("");

  useEffect(() => saveJSON(LS_ORDERS, orders), [orders]);
  useEffect(() => saveJSON(LS_INV, inventory), [inventory]);
  useEffect(() => saveJSON(LS_REV, revenue), [revenue]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MENU.filter((m) => {
      const matchesText =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.desc?.toLowerCase().includes(q);
      const matchesCat = tab === "featured" ? true : m.category === tab;
      return matchesText && matchesCat;
    });
  }, [query, tab]);

  const subtotal = useMemo(
    () => cart.reduce((s, it) => s + it.price * it.qty, 0),
    [cart]
  );
  const total = useMemo(() => subtotal + (cart.length ? 1.0 : 0), [subtotal, cart]);

  const addToCart = (item: any) => {
    if (inventory[item.id] <= 0) {
      alert("Sorry, this item is out of stock.");
      return;
    }
    setCart((c) => {
      const existing = c.find((i) => i.id === item.id);
      if (existing) {
        return c.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...c, { ...item, qty: 1 }];
    });
  };

  const handleCheckout = (info: any) => {
    const newOrder = {
      id: shortId(),
      items: cart,
      total,
      info,
      status: "Pending",
    };
    setOrders([...orders, newOrder]);

    const updatedInv = { ...inventory };
    cart.forEach((line) => {
      updatedInv[line.id] = (updatedInv[line.id] || 0) - line.qty;
    });
    setInventory(updatedInv);

    setRevenue(revenue + total);
    setCart([]);
    setShowCheckout(false);
  };
{runnerMode ? (
  <RunnerPage
    orders={orders}
    inventory={inventory}
    setInventory={setInventory}
    onSetStatus={setOrderStatus}
    onExit={() => setRunnerMode(false)}
    revenue={revenue}
    setRevenue={setRevenue}
  />
) : (
  <>
    {/* normal site continues here */}
)}
function setOrderStatus(id: string, status: string) {
  setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-slate-800">
      <Header
        cartCount={cart.reduce((n, i) => n + i.qty, 0)}
        onOpenCheckout={() => setShowCheckout(true)}
        runnerMode={runnerMode}
        onRunnerToggle={() => setRunnerMode((m) => !m)}
        onRunnerAuth={(pin: string) => {
          if (pin === "4242") {
            setRunnerMode(true);
            setPinPrompt("");
          } else {
            alert("Incorrect PIN");
          }
        }}
        pinPrompt={pinPrompt}
        setPinPrompt={setPinPrompt}
      />

      <Hero onStartOrder={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })} />

      {/* HOW IT WORKS */}
      <section id="how" className="container mx-auto px-4 mt-12">
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: <Search className="h-5 w-5" />, title: "Pick your items", text: "Browse the menu and add to cart." },
            { icon: <Bike className="h-5 w-5" />, title: "Choose a time", text: "We deliver at HS lunch." },
            { icon: <ShoppingCart className="h-5 w-5" />, title: "Checkout", text: "Add name, grade, and instructions." },
            { icon: <Bike className="h-5 w-5" />, title: "We deliver", text: "Fast & safe to your spot." },
          ].map((s, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border shadow-sm">
              <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                {s.icon} Step {i + 1}
              </div>
              <div className="mt-2 font-semibold">{s.title}</div>
              <div className="text-sm text-slate-600">{s.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MENU */}
      <main id="menu" className="container mx-auto px-4 mt-10 pb-28">
        <div className="flex gap-2 mb-6">
          {["featured", "snacks", "drinks"].map((c) => (
            <button
              key={c}
              onClick={() => setTab(c)}
              className={`px-4 py-2 rounded-xl border ${tab === c ? "bg-indigo-600 text-white" : "bg-white"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              stock={inventory[item.id]}
              cartQty={cart.find((i) => i.id === item.id)?.qty || 0}
              onAdd={addToCart}
            />
          ))}
        </div>
      </main>

      {showCheckout && (
        <CheckoutModal
          cart={cart}
          subtotal={subtotal}
          total={total}
          onClose={() => setShowCheckout(false)}
          onConfirm={handleCheckout}
        />
      )}
    </div>
  );
}
