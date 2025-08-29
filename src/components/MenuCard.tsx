import React, { useState } from "react";
import { Plus } from "lucide-react";
import { currency } from "../utils"; // ⬅️ we'll move helpers (like currency) into utils.ts later

export default function MenuCard({ item, onAdd }: { item: any; onAdd: (item: any, selected?: any) => void }) {
  const [opts, setOpts] = useState<any>({});

  function setChoice(key: string, val: string) {
    setOpts((o: any) => ({ ...o, [key]: val }));
  }

  return (
    <div className="rounded-2xl border shadow-sm hover:shadow-md transition bg-white">
      {/* Image */}
      <div className="h-36 w-full overflow-hidden rounded-t-2xl bg-slate-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-sm text-slate-500">No image</div>
        )}
      </div>

      {/* Name + Price */}
      <div className="p-4 border-t flex items-center justify-between">
        <div className="font-semibold">{item.name}</div>
        <div className="text-indigo-600 font-semibold">{currency(item.price)}</div>
      </div>

      {/* Description + Options */}
      <div className="px-4 pb-4">
        <div className="text-sm text-slate-600">{item.desc}</div>

        {/* Tags */}
        {item.tags && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.map((t: string) => (
              <span key={t} className="rounded-full border px-2 py-0.5 text-xs">{t}</span>
            ))}
          </div>
        )}

        {/* Options (like flavor) */}
        {item.options?.length ? (
          <div className="mt-3 space-y-3">
            {item.options.map((op: any) => (
              <div key={op.key} className="grid grid-cols-[120px,1fr] items-center gap-2 text-sm">
                <label className="text-slate-700">{op.label}</label>
                <select
                  className="rounded-xl border px-2 py-1"
                  onChange={(e) => setChoice(op.key, e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>{`Choose ${op.label.toLowerCase()}`}</option>
                  {op.choices.map((c: string) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ) : null}

        {/* Add to cart button */}
        <div className="mt-4 flex gap-2">
          <button
            className="rounded-xl px-3 py-2 bg-indigo-600 text-white flex items-center gap-2"
            onClick={() => onAdd(item, opts)}
          >
            <Plus className="h-4 w-4" /> Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
