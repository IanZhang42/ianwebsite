(() => {
  "use strict";
  const root = new URL("../", document.currentScript.src);
  function siteUrl(path) {
    const url = new URL(path, root);
    if (url.protocol === "file:" && url.pathname.endsWith("/")) url.pathname += "index.html";
    return url.href;
  }

  // A downloaded copy can be opened directly, without a web server.
  if (location.protocol === "file:") {
    for (const link of document.querySelectorAll("a[href]")) {
      const raw = link.getAttribute("href");
      if (raw.startsWith("#")) continue;
      const url = new URL(raw, location.href);
      if (url.protocol === "file:" && url.pathname.endsWith("/")) {
        url.pathname += "index.html";
        link.href = url.href;
      }
    }
  }

  const glyphs = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
    moon: '<path d="M20.7 14.2A9 9 0 0 1 9.8 3.3a9 9 0 1 0 10.9 10.9Z"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>',
    file: '<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    layers: '<path d="m2 8 10-5 10 5-10 5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
    rotate: '<path d="M4 13c2.3 4.5 11 6 15 2.5 2.3-2 1.3-5.3-2.9-7M4 13l-.3 4M4 13l3.7.5M11 3v8"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',
    plus: '<path d="M12 4v16M4 12h16"/>',
    cap: '<path d="m2 9 10-5 10 5-10 5zM6 11v5c4 3 8 3 12 0v-5M22 9v7"/>',
    book: '<path d="M12 5.5C8 3 5 3 2.5 4v15c3.5-1.2 6-.9 9.5 1 3.5-1.9 6-2.2 9.5-1V4c-2.5-1-5.5-1-9.5 1.5zM12 5.5V20"/>'
  };
  const symbols = Object.entries(glyphs).map(([name, path]) =>
    '<symbol id="i-' + name + '" viewBox="0 0 24 24">' + path + '</symbol>').join("");
  document.body.insertAdjacentHTML("afterbegin", '<svg width="0" height="0" aria-hidden="true" style="position:absolute;pointer-events:none">' + symbols + '</svg>');
  const icon = name => '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"/></svg>';

  const sections = [
    ["Overview", ""], ["Research", "research/"], ["Teaching", "teaching/"],
    ["Notes", "notes/"], ["Courses", "courses/"]
  ];
  const route = location.pathname.slice(root.pathname.length).replace(/index\.html$/, "").split("/")[0];
  const current = path => route === path.replace(/\/$/, "") ? ' aria-current="page"' : "";
  const brand = '<a class="wordmark" href="' + siteUrl("") + '"><img src="' + siteUrl("assets/mark.svg") + '" width="37" height="37" alt=""><span>Ian Zhang</span></a>';
  const header = document.querySelector("site-header");
  const main = document.querySelector("main");
  if (main && !main.id) main.id = "main-content";
  if (header) {
    const links = sections.map(([name, path]) => '<a href="' + siteUrl(path) + '"' + current(path) + '>' + name + '</a>').join("");
    header.innerHTML = '<a class="skip-link" href="#' + (main?.id || "main-content") + '">Skip to content</a>' +
      '<header class="site-mast"><div class="shell mast-inner">' + brand +
      '<nav class="primary-nav" id="main-nav" aria-label="Main navigation">' + links + '<a class="compact-cv" href="' + siteUrl('cv/') + '"' + current('cv/') + '>Curriculum vitae</a></nav>' +
      '<div class="header-tools"><button type="button" class="icon-button search-trigger" aria-label="Search site" aria-haspopup="dialog" title="Search site (/)">' + icon("search") + '</button>' +
      '<button type="button" class="theme-toggle" data-theme-toggle>' +
        '<span class="theme-to-light">' + icon("sun") + '<span class="theme-label">Light mode</span></span>' +
        '<span class="theme-to-dark">' + icon("moon") + '<span class="theme-label">Dark mode</span></span>' +
      '</button>' +
      '<a class="cv-link" href="' + siteUrl("cv/") + '"' + current("cv/") + '>' + icon("file") + 'View CV</a>' +
      '<button type="button" class="icon-button mobile-trigger" aria-label="Open navigation" aria-expanded="false" aria-controls="main-nav">' + icon("menu") + '</button></div></div></header>';
  }
  const footer = document.querySelector("site-footer");
  if (footer) {
    const footerLinks = [
      ["Email", "mailto:ianz.zhang@mail.utoronto.ca"],
      ["Google Scholar", "https://scholar.google.com/citations?user=0FL5fjMAAAAJ&hl=en"],
      ["GitHub", "https://github.com/IanZhang42"], ["LinkedIn", "https://www.linkedin.com/in/ian-zhang-ba2195195"],
      ["Instagram", "https://instagram.com/iaanzhang"]
    ];
    footer.innerHTML = '<footer class="site-foot"><div class="shell footer-inner"><div>' + brand +
      '<p class="foot-location">Statistical Sciences · University of Toronto</p></div><nav aria-label="Footer" class="foot-links">' +
      footerLinks.map(([name, url]) => '<a href="' + url + '">' + name + '</a>').join("") +
      '</nav></div><div class="shell foot-bottom"><span>© 2026 Ian Zhang</span><span>Toronto, Canada</span></div></footer>';
  }

  const themeButton = header?.querySelector("[data-theme-toggle]");
  function labelThemeButton() {
    if (!themeButton) return;
    const label = document.documentElement.dataset.theme === "light" ? "Switch to dark mode" : "Switch to light mode";
    themeButton.setAttribute("aria-label", label);
    themeButton.title = label;
  }
  labelThemeButton();
  window.addEventListener("site-theme-change", labelThemeButton);

  const menuButton = header?.querySelector(".mobile-trigger");
  const nav = header?.querySelector(".primary-nav");
  function setMenu(open) {
    if (!menuButton) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    menuButton.innerHTML = icon(open ? "x" : "menu");
    nav.classList.toggle("is-open", open);
  }
  menuButton?.addEventListener("click", event => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    setMenu(open);
    if (open && event.detail === 0) nav.querySelector("a")?.focus();
  });
  window.matchMedia("(min-width:761px)").addEventListener("change", () => setMenu(false));
  document.addEventListener("pointerdown", event => {
    if (menuButton?.getAttribute("aria-expanded") === "true" && !header.contains(event.target)) setMenu(false);
  });
  header?.addEventListener("focusout", event => {
    if (menuButton?.getAttribute("aria-expanded") === "true" && event.relatedTarget && !header.contains(event.relatedTarget)) setMenu(false);
  });

  document.body.insertAdjacentHTML("beforeend",
    '<dialog class="modal search-modal" id="site-search" aria-labelledby="search-title">' +
    '<div class="search-head"><h2 id="search-title">Search the site</h2><button type="button" class="icon-button" aria-label="Close search">' + icon("x") + '</button></div>' +
    '<label class="search-box">' + icon("search") + '<input type="search" aria-label="Search research, courses, and notes" placeholder="Search papers, courses, notes…" autocomplete="off"></label>' +
    '<p class="search-count" role="status" aria-live="polite"></p><ul class="search-results"></ul></dialog>');
  const dialog = document.getElementById("site-search");
  const input = dialog.querySelector("input");
  const list = dialog.querySelector("ul");
  const count = dialog.querySelector(".search-count");
  const shortcuts = [
    ["Research", "research/", "Section", "papers preprints publications talks presentations experience"],
    ["Teaching", "teaching/", "Section", "teaching assistantships tutorials"],
    ["Course notes", "notes/", "Section", "lectures resources PDFs notes"],
    ["Coursework", "courses/", "Section", "courses undergraduate masters doctoral statistics mathematics economics"],
    ["Curriculum vitae", "cv/", "Section", "CV résumé resume education awards experience"],
    ["About Ian", "#about", "Section", "background bio supervisors"]
  ];
  let entries = shortcuts;
  let loadState = "pending";
  let opener;
  function normalize(value) {
    return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’'–—-]/g, " ");
  }
  function draw() {
    const terms = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
    const matches = terms.length ? entries.filter(row => {
      const text = normalize([row[0], row[2], row[3] || ""].join(" "));
      return terms.every(term => text.includes(term));
    }) : shortcuts;
    count.textContent = terms.length ? (matches.length ? matches.length + (matches.length === 1 ? " result" : " results") :
      loadState === "loading" ? "Loading results…" : loadState === "failed" ? "Search index unavailable. Browse the sections below." : "No results. Try a course code, topic, or author.") : "Browse sections";
    const visible = !matches.length && loadState === "failed" ? shortcuts : matches;
    list.replaceChildren();
    for (const [title, path, type] of visible) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      const label = document.createElement("span");
      const tag = document.createElement("small");
      a.href = siteUrl(path);
      label.textContent = title;
      tag.textContent = type;
      a.append(label, tag);
      li.append(a);
      list.append(li);
    }
  }
  function loadIndex() {
    if (loadState === "loading" || loadState === "ready") return;
    loadState = "loading";
    const script = document.createElement("script");
    script.src = siteUrl("assets/search-index.js");
    script.onload = () => {
      entries = shortcuts.concat(window.IAN_SEARCH_INDEX || []);
      loadState = "ready";
      draw();
    };
    script.onerror = () => { loadState = "failed"; draw(); };
    document.head.append(script);
  }
  function openSearch() {
    if (dialog.open) return;
    opener = document.activeElement;
    setMenu(false);
    input.value = "";
    draw();
    loadIndex();
    dialog.showModal();
    input.focus();
  }
  header?.querySelector(".search-trigger")?.addEventListener("click", openSearch);
  dialog.querySelector("button").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => { if (opener?.isConnected) opener.focus({preventScroll:true}); });
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  list.addEventListener("click", event => { if (event.target.closest("a")) dialog.close(); });
  input.addEventListener("input", draw);
  dialog.addEventListener("keydown", event => {
    const resultLinks = [...list.querySelectorAll("a")];
    const selected = resultLinks.indexOf(document.activeElement);
    if (event.key === "Enter" && event.target === input && resultLinks.length) {
      event.preventDefault();
      resultLinks[0].click();
    }
    if (event.key === "ArrowDown" && (event.target === input || selected >= 0) && resultLinks.length) {
      event.preventDefault();
      resultLinks[Math.min(selected + 1, resultLinks.length - 1)].focus();
    }
    if (event.key === "ArrowUp" && selected >= 0) {
      event.preventDefault();
      (resultLinks[selected - 1] || input).focus();
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menuButton.focus();
      return;
    }
    if (document.querySelector("dialog[open]") || event.target.closest("input,textarea,select,[contenteditable=true]")) return;
    const shortcut = event.key === "/" || (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
    if (shortcut) { event.preventDefault(); openSearch(); }
  });

  // A search result can point inside a closed degree group or a previously filtered collection.
  function revealFragment() {
    if (!location.hash) return;
    let id;
    try { id = decodeURIComponent(location.hash.substring(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    let revealed = false;
    if (target.closest("[hidden]")) {
      const group = target.closest("[data-filter-list]");
      const search = group?.querySelector("[data-filter-search]");
      if (search) { search.value = ""; search.dispatchEvent(new Event("input")); }
      group?.querySelector('[data-filter="all"]')?.click();
      revealed = true;
    }
    for (let node = target; node; node = node.parentElement) {
      if (node.tagName === "DETAILS" && !node.open) { node.open = true; revealed = true; }
    }
    if (revealed) target.scrollIntoView({block:"center"});
  }
  window.addEventListener("hashchange", revealFragment);
  window.addEventListener("load", revealFragment);
  list.addEventListener("click", () => setTimeout(revealFragment));
})();
