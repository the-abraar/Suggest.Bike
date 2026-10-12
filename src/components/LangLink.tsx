"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLang } from "@/lib/i18n";
import { langHref } from "@/lib/site";

/** next/link that keeps Bangla readers on the /bn/ twin of each page. */
export default function Link({ href, ...rest }: ComponentProps<typeof NextLink>) {
  const { lang } = useLang();
  return <NextLink href={typeof href === "string" ? langHref(href, lang) : href} {...rest} />;
}
