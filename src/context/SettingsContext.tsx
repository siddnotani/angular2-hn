import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Settings } from '../types/settings';

interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function initialSettings(): Settings {
    const openLinks = localStorage.getItem('openLinkInNewTab');
    return {
        showSettings: false,
        openLinkInNewTab: openLinks ? JSON.parse(openLinks) as boolean : false,
        theme: 'default',
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0'
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(initialSettings);

    useEffect(() => {
        const media = window.matchMedia?.('(prefers-color-scheme: dark)');
        const handleChange = (event: MediaQueryListEvent) => {
            setSettings((current) => ({ ...current, theme: event.matches ? 'night' : 'default' }));
        };
        media?.addEventListener('change', handleChange);
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setSettings((current) => ({ ...current, theme: savedTheme }));
        } else if (media) {
            setSettings((current) => ({ ...current, theme: media.matches ? 'night' : 'default' }));
        }
        return () => media?.removeEventListener('change', handleChange);
    }, []);

    const value: SettingsContextValue = {
        settings,
        toggleSettings: () => setSettings((current) => ({ ...current, showSettings: !current.showSettings })),
        toggleOpenLinksInNewTab: () => setSettings((current) => {
            const openLinkInNewTab = !current.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
            return { ...current, openLinkInNewTab };
        }),
        setTheme: (theme) => {
            localStorage.setItem('theme', theme);
            setSettings((current) => ({ ...current, theme }));
        },
        setFont: (titleFontSize) => {
            localStorage.setItem('titleFontSize', titleFontSize);
            setSettings((current) => ({ ...current, titleFontSize }));
        },
        setSpacing: (listSpacing) => {
            localStorage.setItem('listSpacing', listSpacing);
            setSettings((current) => ({ ...current, listSpacing }));
        }
    };
    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
    const value = useContext(SettingsContext);
    if (!value) throw new Error('useSettings must be used within a SettingsProvider');
    return value;
}
