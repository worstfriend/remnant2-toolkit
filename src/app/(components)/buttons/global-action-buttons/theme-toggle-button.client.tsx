import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'
import { useTheme } from 'next-themes'

import { BaseButton } from '@/app/(components)/_base/button'

// WARNING: This component is not hydration-safe
// https://github.com/pacocoursey/next-themes#avoid-hydration-mismatch
export default function ToggleThemeButton() {
  const { setTheme, forcedTheme, resolvedTheme } = useTheme()

  // Temporary feature gate
  if (forcedTheme) {
    // If a theme is being forced, there is no alternate theme to toggle to
    // Disable the toggle option in this case
    return
  }

  if (resolvedTheme === 'dark') {
    return (
      <BaseButton onClick={() => setTheme('light')} color="white">
        <SunIcon className="h-5 w-5" />
      </BaseButton>
    )
  } else {
    return (
      <BaseButton onClick={() => setTheme('dark')} color="white">
        <MoonIcon className="h-5 w-5" />
      </BaseButton>
    )
  }
}