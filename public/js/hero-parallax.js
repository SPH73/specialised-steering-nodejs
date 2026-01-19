(() => {
  const heroImage = document.querySelector(".parallax-1 .hero-background");
  const heroSection = document.querySelector(".parallax-1");

  if (!heroImage || !heroSection) {
    return;
  }

  const desktopQuery = window.matchMedia("(min-width: 992px)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const parallaxSpeed = 0.2;
  let ticking = false;
  let enabled = false;

  const updateParallax = () => {
    if (!enabled) {
      ticking = false;
      return;
    }

    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const elementTop = heroSection.offsetTop;
    const offset = Math.max(0, scrollY - elementTop) * parallaxSpeed;

    heroImage.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  const enableParallax = () => {
    if (enabled) {
      return;
    }

    enabled = true;
    document.documentElement.classList.add("parallax-enabled");
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateParallax();
  };

  const disableParallax = () => {
    if (!enabled) {
      return;
    }

    enabled = false;
    document.documentElement.classList.remove("parallax-enabled");
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    heroImage.style.transform = "";
  };

  const evaluateParallax = () => {
    if (reducedMotionQuery.matches || !desktopQuery.matches) {
      disableParallax();
      return;
    }

    enableParallax();
  };

  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener("change", evaluateParallax);
    reducedMotionQuery.addEventListener("change", evaluateParallax);
  } else {
    desktopQuery.addListener(evaluateParallax);
    reducedMotionQuery.addListener(evaluateParallax);
  }

  evaluateParallax();
})();
