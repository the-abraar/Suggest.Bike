/** Prefilled GitHub issue: a feedback path for phones with no mail client. Needs a GitHub account. */
export const issueUrl = (title: string, body = "") =>
  `https://github.com/the-abraar/Suggest.Bike/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;

export const SITE = {
  name: "Suggest.Bike",
  url: "https://suggest.bike",
  // Inbox for price corrections and feedback. Create this mailbox before launch (see Todo_owner.md).
  contactEmail: "hello@suggest.bike",
  description:
    "Bangladesh's motorcycle decision engine — find the right bike for your budget, compare real-world mileage, parts prices, mechanic familiarity and true monthly cost.",
  editor: "Abrar (The-Abraar)",
};

/** Formspree-compatible JSON endpoint (e.g. https://formspree.io/f/xxxx). Empty: forms open a prefilled email instead. See Todo_owner.md. */
export const FORM_ENDPOINT: string = "";

/** GoatCounter site code (the "xxx" in xxx.goatcounter.com). Empty: no analytics script is loaded. See Todo_owner.md. */
export const GOATCOUNTER_CODE: string = "";

/** Count a custom GoatCounter event; a no-op when analytics is off or blocked. */
export function track(event: string) {
  const gc = (globalThis as { goatcounter?: { count?: (o: { path: string; event: boolean }) => void } }).goatcounter;
  gc?.count?.({ path: event, event: true });
}
