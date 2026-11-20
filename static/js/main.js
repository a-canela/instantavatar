/* InstantAvatar project page — interactions (adapted from the ManifoldSplat project page) */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky nav: shadow, brand and active section ---------- */
  const nav = $(".section-nav");
  const navScroller = nav ? $(".wrap", nav) : null;
  const navLinks = $$(".nav-link");
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const toTop = $(".to-top");
  let lastActive = null;

  function onScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle("scrolled", nav.getBoundingClientRect().top <= 0 && y > 10);
    if (toTop) toTop.classList.toggle("show", y > window.innerHeight * 0.8);

    const probe = y + window.innerHeight * 0.3;
    let current = null;
    for (const s of sections) if (s.offsetTop <= probe) current = s;
    if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) current = sections[sections.length - 1];
    navLinks.forEach((a) => {
      const active = current && a.getAttribute("href") === "#" + current.id;
      a.classList.toggle("active", Boolean(active));
      if (active) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
      // On narrow screens the pill bar scrolls horizontally: keep the active pill in view.
      if (active && a !== lastActive && navScroller && navScroller.scrollWidth > navScroller.clientWidth) {
        navScroller.scrollTo({ left: a.offsetLeft - (navScroller.clientWidth - a.offsetWidth) / 2, behavior: reducedMotion ? "auto" : "smooth" });
      }
      if (active) lastActive = a;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));

  /* ---------- Conference note: hover/focus via CSS; tap toggle for touch screens ---------- */
  const confLine = $(".conf-line");
  if (confLine) {
    confLine.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      confLine.classList.toggle("open");
    });
    document.addEventListener("click", (e) => { if (!confLine.contains(e.target)) confLine.classList.remove("open"); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { confLine.classList.remove("open"); confLine.blur(); }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Copy buttons ---------- */
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return; } catch { /* fall back below */ }
    }
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } finally { ta.remove(); }
    if (!ok) throw new Error("copy failed");
  }
  $$("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const target = $(btn.dataset.copy);
      if (!target) return;
      const label = btn.textContent;
      try {
        await copyText(target.innerText.replace(/\u00a0/g, " ").trimEnd() + "\n");
        btn.textContent = "Copied!"; btn.classList.add("copied");
      } catch {
        btn.textContent = "Press Ctrl+C";
      }
      setTimeout(() => { btn.textContent = label; btn.classList.remove("copied"); }, 1600);
    });
  });
})();
