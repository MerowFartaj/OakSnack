// src/components/CheckoutModal.tsx
import React, { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { currency } from "../utils";

const LOCATIONS = [
  "Main Quad",
  "Library Patio",
  "Arts Building",
  "Science Building",
  "Gym Entrance",
  "Front Gate",
  "College Counseling",
];

export default function CheckoutModal({
  onClose,
  cart,
  subtotal,
  fee,
  total,
  onPlace,
}: {
  onClose: () => void;
  cart: any[];
  subtotal: number;
  fee: number;
  total: number;
  onPlace: (payload: any) => void;
}) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("9");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);

  function place() {
    if (!cart || cart.length === 0) return;
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
    setPlacing(true);
    setTimeout(() => {
      onPlace({ name, grade, email, location, notes });
      setPlacing(false);
    }, 400);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-50 w-[95%] max-w-3xl rounded-2xl bg-white shadow-xl p-6 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">Checkout</div>
          <div className="text-indigo-600 font-semibold">{currency(total)}</div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div>
            <div className="font-semibold mb-2">Delivery details</div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="rounded-xl border px-3 py-2"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <select
                  className="rounded-xl border px-3 py-2"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  {["9", "10", "11", "12"].map((g) => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </select>
              </div>

              <input
                className="rounded-xl border px-3 py-2 w-full"
                placeholder="Email (optional, for status lookup)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-2 items-center">
                <label className="text-sm">Delivery spot</label>
                <select
                  className="rounded-xl border px-3 py-2"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                className="rounded-xl border px-3 py-2 w-full"
                placeholder="Notes (allergies, extra sauce, etc.)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="font-semibold mb-2">Order summary</div>
            <div className="space-y-3">
              <div className="rounded-xl border bg-white divide-y">
                {cart.map((line: any) => (
                  <div
                    key={line.key}
                    className="p-3 text-sm flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="font-medium">
                        {line.name}{" "}
                        <span className="text-slate-500">×{line.qty}</span>
                      </div>
                    </div>
                    <div className="text-slate-700">
                      {currency(line.price * line.qty)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <span>{currency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Service fee</span>
                <span>{currency(fee)}</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-base">
                <span>Total</span>
                <span>{currency(total)}</span>
              </div>

              <button
                className={`w-full rounded-xl px-3 py-2 flex items-center gap-2 justify-center ${
                  placing ? "bg-slate-300 text-slate-600" : "bg-indigo-600 text-white"
                }`}
                disabled={placing}
                onClick={place}
              >
                {placing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                {placing ? "Placing…" : "Place order"}
              </button>
              <button
                className="w-full rounded-xl px-3 py-2 border"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
