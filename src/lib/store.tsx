"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import bikeIds from "@/data/generated/bikes.ids.json"; // ids only: the layout validates picks without shipping the bike index

export const MAX_COMPARE = 3;
const KNOWN = new Set<string>(bikeIds);

/** Known bike ids only, each once, at most MAX_COMPARE: stale ids from old localStorage or shared links drop out (critique B7, B12). */
export const compareIds = (ids: string[]) => [...new Set(ids)].filter((id) => KNOWN.has(id)).slice(0, MAX_COMPARE);
/** Adds or removes one bike. A 4th is refused, not swapped for the oldest (critique B6); the full tray says why. */
export const toggleIn = (c: string[], id: string) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= MAX_COMPARE ? c : compareIds([...c, id]));

type Store = {
  compare: string[];
  toggleCompare: (id: string) => void;
  setCompare: (ids: string[]) => void;
  clearCompare: () => void;
  saved: string[];
  toggleSaved: (id: string) => void;
  ready: boolean;
};

const StoreContext = createContext<Store>({
  compare: [],
  toggleCompare: () => {},
  setCompare: () => {},
  clearCompare: () => {},
  saved: [],
  toggleSaved: () => {},
  ready: false,
});

function read(key: string): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
function write(key: string, v: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [compare, setCompareState] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompareState(compareIds(read("sb-compare")));
    setSaved(read("sb-saved"));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) write("sb-compare", compare);
  }, [compare, ready]);
  useEffect(() => {
    if (ready) write("sb-saved", saved);
  }, [saved, ready]);

  const toggleCompare = useCallback((id: string) => setCompareState((c) => toggleIn(c, id)), []);
  const setCompare = useCallback((ids: string[]) => setCompareState(compareIds(ids)), []);
  const clearCompare = useCallback(() => setCompareState([]), []);
  const toggleSaved = useCallback((id: string) => {
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [id, ...s]));
  }, []);

  return (
    <StoreContext.Provider value={{ compare, toggleCompare, setCompare, clearCompare, saved, toggleSaved, ready }}>{children}</StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
