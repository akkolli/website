(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function isPlainLeftClick(event) {
    return (
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    );
  }

  function setupFileTabs() {
    const index = $("[data-file-index]");
    if (!index) return;

    const tabs = $$("[data-file-tab]", index);
    const panels = $$("[data-file-panel]", index);
    const announcer = $("[data-file-announcer]", index);
    const canonical = $('link[rel="canonical"]');
    const routes = new Map(
      tabs.map((tab) => [new URL(tab.href, window.location.href).pathname, tab.dataset.fileTab])
    );
    let activeId = null;

    function idForLocation() {
      return routes.get(window.location.pathname) || "posts";
    }

    function activate(id, { announce = false } = {}) {
      const activeTab = tabs.find((tab) => tab.dataset.fileTab === id) || tabs[0];
      if (!activeTab) return;
      const changed = activeId !== activeTab.dataset.fileTab;
      activeId = activeTab.dataset.fileTab;

      for (const tab of tabs) {
        const active = tab === activeTab;
        tab.classList.toggle("active", active);
        if (active) tab.setAttribute("aria-current", "page");
        else tab.removeAttribute("aria-current");
      }

      for (const panel of panels) {
        panel.hidden = panel.dataset.filePanel !== activeTab.dataset.fileTab;
      }

      document.title = activeTab.dataset.pageTitle || document.title;
      if (canonical) canonical.href = new URL(activeTab.href, window.location.href).href;
      if (announce && changed && announcer) {
        announcer.textContent = `Showing ${activeTab.textContent.trim()}`;
      }
    }

    for (const tab of tabs) {
      tab.addEventListener("click", (event) => {
        if (!isPlainLeftClick(event)) return;
        event.preventDefault();

        const url = new URL(tab.href, window.location.href);
        const nextLocation = `${url.pathname}${url.search}${url.hash}`;
        const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        if (nextLocation !== currentLocation) {
          window.history.pushState({ fileTab: tab.dataset.fileTab }, "", nextLocation);
        }

        activate(tab.dataset.fileTab, { announce: true });
        window.dispatchEvent(new CustomEvent("filetabchange"));
      });
    }

    window.addEventListener("popstate", () => activate(idForLocation(), { announce: true }));
    activate(idForLocation());
  }

  function setupToc() {
    const headings = $$(".post-content h2[id], .post-content h3[id]");
    const links = $$("#TableOfContents a");
    if (!headings.length || !links.length) return;

    let queued = false;

    function update() {
      const y = window.scrollY + window.innerHeight * 0.35;
      let activeId = headings[0].id;

      for (const heading of headings) {
        const headingY = heading.getBoundingClientRect().top + window.scrollY;
        if (headingY > y) break;
        activeId = heading.id;
      }

      for (const link of links) {
        link.classList.toggle(
          "active",
          decodeURIComponent(link.hash.slice(1)) === activeId
        );
      }

      queued = false;
    }

    function queue() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    update();
  }

  function setupPostTags() {
    const list = $("[data-post-list]");
    if (!list) return;

    const rows = $$(".post-row", list);
    const links = $$("[data-tag]");
    const status = $("[data-tag-filter-status]");
    const clear = status?.querySelector("a");
    const empty = $("[data-tag-empty]");

    function setUrl(tag) {
      const url = new URL(window.location.href);
      if (tag) url.searchParams.set("tag", tag);
      else url.searchParams.delete("tag");
      window.history.pushState({ tag }, "", `${url.pathname}${url.search}`);
    }

    function applyTag(tag) {
      for (const link of links) {
        link.classList.toggle("active", link.dataset.tag === tag);
      }

      let visible = 0;
      for (const row of rows) {
        const tags = JSON.parse(row.dataset.tags || "[]");
        const matched = !tag || tags.includes(tag);
        row.hidden = !matched;
        if (matched) visible += 1;
      }

      if (status) {
        const name = $("[data-tag-filter-name]", status);
        const count = $("[data-tag-filter-count]", status);
        if (name) name.textContent = tag ? `[${tag}]` : "";
        if (count) count.textContent = `${visible} ${visible === 1 ? "post" : "posts"}`;
        status.hidden = !tag;
        status.classList.toggle("is-empty", visible === 0);
      }

      if (empty) empty.hidden = !tag || visible > 0;
    }

    function applyFromLocation() {
      applyTag(new URLSearchParams(window.location.search).get("tag"));
    }

    for (const link of links) {
      link.addEventListener("click", (event) => {
        if (!isPlainLeftClick(event)) return;
        event.preventDefault();
        const nextTag = link.classList.contains("active") ? null : link.dataset.tag;
        setUrl(nextTag);
        applyTag(nextTag);
      });
    }

    if (clear) {
      clear.addEventListener("click", (event) => {
        if (!isPlainLeftClick(event)) return;
        event.preventDefault();
        setUrl(null);
        applyTag(null);
      });
    }

    window.addEventListener("popstate", applyFromLocation);
    window.addEventListener("filetabchange", applyFromLocation);
    applyFromLocation();
  }

  function setupClickableRows() {
    const rows = $$("[data-row-href]");

    for (const row of rows) {
      row.addEventListener("click", (event) => {
        if (event.target.closest("a")) return;
        const href = row.dataset.rowHref;
        if (href) window.location.assign(href);
      });

      row.addEventListener("pointerdown", (event) => {
        if (event.target.closest("a")) return;
        row.classList.add("is-pressed");
      });

      for (const eventName of ["pointerup", "pointercancel", "pointerleave"]) {
        row.addEventListener(eventName, () => row.classList.remove("is-pressed"));
      }
    }
  }

  function setupPrefetch() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || "")) return;

    const prefetched = new Set();

    function prefetch(href) {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin || url.hash || url.pathname === window.location.pathname) return;
      if (prefetched.has(url.href)) return;
      prefetched.add(url.href);

      const hint = document.createElement("link");
      hint.rel = "prefetch";
      hint.as = "document";
      hint.href = url.href;
      document.head.append(hint);
    }

    for (const link of $$(".item-title[href], .post-title[href], .back-link[href], .post-button[href]")) {
      link.addEventListener("pointerenter", () => prefetch(link.href), { once: true });
      link.addEventListener("focus", () => prefetch(link.href), { once: true });
    }

    for (const row of $$("[data-row-href]")) {
      row.addEventListener("pointerenter", () => prefetch(row.dataset.rowHref), { once: true });
    }
  }

  setupFileTabs();
  setupToc();
  setupPostTags();
  setupClickableRows();
  setupPrefetch();
})();
