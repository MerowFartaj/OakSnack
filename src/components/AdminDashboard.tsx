import React, { useMemo, useState } from "react";
import { Trash2, CheckCircle, XCircle, RotateCcw, Plus, Minus, Save, LogOut } from "lucide-react";
import { currency } from "../utils";

type OrderStatus =
  | "new"
  | "preparing"
  | "out-for-delivery"
  | "delivered"
  | "canceled"
  | "refunded";

type OrderItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
  email?: string | null;
};

type Product = { id: string; name: string };

export default function AdminDashboard({
  products,
  stock,
  onIncStock,
  onDecStock,
  onSetStock,
  revenueDelivered,
  adjustments,
  netRevenue,
  orders,
  onSetStatus,
  onMarkDelivered,
  onCancel,
  onRefund,
  onDelete,
  onAdjust,
  onExit,              // ← NEW
}: {
  products: Product[];
  stock: Record<string, number>;
  onIncStock: (id: string, n?: number) => void;
  onDecStock: (id: string, n?: number) => void;
  onSetStock: (id: string, qty: number) => void;
  revenueDelivered: number;
  adjustments: number;
  netRevenue: number;
  orders: Order[];
  onSetStatus: (id: string, status: OrderStatus) => void;
  onMarkDelivered: (id: string) => void;
  onCancel: (id: string) => void;
  onRefund: (id: string) => void;
  onDelete: (id: string) => void;
  onAdjust: (delta: number) => void;
  onExit: () => void;  // ← NEW
}) {
  const counts = useMemo(() => {
    const c: Record<OrderStatus, number> = {
      new: 0,
      preparing: 0,
      "out-for-delivery": 0,
      delivered: 0,
      canceled: 0,
      refunded: 0,
    };
    for (const o of orders) c[o.status]++;
    return c;
  }, [orders]);

  const [draft, setDraft] = useState<Record<string, string>>({});

  return (
    <section className="container mx-auto px-4 py-10 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">Runner Dashboard</h2>
          <p className="text-slate-600 mt-1">
            Update inventory & order statuses. Revenue auto-calculates on delivered orders.
          </p>
        </div>
        <button
          onClick={onExit}
          className="rounded-xl border px-3 py-2 text-sm flex items-center gap-2"
          title="Exit to main site"
        >
          <LogOut className="h-4 w-4" /> Exit
        </button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-slate-600">Revenue (delivered)</div>
          <div className="mt-1 text-2xl font-extrabold">{currency(revenueDelivered)}</div>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="text-slate-600">Adjustments</div>
          <div className="mt-1 text-2xl font-extrabold">{currency(adjustments)}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="rounded-xl border px-3 py-1" onClick={() => onAdjust(-5)}>– $5</button>
            <button className="rounded-xl border px-3 py-1" onClick={() => onAdjust(-1)}>– $1</button>
            <button className="rounded-xl border px-3 py-1" onClick={() => onAdjust(+1)}>+ $1</button>
            <button className="rounded-xl border px-3 py-1" onClick={() => onAdjust(+5)}>+ $5</button>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="text-slate-600">Net revenue</div>
          <div className="mt-1 text-2xl font-extrabold">{currency(netRevenue)}</div>
        </div>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2 text-sm">
        {(
          [
            ["new", counts.new],
            ["preparing", counts.preparing],
            ["out-for-delivery", counts["out-for-delivery"]],
            ["delivered", counts.delivered],
            ["canceled", counts.canceled],
            ["refunded", counts.refunded],
          ] as [OrderStatus, number][]
        ).map(([s, n]) => (
          <span key={s} className="rounded-full border bg-white px-3 py-1">
            {s} • {n}
          </span>
        ))}
      </div>

      {/* INVENTORY */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold">Inventory</div>
        <div className="p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Current</th>
                <th className="px-3 py-2">Adjust</th>
                <th className="px-3 py-2">Set exact</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td className="px-3 py-2">{stock[p.id] ?? 0}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button className="rounded-xl border px-2 py-1" onClick={() => onDecStock(p.id, 1)}><Minus className="h-4 w-4" /></button>
                      <button className="rounded-xl border px-2 py-1" onClick={() => onIncStock(p.id, 1)}><Plus className="h-4 w-4" /></button>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <input
                        className="rounded-xl border px-2 py-1 w-24"
                        placeholder="qty"
                        value={draft[p.id] ?? ""}
                        onChange={e => setDraft(d => ({ ...d, [p.id]: e.target.value }))}
                      />
                      <button
                        className="rounded-xl border px-2 py-1"
                        onClick={() => {
                          const v = Number(draft[p.id]);
                          if (Number.isFinite(v) && v >= 0) onSetStock(p.id, Math.floor(v));
                        }}
                        title="Set quantity"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-slate-500">No products.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDERS */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold">Orders</div>
        <div className="p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{o.id}</div>
                    <div className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3">
                    {o.items.map(it => (
                      <div key={it.id}>
                        {it.name} × {it.qty} — {currency(it.price)}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3 font-semibold">{currency(o.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={e => onSetStatus(o.id, e.target.value as OrderStatus)}
                      className="rounded-xl border px-2 py-1"
                    >
                      <option value="new">new</option>
                      <option value="preparing">preparing</option>
                      <option value="out-for-delivery">out-for-delivery</option>
                      <option value="delivered">delivered</option>
                      <option value="canceled">canceled</option>
                      <option value="refunded">refunded</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onMarkDelivered(o.id)}
                        className="rounded-xl px-3 py-1 text-sm border text-green-700"
                        title="Mark delivered"
                      >
                        <CheckCircle className="inline h-4 w-4 mr-1"/> Deliver
                      </button>
                      <button
                        onClick={() => onCancel(o.id)}
                        className="rounded-xl px-3 py-1 text-sm border text-slate-700"
                        title="Cancel order"
                      >
                        <XCircle className="inline h-4 w-4 mr-1"/> Cancel
                      </button>
                      <button
                        onClick={() => onRefund(o.id)}
                        className="rounded-xl px-3 py-1 text-sm border text-slate-700"
                        title="Refund order"
                      >
                        <RotateCcw className="inline h-4 w-4 mr-1"/> Refund
                      </button>
                      <button
                        onClick={() => onDelete(o.id)}
                        className="rounded-xl px-3 py-1 text-sm border text-red-700"
                        title="Delete (remove from list)"
                      >
                        <Trash2 className="inline h-4 w-4 mr-1"/> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
