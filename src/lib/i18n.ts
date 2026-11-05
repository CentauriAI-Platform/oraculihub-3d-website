// New locales can implement this shape and be added to supportedLocales when ready.
export const supportedLocales = ["en"] as const;
export const plannedLocales = ["si", "ta"] as const;
export const defaultLocale = "en";
export const english = {
  language: "English",
  navigation: {
    pathways: "The pathways",
    courses: "Explore courses",
    coaching: "Career coaching",
    about: "Our story",
    signIn: "Sign in",
    learning: "My learning",
    dashboard: "Your dashboard",
    begin: "Begin your journey",
    open: "Open navigation",
    close: "Close navigation",
  },
};
export type Translation = typeof english;
export const messages: Record<(typeof supportedLocales)[number], Translation> =
  { en: english };
