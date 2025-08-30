// src/components/MenuCard.tsx
import React from "react";
import { Plus } from "lucide-react";
import { currency } from "../utils";

type Item = {
  id: string;
  name: string;
  price: number;
  desc?: string;
  image?: string;
};

export default function MenuCard({
  item,
  stock,
  cartQty,
  onAdd,
}: {
  item: Item;
  /** current inventory for this item (number or Infinity) */
  stock: number;
  /** qty for this item currently in cart */
  cartQty: number;
  /** add handler (item plus optional selected options) */
  onAdd: (item: Item, selected?: any) => void;
}) {
  const remaining = Number.isFinite(stock) ? Math.max(stock - cartQty, 0) : Infinity;
  const canAdd = remaining > 0;

  const src =
    item.image
      ? (item.image.startsWith("/") ? item.image : `/products/${item.image}`)
      : "/products/placeholder.jpg"; // fallback (optional)

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <div className="aspect-[16/9] bg-slate-100">
        <img
          src={src}
          alt={item.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="font-semibold">{item.name}</div>
          <div className="text-indigo-700 font-semibold">{currency(item.price)}</div>
        </div>
        {item.desc && <div className="text-sm text-slate-600 mt-1">{item.desc}</div>}

        <div className="mt-2 text-xs text-slate-500">
          {Number.isFinite(stock) ? (
            remaining > 0 ? <span>{remaining} left</span> : <span className="text-rose-600">Out of stock</span>
          ) : (
            <span>In stock</span>
          )}
        </div>

        <div className="mt-3">
          <button
            disabled={!canAdd}
            onClick={() => onAdd(item)}
            className={`rounded-xl px-3 py-2 flex items-center gap-2 ${
              canAdd ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Plus className="h-4 w-4" />
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
