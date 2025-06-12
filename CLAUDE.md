# Project: AdultReels PWA

## GitHub Configuration
- **Email**: tugayigus@hotmail.com
- **Username**: Tugay
- **Repository**: https://github.com/tugayigus/adultreels-pwa.git

## Project Overview
This is a TikTok-style video feed PWA for adult content with mobile-first design.

## Key Features
- Vertical video scrolling with snap behavior
- PWA support with offline capabilities
- Age verification modal
- Dynamic viewport height handling for mobile browsers
- Progress bar with scrubbing support

## Recent Work
- Fixed mobile browser UI overflow issues by implementing dynamic viewport calculations
- Added useViewportHeight hook for responsive mobile layouts
- Updated components to use viewport-safe CSS classes

## Development Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Important Notes
- Always test on mobile devices, especially iOS Safari and Chrome
- Use viewport-safe classes (h-viewport, progress-bar-mobile) instead of h-screen
- Progress bars and UI elements must account for mobile browser chrome