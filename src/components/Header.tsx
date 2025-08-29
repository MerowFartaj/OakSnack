// ===============================
// HEADER
// ===============================
function Header({ cartCount, onOpenCheckout, runnerMode, onRunnerToggle, onRunnerAuth, pinPrompt, setPinPrompt }: any) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-slate-200/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-inner grid place-items-center text-white font-bold">OD</div>
          <div>
            <div className="font-extrabold text-lg leading-5">OakwoodDash</div>
            <div className="text-xs text-slate-500 -mt-0.5">Student Store Delivery — by students, for students</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a
            href="#menu"
            className="hover:text-indigo-600"
            onClick={(e)=>{ e.preventDefault(); document.getElementById('menu')?.scrollIntoView({behavior:'smooth'}); }}
          >
            Menu
          </a>
          <a href="#status" className="hover:text-indigo-600">Status</a>
          <a href="#how" className="hover:text-indigo-600">How it works</a>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <input className="rounded-xl border px-2 py-1 text-sm" placeholder="Runner PIN" value={pinPrompt} onChange={(e)=>setPinPrompt(e.target.value)} />
            <button className="rounded-xl border px-3 py-1 text-sm" onClick={()=>onRunnerAuth(pinPrompt)}><LogIn className="h-4 w-4 inline mr-1"/>Enter</button>
          </div>
          <button onClick={onOpenCheckout} className="rounded-xl px-3 py-2 bg-indigo-600 text-white flex items-center gap-2">
            <ShoppingCart className="h-4 w-4"/>
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

// ===============================
// HERO
// ===============================
function Hero({ onStartOrder }: { onStartOrder: () => void }) {
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
              <button className="rounded-xl px-4 py-2 bg-indigo-600 text-white flex items-center gap-2" onClick={onStartOrder}><ShoppingCart className="h-5 w-5"/> Start an order</button>
              <a href="#how" className="rounded-xl px-4 py-2 border bg-white flex items-center gap-2"><Bike className="h-5 w-5"/> How it works</a>
            </div>
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
              <Shield className="h-4 w-4"/> Independent student service • On-campus only • Safe & fast
            </div>
          </div>
          <div className="md:pl-8">
            <div className="border rounded-3xl bg-white shadow-xl">
              <div className="p-4 border-b font-semibold flex items-center gap-2"><Clock className="h-5 w-5"/> Popular right now</div>
              <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                {MENU.slice(0,4).map((m) => (
                  <div key={m.id} className="p-3 rounded-2xl border bg-white hover:shadow-md transition">
                    <div className="h-28 w-full overflow-hidden rounded-xl bg-slate-100 mb-2">
                      {m.image ? (
                        <img src={m.image} alt={m.name} loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-xs text-slate-500">No image</div>
                      )}
                    </div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-slate-500">{currency(m.price)}</div>
                    <div className="mt-1 flex gap-1 flex-wrap">
                      {(m.tags||[]).map((t: string) => (
                        <span key={t} className="rounded-full border px-2 py-0.5 text-xs">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4 text-xs text-slate-500">Heads up: limited slots per break to keep it real. Order early!</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
