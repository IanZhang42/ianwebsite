// Load in the document head so the saved palette applies before the first paint.
(() => {
  const key = "ian-zhang-site-theme";
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  const darkChrome = meta?.content || "#0b1116";
  const isLocal = location.protocol === "file:";
  const valid = value => value === "light" || value === "dark";
  function savedTheme() {
    try { return localStorage.getItem(key); }
    catch { return null; }
  }
  function save(theme) {
    try { localStorage.setItem(key, theme); }
    catch { /* The switch also works when storage is unavailable. */ }
  }
  function apply(theme) {
    if (root.dataset.theme === theme) return;
    root.dataset.theme = theme;
    if (meta) meta.content = theme === "light" ? "#f7f9f7" : darkChrome;
    window.dispatchEvent(new Event("site-theme-change"));
  }

  // Browsers can isolate localStorage per file in the downloadable site.
  const localTheme = isLocal && new URL(location.href).searchParams.get("theme");
  if (valid(localTheme)) save(localTheme);
  apply(valid(localTheme) ? localTheme : savedTheme() === "light" ? "light" : "dark");

  document.addEventListener("click", event => {
    if (!event.target.closest?.("[data-theme-toggle]")) return;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    apply(next);
    save(next);
    if (isLocal && valid(localTheme)) {
      const url = new URL(location.href);
      url.searchParams.set("theme", next);
      try { history.replaceState(history.state, "", url); } catch {}
    }
  });

  if (isLocal) {
    const carryPreference = event => {
      const link = event.target.closest?.("a[href]");
      if (!link || link.getAttribute("href").startsWith("#")) return;
      const destination = new URL(link.href);
      if (destination.protocol !== "file:" || !destination.pathname.endsWith("/index.html")) return;
      destination.searchParams.set("theme", root.dataset.theme);
      link.href = destination.href;
    };
    document.addEventListener("click", carryPreference, true);
    document.addEventListener("auxclick", carryPreference, true);
    document.addEventListener("contextmenu", carryPreference, true);
  }

  window.addEventListener("storage", event => {
    if (event.key === key || event.key === null) apply(savedTheme() === "light" ? "light" : "dark");
  });
  window.addEventListener("pageshow", event => {
    const saved = savedTheme();
    if (event.persisted && valid(saved)) apply(saved);
  });
})();
