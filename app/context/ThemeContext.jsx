"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Add new theme names here as you build them out
const THEMES = ["professional", "cloudy", "nightsky"];

const ThemeContext = createContext({
    theme: "nightsky",
    setTheme: () => {},
    themes: THEMES,
});

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState("nightsky");

    const setTheme = (t) => {
        setThemeState(t);
        document.documentElement.setAttribute("data-theme", t);
        localStorage.setItem("app-theme", t);
    };

    useEffect(() => {
        const saved = localStorage.getItem("app-theme");
        if (saved && THEMES.includes(saved)) {
            setTheme(saved);
        } else {
            document.documentElement.setAttribute("data-theme", "nightsky");
        }
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);