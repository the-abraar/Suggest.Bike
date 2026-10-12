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
};
