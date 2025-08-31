import React from "react";

export default function MenuCard({
  item,
  stock,
  cartQty,
  onAdd,
}: {
  item: {
    id: string;
    name: string;
    price: number;
    desc: string;
    image: string;
  };
  stock: number;
  cartQty: number;
  onAdd: (item: any) => void;
}) {
  return (
    <div className="rounded-2xl border bg-white shadow hover:shadow-lg transition p-4 flex flex-col">
      <img
        src={item.image}
        alt={item.name}
        className="rounded-xl mb-3 w-full h-40 object-cover"
        onError={(e) => ((e.target as HTMLImageElement).src = "/products/fallback.jpg")}
      />
      <div className="font-semibold">{item.name}</div>
      <div className="text-sm text-slate-600 flex-1">{item.desc}</div>
      <div className="mt-2 flex justify-between items-center">
        <div className="font-bold">${item.price.toFixed(2)}</div>
        {stock > 0 ? (
          <button
            className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm"
            onClick={() => onAdd(item)}
          >
            {cartQty > 0 ? `+ Add (${cartQty})` : "Add"}
          </button>
        ) : (
          <div className="text-red-500 text-sm">Out of stock</div>
        )}
      </div>
    </div>
  );
}
