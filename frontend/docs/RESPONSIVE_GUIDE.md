# Responsive Design Guide

This document outlines the responsive design implementation for the Shohanis Reflection e-commerce application.

## Overview

The application is built with a mobile-first responsive design approach using Tailwind CSS. All components are designed to work seamlessly across different device sizes:

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1023px (sm to lg)
- **Desktop**: ≥ 1024px (lg and above)
- **Large Desktop**: ≥ 1280px (xl and above)

## Responsive Breakpoints

```css
/* Tailwind CSS default breakpoints */
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (laptops/desktops) */
xl: 1280px  /* Extra large devices (large desktops) */
2xl: 1536px /* 2X large devices (larger desktops) */
```

## Responsive Utilities

### Global CSS Classes

The following responsive utility classes are available in `globals.css`:

#### Text Sizing
```css
.text-responsive-sm      /* text-xs sm:text-sm */
.text-responsive-base    /* text-sm sm:text-base */
.text-responsive-lg      /* text-base sm:text-lg */
.text-responsive-xl      /* text-lg sm:text-xl */
.text-responsive-2xl     /* text-xl sm:text-2xl */
.text-responsive-3xl     /* text-2xl sm:text-3xl */
.text-responsive-4xl     /* text-3xl sm:text-4xl */
```

#### Spacing
```css
.space-responsive-sm     /* space-y-2 sm:space-y-3 */
.space-responsive-md     /* space-y-3 sm:space-y-4 */
.space-responsive-lg     /* space-y-4 sm:space-y-6 */
.space-responsive-xl     /* space-y-6 sm:space-y-8 */
```

#### Padding & Margins
```css
.p-responsive-sm         /* p-3 sm:p-4 */
.p-responsive-md         /* p-4 sm:p-6 */
.p-responsive-lg         /* p-6 sm:p-8 */

.m-responsive-sm         /* m-2 sm:m-3 */
.m-responsive-md         /* m-3 sm:m-4 */
.m-responsive-lg         /* m-4 sm:m-6 */
```

#### Gaps
```css
.gap-responsive-sm       /* gap-3 sm:gap-4 */
.gap-responsive-md       /* gap-4 sm:gap-6 */
.gap-responsive-lg       /* gap-6 sm:gap-8 */
```

#### Visibility
```css
.mobile-only             /* block sm:hidden */
.desktop-only            /* hidden sm:block */
.tablet-up               /* hidden md:block */
.mobile-tablet-only      /* block lg:hidden */
```

#### Touch-Friendly Buttons
```css
.btn-touch              /* min-h-[44px] min-w-[44px] */
.btn-touch-sm           /* min-h-[40px] min-w-[40px] */
.btn-touch-lg           /* min-h-[48px] min-w-[48px] */
```

#### Line Heights
```css
.leading-tight-responsive    /* leading-tight sm:leading-snug */
.leading-normal-responsive   /* leading-snug sm:leading-normal */
.leading-relaxed-responsive  /* leading-normal sm:leading-relaxed */
```

## Component Responsiveness

### Header Component

**Mobile (< 640px):**
- Logo size: 32x32px
- Brand name hidden
- Search hidden to save space
- Compact spacing
- Mobile navigation drawer

**Tablet (640px - 1023px):**
- Logo size: 40x40px
- Brand name visible
- Search visible
- Standard spacing

**Desktop (≥ 1024px):**
- Logo size: 40x40px
- Full navigation visible
- Top bar with contact info
- Maximum spacing

### Hero Component

**Mobile (< 640px):**
- Height: 400px
- Text: 2xl (24px) for title
- Navigation arrows hidden
- Smaller dots indicator
- Reduced overlay height

**Tablet (640px - 1023px):**
- Height: 500px
- Text: 3xl (30px) for title
- Navigation arrows visible
- Standard dots indicator
- Medium overlay height

**Desktop (≥ 1024px):**
- Height: 600px-700px
- Text: 4xl-6xl (36px-60px) for title
- Full navigation controls
- Large dots indicator
- Full overlay height

### Categories Component

**Mobile (< 640px):**
- Single column grid
- Reduced padding (p-4)
- Smaller images (h-40)
- Compact spacing

**Tablet (640px - 1023px):**
- Two column grid
- Standard padding (p-6)
- Medium images (h-48)
- Standard spacing

**Desktop (≥ 1024px):**
- Four column grid
- Full padding and spacing
- Large images and spacing

### Featured Products Component

