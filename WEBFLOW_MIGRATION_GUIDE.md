# Webflow to Modern CSS Migration Guide

**Date**: December 18, 2025  
**Project**: Specialised Steering Web Application  
**Goal**: Remove Webflow dependencies and convert to maintainable, lightweight modern CSS

---

## 📊 Current State Analysis

### Webflow Code Present:
- **`public/js/scripts.js`**: 31,783 lines of minified Webflow JavaScript (~1.2MB)
- **`public/css/styles.css`**: 231 lines of Webflow utility classes
- **`public/documents/menu-icon-animation.json`**: 6KB Lottie animation file
- **HTML Templates**: 59+ instances of `w-*` classes across 12 files
- **Webflow Attributes**: `data-wf-page`, `data-w-id`, `data-animation-type`

### Dependencies to Remove:
1. Webflow JavaScript library
2. Lottie animation player (embedded in Webflow)
3. Webflow-specific CSS utilities
4. Webflow touch detection script
5. All `w-*` CSS classes

---

## 🎯 Migration Goals

1. **Reduce JavaScript**: 1.2MB → ~2KB (99% reduction)
2. **Remove External Dependencies**: Zero third-party animation libraries
3. **Improve Performance**: 95+ Lighthouse score
4. **Maintainability**: Clean, documented, modern CSS/JS
5. **Preserve Functionality**: All animations and interactions work better

---

## 📋 Migration Phases

### Phase 1: Preparation & Documentation ✅
- [x] Create this migration guide
- [x] Document current Webflow usage
- [x] Commit all current changes
- [ ] Create backup branch

### Phase 2: Remove Webflow Dependencies
- [ ] Delete `public/js/scripts.js`
- [ ] Delete `public/documents/menu-icon-animation.json`
- [ ] Remove Webflow utilities from `public/css/styles.css`
- [ ] Remove Webflow touch detection from `views/includes/head.ejs`
- [ ] Remove Webflow script tags from templates

### Phase 3: Replace Mobile Menu Animation
- [ ] Create CSS hamburger menu animation (Lottie replacement)
- [ ] Add JavaScript menu toggle functionality
- [ ] Update `views/includes/nav.ejs` with new markup
- [ ] Test menu on mobile devices

### Phase 4: Replace Brand Logo Animation
- [ ] Convert `w-layout-grid` to CSS Grid
- [ ] Add CSS animations for logo appearance
- [ ] Implement scroll-triggered animations (Intersection Observer)
- [ ] Update `views/includes/header.ejs`
- [ ] Test on all screen sizes

### Phase 5: Replace w-* Component Classes
- [ ] Create custom CSS equivalents for all `w-*` classes
- [ ] Update all `.ejs` files with new classes
- [ ] Remove `data-wf-*` attributes
- [ ] Test all pages and components

### Phase 6: Testing & Optimization
- [ ] Test all pages on desktop
- [ ] Test all pages on mobile
- [ ] Test all animations and interactions
- [ ] Run Lighthouse performance audit
- [ ] Fix any issues found
- [ ] Cross-browser testing

### Phase 7: Cleanup & Documentation
- [ ] Remove unused CSS
- [ ] Document new animation system
- [ ] Update README with changes
- [ ] Final commit and deploy

---

## 🔧 Technical Implementation Details

### 1. Mobile Menu Animation

#### Current (Lottie):
```html
<div data-animation-type="lottie" 
     data-src="../documents/menu-icon-animation.json">
</div>
```

#### New (Pure CSS):
```html
<button class="menu-toggle" aria-label="Toggle menu">
  <span class="menu-icon">
    <span class="menu-line menu-line-top"></span>
    <span class="menu-line menu-line-middle"></span>
    <span class="menu-line menu-line-bottom"></span>
  </span>
</button>
```

**CSS** (`~80 lines`):
```css
/* Hamburger Menu Button */
.menu-toggle {
  background: transparent;
  border: none;
  padding: 0.75rem;
  cursor: pointer;
  display: none;
}

@media (max-width: 991px) {
  .menu-toggle {
    display: block;
  }
}

.menu-icon {
  display: block;
  width: 30px;
  height: 24px;
  position: relative;
}

.menu-line {
  display: block;
  position: absolute;
  height: 4px;
  width: 100%;
  background: #4f4f4f;
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  left: 0;
}

.menu-line-top {
  top: 0;
}

.menu-line-middle {
  top: 50%;
  transform: translateY(-50%);
}

.menu-line-bottom {
  bottom: 0;
}

/* Active state (X icon) */
.menu-toggle.active .menu-line-top {
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.menu-toggle.active .menu-line-middle {
  opacity: 0;
  transform: translateX(-20px);
}

.menu-toggle.active .menu-line-bottom {
  bottom: 50%;
  transform: translateY(50%) rotate(-45deg);
}
```

**JavaScript** (`~15 lines`):
```javascript
// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.navbar_menu');
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }
});
```

