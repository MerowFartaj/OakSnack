import React from "react";
import { LogOut, CheckCircle, Trash2 } from "lucide-react";
import { currency } from "../utils";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale);

export default function RunnerPage({
  orders,
  setOrders,
  inventory,
  setInventory,
  revenue,
  setRevenue,
  onExit,
}: {
  orders: any[];
  setOrders: (o: any[]) => void;
  inventory: Record<string, number>;
  setInventory: (inv: Record<string, number>) => void;
  revenue: number;
  setRevenue: (r: number) => void;
  onExit: () => void;
}) {
  const updateStatus = (id: string, status: string) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const deleteOrder = (id: string) => {
    setOrders(orders.filter((o) => o.id !== id));
  };

  const updateStock = (id: string, newVal: number) => {
    setInventory({ ...inventory, [id]: newVal });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Runner Page</h1>
        <button
          className="px-3 py-2 rounded-xl bg-red-500 text-white flex items-center gap-2"
          onClick={onExit}
        >
          <LogOut className="h-5 w-5" /> Exit
        </button>
      </div>

      {/* Revenue + Graph */}
      <div className="mb-8">
        <h2 className="font-semibold mb-2">
          Revenue: {currency(revenue)}
        </h2>
        <Line
          data={{
            labels: orders.map((o) => o.id),
            datasets: [
              {
                label: "Revenue Growth",
                data: orders.map((o) => o.total),
                borderColor: "rgb(99,102,241)",
                backgroundColor: "rgba(99,102,241,0.3)",
              },
            ],
          }}
        />
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            className="border rounded-lg px-3 py-1"
            placeholder="Adjust revenue"
            onBlur={(e) => setRevenue(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Inventory */}
      <div className="mb-8">
        <h2 className="font-semibold mb-2">Inventory</h2>
        <div className="space-y-2">
          {Object.keys(inventory).map((id) => (
            <div key={id} className="flex justify-between items-center border rounded-lg p-2">
              <span>{id}</span>
              <input
                type="number"
                className="border rounded px-2 py-1 w-20"
                value={inventory[id]}
                onChange={(e) => updateStock(id, Number(e.target.value))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Orders */}
      <div>
        <h2 className="font-semibold mb-2">Orders</h2>
        {orders.length === 0 && <div>No orders yet.</div>}
        {orders.map((o) => (
          <div
            key={o.id}
            className="border rounded-xl p-3 mb-3 bg-white shadow"
          >
            <div className="font-semibold">
              {o.info?.name} ({o.info?.grade}) - {currency(o.total)}
            </div>
            <div className="text-sm text-slate-600">{o.info?.location}</div>
            <div className="text-xs italic text-slate-500">
              {o.info?.notes}
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => updateStatus(o.id, "Delivered")}
                className="px-2 py-1 rounded bg-green-500 text-white flex items-center gap-1 text-sm"
              >
                <CheckCircle className="h-4 w-4" /> Delivered
              </button>
              <button
                onClick={() => deleteOrder(o.id)}
                className="px-2 py-1 rounded bg-red-500 text-white flex items-center gap-1 text-sm"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
