import React, { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { currency } from "../utils";

export default function CheckoutModal({
  onClose,
  cart,
  subtotal,
  fee,
  total,
  onPlace,
  slots,
  locations,
}: {
  onClose: () => void;
  cart: any[];
  subtotal: number;
  fee: number;
  total: number;
  onPlace: (payload: any) => void;
  slots: { id: string; label: string }[];
  locations: string[];
}) {
  const [slotId, setSlotId] = useState(slots[0]?.id || "HS_LUNCH");
  const [customTime, setCustomTime] = useState("");
  const [location, setLocation] = useState(locations[0] || "");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("9");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState("Cash");
  const [placing, setPlacing] = useState(false);

  function place() {
    if (!cart || cart.length === 0) return;
    if (!name.trim()) { alert("Please enter your name"); return; }
    setPlacing(true);
    setTimeout(() => {
      onPlace({
        slot: { id: slotId, label: (slots.find(s=>s.id===slotId)?.label || slotId), time: slotId==="CUSTOM"?customTime:undefined },
        location,
        customer: { name, grade, email },
        notes,
        payment,
      });
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
                <input className="rounded-xl border px-3 py-2" placeholder="Full name" value={name} onChange={(e)=>setName(e.target.value)} />
                <select className="rounded-xl border px-3 py-2" value={grade} onChange={(e)=>setGrade(e.target.value)}>
                  {["9","10","11","12"].map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </div>
              <input className="rounded-xl border px-3 py-2 w-full" placeholder="Email (for status lookup)" value={email} onChange={(e)=>setEmail(e.target.value)} />
              <div className="grid grid-cols-2 gap-2 items-center">
                <label className="text-sm">Delivery spot</label>
                <select className="rounded-xl border px-3 py-2" value={location} onChange={(e)=>setLocation(e.target.value)}>
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 items-center">
                <label className="text-sm">Time slot</label>
                <select className="rounded-xl border px-3 py-2" value={slotId} onChange={(e)=>setSlotId(e.target.value)}>
                  {slots.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              {slotId === "CUSTOM" && (
                <div className="grid grid-cols-2 gap-2 items-center">
                  <label className="text-sm">Custom time</label>
                  <input className="rounded-xl border px-3 py-2" type="time" value={customTime} onChange={(e)=>setCustomTime(e.target.value)} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 items-center">
                <label className="text-sm">Pay with</label>
                <select className="rounded-xl border px-3 py-2" value={payment} onChange={(e)=>setPayment(e.target.value)}>
                  {["Cash","Apple Pay (in-person)","Venmo"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <textarea className="rounded-xl border px-3 py-2 w-full" placeholder="Notes (allergies, extra sauce, etc.)" value={notes} onChange={(e)=>setNotes(e.target.value)} />
              <div className="text-[11px] text-slate-500">Student-run service. On-campus delivery only.</div>
            </div>
          </div>

          <div>
            <div className="font-semibold mb-2">Order summary</div>
            <div className="space-y-3">
              <div className="rounded-xl border bg-white divide-y">
                {cart.map((line: any) => (
                  <div key={line.key} className="p-3 text-sm flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{line.name} <span className="text-slate-500">×{line.qty}</span></div>
                      {line.options && Object.keys(line.options).length>0 && (
                        <div className="text-xs text-slate-500">
                          {Object.entries(line.options).map(([k,v]) => `${k}: ${v}`).join(" • ")}
                        </div>
                      )}
                    </div>
                    <div className="text-slate-700">{currency(line.price * line.qty)}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm"><span>Subtotal</span><span>{currency(subtotal)}</span></div>
              <div className="flex items-center justify-between text-sm"><span>Service fee</span><span>{currency(fee)}</span></div>
              <div className="flex items-center justify-between font-semibold text-base"><span>Total</span><span>{currency(total)}</span></div>
              <button className={`w-full rounded-xl px-3 py-2 flex items-center gap-2 justify-center ${placing?'bg-slate-300 text-slate-600':'bg-indigo-600 text-white'}`} disabled={placing} onClick={place}>
                {placing ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle className="h-4 w-4"/>}
                {placing ? "Placing…" : "Place order"}
              </button>
              <button className="w-full rounded-xl px-3 py-2 border" onClick={onClose}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