---

### 2. Brand Logo Grid Animation

#### Current (Webflow):
```html
<div class="w-layout-grid brands-logo-grid">
  <img src="..." class="brand-image" />
  <!-- Webflow handles animations -->
</div>
```

#### New (CSS Grid + Animations):
```html
<div class="brands-grid">
  <img src="..." alt="..." class="brand-logo" loading="eager" />
</div>
```

**CSS** (`~100 lines`):
```css
/* Brand Logo Grid */
.brands-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2rem;
  align-items: center;
  justify-items: center;
  padding: 2rem 0;
}

.brand-logo {
  width: 100%;
  max-width: 150px;
  height: auto;
  opacity: 0;
  transform: scale(0.8);
  animation: logoAppear 0.6s ease-out forwards;
  filter: grayscale(100%);
  transition: all 0.3s ease;
}

.brand-logo:hover {
  filter: grayscale(0%);
  transform: scale(1.05);
}

/* Stagger animations */
.brand-logo:nth-child(1) { animation-delay: 0.1s; }
.brand-logo:nth-child(2) { animation-delay: 0.2s; }
.brand-logo:nth-child(3) { animation-delay: 0.3s; }
.brand-logo:nth-child(4) { animation-delay: 0.4s; }
.brand-logo:nth-child(5) { animation-delay: 0.5s; }
.brand-logo:nth-child(6) { animation-delay: 0.6s; }
.brand-logo:nth-child(7) { animation-delay: 0.7s; }
.brand-logo:nth-child(8) { animation-delay: 0.8s; }
.brand-logo:nth-child(9) { animation-delay: 0.9s; }
.brand-logo:nth-child(10) { animation-delay: 1.0s; }

@keyframes logoAppear {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 991px) {
  .brands-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 767px) {
  .brands-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}
```

---

### 3. Webflow Class Replacements

Comprehensive mapping of all `w-*` classes to custom equivalents:

| Webflow Class | Custom Replacement | Usage |
|---------------|-------------------|-------|
| `w-button` | `button` or `btn` | Buttons and CTAs |
| `w-inline-block` | `inline-block` | Inline block elements |
| `w-form` | `form` | Form containers |
| `w-layout-grid` | `grid` | Grid layouts |
| `w-list-unstyled` | `list-unstyled` | Lists without bullets |
| `w-clearfix` | `clearfix` | Float clearing |
| `w-container` | `container` | Content containers |
| `w-embed` | `embed` | Embedded content |
| `w-row` | `row` | Flexbox rows |
| `w-hidden` | `hidden` | Hidden elements |
| `w-block` | `block` | Block elements |
| `w-node-*` | (remove) | Webflow-specific IDs |
| `data-wf-page` | (remove) | Webflow page ID |
| `data-w-id` | (remove) | Webflow element ID |

**Custom CSS for Replacements**:
```css
/* Button Component */
.button,
.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #3898ec;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 0.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button:hover,
.btn:hover {
  background-color: #2a7bc4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(56, 152, 236, 0.3);
}

/* Layout Utilities */
.inline-block {
  display: inline-block;
  max-width: 100%;
}

.block {
  display: block;
}

.hidden {
  display: none;
}

.clearfix::after {
  content: "";
  display: table;
  clear: both;
}

/* Form Component */
.form {
  margin-bottom: 1rem;
}

/* List Component */
.list-unstyled {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

/* Grid Component */
.grid {
  display: grid;
  grid-auto-columns: 1fr;
  gap: 1rem;
}

.grid-2col {
  grid-template-columns: repeat(2, 1fr);
}

.grid-3col {
  grid-template-columns: repeat(3, 1fr);
}

.grid-4col {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 991px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

/* Container */
.container {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

/* Flexbox Row */
.row {
  display: flex;
  flex-wrap: wrap;
  margin-left: -0.75rem;
  margin-right: -0.75rem;
}

.row > * {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}
```

---

### 4. Scroll-Triggered Animations

Using **Intersection Observer API** (native browser API, no dependencies):

```javascript
// Scroll animations using Intersection Observer
document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        // Optionally unobserve after animation
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements to animate
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
});
```

**CSS for Scroll Animations**:
```css
/* Fade in up animation */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.animate-on-scroll.animate {
  opacity: 1;
  transform: translateY(0);
}

/* Alternative: Fade in */
.fade-in {
  opacity: 0;
  transition: opacity 0.8s ease-out;
}

.fade-in.animate {
  opacity: 1;
}

/* Alternative: Slide in from left */
.slide-in-left {
  opacity: 0;
  transform: translateX(-50px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.slide-in-left.animate {
  opacity: 1;
  transform: translateX(0);
}
```

---

## 📁 Files to Modify

### Delete:
- [ ] `public/js/scripts.js`
- [ ] `public/documents/menu-icon-animation.json`