**Mobile (< 640px):**
- Single column grid
- Stacked filter controls
- Compact spacing
- Smaller buttons

**Tablet (640px - 1023px):**
- Two column grid
- Horizontal filter layout
- Standard spacing

**Desktop (≥ 1024px):**
- Three to four column grid
- Full filter layout
- Maximum spacing

### Product Cards

**Mobile (< 640px):**
- Height: 48 (192px)
- Padding: p-3
- Smaller text sizes
- Compact badges and buttons

**Tablet (640px - 1023px):**
- Height: 56 (224px)
- Padding: p-4
- Medium text sizes
- Standard badges and buttons

**Desktop (≥ 1024px):**
- Height: 64 (256px)
- Padding: p-4
- Large text sizes
- Full badges and buttons

### Brands Component

**Mobile (< 640px):**
- Two column grid
- Small brand logos (64x64px)
- Compact spacing

**Tablet (640px - 1023px):**
- Three column grid
- Medium brand logos (80x80px)
- Standard spacing

**Desktop (≥ 1024px):**
- Six column grid
- Large brand logos (96x96px)
- Maximum spacing

### Newsletter Component

**Mobile (< 640px):**
- Stacked form layout
- Smaller icon (48x48px)
- Compact spacing
- Smaller text

**Tablet (640px - 1023px):**
- Horizontal form layout
- Medium icon (64x64px)
- Standard spacing
- Medium text

**Desktop (≥ 1024px):**
- Full horizontal layout
- Large icon (64x64px)
- Maximum spacing
- Large text

### Footer Component

**Mobile (< 640px):**
- Single column layout
- Compact spacing
- Small text sizes
- Centered content

**Tablet (640px - 1023px):**
- Two column layout
- Standard spacing
- Medium text sizes
- Left-aligned content

**Desktop (≥ 1024px):**
- Four column layout
- Maximum spacing
- Large text sizes
- Full layout

## Mobile Navigation

### Features
- Slide-out drawer from left
- Full-screen overlay
- Touch-friendly buttons (44px minimum)
- Smooth animations
- Body scroll prevention
- Click outside to close

### Components
- Search bar
- Category navigation with icons
- User account menu
- Quick access to cart and wishlist
- Authentication links

## Responsive Images

### ResponsiveImage Component
- Automatically selects appropriate image size
- Lazy loading support
- Loading states with skeleton
- Error handling
- Smooth transitions

### Usage
```jsx
<ResponsiveImage
  src="/images/desktop.jpg"
  mobileSrc="/images/mobile.jpg"
  tabletSrc="/images/tablet.jpg"
  desktopSrc="/images/desktop.jpg"
  alt="Product image"
  className="w-full h-64"
/>
```

## Touch-Friendly Design

### Button Sizes
- Minimum touch target: 44x44px
- Adequate spacing between interactive elements
- Clear visual feedback on touch

### Gestures
- Swipe support for mobile navigation
- Touch-friendly form controls
- Responsive hover states

## Performance Considerations

### Image Optimization
- Responsive image loading
- Lazy loading for off-screen images
- WebP format support
- Appropriate image sizes for each breakpoint

### Code Splitting
- Component-level lazy loading
- Responsive component loading
- Optimized bundle sizes

## Testing Responsiveness

### Device Testing
- Test on actual devices when possible
- Use browser developer tools
- Test various screen orientations

### Breakpoint Testing
- Test at exact breakpoint values
- Test just above and below breakpoints
- Verify smooth transitions

### Content Testing
- Ensure text remains readable
- Verify images scale appropriately
- Check interactive elements remain accessible

## Best Practices

### Mobile-First Approach
- Start with mobile design
- Add complexity for larger screens
- Use progressive enhancement

### Consistent Spacing
- Use responsive spacing utilities
- Maintain visual hierarchy
- Ensure adequate breathing room

### Typography
- Use responsive text sizing
- Maintain readability across devices
- Consider line height adjustments

### Interactive Elements
- Ensure adequate touch targets
- Provide clear visual feedback
- Maintain accessibility standards

## Future Enhancements

### Planned Features
- Advanced responsive image handling
- Touch gesture support
- Responsive animations
- Performance optimizations
- Accessibility improvements

### Monitoring
- Performance metrics
- User experience analytics
- Device usage statistics
- Responsive design feedback

## Resources

### Documentation
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

### Tools
- Chrome DevTools Device Mode
- Firefox Responsive Design Mode
- BrowserStack for device testing
- Lighthouse for performance testing

---

This guide should be updated as new responsive features are added to the application.
