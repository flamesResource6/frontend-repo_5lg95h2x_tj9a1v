import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_BACKEND_URL || "";

function Select({ label, value, onChange, options, placeholder }) {
  return (
    <label className="block text-sm text-blue-200/80">
      <span className="mb-1 block">{label}</span>
      <select
        className="w-full rounded-lg bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder || "Välj..."}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberInput({ label, value, onChange, min = 0, step = 1 }) {
  return (
    <label className="block text-sm text-blue-200/80">
      <span className="mb-1 block">{label}</span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      />
    </label>
  );
}

export default function OrderForm({ onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [installers, setInstallers] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [installerId, setInstallerId] = useState("");
  const [status, setStatus] = useState("ny");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState([
    { material_id: "", quantity: 1, unit_price: "" },
  ]);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [c, i, m] = await Promise.all([
          fetch(`${API}/customers`).then((r) => r.json()),
          fetch(`${API}/installers`).then((r) => r.json()),
          fetch(`${API}/materials`).then((r) => r.json()),
        ]);
        setCustomers(c);
        setInstallers(i);
        setMaterials(m);
      } catch (e) {
        setMsg("Kunde inte hämta data");
      }
    };
    load();
  }, []);

  const addItem = () => setItems((prev) => [...prev, { material_id: "", quantity: 1, unit_price: "" }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateItem = (idx, key, value) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  };

  const total = useMemo(() => {
    return items.reduce((sum, it) => {
      const qty = Number(it.quantity || 0);
      let price = it.unit_price !== "" ? Number(it.unit_price) : 0;
      if (it.material_id && it.unit_price === "") {
        const mat = materials.find((m) => m.id === it.material_id);
        price = mat ? Number(mat.price) : 0;
      }
      return sum + qty * price;
    }, 0);
  }, [items, materials]);

  const submit = async () => {
    if (!customerId || items.some((it) => !it.material_id || Number(it.quantity) <= 0)) {
      setMsg("Fyll i kund och minst en giltig orderrad");
      return;
    }
    try {
      setBusy(true);
      setMsg("");
      const payload = {
        customer_id: customerId,
        installer_id: installerId || undefined,
        status,
        notes: notes || undefined,
        items: items.map((it) => ({
          material_id: it.material_id,
          quantity: Number(it.quantity),
          unit_price: it.unit_price !== "" ? Number(it.unit_price) : undefined,
        })),
      };
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Kunde inte skapa order");
      setMsg(`Order skapad ✅ Totalt: ${data.total} kr`);
      setItems([{ material_id: "", quantity: 1, unit_price: "" }]);
      setCustomerId("");
      setInstallerId("");
      setStatus("ny");
      setNotes("");
      onCreated?.();
    } catch (e) {
      setMsg(e.message || "Fel vid skapande");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-slate-800/60 border border-blue-500/10 rounded-xl p-4 space-y-4">
      <div className="text-white font-semibold text-lg">Ny order</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Select
          label="Kund"
          value={customerId}
          onChange={setCustomerId}
          options={customers.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Välj kund"
        />
        <Select
          label="Montör (valfritt)"
          value={installerId}
          onChange={setInstallerId}
          options={installers.map((i) => ({ value: i.id, label: i.name }))}
          placeholder="Välj montör"
        />
        <Select
          label="Status"
          value={status}
          onChange={setStatus}
          options={["ny", "planerad", "pågår", "klar", "fakturerad"].map((s) => ({ value: s, label: s }))}
        />
      </div>

      <div className="space-y-3">
        {items.map((it, idx) => {
          const matOptions = materials.map((m) => ({ value: m.id, label: `${m.name} (${m.price} kr/${m.unit})` }));
          return (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-8 gap-2 items-end">
              <div className="md:col-span-4">
                <Select
                  label="Material"
                  value={it.material_id}
                  onChange={(v) => updateItem(idx, "material_id", v)}
                  options={matOptions}
                  placeholder="Välj material"
                />
              </div>
              <div className="md:col-span-2">
                <NumberInput
                  label="Antal"
                  value={it.quantity}
                  onChange={(v) => updateItem(idx, "quantity", v)}
                  min={0}
                  step={0.5}
                />
              </div>
              <div className="md:col-span-2">
                <NumberInput
                  label="Pris (valfritt)"
                  value={it.unit_price}
                  onChange={(v) => updateItem(idx, "unit_price", v)}
                  min={0}
                  step={1}
                />
              </div>
              <div className="md:col-span-8 flex items-center justify-between text-blue-200/80 text-sm">
                <div>
                  Radtotal: {(() => {
                    const qty = Number(it.quantity || 0);
                    const price = it.unit_price !== "" ? Number(it.unit_price) : (materials.find((m) => m.id === it.material_id)?.price || 0);
                    return (qty * price).toFixed(2);
                  })()} kr
                </div>
                <button
                  onClick={() => removeItem(idx)}
                  className="px-3 py-1 rounded bg-red-600/60 hover:bg-red-600 text-white"
                >
                  Ta bort rad
                </button>
              </div>
            </div>
          );
        })}
        <button
          onClick={addItem}
          className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
        >
          Lägg till rad
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-blue-200">Totalt: <span className="text-white font-semibold">{total.toFixed(2)} kr</span></div>
        <button
          disabled={!customerId || busy}
          onClick={submit}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
        >
          Spara order
        </button>
      </div>

      {msg && (
        <div className="bg-slate-900/60 border border-blue-500/10 rounded p-3 text-blue-200">{msg}</div>
      )}
    </div>
  );
}
