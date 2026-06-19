"use client"

import * as React from "react"
import { useTheme } from "next-themes"

function LightThemeEnforcer() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    if (resolvedTheme !== "light") {
      setTheme("light")
    }
  }, [resolvedTheme, setTheme])

  return null
}

export { LightThemeEnforcer }
