import React from 'react';
import TicketList from './pages/TicketList';
import { LifeBuoy, ExternalLink, ShieldCheck } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans">
      {/* Top Application Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-extrabold text-lg shadow-md shadow-blue-500/20">
              D
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900 tracking-tight">Datastraw</span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200/60">
                  CRM
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Customer Support Desk</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Backend Connected (IST)</span>
            </div>

            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <span>API Docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 pb-16">
        <TicketList />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 py-6 text-center text-xs text-slate-400">
        <p>Datastraw Assessment Test — Support CRM System • Built with FastAPI, SQLite & React</p>
      </footer>
    </div>
  );
}

export default App;
