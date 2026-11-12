(function () {
  // --- Stockage (sécurisé) ---
  var LS = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var lang = LS.get("lang") === "en" ? "en" : "fr";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var skipIntro = document.documentElement.classList.contains("skip-intro");
  function raf(fn) {
    var q = false;
    return function () { if (q) return; q = true; requestAnimationFrame(function () { q = false; fn(); }); };
  }

  // --- Textes qui changent selon la langue ---
  var ROLES = { fr: ["Développeuse full-stack junior", "Développeuse front-end junior"], en: ["Junior full-stack developer", "Junior front-end developer"] };
  var WORDS = { fr: ["Concevoir", "Créer", "Inspirer"], en: ["Design", "Create", "Inspire"] };
  var MARQ = { fr: "CONSTRUIRE L’AVENIR • ", en: "BUILDING THE FUTURE • " };
  var ri = 0, wi = 0;
  var lw = document.getElementById("lw"), lc = document.getElementById("lc"), lb = document.getElementById("lb"), ld = document.getElementById("loader");
  var mq = document.getElementById("mq");

  function applyLang(l) {
    lang = l; document.documentElement.lang = l;
    document.querySelectorAll("[data-en]").forEach(function (el) {
      if (!el.hasAttribute("data-fr")) el.setAttribute("data-fr", el.innerHTML);
      el.innerHTML = el.getAttribute(l === "en" ? "data-en" : "data-fr");
    });
    document.querySelectorAll("#lang button").forEach(function (b) {
      var on = b.dataset.l === l;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.getElementById("role").textContent = ROLES[l][ri];
    lw.textContent = WORDS[l][wi];
    mq.textContent = new Array(11).join(MARQ[l]);
    LS.set("lang", l);
  }
  document.querySelectorAll("#lang button").forEach(function (b) { b.addEventListener("click", function () { applyLang(b.dataset.l); }); });

  // --- Thème clair / sombre ---
  var tg = document.getElementById("tg");
  function applyTheme(t) {
    if (t === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    tg.textContent = t === "light" ? "☾" : "☀";
    tg.setAttribute("aria-pressed", t === "light" ? "true" : "false");
    LS.set("theme", t);
  }
  applyTheme(LS.get("theme") === "light" ? "light" : "dark");
  tg.addEventListener("click", function () { applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light"); });

  // --- Menu mobile ---
  var links = document.getElementById("links"), mb = document.getElementById("mb");
  function setMenu(open) {
    links.classList.toggle("open", open);
    mb.setAttribute("aria-expanded", open ? "true" : "false");
  }
  mb.addEventListener("click", function () { setMenu(!links.classList.contains("open")); });
  links.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  document.addEventListener("click", function (e) {
    if (links.classList.contains("open") && !links.contains(e.target) && !mb.contains(e.target)) setMenu(false);
  });

  // --- Vidéo HLS (hero + footer) ---
  var SRC = "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";
  function hls(v) {
    try {
      if (window.Hls && Hls.isSupported()) { var h = new Hls(); h.loadSource(SRC); h.attachMedia(v); }
      else if (v.canPlayType("application/vnd.apple.mpegurl")) { v.src = SRC; }
    } catch (e) {}
  }
  hls(document.getElementById("hv")); hls(document.getElementById("fv"));

  // --- Marquee du footer ---
  if (window.gsap && !reduce) gsap.to("#mq", { xPercent: -50, duration: 40, ease: "none", repeat: -1 });

  // --- Rôles qui défilent ---
  if (!reduce) setInterval(function () {
    ri = (ri + 1) % ROLES[lang].length;
    var old = document.getElementById("role"), n = old.cloneNode(false);
    n.textContent = ROLES[lang][ri]; old.parentNode.replaceChild(n, old);
  }, 2000);

  applyLang(lang);

  // --- Header : ombre au scroll + lien actif ---
  var pill = document.getElementById("pill");
  addEventListener("scroll", raf(function () { pill.classList.toggle("s", scrollY > 100); }), { passive: true });
  var nls = document.querySelectorAll(".nl");
  var so = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) nls.forEach(function (l) { l.classList.toggle("a", l.getAttribute("href") === "#" + e.target.id); });
    });
  }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
  ["home", "about", "skills", "journey", "projects", "motivation", "contact"].forEach(function (id) { so.observe(document.getElementById(id)); });

  // --- Trait animé du parcours ---
  var tl2 = document.getElementById("tl2"), vf = document.getElementById("vf"), vd = document.getElementById("vd");
  function vp() {
    var r = tl2.getBoundingClientRect();
    var p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
    vf.style.transform = "scaleY(" + p + ")"; vd.style.top = (p * 100) + "%";
  }
  addEventListener("scroll", raf(vp), { passive: true }); vp();

  // --- Apparition au scroll ---
  var ro = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -100px 0px" });
  document.querySelectorAll(".rv").forEach(function (el) { ro.observe(el); });

  // --- Logos : essaie .svg, .png, .jpg, .jpeg, .webp ; retire l’image si aucun fichier n’existe ---
  document.querySelectorAll("img[data-logo]").forEach(function (img) {
    var exts = ["svg", "png", "jpg", "jpeg", "webp"], i = 0;
    function next() { if (i < exts.length) img.src = img.dataset.logo + "." + exts[i++]; else img.remove(); }
    img.onerror = next; next();
  });

  // --- Entrée du hero (GSAP) ---
  function enter() {
    if (!window.gsap || reduce) { document.querySelectorAll(".pre").forEach(function (e) { e.style.opacity = 1; }); return; }
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(".nr", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2 }, 0.1)
      .fromTo(".bi", { opacity: 0, filter: "blur(10px)", y: 20 }, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, stagger: 0.1 }, 0.3);
  }

  // --- Écran de chargement 000 → 100 ---
  if (!skipIntro && !reduce) setInterval(function () { wi = (wi + 1) % 3; lw.textContent = WORDS[lang][wi]; }, 900);
  var st = null, DUR = reduce ? 300 : 1600;
  function tick(ts) {
    if (!st) st = ts;
    var p = Math.min((ts - st) / DUR, 1), c = Math.round(p * 100);
    lc.textContent = String(c).padStart(3, "0"); lb.style.transform = "scaleX(" + c / 100 + ")";
    if (p < 1) requestAnimationFrame(tick);
    else setTimeout(function () { ld.style.opacity = 0; setTimeout(function () { ld.remove(); enter(); }, 500); }, 400);
  }
  if (skipIntro) {
    if (ld && ld.parentNode) ld.parentNode.removeChild(ld);
    enter();
  } else {
    requestAnimationFrame(tick);
  }
})();