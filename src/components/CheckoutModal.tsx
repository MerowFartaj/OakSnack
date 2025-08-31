import React, { useState } from "react";
import { X, Bike } from "lucide-react";
import { currency } from "../utils";

export default function CheckoutModal({
  cart,
  subtotal,
  total,
  onClose,
  onConfirm,
}: {
  cart: any[];
  subtotal: number;
  total: number;
  onClose: () => void;
  onConfirm: (info: any) => void;
}) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    if (!name || !grade || !location) {
      alert("Please fill out all required fields.");
      return;
    }
    onConfirm({ name, grade, location, notes });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
        <button
          className="absolute top-3 right-3 text-slate-500"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold mb-4">Checkout</h2>

        <div className="space-y-3">
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="w-full border rounded-lg px-3 py-2"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          >
            <option value="">Select grade</option>
            <option>6th</option>
            <option>7th</option>
            <option>8th</option>
            <option>9th</option>
            <option>10th</option>
            <option>11th</option>
            <option>12th</option>
          </select>

          <select
            className="w-full border rounded-lg px-3 py-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Delivery location</option>
            <option>Main quad</option>
            <option>Cafeteria</option>
            <option>Gym</option>
            <option>Library</option>
          </select>

          <textarea
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Special instructions (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="text-sm text-slate-600">
            Subtotal: {currency(subtotal)} • Total:{" "}
            <span className="font-semibold">{currency(total)}</span>
          </div>
        </div>

        <button
          className="mt-4 w-full py-2 rounded-xl bg-indigo-600 text-white flex items-center justify-center gap-2"
          onClick={handleConfirm}
        >
          <Bike className="h-5 w-5" /> Confirm Order
        </button>
      </div>
    </div>
  );
}
