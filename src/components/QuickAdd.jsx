import { useState } from "react";

const API = import.meta.env.VITE_BACKEND_URL || "";

function TextInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block text-sm text-blue-200/80">
      <span className="mb-1 block">{label}</span>
      <input
        type={type}
        className="w-full rounded-lg bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-blue-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export default function QuickAdd({ onCreated }) {
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPhone, setCPhone] = useState("");

  const [iName, setIName] = useState("");
  const [iEmail, setIEmail] = useState("");
  const [iPhone, setIPhone] = useState("");

  const [mSku, setMSku] = useState("");
  const [mName, setMName] = useState("");
  const [mPrice, setMPrice] = useState("");
  const [mUnit, setMUnit] = useState("st");
  const [mStock, setMStock] = useState("");

  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (url, body, success) => {
    try {
      setBusy(true);
      setMsg("");
      const res = await fetch(`${API}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Något gick fel");
      setMsg(success);
      onCreated?.();
    } catch (e) {
      setMsg(e.message || "Fel vid skapande");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-slate-800/60 border border-blue-500/10 rounded-xl p-4 space-y-3">
        <div className="text-white font-semibold">Ny kund</div>
        <TextInput label="Namn" value={cName} onChange={setCName} placeholder="Anna Andersson" />
        <TextInput label="E-post" value={cEmail} onChange={setCEmail} placeholder="anna@example.com" />
        <TextInput label="Telefon" value={cPhone} onChange={setCPhone} placeholder="070-123 45 67" />
        <button
          disabled={!cName || busy}
          onClick={() => submit("/customers", { name: cName, email: cEmail || undefined, phone: cPhone || undefined }, "Kund skapad ✅")}
          className="w-full px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
        >
          Spara kund
        </button>
      </div>

      <div className="bg-slate-800/60 border border-blue-500/10 rounded-xl p-4 space-y-3">
        <div className="text-white font-semibold">Ny montör</div>
        <TextInput label="Namn" value={iName} onChange={setIName} placeholder="Montör Namn" />
        <TextInput label="E-post" value={iEmail} onChange={setIEmail} placeholder="montor@example.com" />
        <TextInput label="Telefon" value={iPhone} onChange={setIPhone} placeholder="070-987 65 43" />
        <button
          disabled={!iName || busy}
          onClick={() => submit("/installers", { name: iName, email: iEmail || undefined, phone: iPhone || undefined }, "Montör skapad ✅")}
          className="w-full px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
        >
          Spara montör
        </button>
      </div>

      <div className="bg-slate-800/60 border border-blue-500/10 rounded-xl p-4 space-y-3">
        <div className="text-white font-semibold">Nytt material</div>
        <TextInput label="Artikelnummer (SKU)" value={mSku} onChange={setMSku} placeholder="MAT-001" />
        <TextInput label="Namn" value={mName} onChange={setMName} placeholder="Golvpaket" />
        <div className="grid grid-cols-3 gap-2">
          <TextInput label="Pris" type="number" value={mPrice} onChange={setMPrice} placeholder="199" />
          <TextInput label="Enhet" value={mUnit} onChange={setMUnit} placeholder="st" />
          <TextInput label="Lager" type="number" value={mStock} onChange={setMStock} placeholder="0" />
        </div>
        <button
          disabled={!mSku || !mName || busy}
          onClick={() => submit(
            "/materials",
            {
              sku: mSku,
              name: mName,
              price: mPrice ? Number(mPrice) : 0,
              unit: mUnit || "st",
              stock: mStock ? Number(mStock) : 0,
            },
            "Material skapat ✅"
          )}
          className="w-full px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
        >
          Spara material
        </button>
      </div>

      {msg && (
        <div className="md:col-span-3 bg-slate-800/60 border border-blue-500/10 rounded-xl p-3 text-blue-200">
          {msg}
        </div>
      )}
    </div>
  );
}
