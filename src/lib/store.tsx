"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export const MAX_COMPARE = 3;

type Store = {
  compare: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  saved: string[];
  toggleSaved: (id: string) => void;
  ready: boolean;
};

const StoreContext = createContext<Store>({
  compare: [],
  toggleCompare: () => {},
  clearCompare: () => {},
  saved: [],
  toggleSaved: () => {},
  ready: false,
});

// The compare tray lives in sessionStorage (one visit, one tab) so a pair from days ago never reappears; saved bikes stay in localStorage.
const storageFor = (key: string) => (key === "sb-compare" ? sessionStorage : localStorage);

function read(key: string): string[] {
  try {
    const v = JSON.parse(storageFor(key).getItem(key) || "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
function write(key: string, v: string[]) {
  try {
    storageFor(key).setItem(key, JSON.stringify(v));
  } catch {}
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [compare, setCompare] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem("sb-compare"); // stale tray from before it moved to sessionStorage
    } catch {}
    setCompare(read("sb-compare").slice(0, MAX_COMPARE));
    setSaved(read("sb-saved"));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) write("sb-compare", compare);
  }, [compare, ready]);
  useEffect(() => {
    if (ready) write("sb-saved", saved);
  }, [saved, ready]);

  const toggleCompare = useCallback((id: string) => {
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id].slice(-MAX_COMPARE)));
  }, []);
  const clearCompare = useCallback(() => setCompare([]), []);
  const toggleSaved = useCallback((id: string) => {
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [id, ...s]));
  }, []);

  return (
    <StoreContext.Provider value={{ compare, toggleCompare, clearCompare, saved, toggleSaved, ready }}>{children}</StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
