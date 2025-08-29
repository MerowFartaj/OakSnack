import React from "react";
import { ShoppingCart, LogIn } from "lucide-react";

function Header({
  cartCount,
  onOpenCheckout,
  runnerMode,
  onRunnerToggle,
  onRunnerAuth,
  pinPrompt,
  setPinPrompt
}: any) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-slate-200/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-inner grid place-items-center text-white font-bold">
            OD
          </div>
          <div>
            <div className="font-extrabold text-lg leading-5">OakwoodDash</div>
            <div className="text-xs text-slate-500 -mt-0.5">
              Student Store Delivery — by students, for students
            </div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a
            href="#menu"
            className="hover:text-indigo-600"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Menu
          </a>
          <a href="#status" className="hover:text-indigo-600">
            Status
          </a>
          <a href="#how" className="hover:text-indigo-600">
            How it works
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <input
              className="rounded-xl border px-2 py-1 text-sm"
              placeholder="Runner PIN"
              value={pinPrompt}
              onChange={(e) => setPinPrompt(e.target.value)}
            />
            <button
              className="rounded-xl border px-3 py-1 text-sm"
              onClick={() => onRunnerAuth(pinPrompt)}
            >
              <LogIn className="h-4 w-4 inline mr-1" />
              Enter
            </button>
          </div>
          <button
            onClick={onOpenCheckout}
            className="rounded-xl px-3 py-2 bg-indigo-600 text-white flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart
            {cartCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-indigo-50 px-2 text-xs text-indigo-700">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
