// src/components/MenuCard.tsx
import React from "react";
import { Plus } from "lucide-react";
import { currency } from "../utils";

export default function MenuCard({
  item,
  onAdd,
  renderImage,
}: {
  item: any;
  onAdd: () => void;
  renderImage?: (src: string, alt: string) => React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border shadow-sm hover:shadow-md transition bg-white">
      <div className="h-36 w-full overflow-hidden rounded-t-2xl bg-slate-100">
        {renderImage ? (
          renderImage(item.image, item.name)
        ) : (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                `https://placehold.co/400x240?text=${encodeURIComponent(item.name)}`;
            }}
          />
        )}
      </div>

      <div className="p-4 border-t flex items-center justify-between">
        <div className="font-semibold">{item.name}</div>
        <div className="text-indigo-600 font-semibold">{currency(item.price)}</div>
      </div>

      {item.desc && <div className="px-4 text-sm text-slate-600">{item.desc}</div>}

      <div className="px-4 pb-4 mt-3">
        <button
          className="rounded-xl px-3 py-2 bg-indigo-600 text-white flex items-center gap-2"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" /> Add to cart
        </button>
      </div>
    </div>
  );
}