### Modify:
- [ ] `public/css/styles.css` - Remove Webflow utilities
- [ ] `public/css/specialised-steering.css` - Add new custom CSS
- [ ] `views/includes/head.ejs` - Remove Webflow scripts
- [ ] `views/includes/nav.ejs` - New mobile menu markup
- [ ] `views/includes/header.ejs` - New brand grid markup
- [ ] `views/includes/blockjs.ejs` - Update script references
- [ ] All `.ejs` files - Replace `w-*` classes

### Create:
- [ ] `public/js/menu.js` - Mobile menu functionality
- [ ] `public/js/animations.js` - Scroll animations
- [ ] `public/css/animations.css` - Animation styles (optional, can merge into main CSS)

---

## 🧪 Testing Checklist

### Desktop Testing:
- [ ] Homepage loads correctly
- [ ] All pages render properly
- [ ] Navigation works
- [ ] Brand logos animate correctly
- [ ] Forms still function
- [ ] Buttons have hover effects
- [ ] All links work
- [ ] Images load properly

### Mobile Testing:
- [ ] Mobile menu button animates (hamburger → X)
- [ ] Mobile menu opens/closes correctly
- [ ] All pages responsive
- [ ] Touch interactions work
- [ ] Brand logos display correctly
- [ ] Forms usable on mobile
- [ ] Performance is good

### Animation Testing:
- [ ] Brand logos fade in on load
- [ ] Scroll animations trigger properly
- [ ] Menu animation is smooth
- [ ] No janky animations
- [ ] 60fps performance

### Browser Testing:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (desktop & iOS)
- [ ] Mobile browsers

### Performance Testing:
- [ ] Run Lighthouse audit
- [ ] Check page load time
- [ ] Verify JavaScript bundle size
- [ ] Check CSS file size
- [ ] Test on slow 3G network

---

## 📊 Expected Results

### Before Migration:
- **Total JS**: ~1.2MB (Webflow + Lottie)
- **Page Load**: ~3-4 seconds
- **Lighthouse Score**: 75-85
- **Dependencies**: Webflow library, Lottie
- **Maintainability**: Low (minified vendor code)

### After Migration:
- **Total JS**: ~2-5KB (custom code only)
- **Page Load**: ~1-2 seconds
- **Lighthouse Score**: 95+
- **Dependencies**: Zero!
- **Maintainability**: High (documented custom code)

### Performance Gains:
- ✅ **99% JavaScript reduction**
- ✅ **~2 seconds faster page load**
- ✅ **Better SEO** (faster load times)
- ✅ **Better mobile experience**
- ✅ **Lower bandwidth usage**
- ✅ **Improved accessibility**
- ✅ **Easier maintenance**

---

## 🔄 Rollback Plan

If issues arise during migration:

1. **Git Reset**: Revert to pre-migration commit
   ```bash
   git reset --hard <commit-hash>
   ```

2. **Cherry-pick**: Bring back specific changes if needed
   ```bash
   git cherry-pick <commit-hash>
   ```

3. **Branch Strategy**: Keep old branch as backup
   ```bash
   git branch backup-webflow-version
   ```

---

## 📝 Post-Migration Tasks

After successful migration:

- [ ] Update `README.md` with new architecture
- [ ] Document custom animation system
- [ ] Update `PROJECT_OVERVIEW.md`
- [ ] Add comments to new CSS/JS
- [ ] Create style guide for new components
- [ ] Train team on new system (if applicable)
- [ ] Monitor production for issues
- [ ] Collect performance metrics

---

## 🎓 Learning Resources

For maintaining the new system:

### CSS Grid:
- [CSS-Tricks Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [MDN CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)

### CSS Animations:
- [MDN CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Using_CSS_animations)
- [Animista - CSS Animation Library](https://animista.net/)

### Intersection Observer:
- [MDN Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [CSS-Tricks Guide to Intersection Observer](https://css-tricks.com/a-few-functional-uses-for-intersection-observer-to-know-when-an-element-is-in-view/)

### Modern JavaScript:
- [JavaScript.info - Modern JavaScript Tutorial](https://javascript.info/)
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)

---

## 🚀 Migration Timeline

Estimated time: **4-6 hours**

- **Phase 1**: Preparation (30 mins) ✅
- **Phase 2**: Remove dependencies (30 mins)
- **Phase 3**: Mobile menu (1 hour)
- **Phase 4**: Brand animations (1 hour)
- **Phase 5**: Replace w-* classes (1-2 hours)
- **Phase 6**: Testing (1 hour)
- **Phase 7**: Cleanup (30 mins)

---

## 📞 Support

If you encounter issues during migration:
- Check browser console for errors
- Verify CSS is loading correctly
- Test JavaScript in isolation
- Use browser DevTools for debugging
- Compare with this guide

---

**Ready to Begin**: All phases documented and ready for implementation!

**Next Step**: Stage and commit all current changes, then begin Phase 2.

