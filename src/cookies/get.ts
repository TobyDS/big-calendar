import { cookies } from "next/headers";

import { THEMES_VALUES } from "@/utils/constants/theme.const";
import { DEFAULT_VALUES } from "@/utils/constants/cookies.const";
import { THEME_COOKIE_NAME } from "@/utils/constants/cookies.const";
import type { TTheme } from "@/types";

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
