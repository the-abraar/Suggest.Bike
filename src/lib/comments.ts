import raw from "../data/comments.json";

/** An approved comment. The owner copies it here by hand from the form inbox (docs/Todo_owner.md). Never store the email. */
export type Comment = { post: string; name: string; date: string; text: string };

export const COMMENTS = raw as Comment[];
export const commentsFor = (slug: string) => COMMENTS.filter((c) => c.post === slug).sort((a, b) => a.date.localeCompare(b.date));
