# EcoRwanda Conservation Portal - Design System Specifications

## Overview

This document provides comprehensive design specifications for creating Figma designs for the Eco-Volunteer and Research Collaboration Portal, themed around Rwanda's ecosystem with green, yellow, and blue colors.

## Brand Identity

### Logo Concept

- **Primary Logo**: Mountain icon (🏔️) with Leaf accent (🍃)
- **Typography**: "EcoRwanda" in bold, "Conservation Portal" in lighter weight
- **Symbol**: Layered mountain with leaf overlay representing Rwanda's diverse ecosystems

### Color Palette

#### Primary Colors (Rwanda Ecosystem Theme)

```
🟢 Primary Green (Forest/Conservation)
- Emerald-600: #059669
- Emerald-100: #D1FAE5 (backgrounds)
- Emerald-800: #065F46 (text)

🟡 Secondary Yellow (Savanna/Energy)
- Amber-600: #D97706
- Amber-100: #FEF3C7 (backgrounds)
- Amber-800: #92400E (text)

🔵 Accent Blue (Water/Sky)
- Blue-600: #2563EB
- Blue-100: #DBEAFE (backgrounds)
- Blue-800: #1E40AF (text)
```

#### Supporting Colors

```
🟣 Purple (Administration)
- Purple-600: #9333EA
- Purple-100: #F3E8FF

🔴 Red (Alerts/Urgent)
- Red-600: #DC2626
- Red-100: #FEE2E2

⚫ Neutral Grays
- Gray-900: #111827 (primary text)
- Gray-600: #4B5563 (secondary text)
- Gray-200: #E5E7EB (borders)
- Gray-50: #F9FAFB (backgrounds)
```

## Typography

### Font Stack

```css
font-family:
  ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
  "Segoe UI Symbol", "Noto Color Emoji";
```

### Type Scale

```
H1 (Page Titles): 30px, Bold (font-weight: 700)
H2 (Section Titles): 24px, Semibold (font-weight: 600)
H3 (Card Titles): 18px, Semibold (font-weight: 600)
Body Large: 16px, Regular (font-weight: 400)
Body: 14px, Regular (font-weight: 400)
Small: 12px, Regular (font-weight: 400)
Caption: 11px, Medium (font-weight: 500)
```

## Layout Specifications

### Grid System

- **Container Max Width**: 1200px
- **Grid Columns**: 12-column grid
- **Gutter**: 24px
- **Margins**: 24px (mobile), 48px (desktop)

### Breakpoints

```
Mobile: 320px - 767px
Tablet: 768px - 1023px
Desktop: 1024px+
```

### Spacing Scale (8px base)

```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
```

## Component Specifications

### 1. Authentication Pages

#### Login Page Layout

```
📱 Mobile/Tablet: Single column
🖥️ Desktop: Two-column layout
- Left (60%): Branding & features showcase
- Right (40%): Login form card

Background: Gradient from emerald-50 via blue-50 to amber-50
```

#### Login Form Card

```
- Width: 400px max
- Padding: 32px
- Background: white/90 with backdrop blur
- Border Radius: 12px
- Shadow: Large drop shadow
- No border (modern glass effect)
```

#### Branding Section Elements

```
🏔️ Logo: Mountain + Leaf icon (48px)
📊 Stats Grid: 3 columns showing volunteer metrics
🎯 Features: 3 cards highlighting platform benefits
```

### 2. Dashboard Layout

#### Sidebar Navigation

```
- Width: 256px (fixed)
- Background: White
- Border Right: 1px gray-200
- Shadow: Medium

User Profile Section:
- Avatar: 40px circle
- Name: 16px semibold
- Role Badge: Small, colored by role
- Connection Status: Online/Offline indicator
```

#### Main Content Area

```
- Margin Left: 256px (to account for sidebar)
- Padding: 24px
- Background: gray-50
- Min Height: 100vh
```

### 3. Role-Specific Color Coding

#### Volunteer (Green Theme)

```
- Primary Actions: emerald-600
- Cards: emerald-50 backgrounds
- Icons: emerald-600
- Stats: emerald-100 backgrounds
```

#### Researcher (Blue Theme)

```
- Primary Actions: blue-600
- Cards: blue-50 backgrounds
- Icons: blue-600
- Stats: blue-100 backgrounds
```

#### Ranger (Amber Theme)

```
- Primary Actions: amber-600
- Cards: amber-50 backgrounds
- Icons: amber-600
- Stats: amber-100 backgrounds
```

#### Administrator (Purple Theme)

```
- Primary Actions: purple-600
- Cards: purple-50 backgrounds
- Icons: purple-600
- Stats: purple-100 backgrounds
```

### 4. Card Components

#### Standard Card

```
- Border Radius: 8px
- Padding: 24px
- Background: White
- Border: 1px gray-200
- Shadow: Small
- Hover: Medium shadow transition
```

#### Stat Cards

```
- Padding: 24px
- Icon: 32px (left aligned)
- Number: 32px bold
- Label: 14px gray-600
- Colored backgrounds based on context
```

