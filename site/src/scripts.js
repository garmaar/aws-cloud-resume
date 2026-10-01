/* Visitor counter: original endpoint, implicit GET, JSON and data.visits unchanged.
   Exactly one request per page load; no retries, caching or invented count. */
const API_URL =
  "https://81zwv999m0.execute-api.us-east-1.amazonaws.com/visits";

fetch(API_URL)
  .then(response => response.json())
  .then(data => {
    document.getElementById("visits-count").textContent = data.visits;
  })
  .catch(error => {
    console.error("Error loading visits:", error);
    document.getElementById("visits-count").textContent = "Unavailable";
  });

/* Optional presentation enhancements are independent of the counter. */
(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hero = document.querySelector(".hero");
  const motionToggle = document.querySelector(".motion-toggle");
  let userPaused = false;
  let heroVisible = true;
  let lenis = null;
  let lenisRequested = false;
  const activeAnimations = new Set();

  function updateBackgroundMotion() {
    hero.classList.toggle("motion-enabled", !reducedMotion.matches);
    hero.classList.toggle("motion-paused", userPaused || !heroVisible || document.hidden);
    motionToggle.hidden = reducedMotion.matches;
    motionToggle.textContent = userPaused ? "Resume motion" : "Pause motion";
    motionToggle.setAttribute("aria-pressed", String(userPaused));
    motionToggle.setAttribute("aria-label", userPaused ? "Resume background motion" : "Pause background motion");
  }

  motionToggle.addEventListener("click", () => {
    userPaused = !userPaused;
    updateBackgroundMotion();
  });
  document.addEventListener("visibilitychange", updateBackgroundMotion);

  // Animate on entry, never pre-hide or add opacity:0 classes to content.
  // Without JS, IntersectionObserver or Web Animations, everything stays visible.
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        revealObserver.unobserve(entry.target);
        if (reducedMotion.matches || typeof entry.target.animate !== "function") return;
        const animation = entry.target.animate([
          { opacity: 0.55, transform: "translateY(12px)" },
          { opacity: 1, transform: "translateY(0)" }
        ], { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "none" });
        activeAnimations.add(animation);
        animation.onfinish = animation.oncancel = () => activeAnimations.delete(animation);
      });
    }, { threshold: 0.08 });
    // Cards have their own entrances; the Projects heading is animated separately.
    document.querySelectorAll("[data-reveal]").forEach(element => {
      revealObserver.observe(element.id === "projects" ? element.querySelector("h2") : element);
    });

    const heroObserver = new IntersectionObserver(entries => {
      heroVisible = entries[0].isIntersecting;
      updateBackgroundMotion();
    });
    heroObserver.observe(hero);
  }

  function startLenis() {
    if (reducedMotion.matches || lenis || typeof window.Lenis !== "function") return;
    try {
      lenis = new window.Lenis({
        autoRaf: true,
        smoothWheel: true,
        syncTouch: false, // Keep touch scrolling native, including hybrid devices.
        lerp: 0.1,
        anchors: false, // Native anchors keep URL hash, keyboard and focus behavior.
        virtualScroll: ({ event }) => !event.ctrlKey && !event.shiftKey
      });
    } catch (error) {
      console.warn("Smooth scrolling unavailable; using native scrolling.", error);
    }
  }

  function loadLenis() {
    if (reducedMotion.matches) return;
    if (typeof window.Lenis === "function") {
      startLenis();
      return;
    }
    if (lenisRequested) return;
    lenisRequested = true;
    const script = document.createElement("script");
    // Pinned version; asynchronously loaded so it cannot hold up the counter.
    script.src = "https://unpkg.com/lenis@1.3.26/dist/lenis.min.js";
    script.async = true;
    script.addEventListener("load", startLenis);
    script.addEventListener("error", () => {
      console.warn("Lenis could not be loaded; using native scrolling.");
    });
    document.head.appendChild(script);
  }

  function applyMotionPreference() {
    if (reducedMotion.matches) {
      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
      for (const animation of activeAnimations) animation.cancel();
      activeAnimations.clear();
    } else {
      loadLenis();
    }
    updateBackgroundMotion();
  }

  // Stop wheel inertia before native hash links, focus changes and keyboard scrolling.
  function stopWheelInertia() {
    if (lenis) lenis.scrollTo(window.scrollY, { immediate: true });
  }
  document.addEventListener("click", event => {
    const link = event.target.closest("a[href^='#']");
    if (link) stopWheelInertia();
  });
  document.addEventListener("keydown", event => {
    if (["Tab", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
      stopWheelInertia();
    }
  });
  document.addEventListener("focusin", stopWheelInertia);

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", applyMotionPreference);
  } else {
    reducedMotion.addListener(applyMotionPreference);
  }
  applyMotionPreference();
})();
