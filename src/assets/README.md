# Assets Folder

This folder contains static assets for the DAGent application.

## Structure

```
assets/
  images/          # Image files (png, jpg, svg, etc.)
  icons/           # Icon files
  logos/           # Company and product logos
  fonts/           # Custom font files
  videos/          # Video files
  audio/           # Audio files
  docs/            # Document files (pdf, etc.)
```

## Usage

Import assets in your components:

```typescript
// For images
import logo from '@/assets/images/logo.png'

// For icons
import icon from '@/assets/icons/example.svg'
```

## Notes

- Use relative paths from the assets folder
- Optimize images for web use
- Use appropriate file formats (SVG for icons, WebP for photos when possible)
