import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultSettings, sampleCustomers, type Customer, type SavedMessage, type Settings } from "./sample-data";

type Store = {
  customers: Customer[];
  setCustomers: (c: Customer[]) => void;
  messages: SavedMessage[];
  addMessage: (m: SavedMessage) => void;
  updateMessage: (id: string, patch: Partial<SavedMessage>) => void;
  settings: Settings;
  setSettings: (s: Settings) => void;
  lastUpload: string | null;
  markUploaded: () => void;
};

const Ctx = createContext<Store | null>(null);

const KEY = "rebot-v1";

type Persisted = {
  customers?: Customer[];
  messages?: SavedMessage[];
  settings?: Settings;
  lastUpload?: string | null;
};

function load(): Persisted {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Persisted) : {};
  } catch {
    return {};
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [lastUpload, setLastUpload] = useState<string | null>(null);

  useEffect(() => {
    const p = load();
    if (p.customers) setCustomers(p.customers);
    if (p.messages) setMessages(p.messages);
    if (p.settings) setSettings(p.settings);
    if (p.lastUpload !== undefined) setLastUpload(p.lastUpload ?? null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ customers, messages, settings, lastUpload }),
    );
  }, [hydrated, customers, messages, settings, lastUpload]);

  const value = useMemo<Store>(
    () => ({
      customers,
      setCustomers,
      messages,
      addMessage: (m) => setMessages((prev) => [m, ...prev]),
      updateMessage: (id, patch) =>
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m))),
      settings,
      setSettings,
      lastUpload,
      markUploaded: () => setLastUpload(new Date().toISOString()),
    }),
    [customers, messages, settings, lastUpload],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used within StoreProvider");
  return v;
}
