import React, { useMemo } from "react";
import { Trash2, CheckCircle, XCircle, RotateCcw } from "lucide-react";
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

export default function AdminDashboard({
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
}: {
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

  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-extrabold">Runner Dashboard</h2>
      <p className="text-slate-600 mt-1">
        Update order statuses, manage revenue, and clean up delivered orders.
      </p>

      {/* KPIs */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
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
      <div className="mt-6 flex flex-wrap gap-2 text-sm">
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

      {/* Orders table */}
      <div className="mt-6 overflow-x-auto rounded-2xl border bg-white">
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
    </section>
  );
}
