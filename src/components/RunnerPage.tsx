import React, { useMemo } from "react";
import { LogOut, Trash2, Plus, Minus, MapPin } from "lucide-react";
import { currency } from "../utils";

/** Types match what App.tsx creates */
type OrderStatus = "queued" | "picked" | "delivering" | "delivered" | "canceled";

type OrderItem = {
  key: string;
  id: string;
  name: string;
  price: number;
  qty: number;
};

type Order = {
  id: string;
  items: OrderItem[];
  name: string;
  grade: string;
  location: string;
  instructions?: string;
  slot: "High School Lunch";
  total: number;
  status: OrderStatus;
  createdAt: number;
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
  /** Build last-7-days revenue from delivered orders */
  const daily = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const o of orders) {
      if (o.status === "delivered") {
        const d = new Date(o.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;
        byDay.set(key, (byDay.get(key) || 0) + o.total);
      }
    }
    const out: { day: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      out.push({ day: key, total: Math.round((byDay.get(key) || 0) * 100) / 100 });
    }
    return out;
  }, [orders]);

  /** Simple SVG bar chart so we don’t need any chart libs */
  const max = Math.max(1, ...daily.map((d) => d.total));
  const barW = 36;
  const gap = 12;
  const width = daily.length * barW + (daily.length - 1) * gap + 52;
  const height = 160;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-xl font-bold">Runner Dashboard</div>
        <button className="rounded-xl border px-3 py-2 flex items-center gap-2" onClick={onExit}>
          <LogOut className="h-4 w-4" /> Exit
        </button>
      </div>

      <div className="container mx-auto px-4 grid md:grid-cols-3 gap-4 pb-16">
        {/* INVENTORY EDITOR */}
        <div className="rounded-2xl border bg-white shadow-sm p-4 md:col-span-1">
          <div className="font-semibold mb-2">Inventory</div>
          <div className="space-y-2">
            {Object.keys(inventory).length === 0 && (
              <div className="text-sm text-slate-500">No products yet.</div>
            )}

            {Object.entries(inventory).map(([id, qty]) => (
              <div key={id} className="flex items-center justify-between gap-2">
                <div className="text-sm">
                  <div className="font-medium">{id}</div>
                  <div className="text-xs text-slate-500">Current: {qty}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg border px-2 py-1"
                    onClick={() =>
                      setInventory((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }))
                    }
                    title="Decrease stock"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    className="w-16 text-center rounded-lg border px-2 py-1"
                    value={qty}
                    onChange={(e) =>
                      setInventory((prev) => ({
                        ...prev,
                        [id]: Math.max(0, parseInt(e.target.value || "0")),
                      }))
                    }
                  />
                  <button
                    className="rounded-lg border px-2 py-1"
                    onClick={() => setInventory((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }))}
                    title="Increase stock"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ORDERS */}
        <div className="rounded-2xl border bg-white shadow-sm p-4 md:col-span-2">
          <div className="font-semibold mb-2">Orders</div>

          {orders.length === 0 ? (
            <div className="text-sm text-slate-500">No orders yet.</div>
          ) : (
            <div className="space-y-3">
              {orders
                .slice()
                .reverse()
                .map((o) => (
                  <div key={o.id} className="border rounded-xl p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold">{o.id}</div>
                      <div className="text-sm text-slate-500">
                        {new Date(o.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    <div className="text-sm">
                      {o.name} • {o.grade} •{" "}
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4 -mt-0.5" />
                        {o.location}
                      </span>
                      {o.instructions ? (
                        <div className="text-xs text-slate-500 mt-1">Notes: {o.instructions}</div>
                      ) : null}
                    </div>

                    <div className="mt-2 text-sm">
                      {o.items.map((l) => (
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
                        onChange={(e) => onSetStatus(o.id, e.target.value as OrderStatus)}
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

        {/* REVENUE + MINI CHART */}
        <div className="rounded-2xl border bg-white shadow-sm p-4 md:col-span-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Revenue</div>
            <div className="text-2xl font-bold">{currency(revenue)}</div>
          </div>
          <div className="mt-2 text-sm text-slate-500">
            Adjust if refunds/cancels happen.
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button className="rounded-xl border px-3 py-1" onClick={() => setRevenue((r) => Math.max(0, r - 1))}>
              - $1
            </button>
            <button className="rounded-xl border px-3 py-1" onClick={() => setRevenue((r) => r + 1)}>
              + $1
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <svg width={width} height={height} className="bg-slate-50 rounded-xl border">
              {/* y labels */}
              <text x={6} y={14} fontSize="10" fill="#64748b">
                {currency(max)}
              </text>
              <text x={6} y={height - 6} fontSize="10" fill="#64748b">
                $0
              </text>

              {daily.map((d, i) => {
                const x = 40 + i * (barW + gap);
                const h = Math.round(((d.total / max) * (height - 40)) * 100) / 100;
                const y = height - 20 - h;
                return (
                  <g key={d.day}>
                    <rect x={x} y={y} width={barW} height={h} fill="#6366F1" rx="6" />
                    <text
                      x={x + barW / 2}
                      y={height - 4}
                      fontSize="10"
                      fill="#64748b"
                      textAnchor="middle"
                    >
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
