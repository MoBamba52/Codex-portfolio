/* ===== CONFIGURATION : modifiez cette section ===== */
const CONFIG = {
  email: "",          // ex. "contact@mondomaine.com"
  whatsapp: "",       // ex. "https://wa.me/33600000000"
  github: "",         // ex. "https://github.com/pseudo"
  linkedin: "",       // ex. "https://www.linkedin.com/in/pseudo"
  formEndpoint: ""    // ex. URL Formspree "https://formspree.io/f/xxxx" (envoi réel)
};
// Supprimez une ligne pour retirer une compétence.
const SKILLS = {
  "Développement": ["HTML", "CSS", "JavaScript", "PHP", "MySQL"],
  "Design": ["Design graphique", "UI/UX design", "Maquettes web", "Identité visuelle"],
  "Outils": ["Git et GitHub", "Visual Studio Code", "Figma"]
};
// status : "En cours" | "Concept" | "Terminé". Ajoutez demo / code / image (chemin) quand ils existent.
const PROJECTS = [
  { title: "Classique Immo", status: "Terminé", desc: "Projet de plateforme web de gestion immobilière.", tech: ["HTML","CSS","JavaScript","PHP","MySQL"], demo: "", code: "", image: "images/maquette.png" },
  { title: "CODEX Brand Identity", status: "En cours", desc: "Création de l’identité visuelle de CODEX : logo, palette de couleurs et typographie.", tech: ["Logo","Couleurs","Typographie"], demo: "", code: "", image: "" },
  { title: "Projet UI/UX", status: "Concept", desc: "Conception d’une interface moderne pour une application ou un service numérique.", tech: ["UI/UX","Maquettes"], demo: "", code: "", image: "" }
];
/* ===== FIN DE LA CONFIGURATION ===== */

const $ = (s) => document.querySelector(s);
const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h) e.innerHTML = h; return e; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Compétences
Object.entries(SKILLS).forEach(([cat, list]) => {
  if (!list.length) return;
  $("#skills").append(el("article", "card", `<h3>${esc(cat)}</h3><ul class="chips">${list.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`));
});

// Projets
PROJECTS.forEach((p) => {
  const thumb = p.image ? `<img src="${esc(p.image)}" alt="Aperçu du projet ${esc(p.title)}" loading="lazy">` : esc(p.title.slice(0, 2).toUpperCase());
  const btns = (p.demo ? `<a class="btn btn-primary btn-sm" href="${esc(p.demo)}" target="_blank" rel="noopener">Voir le projet</a>` : "") +
               (p.code ? `<a class="btn btn-ghost btn-sm" href="${esc(p.code)}" target="_blank" rel="noopener">Code source</a>` : "");
  $("#projects").append(el("article", "card",
    `<div class="thumb">${thumb}</div><span class="badge">${esc(p.status)}</span><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p>
     <ul class="chips">${p.tech.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>${btns ? `<div class="actions">${btns}</div>` : ""}`));
});

// Liens de contact (affichés seulement s'ils sont renseignés)
[[CONFIG.email && `mailto:${CONFIG.email}`, CONFIG.email, true], [CONFIG.whatsapp, "WhatsApp"], [CONFIG.github, "GitHub"], [CONFIG.linkedin, "LinkedIn"]]
  .filter(([u]) => u).forEach(([u, label, isMail]) => {
    const ext = u.startsWith("http") ? ' target="_blank" rel="noopener"' : "";
    const a = `<li><a href="${esc(u)}"${ext}>${esc(label)}</a></li>`;
    $("#links").insertAdjacentHTML("beforeend", a);
    if (!isMail) $("#footlinks").insertAdjacentHTML("beforeend", a);
  });

// Menu mobile
const burger = $("#burger"), nav = $("#nav");
const setMenu = (open) => { nav.classList.toggle("open", open); burger.setAttribute("aria-expanded", open); burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu"); };
burger.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
nav.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

// Header, retour en haut, année
const onScroll = () => { $("#header").classList.toggle("scrolled", scrollY > 20); $("#top").classList.toggle("show", scrollY > 600); };
addEventListener("scroll", onScroll, { passive: true }); onScroll();
$("#year").textContent = new Date().getFullYear();

// Apparition au défilement (désactivée par prefers-reduced-motion dans le CSS)
const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))), { threshold: .1 });
document.querySelectorAll(".card").forEach((c) => { c.classList.add("reveal"); io.observe(c); });

// Formulaire
const form = $("#form"), status = $("#status");
const say = (msg, ok) => { status.textContent = msg; status.className = ok ? "ok" : "err"; };
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  let bad = null;
  [...form.elements].forEach((f) => {
    if (!f.name) return;
    const v = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value)) || (f.name === "message" && f.value.trim().length < 10);
    f.setAttribute("aria-invalid", v); if (v && !bad) bad = f;
  });
  if (bad) { say("Vérifiez les champs signalés (e-mail valide, message de 10 caractères minimum).", false); bad.focus(); return; }
  if (CONFIG.formEndpoint) {
    try {
      const r = await fetch(CONFIG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(d) });
      if (!r.ok) throw new Error();
      form.reset(); say("Message envoyé. Merci, je vous réponds rapidement.", true);
    } catch { say("L’envoi a échoué. Réessayez plus tard ou écrivez directement par e-mail.", false); }
  } else if (CONFIG.email) {
    const body = `${d.message}\n\nNom : ${d.nom}\nE-mail : ${d.email}\nType de projet : ${d.type}`;
    location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(d.sujet)}&body=${encodeURIComponent(body)}`;
    say("Votre application de messagerie s’ouvre. Le message n’est envoyé qu’une fois validé dans celle-ci.", true);
  } else say("Formulaire non configuré : renseignez formEndpoint ou email dans js/script.js.", false);
});
