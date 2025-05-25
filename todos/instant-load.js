document.addEventListener("DOMContentLoaded", () => {
  const isInternal = (url) =>
    location.origin === new URL(url, location.href).origin;

  const loadPage = async (url) => {
    const res = await fetch(url);
    const text = await res.text();
    const html = document.createElement("html");
    html.innerHTML = text;

    const newContent = html.querySelector("main");
    const title = html.querySelector("title")?.textContent;

    document.querySelector("main").replaceWith(newContent);
    if (title) document.title = title;
    history.pushState(null, title, url);
    window.scrollTo(0, 0);
  };

  const isNavigableHtml = async (url) => {
    try {
      const res = await fetch(url, { method: "HEAD" });
      const type = res.headers.get("Content-Type") || "";
      return type.includes("text/html");
    } catch {
      return false;
    }
  };

  document.body.addEventListener("click", async (e) => {
    const a = e.target.closest("a");
    if (!a || !isInternal(a.href)) return;

    if (
      a.target === "_blank" ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }

    const href = a.href;

    if (await isNavigableHtml(href)) {
      e.preventDefault();
      loadPage(href);
    }
  });

  window.addEventListener("popstate", () => loadPage(location.href));
});
