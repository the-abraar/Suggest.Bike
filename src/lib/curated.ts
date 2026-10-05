import { getBike } from "./bikes";
import type { BikeLite } from "./types";

/** The comparisons Bangladeshi buyers argue about most. */
export const POPULAR_COMPARISONS: [string, string][] = [
  ["bajaj-pulsar-n160", "tvs-apache-rtr-160-4v"],
  ["yamaha-fzs-fi-v4", "suzuki-gixxer-fi-abs"],
  ["yamaha-r15-v4", "suzuki-gixxer-sf-fi-abs"],
  ["royal-enfield-hunter-350", "royal-enfield-classic-350"],
  ["hero-xpulse-200-4v", "honda-nx200"],
  ["hero-splendor-plus", "bajaj-platina-100"],
  ["honda-hornet-2-0", "yamaha-fzs-fi-v4"],
  ["honda-dio", "tvs-ntorq-125"],
];

export const popularPairs = () =>
  POPULAR_COMPARISONS.map(([a, b]) => [getBike(a), getBike(b)] as const).filter((p): p is readonly [BikeLite, BikeLite] => !!p[0] && !!p[1]);
