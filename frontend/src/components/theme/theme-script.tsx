/**
 * Blocking theme script — runs before first paint so the correct theme
 * (stored choice, else OS preference) is applied with zero flash.
 * Must stay in sync with `storedTheme`/`systemTheme` in theme-provider.
 */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('mjm-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.classList.toggle('light',t==='light');document.documentElement.style.colorScheme=t;}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
