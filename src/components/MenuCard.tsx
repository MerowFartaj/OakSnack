// src/components/MenuCard.tsx
import React from "react";
import { Plus } from "lucide-react";
import { currency } from "../utils";

export type Item = {
  id: string;
  name: string;
  price: number;
  category: "snacks" | "drinks" | "featured" | string;
  desc?: string;
  image?: string;
  tags?: string[];
};

export default function MenuCard({
  item,
  stock,
  cartQty,
  onAdd,
}: {
  item: Item;
  stock: number;
  cartQty: number;
  onAdd: (item: Item) => void;
}) {
  const out = stock <= 0;

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <div className="aspect-[16/9] bg-slate-100">
        <img
          src={item.image || ""}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="font-semibold">{item.name}</div>
          <div className="font-semibold text-indigo-600">{currency(item.price)}</div>
        </div>
        {item.desc && <div className="text-sm text-slate-600 mt-1">{item.desc}</div>}
        <div className="text-xs text-slate-500 mt-1">
          {out ? "Out of stock" : `${stock} left`}
          {cartQty > 0 && !out ? <span className="ml-2">• In cart: {cartQty}</span> : null}
        </div>

        <div className="mt-3">
          <button
            disabled={out}
            onClick={() => onAdd(item)}
            className={`w-full rounded-xl px-3 py-2 flex items-center justify-center gap-2 ${
              out ? "bg-slate-200 text-slate-500" : "bg-indigo-600 text-white"
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
