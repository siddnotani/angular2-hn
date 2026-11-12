// jsdom has no matchMedia; this fake lets tests set the system colour scheme and fire changes.
export function mockColorScheme(initiallyDark: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const media = {
    matches: initiallyDark,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_: string, fn: (event: MediaQueryListEvent) => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: (event: MediaQueryListEvent) => void) => listeners.delete(fn),
  };
  window.matchMedia = vi.fn().mockReturnValue(media);
  return {
    listenerCount: () => listeners.size,
    change(dark: boolean) {
      media.matches = dark;
      listeners.forEach(fn => fn({ matches: dark } as MediaQueryListEvent));
    },
  };
}
