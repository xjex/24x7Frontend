"use client"

import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "dental-ui-theme",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = true,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(storageKey) as Theme
    if (stored && (stored === "light" || stored === "dark" || stored === "system")) {
      setTheme(stored)
    }
    
    // Force initial theme application
    const root = document.documentElement
    const initialTheme = stored || defaultTheme
    if (initialTheme !== "system") {
      root.classList.remove("light", "dark")
      root.classList.add(initialTheme)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    const body = window.document.body
    
    // Remove all theme classes
    root.classList.remove("light", "dark")
    body.classList.remove("theme-light", "theme-dark")

    let currentTheme = theme
    if (theme === "system" && enableSystem) {
      currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    }

    // Add theme classes to both html and body
    root.classList.add(currentTheme)
    body.classList.add(`theme-${currentTheme}`)
    
    // Force Tailwind to recognize the change
    root.setAttribute('data-theme', currentTheme)
  }, [theme, enableSystem, mounted])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
} 