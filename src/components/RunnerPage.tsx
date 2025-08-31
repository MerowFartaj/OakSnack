// src/components/RunnerPage.tsx
import React, { useMemo } from "react";
import { LogOut, Trash2 } from "lucide-react";
import { currency } from "../utils";

type CartLine = {
  key: string;
  id: string;
  name: string;
  price: number;
  qty: number;
};

type Order = {
  id: string;
  items: CartLine[];
  name: string;
  grade: string;
  location: string;
  instructions?: string;
  slot: "High School Lunch";
  total: number;
  status: "queued" | "picked" | "delivering" | "delivered" | "canceled";
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
  onSetStatus: (id: string, status: Order["status"]) => void;
  onDelete: (id: string) => void;
  revenue: number;
  setRevenue: React.Dispatch<React.SetStateAction<number>>;
  onExit: () => void;
}) {
  // simple delivered revenue computed from orders (for display/reference)
  const deliveredRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status === "delivered")
        .reduce((s, o) => s + o.total, 0),
    [orders]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-xl font-bold">Runner Dashboard</div>
        <button
          className="rounded-xl border px-3 py-2 flex items-center gap-2"
          onClick={onExit}
          title="Exit to main site"
        >
          <LogOut className="h-4 w-4" />
          Exit
        </button>
      </div>

      <div className="container mx-auto px-4 grid md:grid-cols-3 gap-4 pb-12">
        {/* Inventory editor */}
        <section className="rounded-2xl border bg-white p-4 md:col-span-1">
          <div className="font-semibold mb-3">Inventory</div>
          <div className="space-y-3">
            {Object.keys(inventory).length === 0 && (
              <div className="text-sm text-slate-500">No inventory yet.</div>
            )}
            {Object.entries(inventory).map(([id, qty]) => (
              <div key={id} className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">{id}</div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg border px-2 py-1"
                    onClick={() =>
                      setInventory((prev) => ({
                        ...prev,
                        [id]: Math.max(0, (prev[id] || 0) - 1),
                      }))
                    }
                  >
                    -1
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
                    onClick={() =>
                      setInventory((prev) => ({
                        ...prev,
                        [id]: (prev[id] || 0) + 1,
                      }))
                    }
                  >
                    +1
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Orders */}
        <section className="rounded-2xl border bg-white p-4 md:col-span-2">
          <div className="font-semibold mb-3">Orders</div>
          {orders.length === 0 ? (
            <div className="text-sm text-slate-500">No orders yet.</div>
          ) : (
            <div className="space-y-3">
              {[...orders].reverse().map((o) => (
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
                    {o.name} • {o.grade} • {o.location}
                    {o.instructions ? (
                      <div className="text-xs text-slate-500 mt-1">
                        Notes: {o.instructions}
                      </div>
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
                      onChange={(e) =>
                        onSetStatus(o.id, e.target.value as Order["status"])
                      }
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
        </section>

        {/* Revenue card */}
        <section className="rounded-2xl border bg-white p-4 md:col-span-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Revenue (manual)</div>
            <div className="text-2xl font-bold">{currency(revenue)}</div>
          </div>
          <div className="text-sm text-slate-500 mt-1">
            Delivered (from orders): {currency(deliveredRevenue)}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              className="rounded-xl border px-3 py-1"
              onClick={() => setRevenue((r) => Math.max(0, r - 1))}
            >
              - $1
            </button>
            <button
              className="rounded-xl border px-3 py-1"
              onClick={() => setRevenue((r) => r + 1)}
            >
              + $1
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
