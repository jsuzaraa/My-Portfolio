/* ============================================================
   Jen Suzara Andres — PORTFOLIO
   Vanilla JS, no dependencies.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     1. MOBILE NAV TOGGLE
  --------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------
     2. TIMECODE SCRUBBER — scroll-linked playhead + readout
        Formats elapsed scroll as HH:MM:SS:FF (24fps), and
        highlights the tick for the section in view.
  --------------------------------------------------------- */
  const scrubberFill = document.getElementById("scrubberFill");
  const scrubberPlayhead = document.getElementById("scrubberPlayhead");
  const scrubberReadout = document.getElementById("scrubberReadout");
  const ticks = Array.from(document.querySelectorAll(".scrub-tick"));
  const navLinks = Array.from(document.querySelectorAll("[data-nav]"));

  const FPS = 24;
  const TOTAL_SECONDS = 90; // stylized "duration" of the page, mapped to full scroll

  function formatTimecode(totalFrames) {
    const f = Math.max(0, Math.floor(totalFrames));
    const frames = f % FPS;
    const totalSecs = Math.floor(f / FPS);
    const secs = totalSecs % 60;
    const totalMins = Math.floor(totalSecs / 60);
    const mins = totalMins % 60;
    const hours = Math.floor(totalMins / 60);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(hours)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
  }

  function updateScrubber() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

    if (scrubberFill) scrubberFill.style.width = `${progress * 100}%`;
    if (scrubberPlayhead) scrubberPlayhead.style.left = `${progress * 100}%`;
    if (scrubberReadout) {
      scrubberReadout.textContent = formatTimecode(progress * TOTAL_SECONDS * FPS);
    }
  }

  let scrubberTicking = false;
  window.addEventListener("scroll", () => {
    if (!scrubberTicking) {
      window.requestAnimationFrame(() => {
        updateScrubber();
        scrubberTicking = false;
      });
      scrubberTicking = true;
    }
  }, { passive: true });

  updateScrubber();

  ticks.forEach((tick) => {
    tick.addEventListener("click", () => {
      const targetSelector = tick.getAttribute("data-target");
      const target = document.querySelector(targetSelector);
      if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });

  /* ---- active section tracking for ticks + nav links ---- */
  const trackedSections = ticks
    .map((t) => document.querySelector(t.getAttribute("data-target")))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;

        ticks.forEach((t) => t.classList.toggle("is-active", t.getAttribute("data-target") === id));
        navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === id));
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );
  trackedSections.forEach((sec) => sectionObserver.observe(sec));

  /* ---------------------------------------------------------
     3. SCROLL REVEAL — fade/slide up elements as they enter view
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll("[data-reveal]");

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

/* =========================
   SKILL BAR ANIMATION
========================= */

const skillSection = document.querySelector(".skills-section");
const skillBars = document.querySelectorAll(".skill-progress");

const skillObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {

        skillBars.forEach((bar) => {
          const level = bar.dataset.level;

          setTimeout(() => {
            bar.style.width = `${level}%`;
          }, 150);
        });

        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2
  }
);

if (skillSection) {
  skillObserver.observe(skillSection);
};
  skillBars.forEach((bar) => skillObserver.observe(bar));

  /* ---------------------------------------------------------
     5. WORK FILTERS
  --------------------------------------------------------- */
  const filterButtons = document.querySelectorAll(".filter-btn");
  const workCards = document.querySelectorAll(".work-card");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const filter = btn.getAttribute("data-filter");
      workCards.forEach((card) => {
        const match = filter === "all" || card.getAttribute("data-category") === filter;
        card.hidden = !match;
      });
    });
  });

  /* ---------------------------------------------------------
     7. CUSTOM PLAYHEAD CURSOR (desktop only, decorative)
  --------------------------------------------------------- */
  const cursor = document.querySelector(".playhead-cursor");
  const hoverTargets = "a, button, .work-card, .cert-card, input, textarea";

  if (cursor && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      cursor.classList.add("is-visible");
    });
    window.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));

    document.querySelectorAll(hoverTargets).forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-active"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
    });
  }

  /* ---------------------------------------------------------
     7. CONTACT FORM — lightweight client-side validation
        (no backend wired up; replace with your own endpoint)
  --------------------------------------------------------- */
  const contactForm = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name || !email || !message) {
        formNote.textContent = "Please fill in every field before sending.";
        return;
      }
      if (!emailPattern.test(email)) {
        formNote.textContent = "That email address doesn't look right.";
        return;
      }

      // No backend connected yet — wire this up to your form
      // service or mail API of choice (Formspree, Resend, etc).
      formNote.textContent = `Thanks, ${name.split(" ")[0]} — kindly message me directly on my email or LinkedIn.`;
      contactForm.reset();
    });
  }

  /* ---------------------------------------------------------
     8. FOOTER YEAR
  --------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});