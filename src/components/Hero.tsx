import React from "react";
import { ShoppingCart, Bike, Clock, Shield } from "lucide-react";

export default function Hero({ onStartOrder }: { onStartOrder: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-indigo-200 blur-3xl opacity-70" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-blue-200 blur-3xl opacity-70" />
      </div>
      <div className="container mx-auto px-4 py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Skip the line. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Get your food fast.</span>
            </h1>
            <p className="mt-4 text-slate-600 max-w-xl">
              OakwoodDash is a student-run preorder + delivery service for the Student Store.
              Order during class breaks and we’ll grab it for you while you keep chilling with friends.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-xl px-4 py-2 bg-indigo-600 text-white flex items-center gap-2" onClick={onStartOrder}>
                <ShoppingCart className="h-5 w-5"/> Start an order
              </button>
              <a href="#how" className="rounded-xl px-4 py-2 border bg-white flex items-center gap-2">
                <Bike className="h-5 w-5"/> How it works
              </a>
            </div>
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
              <Shield className="h-4 w-4"/> Independent student service • On-campus only • Safe & fast
            </div>
          </div>
          <div className="md:pl-8">
            <div className="border rounded-3xl bg-white shadow-xl">
              <div className="p-4 border-b font-semibold flex items-center gap-2"><Clock className="h-5 w-5"/> Popular right now</div>
              {/* We keep this “popular” box empty for now; we’ll hook it to real data later */}
              <div className="p-4 text-sm text-slate-500">Add popular items here later.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
