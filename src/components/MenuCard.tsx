// src/components/MenuCard.tsx
import React from "react";
import { Plus } from "lucide-react";
import { currency } from "../utils";

export type Item = {
  id: string;
  name: string;
  price: number;
  category: string;
  desc: string;
  image: string;     // e.g. "/products/cheetos.jpg"
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
  onAdd: (selected?: any) => void;
}) {
  // Build a safe URL that works in dev/prod even if the app is served from a subpath
  const imgSrc =
    item.image.startsWith("http")
      ? item.image
      : `${import.meta.env.BASE_URL}${item.image.replace(/^\//, "")}`;

  const remaining = Math.max(0, stock - cartQty);
  const out = remaining <= 0;

  return (
    <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
      <div className="h-40 w-full overflow-hidden bg-slate-100 grid place-items-center">
        <img
          src={imgSrc}
          alt={item.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            // last-resort fallback so you never see a "?"
            (e.currentTarget as HTMLImageElement).src =
              `${import.meta.env.BASE_URL}products/cheetos.jpg`;
          }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold">{item.name}</div>
            <div className="text-sm text-slate-600">{item.desc}</div>
            <div className="text-xs text-slate-500 mt-1">
              {out ? "Out of stock" : `${remaining} left`}
            </div>
          </div>
          <div className="font-semibold text-indigo-600">
            {currency(item.price)}
          </div>
        </div>

        <button
          disabled={out}
          onClick={() => onAdd()}
          className={`mt-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 ${
            out ? "bg-slate-200 text-slate-500" : "bg-indigo-600 text-white"
          }`}
        >
          <Plus className="h-4 w-4" />
          {out ? "Unavailable" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
