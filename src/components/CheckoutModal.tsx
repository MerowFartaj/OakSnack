// src/components/CheckoutModal.tsx
import React from "react";
import { currency } from "../utils";

export default function CheckoutModal({
  open,
  subtotal,
  fee,
  total,
  defaultSlot = "High School Lunch",
  onClose,
  onConfirm,
}: {
  open: boolean;
  subtotal: number;
  fee: number;
  total: number;
  defaultSlot?: string;
  onClose: () => void;
  onConfirm: (form: {
    name: string;
    grade: string;
    slot: string;
    location: string;
  }) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5">
        <div className="text-lg font-semibold">Checkout & Deliver</div>

        <form
          className="mt-4 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget as HTMLFormElement);
            onConfirm({
              name: String(fd.get("name") || ""),
              grade: String(fd.get("grade") || ""),
              slot: String(fd.get("slot") || defaultSlot),
              location: String(fd.get("location") || ""),
            });
          }}
        >
          <input
            name="name"
            className="rounded-xl border p-2"
            placeholder="Your name"
            required
          />
          <input
            name="grade"
            className="rounded-xl border p-2"
            placeholder="Grade (e.g. 10)"
            required
          />
          <input
            name="slot"
            className="rounded-xl border p-2"
            defaultValue={defaultSlot}
            placeholder="Time slot"
            required
          />
          <input
            name="location"
            className="rounded-xl border p-2"
            placeholder="Meet location (e.g. Main Quad)"
            required
          />

          <div className="flex items-center justify-between mt-2 text-sm text-slate-600">
            <div>
              Subtotal: <strong>{currency(subtotal)}</strong>
            </div>
            <div>Service: {currency(fee)}</div>
            <div>
              Total: <strong>{currency(total)}</strong>
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-3 py-2"
            >
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-indigo-600 text-white px-3 py-2">
              Confirm order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
