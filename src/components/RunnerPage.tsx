import React, { useMemo, useState } from "react";
import { Bike, Package, Minus, Plus, Search } from "lucide-react";
import { currency } from "../utils";

type Order = any;
type MenuItem = { id: string; name: string; price: number };

export default function RunnerPage({
  onExit,
  orders,
  onSetStatus,
  menu,
  inventory,
  onAdjustInventory,
}: {
  onExit: () => void;
  orders: Order[];
  onSetStatus: (id: string, status: string) => void;
  menu: MenuItem[];
  inventory: Record<string, number>;
  onAdjustInventory: (id: string, delta: number) => void;
}) {
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");

  const list = useMemo(
    () =>
      orders
        .filter((o) => (filter === "All" ? true : o.status === filter))
        .filter(
          (o) =>
            !q ||
            o.id.toLowerCase().includes(q.toLowerCase()) ||
            o.customer?.name?.toLowerCase().includes(q.toLowerCase())
        ),
    [orders, filter, q]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-slate-800">
      {/* Top bar */}
      <div className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-slate-200/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-bold text-lg flex items-center gap-2">
            <Bike className="h-5 w-5" /> Runner Dashboard
          </div>
          <button className="rounded-xl border px-3 py-1" onClick={onExit}>
            Exit runner
          </button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {/* Search + filter */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,180px] gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 rounded-xl border px-3 py-2"
              placeholder="Search by Order ID or customer name"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            className="rounded-xl border px-3 py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {["All", "Queued", "In Progress", "Ready", "Delivered"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Inventory */}
        <section className="mt-6">
          <div className="font-semibold mb-2">Inventory</div>
          <div className="rounded-2xl border bg-white divide-y">
            {menu.map((m) => (
              <div
                key={m.id}
                className="p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{m.name}</div>
                  <div className="text-xs text-slate-500">
                    Price {currency(m.price)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg border px-2 py-1"
                    onClick={() => onAdjustInventory(m.id, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="w-10 text-center">
                    {Math.max(0, inventory[m.id] ?? 0)}
                  </div>
                  <button
                    className="rounded-lg border px-2 py-1"
                    onClick={() => onAdjustInventory(m.id, +1)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Tip: bump numbers when you restock, drop when you sell out.
          </p>
        </section>

        {/* Orders */}
        <section className="mt-8">
          <div className="font-semibold mb-2">Orders</div>
          <div className="space-y-3">
            {list.length === 0 && (
              <div className="text-sm text-slate-500">No orders yet.</div>
            )}
            {list.map((o) => (
              <div key={o.id} className="rounded-2xl border p-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">
                    {o.customer?.name}{" "}
                    <span className="text-slate-500">
                      {o.customer?.grade ? `(G${o.customer.grade})` : ""}
                    </span>
                  </div>
                  <span className="rounded-full bg-indigo-600 text-white text-xs px-2 py-1">
                    {o.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <div>#{o.id}</div>
                  <div>{o.slot?.label}</div>
                  {o.location && <div>{o.location}</div>}
                  {o.payment && <div>{o.payment}</div>}
                </div>
                <div className="mt-2 text-sm divide-y">
                  {o.items.map((it: any) => (
                    <div
                      key={it.key}
                      className="py-1 flex items-start justify-between"
                    >
                      <div>
                        <div className="font-medium">
                          {it.name}{" "}
                          <span className="text-slate-500">×{it.qty}</span>
                        </div>
                        {it.options &&
                          Object.keys(it.options).length > 0 && (
                            <div className="text-xs text-slate-500">
                              {Object.entries(it.options)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(" • ")}
                            </div>
                          )}
                      </div>
                      <div className="text-slate-700">
                        {currency(it.price * it.qty)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-sm flex items-center justify-between">
                  <div className="text-slate-600">
                    Total{" "}
                    <span className="font-semibold">{currency(o.total)}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {["Queued", "In Progress", "Ready", "Delivered"].map(
                      (s) => (
                        <button
                          key={s}
                          className={`rounded-xl border px-2 py-1 text-sm ${
                            o.status === s ? "bg-indigo-600 text-white" : ""
                          }`}
                          onClick={() => onSetStatus(o.id, s)}
                        >
                          {s}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-xs text-slate-500 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Update statuses as you work—customers can check via Order ID/email.
          </div>
        </section>
      </main>
    </div>
  );
}
