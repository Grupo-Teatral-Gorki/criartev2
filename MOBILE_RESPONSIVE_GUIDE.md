# Mobile Responsive Design Guide - Criarte Platform

## Overview
This document outlines the mobile-responsive design patterns implemented across the Criarte platform and provides guidelines for maintaining consistency.

## ✅ Completed Mobile Optimizations

### 1. **Proponente Mapping Section** (FULLY OPTIMIZED)
- `/management/mapping` - Main mapping page
- `/management/mapping/tipo/[tipo]` - List by type page
- `/management/mapping/proponente/[id]` - Detail page

### 2. **Management Pages** (FULLY OPTIMIZED)
- `/management` - Main management dashboard

### 3. **Proponentes Pages** (FULLY OPTIMIZED)
- `/proponentes` - List page

### 4. **Header Component** (ALREADY MOBILE-FRIENDLY)
- Mobile menu with hamburger button
- Responsive navigation
- Collapsible menu on mobile

### 5. **Home Page** (ALREADY MOBILE-FRIENDLY)
- Responsive grid layout
- Mobile-optimized cards

---

## 📱 Mobile-Responsive Patterns Used

### **1. Responsive Padding**
```tsx
// Container padding
className="px-4 md:px-8 lg:px-32"

// Vertical padding
className="py-6 md:py-12"

// Card padding
className="p-4 md:p-6"
```

### **2. Responsive Text Sizes**
```tsx
// Headings
className="text-2xl md:text-4xl"  // Main titles
className="text-lg md:text-xl"    // Section titles
className="text-base md:text-lg"  // Subtitles

// Body text
className="text-xs md:text-sm"    // Small text
className="text-sm md:text-base"  // Regular text
```

### **3. Responsive Layouts**
```tsx
// Flex to column on mobile
className="flex flex-col md:flex-row"

// Grid columns
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
className="grid grid-cols-2 md:grid-cols-3"  // For cards

// Gaps
className="gap-2 md:gap-4"
className="gap-4 md:gap-6"
```

### **4. Responsive Components**
```tsx
// Buttons
className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm"

// Icons
className="w-5 h-5 md:w-6 md:h-6"
className="w-3 h-3 md:w-4 md:w-4"

// Images
className="w-24 md:w-[120px]"
```

### **5. Hide/Show Elements**
```tsx
// Hide on mobile, show on desktop
className="hidden md:block"
className="hidden md:table-cell"
className="hidden md:flex"

// Show on mobile, hide on desktop
className="md:hidden"
className="block md:hidden"
```

### **6. Table Optimization**
```tsx
// Mobile-friendly table pattern:
// 1. Hide email column on mobile
<th className="hidden md:table-cell">E-mail</th>

// 2. Show email under name on mobile
<span className="md:hidden text-xs">
  <Mail className="w-3 h-3" />
  {email}
</span>

// 3. Responsive padding
<td className="px-3 md:px-6 py-3 md:py-4">
```

### **7. Responsive Spacing**
```tsx
// Margins
className="mb-4 md:mb-6"
className="mb-6 md:mb-8"

// Space between items
className="space-y-4 md:space-y-6"
className="space-x-2 md:space-x-4"
```

---

## 🎯 Pages Requiring Mobile Optimization

### **High Priority**
1. **Project Creation Flow** (`/criar`)
   - Forms need responsive layouts
   - File upload components
   - Multi-step wizard

2. **My Projects** (`/meusprojetos`)
   - Project cards
   - Status filters
   - Action buttons

3. **Map Pages** (`/map/*`)
   - Form inputs
   - Map components
   - Success pages

### **Medium Priority**
4. **Admin Pages** (`/admin/*`)
   - City config
   - Logs viewer
   - Review pages

5. **Profile Page** (`/profile`)
   - User information
   - Settings

6. **Help Page** (`/help`)
   - FAQ sections
   - Contact forms

### **Low Priority**
7. **Public Statistics** (`/estatisticas/[cityCode]`)
   - Already has some responsive design
   - May need minor tweaks

