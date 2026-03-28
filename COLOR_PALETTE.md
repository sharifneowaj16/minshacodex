# Minsah Beauty Color Palette

## Overview
This document describes the official Minsah Beauty brand color palette used throughout the e-commerce website.

## Color Palette

| Color Name | Hex Code | RGB | Usage | CSS Variable |
|------------|----------|-----|-------|--------------|
| **Primary Dark Brown** | `#64320D` | rgb(100, 50, 13) | Primary buttons, headers, navigation | `--color-minsah-primary` |
| **Secondary Medium Brown** | `#8E6545` | rgb(142, 101, 69) | Secondary buttons, accents, borders | `--color-minsah-secondary` |
| **Accent Cream** | `#FFE6D2` | rgb(255, 230, 210) | Backgrounds, cards, containers | `--color-minsah-accent` |
| **Dark Brown** | `#421C00` | rgb(66, 28, 0) | Text, dark elements, footer | `--color-minsah-dark` |
| **Light Cream** | `#FFF5EB` | rgb(255, 245, 235) | Light backgrounds, subtle containers | `--color-minsah-light` |

## Visual Preview

```
#64320D ████████  Primary Dark Brown
#8E6545 ████████  Secondary Medium Brown
#FFE6D2 ████████  Accent Cream
#421C00 ████████  Dark Brown
#FFF5EB ████████  Light Cream
```

## Usage Examples

### Tailwind CSS Classes

The color palette is integrated with Tailwind CSS v4 and can be used with standard utility classes:

```html
<!-- Background Colors -->
<div class="bg-minsah-primary">Primary Dark Brown Background</div>
<div class="bg-minsah-secondary">Secondary Medium Brown Background</div>
<div class="bg-minsah-accent">Accent Cream Background</div>
<div class="bg-minsah-dark">Dark Brown Background</div>
<div class="bg-minsah-light">Light Cream Background</div>

<!-- Text Colors -->
<p class="text-minsah-primary">Primary Dark Brown Text</p>
<p class="text-minsah-secondary">Secondary Medium Brown Text</p>
<p class="text-minsah-dark">Dark Brown Text</p>

<!-- Border Colors -->
<div class="border border-minsah-primary">Primary Border</div>
<div class="border border-minsah-secondary">Secondary Border</div>

<!-- Hover States -->
<button class="bg-minsah-primary hover:bg-minsah-dark">
  Button with Hover
</button>
```

### CSS Custom Properties

The colors are also available as CSS custom properties for use in custom CSS:

```css
/* Using in custom CSS */
.custom-element {
  background-color: var(--color-minsah-primary);
  color: var(--color-minsah-light);
  border-color: var(--color-minsah-secondary);
}

/* Using RGB values for opacity */
.translucent-element {
  background-color: rgb(from var(--color-minsah-primary) r g b / 0.5);
}
```

## Design Guidelines

### Primary Color (#64320D - Dark Brown)
- **Use for**: Primary CTAs, main navigation, important buttons
- **Best paired with**: Accent Cream (#FFE6D2) for text
- **Example**: "Checkout" button, "Add to Cart" button

### Secondary Color (#8E6545 - Medium Brown)
- **Use for**: Secondary actions, hover states, subtle accents
- **Best paired with**: Light backgrounds
- **Example**: "Learn More" links, secondary navigation items

### Accent Color (#FFE6D2 - Cream)
- **Use for**: Card backgrounds, input fields, content containers
- **Best paired with**: Dark Brown (#421C00) for text
- **Example**: Product cards, form inputs, modal backgrounds

### Dark Brown (#421C00)
- **Use for**: Body text, headings, footer backgrounds
- **Best paired with**: Light backgrounds (#FFF5EB)
- **Example**: Product descriptions, article text, footer content

### Light Cream (#FFF5EB)
- **Use for**: Page backgrounds, alternating sections
- **Best paired with**: Any dark color for text
- **Example**: Main background, section dividers

## Accessibility Considerations

### Contrast Ratios

| Foreground | Background | Ratio | WCAG Level |
|------------|------------|-------|------------|
| #421C00 | #FFE6D2 | 13.8:1 | AAA ✓ |
| #421C00 | #FFF5EB | 15.2:1 | AAA ✓ |
| #64320D | #FFE6D2 | 7.8:1 | AAA ✓ |
| #64320D | #FFF5EB | 8.6:1 | AAA ✓ |
| #8E6545 | #FFF5EB | 4.9:1 | AA ✓ |

All color combinations meet WCAG 2.1 Level AA standards for normal text and many meet AAA standards.

## Implementation Notes

1. **Tailwind CSS v4**: Colors are defined in `app/globals.css` using the `@theme inline` directive
2. **CSS Variables**: Available in `:root` for use throughout the application
3. **Naming Convention**: Use `minsah-{variant}` for Tailwind classes
4. **Legacy Support**: Old class names (`brown-dark`, `brown-medium`, etc.) are maintained for backward compatibility

## Color Psychology

The Minsah Beauty color palette evokes:
- **Warmth**: Brown tones create a welcoming, comfortable atmosphere
- **Natural Beauty**: Earth tones connect to natural ingredients and organic products
- **Elegance**: Cream accents add sophistication and luxury
- **Trust**: Warm, natural colors build customer confidence

## Related Files

- `/app/globals.css` - Color definitions and Tailwind theme configuration
- `/postcss.config.mjs` - PostCSS and Tailwind configuration
- Design mockups provided in project documentation

## Version History

- **v1.0** (2026-01-07): Initial color palette implementation
  - Primary: #64320D
  - Secondary: #8E6545
  - Accent: #FFE6D2
  - Dark: #421C00
  - Light: #FFF5EB
