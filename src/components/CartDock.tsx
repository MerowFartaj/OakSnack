import React from "react";
import { ShoppingCart, Minus, Plus, Trash2, Bike } from "lucide-react";
import { currency } from "../utils";

type Line = {
  key: string;
  name: string;
  price: number;
  qty: number;
  options?: Record<string, string>;
};

export default function CartDock({
  cart,
  subtotal,
  fee,
  total,
  onQty,
  onRemove,
  onCheckout,
}: {
  cart: Line[];
  subtotal: number;
  fee: number;
  total: number;
  onQty: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
  onCheckout: () => void;
}) {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white shadow-xl">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Your Cart
              </div>
              <div className="text-sm text-slate-600">
                Subtotal: <span className="font-semibold">{currency(subtotal)}</span> • Service: {currency(fee)} •{" "}
                <span className="font-semibold">Total: {currency(total)}</span>
              </div>
            </div>

            <div className="mt-3 divide-y">
              {(!cart || cart.length === 0) ? (
                <div className="text-sm text-slate-500 py-3">Cart is empty. Add something tasty 👀</div>
              ) : cart.map((line) => (
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
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="w-8 text-center">{line.qty}</div>
                    <button className="rounded-lg border px-2 py-1" onClick={() => onQty(line.key, +1)}>
                      <Plus className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg px-2 py-1" onClick={() => onRemove(line.key)}>
                      <Trash2 className="h-4 w-4 text-slate-500" />
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
                <Bike className="h-4 w-4" /> Checkout & Deliver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
