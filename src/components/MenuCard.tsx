import React, { useState } from "react";
import { Plus } from "lucide-react";
import { currency } from "../utils";

export default function MenuCard({
  item,
  stockLeft,
  onAdd,
}: {
  item: any;
  stockLeft: number;         // NEW
  onAdd: (item: any, selected?: any) => void;
}) {
  const [opts, setOpts] = useState<any>({});
  const disabled = stockLeft <= 0;

  function setChoice(key: string, val: string) {
    setOpts((o: any) => ({ ...o, [key]: val }));
  }

  return (
    <div className="rounded-2xl border shadow-sm hover:shadow-md transition bg-white">
      <div className="h-36 w-full overflow-hidden rounded-t-2xl bg-slate-100 relative">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-sm text-slate-500">
            No image
          </div>
        )}
        {disabled && (
          <div className="absolute inset-0 bg-white/70 grid place-items-center text-sm font-semibold text-slate-700">
            Out of stock
          </div>
        )}
      </div>

      <div className="p-4 border-t flex items-center justify-between">
        <div className="font-semibold">{item.name}</div>
        <div className="text-indigo-600 font-semibold">{currency(item.price)}</div>
      </div>

      <div className="px-4 pb-4">
        <div className="text-sm text-slate-600">{item.desc}</div>
        {!!stockLeft && (
          <div className="mt-1 text-xs text-slate-500">{stockLeft} left</div>
        )}

        {item.options?.length ? (
          <div className="mt-3 space-y-3">
            {item.options.map((op: any) => (
              <div
                key={op.key}
                className="grid grid-cols-[120px,1fr] items-center gap-2 text-sm"
              >
                <label className="text-slate-700">{op.label}</label>
                <select
                  className="rounded-xl border px-2 py-1"
                  onChange={(e) => setChoice(op.key, e.target.value)}
                  defaultValue=""
                  disabled={disabled}
                >
                  <option value="" disabled>{`Choose ${op.label.toLowerCase()}`}</option>
                  {op.choices.map((c: string) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex gap-2">
          <button
            className={`rounded-xl px-3 py-2 flex items-center gap-2 ${
              disabled ? "bg-slate-200 text-slate-500" : "bg-indigo-600 text-white"
            }`}
            disabled={disabled}
            onClick={() => onAdd(item, opts)}
          >
            <Plus className="h-4 w-4" /> {disabled ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
