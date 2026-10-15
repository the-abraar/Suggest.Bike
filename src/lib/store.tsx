"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import bikeIds from "@/data/generated/bikes.ids.json"; // ids only: the layout validates picks without shipping the bike index

export const MAX_COMPARE = 3;
const KNOWN = new Set<string>(bikeIds);

/** Known bike ids only, each once, at most MAX_COMPARE: stale ids from old localStorage or shared links drop out (critique B7, B12). */
export const compareIds = (ids: string[]) => [...new Set(ids)].filter((id) => KNOWN.has(id)).slice(0, MAX_COMPARE);
/** Adds or removes one bike. A 4th is refused, not swapped for the oldest (critique B6); the full tray says why. */
export const toggleIn = (c: string[], id: string) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= MAX_COMPARE ? c : compareIds([...c, id]));
/**
 * What /compare/ shows on load: the URL's bikes, else this tab's tray (`fromTray`: the page then writes them into the URL).
 * A shared link seeds the tray only when the tray is empty or holds the same bikes, and the page may edit the tray only
 * then (`ownsTray`), so opening a link never replaces picks the visitor made (critique B7).
 */
export function compareStart(urlBikes: string | null, tray: string[]) {
  const fromUrl = compareIds((urlBikes || "").split(","));
  const ownsTray = !fromUrl.length || !tray.length || fromUrl.join() === tray.join();
  return { ids: fromUrl.length ? fromUrl : tray, ownsTray, seedTray: ownsTray && fromUrl.length > 0, fromTray: !fromUrl.length && tray.length > 0 };
}

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

// The compare tray lives in sessionStorage (one visit, one tab) so a pair from days ago never reappears; saved bikes stay in localStorage.
export const storageFor = (key: string) => (key === "sb-compare" ? sessionStorage : localStorage);

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
  const [compare, setCompareState] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem("sb-compare"); // stale tray from before it moved to sessionStorage
    } catch {}
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
