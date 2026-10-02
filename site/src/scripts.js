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
  let sectionObserver = null;
  const revealedHeadings = new WeakSet();

  // One small heading entrance per section. Body text, projects and SVG stay still.
  // No pre-hidden content, scroll scrubbing, staggered rows or animation library.
  function startSectionEntrances() {
    if (sectionObserver || reducedMotion.matches || !("IntersectionObserver" in window)) return;
    sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        sectionObserver.unobserve(entry.target);
        revealedHeadings.add(entry.target);
        const heading = entry.target;
        if (reducedMotion.matches || !heading || typeof heading.animate !== "function") return;
        const animation = heading.animate([
          { opacity: 0.9, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" }
        ], { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "none" });
        activeAnimations.add(animation);
        animation.onfinish = animation.oncancel = () => activeAnimations.delete(animation);
      });
    }, { threshold: 0, rootMargin: "0px 0px -32px 0px" });
    document.querySelectorAll(".block:not(.block--architecture) > h2").forEach(heading => {
      if (!revealedHeadings.has(heading)) sectionObserver.observe(heading);
    });
  }

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

  // CSS never pre-hides content; all enhancements are optional.
  if ("IntersectionObserver" in window) {
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
      if (sectionObserver) { sectionObserver.disconnect(); sectionObserver = null; }
      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
      for (const animation of activeAnimations) animation.cancel();
      activeAnimations.clear();
    } else {
      loadLenis();
      startSectionEntrances();
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
