import { cookies } from "next/headers";

import type { TTheme } from "@/types";
import { DEFAULT_VALUES, THEME_COOKIE_NAME } from "@/utils/constants/cookies.const";
import { THEMES_VALUES } from "@/utils/constants/theme.const";

export async function getTheme(): Promise<TTheme> {
  try {
    const cookieStore = await cookies();
    const themeCookie = cookieStore.get(THEME_COOKIE_NAME);
    const theme = themeCookie?.value;

    if (!theme || !THEMES_VALUES.includes(theme as TTheme)) {
      return DEFAULT_VALUES.theme as TTheme;
    }

    return theme as TTheme;
  } catch {
    // If there's any error accessing cookies, return the default theme
    return DEFAULT_VALUES.theme as TTheme;
  }
}
