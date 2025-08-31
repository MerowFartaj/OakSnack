// src/components/CheckoutModal.tsx
import React, { useState } from "react";
import { currency } from "../utils";

export default function CheckoutModal({
  open,
  onClose,
  subtotal,
  fee,
  total,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  subtotal: number;
  fee: number;
  total: number;
  onConfirm: (info: { name: string; grade: string; slot: string; location: string }) => void;
}) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [slot] = useState("High School Lunch"); // fixed for now
  const [location, setLocation] = useState("");

  if (!open) return null;

  function confirm() {
    if (!name.trim() || !grade.trim() || !location.trim()) {
      alert("Please fill your name, grade, and meet location.");
      return;
    }
    onConfirm({ name: name.trim(), grade: grade.trim(), slot, location: location.trim() });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
        <div className="text-xl font-semibold">Checkout &amp; Deliver</div>

        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-xl border px-3 py-2"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full rounded-xl border px-3 py-2"
            placeholder="Grade (e.g. 10)"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          />
          <input
            disabled
            className="w-full rounded-xl border px-3 py-2 bg-slate-100"
            value={slot}
          />
          <select
            className="w-full rounded-xl border px-3 py-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Meet location…</option>
            <option>Main Quad</option>
            <option>Library Patio</option>
            <option>Arts Building</option>
            <option>Science Building</option>
            <option>Gym Entrance</option>
            <option>Front Gate</option>
            <option>College Counseling</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <div>
            Subtotal: <span className="font-semibold">{currency(subtotal)}</span>
          </div>
          <div>
            Service: <span className="font-semibold">{currency(fee)}</span>
          </div>
          <div>
            Total: <span className="font-semibold">{currency(total)}</span>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded-xl border px-3 py-2" onClick={onClose}>
            Cancel
          </button>
          <button className="rounded-xl bg-indigo-600 px-4 py-2 text-white" onClick={confirm}>
            Confirm order
          </button>
        </div>
      </div>
    </div>
  );
}
