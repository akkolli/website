(() => {
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function setupToc() {
    const headings = $$(".post-content h2[id], .post-content h3[id]");
    const links = $$("#TableOfContents a");
    if (!headings.length || !links.length) return;

    let queued = false;

    function update() {
      const y = window.scrollY + window.innerHeight * 0.35;
      let activeId = headings[0].id;

      for (const heading of headings) {
        if (heading.offsetTop > y) break;
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
    const list = document.querySelector("[data-post-list]");
    if (!list) return;

    const rows = $$(".post-row", list);
    const links = $$("[data-tag]");
    const status = document.querySelector("[data-tag-filter-status]");
    const clear = status?.querySelector("a");

    function setUrl(tag) {
      const url = new URL(window.location.href);
      if (tag) {
        url.searchParams.set("tag", tag);
      } else {
        url.searchParams.delete("tag");
      }
      window.history.pushState(null, "", `${url.pathname}${url.search}`);
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
        const name = status.querySelector("[data-tag-filter-name]");
        if (name) name.textContent = tag ? `[${tag}]` : "";
        status.hidden = !tag;
        status.classList.toggle("is-empty", visible === 0);
      }
    }

    for (const link of links) {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const nextTag = link.classList.contains("active") ? null : link.dataset.tag;
        applyTag(nextTag);
        setUrl(nextTag);
      });
    }

    if (clear) {
      clear.addEventListener("click", (event) => {
        event.preventDefault();
        applyTag(null);
        setUrl(null);
      });
    }

    applyTag(new URLSearchParams(window.location.search).get("tag"));
  }

  function setupClickableRows() {
    const rows = $$("[data-row-href]");

    function openRow(row) {
      const href = row.dataset.rowHref;
      if (href) window.location.href = href;
    }

    for (const row of rows) {
      row.addEventListener("click", (event) => {
        if (event.target.closest("a")) return;
        openRow(row);
      });

      row.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        openRow(row);
      });

      row.addEventListener("pointerdown", (event) => {
        if (event.target.closest(".item-links a")) return;
        row.classList.add("is-pressed");
      });

      for (const eventName of ["pointerup", "pointercancel", "pointerleave", "blur"]) {
        row.addEventListener(eventName, () => row.classList.remove("is-pressed"));
      }
    }
  }

  setupToc();
  setupPostTags();
  setupClickableRows();
})();
