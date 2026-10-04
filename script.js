/* Thriwarna - script.js */

/* ========= CONFIG: REPLACE THESE BEFORE PUBLISHING =========
   The values below are PLACEHOLDERS, not real business details. */
const CONFIG = {
  agency: "Thriwarna",
  whatsapp: "94XXXXXXXXX",          // international format, no "+" (e.g. 94771234567). Leave the X's until you have the real number.
  email: "hello@example.com",       // PLACEHOLDER
  website: "https://example.com",   // PLACEHOLDER
  social: { instagram: "", facebook: "", linkedin: "", tiktok: "" }, // paste real profile URLs; empty = hidden
  founders: { milinduSite: "https://milindu.vercel.app/", pawaniLinkedIn: "" }, // paste Pawani's real LinkedIn URL; empty = link hidden
  showPortfolio: true,              // set false to hide the Selected Work section
  showTestimonials: false           // set true only once you have genuine testimonials
};

(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const waReady = /^\d{8,15}$/.test(CONFIG.whatsapp);
  const emailReady = !/example\.com$/.test(CONFIG.email);

  /* ---- Feature toggles ---- */
  if (!CONFIG.showPortfolio) { $('[data-feature="portfolio"]')?.remove(); $$('a[href="#work"]').forEach((a) => a.closest("li")?.remove()); }
  if (CONFIG.showTestimonials) $('[data-feature="testimonials"]')?.removeAttribute("hidden");
  else $('[data-feature="testimonials"]')?.remove();

  /* ---- Contact links from config ---- */
  const waUrl = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
  $$("[data-wa]").forEach((a) => {
    if (waReady) { a.href = waUrl(`Hello ${CONFIG.agency}, I'd like to discuss a project.`); a.target = "_blank"; a.rel = "noopener"; }
  });
  $$("[data-mail]").forEach((a) => { a.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Project enquiry")}`; });
  const social = $("#social");
  Object.entries(CONFIG.social).filter(([, u]) => u).forEach(([name, url]) => {
    const li = document.createElement("li"), a = document.createElement("a");
    a.href = url; a.target = "_blank"; a.rel = "noopener"; a.textContent = name[0].toUpperCase() + name.slice(1);
    li.append(a); social.append(li);
  });
  $("#year").textContent = new Date().getFullYear();

  /* ---- Founder links ---- */
  $("[data-site]").href = CONFIG.founders.milinduSite;
  const liLink = $("[data-linkedin]");
  if (CONFIG.founders.pawaniLinkedIn) liLink.href = CONFIG.founders.pawaniLinkedIn; else { liLink.replaceWith(liLink.textContent); $("[data-linkedin-go]")?.remove(); }

  /* ---- Mobile menu ---- */
  const burger = $(".burger"), menu = $("#menu"), mq = matchMedia("(min-width:960px)");
  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
    if (!mq.matches) menu.inert = !open;
  };
  const syncMq = () => { menu.inert = false; if (mq.matches) setMenu(false); else menu.inert = !menu.classList.contains("open"); };
  burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("open")) { setMenu(false); burger.focus(); } });
  mq.addEventListener("change", syncMq); syncMq();

  /* ---- Scroll state: header, progress bar, process line, back-to-top ---- */
  const hdr = $(".hdr"), bar = $(".progress"), steps = $(".steps");
  let ticking = false;
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    hdr.classList.toggle("scrolled", y > 24);
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    const r = steps.getBoundingClientRect();
    steps.style.setProperty("--p", Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height)).toFixed(3));
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll); onScroll();

  /* ---- Reveal + active nav (IntersectionObserver, with fallback) ---- */
  const rv = $$(".rv");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    rv.forEach((el) => io.observe(el));
    const links = $$(".menu li a"), map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const so = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { links.forEach((a) => { a.classList.remove("active"); a.removeAttribute("aria-current"); }); const a = map.get(e.target.id); if (a) { a.classList.add("active"); a.setAttribute("aria-current", "true"); } }
    }), { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach((s) => { if (map.has(s.id)) so.observe(s); });
  } else rv.forEach((el) => el.classList.add("in"));

  /* ---- Services accordion (click, touch and keyboard via native <button>) ---- */
  const form = $("#form"), serviceSel = $("#service");
  $$(".svc-h").forEach((btn) => btn.addEventListener("click", () => {
    const item = btn.closest(".svc"), open = !item.classList.contains("open");
    item.classList.toggle("open", open); btn.setAttribute("aria-expanded", open);
  }));
  $$("[data-service]").forEach((a) => a.addEventListener("click", () => { serviceSel.value = a.dataset.service; }));

  /* ---- Form: validation + WhatsApp fallback ---- */
  const rules = {
    name: (v) => (v.trim() ? "" : "Enter your name."),
    biz: (v) => (v.trim() ? "" : "Enter your business or brand name."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter a valid email address, like name@business.com."),
    wa: (v) => (!v.trim() || /^\+?[\d\s-]{8,16}$/.test(v) ? "" : "Use digits only, for example 077 123 4567."),
    service: (v) => (v ? "" : "Choose a service, or pick Not Sure Yet."),
    details: (v) => (v.trim().length >= 10 ? "" : "Add a few details about your project (at least 10 characters).")
  };
  const check = (k) => {
    const el = form.elements[k], msg = rules[k](el.value), out = $("#e-" + k);
    el.setAttribute("aria-invalid", !!msg); el.setAttribute("aria-describedby", "e-" + k); out.textContent = msg;
    return !msg;
  };
  Object.keys(rules).forEach((k) => form.elements[k].addEventListener("blur", () => check(k)));
  Object.keys(rules).forEach((k) => form.elements[k].addEventListener("input", () => { if (form.elements[k].getAttribute("aria-invalid") === "true") check(k); }));
  const status = $("#status");
  const say = (t, ok) => { status.textContent = t; status.className = "status full " + (ok ? "ok" : "bad"); };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const bad = Object.keys(rules).filter((k) => !check(k));
    if (bad.length) { say("Please fix the highlighted fields.", false); form.elements[bad[0]].focus(); return; }
    const d = Object.fromEntries(new FormData(form));
    const msg = [`New enquiry for ${CONFIG.agency}`, `Name: ${d.name}`, `Business: ${d.biz}`, `Email: ${d.email}`,
      d.wa ? `WhatsApp: ${d.wa}` : null, `Service: ${d.service}`, d.budget ? `Budget: ${d.budget}` : null, `Details: ${d.details}`].filter(Boolean).join("\n");
    if (waReady) {
      window.open(waUrl(msg), "_blank", "noopener");
      say("WhatsApp is opening with your message. Press send there to deliver it.", true);
    } else if (emailReady) {
      location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Project enquiry: " + d.biz)}&body=${encodeURIComponent(msg)}`;
      say("Your email app is opening with your message. Press send there to deliver it.", true);
    } else {
      say("Contact details are not configured yet. Set the WhatsApp number or email in script.js (CONFIG).", false);
    }
  });

  /* ---- Pointer effects (fine pointers only, skipped for reduced motion) ---- */
  if (matchMedia("(pointer:fine) and (prefers-reduced-motion:no-preference)").matches) {
    const hero = $(".hero"), panel = $(".panel");
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      hero.style.setProperty("--mx", x * 100 + "%"); hero.style.setProperty("--my", y * 100 + "%");
      panel.style.transform = `perspective(900px) rotateY(${(x - 0.5) * 8}deg) rotateX(${(0.5 - y) * 6}deg)`;
    });
    hero.addEventListener("pointerleave", () => { panel.style.transform = ""; });
    $$("[data-tilt]").forEach((c) => {
      c.addEventListener("pointermove", (e) => { const r = c.getBoundingClientRect(); c.style.transform = `perspective(900px) rotateY(${((e.clientX - r.left) / r.width - 0.5) * 5}deg) rotateX(${(0.5 - (e.clientY - r.top) / r.height) * 4}deg)`; });
      c.addEventListener("pointerleave", () => { c.style.transform = ""; });
    });
  }

  /* ---- Count-up for case study results (final value is already in the HTML) ---- */
  const fmt = (el, v) => { const d = +el.dataset.dec || 0; el.textContent = (el.dataset.pre || "") + v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) + (el.dataset.suf || ""); };
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
    $$("[data-to]").forEach((el) => {
      const to = +el.dataset.to;
      const o = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return; o.disconnect();
        const t0 = performance.now();
        const step = (t) => { const p = Math.min(1, (t - t0) / 1300); fmt(el, to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); else fmt(el, to); };
        requestAnimationFrame(step);
      }, { threshold: 0.6 });
      o.observe(el);
    });
  }

  /* ---- Back to top ---- */
  $("#top").addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth" }); });
})();
