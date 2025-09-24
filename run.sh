#!/bin/bash

echo "Genererar Bluehome projektsstruktur..."

# Skapa huvudmappar
mkdir -p src/assets
mkdir -p src/components/ui
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/pages
mkdir -p public

# Skapa root-filer
touch README.md
touch package.json
touch package-lock.json
touch tsconfig.json
touch tsconfig.app.json
touch tsconfig.node.json
touch vite.config.ts
touch tailwind.config.ts
touch postcss.config.js
touch components.json
touch eslint.config.js
touch bun.lockb
touch .gitignore

# Skapa public-filer
touch public/favicon.ico
touch public/placeholder.svg
touch public/robots.txt

# Skapa index.html
touch index.html

# Skapa src root-filer
touch src/App.tsx
touch src/App.css
touch src/main.tsx
touch src/index.css
touch src/vite-env.d.ts

# Skapa lib-filer
touch src/lib/utils.ts

# Skapa hooks-filer
touch src/hooks/use-mobile.tsx
touch src/hooks/use-toast.ts

# Skapa pages-filer
touch src/pages/Index.tsx
touch src/pages/NotFound.tsx

# Skapa huvudkomponenter
touch src/components/Header.tsx
touch src/components/Hero.tsx
touch src/components/Footer.tsx
touch src/components/PropertyCard.tsx
touch src/components/PropertyGrid.tsx

# Skapa UI-komponenter
touch src/components/ui/accordion.tsx
touch src/components/ui/alert.tsx
touch src/components/ui/alert-dialog.tsx
touch src/components/ui/aspect-ratio.tsx
touch src/components/ui/avatar.tsx
touch src/components/ui/badge.tsx
touch src/components/ui/breadcrumb.tsx
touch src/components/ui/button.tsx
touch src/components/ui/calendar.tsx
touch src/components/ui/card.tsx
touch src/components/ui/carousel.tsx
touch src/components/ui/chart.tsx
touch src/components/ui/checkbox.tsx
touch src/components/ui/collapsible.tsx
touch src/components/ui/command.tsx
touch src/components/ui/context-menu.tsx
touch src/components/ui/dialog.tsx
touch src/components/ui/drawer.tsx
touch src/components/ui/dropdown-menu.tsx
touch src/components/ui/form.tsx
touch src/components/ui/hover-card.tsx
touch src/components/ui/input.tsx
touch src/components/ui/input-otp.tsx
touch src/components/ui/label.tsx
touch src/components/ui/menubar.tsx
touch src/components/ui/navigation-menu.tsx
touch src/components/ui/pagination.tsx
touch src/components/ui/popover.tsx
touch src/components/ui/progress.tsx
touch src/components/ui/radio-group.tsx
touch src/components/ui/resizable.tsx
touch src/components/ui/scroll-area.tsx
touch src/components/ui/select.tsx
touch src/components/ui/separator.tsx
touch src/components/ui/sheet.tsx
touch src/components/ui/sidebar.tsx
touch src/components/ui/skeleton.tsx
touch src/components/ui/slider.tsx
touch src/components/ui/sonner.tsx
touch src/components/ui/switch.tsx
touch src/components/ui/table.tsx
touch src/components/ui/tabs.tsx
touch src/components/ui/textarea.tsx
touch src/components/ui/toast.tsx
touch src/components/ui/toaster.tsx
touch src/components/ui/toggle.tsx
touch src/components/ui/toggle-group.tsx
touch src/components/ui/tooltip.tsx
touch src/components/ui/use-toast.ts

# Skapa asset placeholder-filer (tomma filer för bilder)
touch src/assets/hero-image.jpg
touch src/assets/property-1.jpg
touch src/assets/property-2.jpg
touch src/assets/property-3.jpg

echo "✅ Projektstruktur skapad!"
echo "📁 Alla mappar och filer är nu skapade"
echo "🔧 Kör 'chmod +x run.sh' för att göra scriptet körbart"
echo "▶️  Kör sedan './run.sh' för att skapa strukturen"