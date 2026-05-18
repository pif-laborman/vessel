# Corix Design System

Based on the Rekon Design System. Light, minimal, warm. Clean typography hierarchy with DM Sans for headlines and Inter for body text.

## Colors

### Backgrounds
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-page` | `#FFFFFF` | Page background |
| `--bg-warm` | `#F7F5F2` | Warm sections, alternating blocks |
| `--bg-surface` | `#FAFAFA` | Cards, elevated surfaces |

### Fills
| Token | Value | Usage |
|-------|-------|-------|
| `--fill-action` | `#0A0A0A` | Primary buttons, CTAs |

### Text
| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | `#0A0A0A` | Headlines, body text |
| `--text-secondary` | `#6B6B6B` | Descriptions, captions |
| `--text-tertiary` | `#999999` | Muted labels, metadata |
| `--text-on-action` | `#FFFFFF` | Text on dark backgrounds |

### Borders
| Token | Value | Usage |
|-------|-------|-------|
| `--border` | `#E8E8E8` | Card borders, dividers |

### Semantic
| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | `#03A97E` | Success states |
| `--color-error` | `#E53935` | Error states |
| `--color-warning-text` | `#B8860B` | Warning text |
| `--color-warning-bg` | `#FFF8E1` | Warning backgrounds |

## Typography

### Font Stack
| Token | Value | Usage |
|-------|-------|-------|
| `--font-display` | `"DM Sans", sans-serif` | Headlines, nav, buttons. Weights: 300, 400, 500 |
| `--font-body` | `"Inter", sans-serif` | Body text, descriptions. Weights: 300, 400, 500 |
| `--font-mono` | `"Fragment Mono", monospace` | Code, data, API examples |

### Sizes
| Token | Value | Pixels |
|-------|-------|--------|
| `--text-xs` | `0.75rem` | 12px |
| `--text-sm` | `0.875rem` | 14px |
| `--text-base` | `1rem` | 16px |
| `--text-lg` | `1.125rem` | 18px |
| `--text-xl` | `1.25rem` | 20px |
| `--text-2xl` | `1.5rem` | 24px |
| `--text-3xl` | `1.875rem` | 30px |

## Spacing

4px base unit. Use multiples:

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |

## Border Radii

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small elements, badges |
| `--radius-md` | 8px | Cards, inputs |
| `--radius-lg` | 12px | Modals, large cards |
| `--radius-full` | 999px | Pill buttons, tags |

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `--shadow-md` | `0 2px 8px rgba(0,0,0,0.08)` | Cards, dropdowns |

## Components

### Buttons
- **Primary** (`.btn-primary`): `--fill-action` bg, `--text-on-action` text, `--radius-full`, font-weight 500, hover opacity 0.85
- **Outline** (`.btn-outline`): Transparent bg, 1px `--border`, hover bg `--bg-surface`
- **Destructive** (`.btn-stop`): Light red bg, red text

### Cards
- **`.card`**: `--bg-page` bg, 1px `--border`, `--radius-md`, `--space-4` padding

## Design Principles
1. Light, warm, minimal. White base with warm gray accents.
2. Typography does the heavy lifting. No decorative elements.
3. Black primary buttons. Outline for secondary actions.
4. Subtle borders, subtle shadows. Nothing loud.
5. Generous whitespace. Let content breathe.
6. Transitions: 0.15s ease for hover states.
