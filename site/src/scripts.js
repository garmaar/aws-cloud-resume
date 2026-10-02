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
  let scrollContext = null;
  let scrollLibraryPromise = null;
  let fallbackObserver = null;
  const narrowScreen = window.matchMedia("(max-width: 600px)");

  function syncScroll() {
    if (window.ScrollTrigger) window.ScrollTrigger.update();
  }

  function loadScript(url, globalName) {
    if (window[globalName]) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = () => window[globalName] ? resolve() : reject(new Error(globalName + " unavailable"));
      script.onerror = () => reject(new Error(globalName + " could not be loaded"));
      document.head.appendChild(script);
    });
  }

  function stopScrollEffects() {
    if (scrollContext) {
      scrollContext.revert();
      scrollContext = null;
    }
    document.documentElement.classList.remove("scroll-visual-ready");
  }

  function startFallback() {
    if (fallbackObserver || reducedMotion.matches || !("IntersectionObserver" in window)) return;
    fallbackObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        fallbackObserver.unobserve(entry.target);
        if (reducedMotion.matches || typeof entry.target.animate !== "function") return;
        const animation = entry.target.animate([
          { opacity: 0.85, transform: "translateY(18px)" },
          { opacity: 1, transform: "translateY(0)" }
        ], { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "none" });
        activeAnimations.add(animation);
        animation.onfinish = animation.oncancel = () => activeAnimations.delete(animation);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".block > h2, .proj, .spec-row, .timeline li").forEach(el => fallbackObserver.observe(el));
  }

  function startScrollEffects() {
    if (reducedMotion.matches || scrollContext || !window.gsap || !window.ScrollTrigger) return;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    if (fallbackObserver) { fallbackObserver.disconnect(); fallbackObserver = null; }
    for (const animation of activeAnimations) animation.cancel();
    activeAnimations.clear();
    document.documentElement.classList.add("scroll-visual-ready");
    const small = narrowScreen.matches;

    try {
      scrollContext = gsap.context(() => {});
      scrollContext.add(() => {
        const trigger = (element, start = "top 92%", end = "top 62%") => ({
          trigger: element, start, end, scrub: 0.45, invalidateOnRefresh: true
        });

        // Every section has a measured visual introduction, without moving its SVG.
        document.querySelectorAll(".block").forEach(section => {
          const heading = section.querySelector("h2");
          gsap.fromTo(heading, { y: small ? 18 : 28 }, {
            y: 0, ease: "none", scrollTrigger: trigger(heading)
          });

        });

        // Titles and descriptions arrive in separate planes; no cards or scroll pinning.
        document.querySelectorAll(".proj").forEach(project => {
          const identity = project.querySelectorAll(".proj-head, .proj-stack, .proj-link");
          const details = project.querySelectorAll("li");
          const timeline = gsap.timeline({ scrollTrigger: trigger(project, "top 90%", "top 46%") });
          timeline.fromTo(identity, { x: small ? 0 : -28, y: small ? 24 : 0 }, {
            x: 0, y: 0, duration: 1, ease: "power2.out"
          }, 0);
          gsap.set(details, { x: small ? 0 : 24, y: 24, opacity: 0.85 });
          timeline.to(details, {
            x: 0, y: 0, opacity: 1, stagger: 0.16, duration: 0.85, ease: "power2.out"
          }, 0.12);
        });

        document.querySelectorAll("#skills .spec-row").forEach(row => {
          gsap.fromTo(row, { x: small ? 0 : 24, y: 18, opacity: 0.85 }, {
            x: 0, y: 0, opacity: 1, ease: "none", scrollTrigger: trigger(row, "top 94%", "top 70%")
          });
        });
        document.querySelectorAll(".timeline li, #certifications .spec-row").forEach(row => {
          gsap.fromTo(row, { y: 30, opacity: 0.85 }, {
            y: 0, opacity: 1, ease: "none", scrollTrigger: trigger(row, "top 94%", "top 70%")
          });
        });
      });
      // Refresh once fonts settle; Lenis keeps its own RAF, avoiding duplicate RAF calls.
      if (document.fonts) document.fonts.ready.then(() => {
        if (scrollContext && !reducedMotion.matches) ScrollTrigger.refresh();
      });
      ScrollTrigger.refresh();
    } catch (error) {
      stopScrollEffects();
      startFallback();
      console.warn("Scroll effects unavailable; using simple entrances.", error);
    }
  }

  function loadScrollEffects() {
    if (reducedMotion.matches) return;
    if (!scrollLibraryPromise) {
      scrollLibraryPromise = loadScript("https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js", "gsap")
        .then(() => loadScript("https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js", "ScrollTrigger"));
    }
    scrollLibraryPromise.then(startScrollEffects).catch(error => {
      startFallback();
      console.warn("GSAP could not be loaded; page remains usable.", error);
    });
  }

  function rebuildScrollEffects() {
    stopScrollEffects();
    if (!reducedMotion.matches) loadScrollEffects();
  }
  if (typeof narrowScreen.addEventListener === "function") {
    narrowScreen.addEventListener("change", rebuildScrollEffects);
  } else {
    narrowScreen.addListener(rebuildScrollEffects);
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
      lenis.on("scroll", syncScroll);
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
      stopScrollEffects();
      if (fallbackObserver) { fallbackObserver.disconnect(); fallbackObserver = null; }
      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
      for (const animation of activeAnimations) animation.cancel();
      activeAnimations.clear();
    } else {
      loadLenis();
      loadScrollEffects();
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
