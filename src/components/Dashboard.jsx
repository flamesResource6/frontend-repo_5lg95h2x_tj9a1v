import { useEffect, useMemo, useState } from "react";
import QuickAdd from "./QuickAdd";
import OrderForm from "./OrderForm";

const API = import.meta.env.VITE_BACKEND_URL || "";

function Section({ title, children, action }) {
  return (
    <div className="bg-slate-800/60 border border-blue-500/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-lg">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [installers, setInstallers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      const [c, i, m, o] = await Promise.all([
        fetch(`${API}/customers`).then((r) => r.json()),
        fetch(`${API}/installers`).then((r) => r.json()),
        fetch(`${API}/materials`).then((r) => r.json()),
        fetch(`${API}/orders`).then((r) => r.json()),
      ]);
      setCustomers(c);
      setInstallers(i);
      setMaterials(m);
      setOrders(o);
    } catch (e) {
      setError("Kunde inte hämta data från servern");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + (o.total || 0), 0),
    [orders]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Hantverkar Dashboard</h1>
            <p className="text-blue-200/70">Hantera ordrar, material, montörer och kunder</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowOrderForm((v) => !v)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
            >
              {showOrderForm ? "Stäng orderformulär" : "Ny order"}
            </button>
            <button
              onClick={() => setShowQuickAdd((v) => !v)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
            >
              {showQuickAdd ? "Stäng snabbskapa" : "Snabbskapa"}
            </button>
            <button
              onClick={fetchAll}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Uppdatera
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-300 border border-red-500/20 p-3 rounded-lg">
            {error}
          </div>
        )}

        {showOrderForm && (
          <Section title="Skapa ny order">
            <OrderForm onCreated={fetchAll} />
          </Section>
        )}

        {showQuickAdd && (
          <Section title="Snabbskapa kund, montör och material">
            <QuickAdd onCreated={fetchAll} />
          </Section>
        )}

        {loading ? (
          <div className="text-blue-300">Laddar...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/60 border border-blue-500/10 rounded-xl p-4">
                <div className="text-blue-300 text-sm">Kunder</div>
                <div className="text-2xl text-white font-semibold">{customers.length}</div>
              </div>
              <div className="bg-slate-800/60 border border-blue-500/10 rounded-xl p-4">
                <div className="text-blue-300 text-sm">Montörer</div>
                <div className="text-2xl text-white font-semibold">{installers.length}</div>
              </div>
              <div className="bg-slate-800/60 border border-blue-500/10 rounded-xl p-4">
                <div className="text-blue-300 text-sm">Material</div>
                <div className="text-2xl text-white font-semibold">{materials.length}</div>
              </div>
              <div className="bg-slate-800/60 border border-blue-500/10 rounded-xl p-4">
                <div className="text-blue-300 text-sm">Intäkter (SEK)</div>
                <div className="text-2xl text-white font-semibold">{totalRevenue.toFixed(2)}</div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <Section title="Senaste ordrar">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-blue-300/80">
                        <th className="text-left font-medium py-2 pr-3">Order</th>
                        <th className="text-left font-medium py-2 pr-3">Kund</th>
                        <th className="text-left font-medium py-2 pr-3">Montör</th>
                        <th className="text-left font-medium py-2 pr-3">Status</th>
                        <th className="text-right font-medium py-2 pl-3">Belopp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 8).map((o) => (
                        <tr key={o.id} className="border-t border-slate-700/50 text-blue-100">
                          <td className="py-2 pr-3">{o.id?.slice(-6)}</td>
                          <td className="py-2 pr-3">{o.customer_name || o.customer_id}</td>
                          <td className="py-2 pr-3">{o.installer_name || "-"}</td>
                          <td className="py-2 pr-3">
                            <span className="px-2 py-1 rounded bg-slate-700/70 text-xs">
                              {o.status}
                            </span>
                          </td>
                          <td className="py-2 pl-3 text-right">{(o.total || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section title="Kunder">
                <ul className="divide-y divide-slate-700/50">
                  {customers.slice(0, 6).map((c) => (
                    <li key={c.id} className="py-2 text-blue-100">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-blue-300/70">{c.company || c.email || c.phone}</div>
                    </li>
                  ))}
                </ul>
              </Section>
            </div>

            <div className="md:col-span-2 space-y-4">
              <Section title="Material">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {materials.slice(0, 8).map((m) => (
                    <div key={m.id} className="p-3 rounded-lg bg-slate-800/60 border border-blue-500/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{m.name}</div>
                          <div className="text-xs text-blue-300/70">SKU: {m.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-blue-200">{m.price} kr/{m.unit}</div>
                          <div className="text-xs text-blue-300/70">Lager: {m.stock}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Montörer">
                <ul className="divide-y divide-slate-700/50">
                  {installers.slice(0, 6).map((i) => (
                    <li key={i.id} className="py-2 text-blue-100 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{i.name}</div>
                        <div className="text-sm text-blue-300/70">{i.skills?.join(", ")}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${i.active ? "bg-emerald-600/30 text-emerald-300" : "bg-slate-700 text-slate-300"}`}>
                        {i.active ? "Aktiv" : "Inaktiv"}
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