---

## 🛠️ Implementation Checklist

For each page, ensure:

### Layout
- [ ] Container has responsive padding (`px-4 md:px-8 lg:px-32`)
- [ ] Vertical spacing is responsive (`py-6 md:py-12`)
- [ ] Bottom padding added (`pb-8 md:pb-12`)

### Typography
- [ ] Main titles: `text-2xl md:text-4xl`
- [ ] Section titles: `text-lg md:text-xl`
- [ ] Body text: `text-sm md:text-base`
- [ ] Small text: `text-xs md:text-sm`

### Components
- [ ] Buttons have responsive padding
- [ ] Icons have responsive sizes
- [ ] Cards have responsive padding
- [ ] Forms stack on mobile

### Navigation
- [ ] Back buttons are visible and accessible
- [ ] Navigation menus collapse on mobile
- [ ] Breadcrumbs wrap properly

### Tables
- [ ] Hide non-essential columns on mobile
- [ ] Show critical info under main column
- [ ] Horizontal scroll if necessary
- [ ] Responsive cell padding

### Images
- [ ] Responsive sizes
- [ ] Proper aspect ratios
- [ ] Loading states

### Interactive Elements
- [ ] Touch-friendly sizes (min 44x44px)
- [ ] Adequate spacing between clickable elements
- [ ] No hover-only interactions

---

## 📋 Testing Checklist

Test on these breakpoints:
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

For each page:
1. [ ] All content is readable
2. [ ] No horizontal scrolling
3. [ ] Buttons are easily tappable
4. [ ] Forms are easy to fill
5. [ ] Navigation works smoothly
6. [ ] Images load and scale properly
7. [ ] Tables are usable
8. [ ] Modals fit on screen

---

## 🎨 Tailwind Breakpoints Reference

```
sm: 640px   // Small devices
md: 768px   // Medium devices (tablets)
lg: 1024px  // Large devices (desktops)
xl: 1280px  // Extra large devices
2xl: 1536px // 2X Extra large devices
```

---

## 💡 Best Practices

### DO:
✅ Use mobile-first approach (base styles for mobile, then add `md:` and `lg:`)
✅ Test on real devices when possible
✅ Use semantic HTML
✅ Maintain consistent spacing
✅ Keep touch targets at least 44x44px
✅ Use responsive images
✅ Stack layouts vertically on mobile

### DON'T:
❌ Use fixed widths
❌ Rely on hover states for mobile
❌ Create horizontal scrolling
❌ Use tiny text (< 14px)
❌ Overcrowd the interface
❌ Forget about landscape orientation
❌ Ignore loading states

---

## 🔧 Common Patterns

### Responsive Container
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
  {/* Content */}
</div>
```

### Responsive Card
```tsx
<div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-4 md:p-6">
  {/* Card content */}
</div>
```

### Responsive Button Group
```tsx
<div className="flex flex-col md:flex-row gap-2 md:gap-4">
  <Button />
  <Button />
  <Button />
</div>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {/* Grid items */}
</div>
```

### Responsive Table
```tsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr>
        <th className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">
          Name
        </th>
        <th className="hidden md:table-cell px-6 py-4 text-sm">
          Email
        </th>
      </tr>
    </thead>
    {/* tbody */}
  </table>
</div>
```

---

## 📝 Notes

- The Header component already has a mobile menu implemented
- Home page is already mobile-friendly
- Focus on form-heavy pages next (criar, habilitacao, recurso)
- Consider using a mobile-first CSS framework for new components
- Test with real devices, not just browser DevTools
- Consider touch gestures for mobile interactions

---

## 🚀 Next Steps

1. Apply patterns to project creation flow (`/criar`)
2. Optimize "My Projects" page (`/meusprojetos`)
3. Update map registration pages
4. Review and optimize admin pages
5. Test thoroughly on multiple devices
6. Document any new patterns discovered

---

**Last Updated**: December 8, 2024
**Maintained By**: Development Team