#### Feature Cards

```
- Aspect Ratio: 4:3 or 16:9 based on content
- Image/Icon: Top section
- Content: Bottom section with padding
- Action Button: Full width, bottom
```

### 5. Button Specifications

#### Primary Buttons

```
- Height: 44px
- Padding: 12px 24px
- Border Radius: 6px
- Font: 14px medium
- Colors: Role-based (emerald, blue, amber, purple)
- States: Default, Hover (-100 shade), Active, Disabled
```

#### Secondary Buttons

```
- Same dimensions as primary
- Background: Transparent
- Border: 1px gray-300
- Text: gray-700
- Hover: gray-50 background
```

### 6. Form Elements

#### Input Fields

```
- Height: 44px
- Padding: 12px 16px
- Border: 1px gray-300
- Border Radius: 6px
- Focus: 2px ring in role color
- Error: Red border + red text
```

#### Select Dropdowns

```
- Same styling as inputs
- Chevron icon: Right aligned
- Dropdown: White background, shadow-lg
- Max Height: 200px with scroll
```

### 7. Navigation Elements

#### Sidebar Menu Items

```
- Height: 44px
- Padding: 12px 16px
- Icon: 20px (left, 12px margin)
- Text: 14px medium
- Active: Colored background (role-based)
- Hover: gray-100 background
```

#### Breadcrumbs

```
- Font: 14px
- Color: gray-600
- Separator: "/" or chevron
- Current: gray-900 bold
```

## Page-Specific Layouts

### 1. Volunteer Dashboard

```
Header: Welcome message + quick stats (4 columns)
Quick Actions: 3 large buttons (submit report, join project, track reports)
Recent Reports: Card list with status badges
Available Projects: Card grid with progress bars
```

### 2. Researcher Dashboard

```
Header: Research dashboard title + stats (4 columns)
Research Tools: 4 action buttons
Active Projects: Card list with progress tracking
Recent Publications: Achievement-style cards
Collaboration Requests: Grid layout
```

### 3. Ranger Dashboard

```
Header: Operations center + critical stats
Urgent Alerts: Red alert banner (if any)
Quick Actions: 4 operation buttons
Pending Reports: Verification queue
Patrol Schedule: Status timeline
Real-time Alerts: Detailed alert cards
```

### 4. Admin Dashboard

```
Header: System administration + health metrics
Admin Tools: 4 management buttons
User Metrics: Growth charts and role distribution
Recent Activity: Timeline/feed format
Pending Verifications: Approval queue
System Alerts: Status indicators
```

## Iconography

### Icon Style

- **Style**: Outline icons (Lucide React compatible)
- **Weight**: 2px stroke
- **Size**: 16px (small), 20px (medium), 24px (large), 32px (stats)

### Key Icons by Role

```
Volunteer: camera, tree-pine, map-pin, users
Researcher: book-open, database, microscope, bar-chart-3
Ranger: shield, binoculars, radio, alert-triangle
Admin: users, settings, bar-chart-3, database
```

## Imagery Guidelines

### Photo Style

- **Nature Photography**: High-quality images of Rwanda's landscapes
- **Wildlife**: Mountain gorillas, birds, forest scenes
- **People**: Conservation work, community engagement
- **Treatment**: Slight warm filter, high contrast

### Illustration Style

- **Flat Design**: Simple, geometric representations
- **Color**: Limited palette using brand colors
- **Usage**: Empty states, onboarding, feature explanations

## Motion & Interaction

### Transitions

```
Standard: 200ms ease-in-out
Hover Effects: 150ms ease-out
Loading States: Fade + scale
Page Transitions: Slide transitions
```

### Loading States

- **Skeleton Screens**: Gray-200 backgrounds with shimmer
- **Spinners**: Circular with brand colors
- **Progress Bars**: Linear with role colors

## Responsive Behavior

### Mobile Adaptations

```
- Sidebar: Transforms to bottom navigation or hamburger menu
- Cards: Stack vertically, full width
- Tables: Horizontal scroll or accordion format
- Forms: Single column, larger touch targets
```

### Accessibility

#### Color Contrast

- **Text on White**: Minimum 4.5:1 ratio
- **UI Elements**: Minimum 3:1 ratio
- **Interactive Elements**: Clear focus indicators

#### Typography

- **Line Height**: 1.5 minimum for body text
- **Font Size**: 16px minimum on mobile
- **Interactive Elements**: 44px minimum touch target

## Implementation Notes

### CSS Framework Alignment

These specifications align with TailwindCSS classes used in the codebase:

- Spacing follows Tailwind's spacing scale
- Colors map to Tailwind color palette
- Breakpoints match Tailwind defaults
- Component patterns follow Tailwind conventions

### Design Tokens Export

When creating Figma designs, export these as design tokens:

- Color palette
- Typography scale
- Spacing values
- Border radius values
- Shadow definitions

This ensures consistency between design and development.
