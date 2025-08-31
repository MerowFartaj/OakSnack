// src/components/RunnerPage.tsx
import React, { useMemo } from "react";
import { LogOut, Minus, Plus, MapPin, Trash2 } from "lucide-react";
import { currency } from "../utils";

// Local types so this file is self-contained
type CartLine = { key: string; id: string; name: string; price: number; qty: number };
type OrderStatus = "queued" | "picked" | "delivering" | "delivered" | "canceled";
type Order = {
  id: string;
  items: CartLine[];
  name: string;
  grade: string;
  location: string;
  instructions?: string;
  total: number;
  status: OrderStatus;
  createdAt: number;
};

// Map of product id -> display name & (optional) price, only for nicer labels in the inventory box
const PRODUCT_INFO: Record<string, { name: string; price?: number }> = {
  "drpepper-can": { name: "Dr Pepper (12oz Can)", price: 2.0 },
  "oreos-snack": { name: "Oreos (Snack Pack)", price: 2.5 },
  "hot-cheetos": { name: "Hot Cheetos (Snack Bag)", price: 2.99 },
  "trident-spearmint": { name: "Trident Gum — Spearmint (14ct)", price: 1.5 },
  "nerds-gummy": { name: "Nerds Gummy Clusters (3oz)", price: 2.99 },
};

export default function RunnerPage({
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
  onSetStatus: (id: string, status: OrderStatus) => void;
  onDelete: (id: string) => void;
  revenue: number;
  setRevenue: React.Dispatch<React.SetStateAction<number>>;
  onExit: () => void;
}) {
  // Compute last 7 days delivered revenue for a tiny inline SVG chart (no external libs)
  const daily = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders) {
      if (o.status === "delivered") {
        const d = new Date(o.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;
        map.set(key, (map.get(key) || 0) + o.total);
      }
    }
    const out: { day: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      out.push({ day: key.slice(5), total: Math.round((map.get(key) || 0) * 100) / 100 });
    }
    return out;
  }, [orders]);

  const max = Math.max(1, ...daily.map(d => d.total));
  const barW = 36, gap = 12, width = daily.length * barW + (daily.length - 1) * gap + 40, height = 160;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-xl font-bold">Runner Dashboard</div>
        <button className="rounded-xl border px-3 py-2 flex items-center gap-2" onClick={onExit}>
          <LogOut className="h-4 w-4" /> Exit
        </button>
      </div>

      <div className="container mx-auto px-4 grid md:grid-cols-3 gap-4 pb-16">
        {/* Inventory editor - based on inventory keys, no dependency on App constants */}
        <div className="rounded-2xl border bg-white shadow-sm p-4 md:col-span-1">
          <div className="font-semibold mb-2">Inventory</div>
          <div className="space-y-2">
            {Object.keys(inventory).length === 0 && (
              <div className="text-sm text-slate-500">No inventory yet.</div>
            )}
            {Object.entries(inventory).map(([id, qty]) => {
              const meta = PRODUCT_INFO[id];
              return (
                <div key={id} className="flex items-center justify-between gap-2">
                  <div className="text-sm">
                    <div className="font-medium">{meta?.name ?? id}</div>
                    {meta?.price != null && (
                      <div className="text-xs text-slate-500">{currency(meta.price)}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-lg border px-2 py-1"
                      onClick={() =>
                        setInventory(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }))
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      className="w-14 text-center rounded-lg border px-2 py-1"
                      value={qty}
                      onChange={e =>
                        setInventory(prev => ({
                          ...prev,
                          [id]: Math.max(0, parseInt(e.target.value || "0", 10)),
                        }))
                      }
                    />
                    <button
                      className="rounded-lg border px-2 py-1"
                      onClick={() => setInventory(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
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
                .map(o => (
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
                      {o.items.map(l => (
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
                        onChange={e => onSetStatus(o.id, e.target.value as OrderStatus)}
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

        {/* Revenue + tiny chart */}
        <div className="rounded-2xl border bg-white shadow-sm p-4 md:col-span-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Revenue</div>
            <div className="text-2xl font-bold">{currency(revenue)}</div>
          </div>
          <div className="mt-2 text-sm text-slate-500">
            Manually adjust revenue if you need to account for refunds/cancels.
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button className="rounded-xl border px-3 py-1" onClick={() => setRevenue(r => Math.max(0, r - 1))}>
              - $1
            </button>
            <button className="rounded-xl border px-3 py-1" onClick={() => setRevenue(r => r + 1)}>
              + $1
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <svg width={width} height={height} className="bg-slate-50 rounded-xl border">
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
