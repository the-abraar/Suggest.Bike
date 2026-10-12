import { test } from "node:test";
import assert from "node:assert/strict";
import { langAlternates, langHref } from "../src/lib/site";
import { productJsonLd } from "../src/lib/bikes";
import bikes from "../src/data/bikes.json";
import type { Bike } from "../src/lib/types";

test("langHref maps EN and BN twins and keeps query and hash", () => {
  assert.equal(langHref("/", "bn"), "/bn/");
  assert.equal(langHref("/bn/", "en"), "/");
  assert.equal(langHref("/bn", "en"), "/");
  assert.equal(langHref("/compare/?bikes=a,b#engine", "bn"), "/bn/compare/?bikes=a,b#engine");
  assert.equal(langHref("/bn/compare/?bikes=a,b#engine", "en"), "/compare/?bikes=a,b#engine");
  assert.equal(langHref("/bikes/bajaj-pulsar-n160/", "bn"), "/bn/bikes/bajaj-pulsar-n160/");
  assert.equal(langHref("/bn/bikes/bajaj-pulsar-n160/", "bn"), "/bn/bikes/bajaj-pulsar-n160/");
});

test("langHref leaves pages without a Bangla twin and non-paths alone", () => {
  assert.equal(langHref("/saved/", "bn"), "/saved/");
  assert.equal(langHref("/privacy/", "bn"), "/privacy/");
  assert.equal(langHref("/bikes/a/b/", "bn"), "/bikes/a/b/");
  assert.equal(langHref("/bnx/", "en"), "/bnx/");
  assert.equal(langHref("mailto:x@y.z", "bn"), "mailto:x@y.z");
  assert.equal(langHref("#top", "bn"), "#top");
});

test("langAlternates gives canonical per language and the same hreflang set", () => {
  const langs = { en: "/cost/", bn: "/bn/cost/", "x-default": "/cost/" };
  assert.deepEqual(langAlternates("/cost/"), { canonical: "/cost/", languages: langs });
  assert.deepEqual(langAlternates("/cost/", "bn"), { canonical: "/bn/cost/", languages: langs });
});

test("Product JSON-LD has an Offer only for bikes on sale", () => {
  const all = bikes as unknown as Bike[];
  const onSale = all.find((b) => b.status === "on-sale")!;
  const used = all.find((b) => b.status === "used-only")!;
  const offer = (productJsonLd(onSale) as { offers?: Record<string, unknown> }).offers;
  assert.equal(offer?.["@type"], "Offer");
  assert.equal(offer?.price, onSale.priceBDT);
  assert.equal(offer?.priceCurrency, "BDT");
  assert.equal("offers" in productJsonLd(used), false);
});
