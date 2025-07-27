# 3D Date Palm Tree Component

A stunning, performance-optimized 3D Date Palm Tree component built with Three.js and React Three Fiber for Next.js applications.

## 🌴 Features

- **Realistic 3D Palm Tree** with animated swaying leaves and floating date fruits
- **Performance Optimized** with lazy loading, adaptive DPR, and mobile-friendly rendering
- **SEO Safe** with proper fallbacks and SSR handling
- **Interactive** with optional camera controls and hover effects
- **Responsive** design that adapts to different screen sizes
- **Customizable** lighting, animations, and visual effects

## 📁 File Structure

```
src/components/3d/PalmTree/
├── index.tsx              # Main export with lazy loading and fallbacks
├── PalmTree.tsx           # Core 3D palm tree component
├── PalmTreeScene.tsx      # Scene wrapper with performance optimizations
├── PalmTrunk.tsx          # Trunk component with bark textures
├── PalmLeaves.tsx         # Animated palm fronds
├── DateFruits.tsx         # Glowing date fruits with sparkles
├── DesertEnvironment.tsx  # Desert sand and ambient lighting
└── README.md              # This documentation
```

## 🚀 Usage

### Basic Usage

```tsx
import PalmTreeContainer from '@/components/3d/PalmTree';

export default function HomePage() {
  return (
    <div className="w-full h-[500px]">
      <PalmTreeContainer />
    </div>
  );
}
```

### Advanced Usage with Props

```tsx
import PalmTreeContainer from '@/components/3d/PalmTree';

export default function HomePage() {
  return (
    <div className="w-full h-[600px]">
      <PalmTreeContainer
        height="600px"
        enableControls={true}
        autoRotate={true}
        intensity={1.5}
        className="rounded-2xl shadow-2xl"
      />
    </div>
  );
}
```

## ⚙️ Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `""` | Additional CSS classes for the container |
| `height` | `string` | `"400px"` | Height of the 3D canvas |
| `enableControls` | `boolean` | `false` | Enable camera orbit controls |
| `autoRotate` | `boolean` | `true` | Enable automatic rotation |
| `intensity` | `number` | `1` | Lighting intensity multiplier |

## 🎨 Visual Features

### Animations
- **Swaying Leaves**: Gentle wind-like movement of palm fronds
- **Floating Dates**: Date fruits with subtle floating animations
- **Sparkles**: Magical particle effects around the dates
- **Trunk Sway**: Subtle trunk movement for realism

### Lighting
- **Ambient Light**: Warm desert lighting with golden tones
- **Directional Light**: Main sun light with shadows
- **Fill Light**: Secondary warm light for depth
- **Environment**: Sunset preset with custom lightformers

### Materials
- **Trunk**: Realistic bark texture with wobble animation
- **Leaves**: Green palm fronds with natural movement
- **Dates**: Brown date fruits with distortion effects
- **Sand**: Desert ground with subtle texture

## ⚡ Performance Optimizations

### Lazy Loading
- Component is dynamically imported with `ssr: false`
- Prevents blocking of initial page render
- Includes loading fallback with spinner

### Adaptive Rendering
- `AdaptiveDpr`: Responsive pixel ratio
- `AdaptiveEvents`: Optimized event handling
- `Preload`: Preloads all assets

### Mobile Optimization
- Reduced complexity on smaller screens
- Optimized frame rates (45fps+ on mobile)
- Touch-friendly controls

## 🔧 Fallbacks

### Loading State
Shows a beautiful loading spinner with palm tree theme:
- Gradient background matching the design
- Animated spinner with brand colors
- Loading text

### Static Fallback
If 3D is not supported, shows a static illustration:
- CSS-based palm tree design
- Animated sparkles
- Maintains visual consistency

## 🎯 SEO & Accessibility

### SEO Safe
- No blocking scripts on first load
- Proper fallback content for crawlers
- Lazy loading prevents layout shifts

### Accessibility
- Proper ARIA labels (can be added)
- Keyboard navigation support
- Screen reader friendly fallbacks

## 🎨 Customization

### Colors
The component uses your brand's warm color palette:
- **Amber/Gold**: `#fbbf24`, `#f59e0b`
- **Brown**: `#8B4513`, `#654321`
- **Green**: `#228B22`, `#32CD32`
- **Sand**: `#f4d03f`

### Animations
All animations can be customized by modifying:
- Animation speeds in `useFrame` hooks
- Material properties and factors
- Particle counts and effects

## 🚀 Integration with Sheikh Shop

The component is designed to complement your existing design:
- Matches the warm amber/gold color scheme
- Uses similar glassmorphism effects
- Integrates seamlessly with your luxury aesthetic
- Responsive design that works with your layout

## 📱 Mobile Considerations

- **Performance**: Optimized for 45fps+ on mobile devices
- **Touch**: Responsive touch controls when enabled
- **Size**: Adapts to different screen sizes
- **Battery**: Efficient rendering to preserve battery life

## 🔍 Troubleshooting

### Common Issues

1. **Component not loading**: Check if Three.js is properly installed
2. **Performance issues**: Reduce `intensity` or disable `autoRotate`
3. **Mobile lag**: Component automatically reduces complexity
4. **SSR errors**: Component uses `ssr: false` to prevent issues

### Debug Mode
Add `debug` prop to enable Three.js debugger:
```tsx
<PalmTreeContainer debug={true} />
```

## 📄 License

This component is part of the Sheikh Shop project and follows the same licensing terms. 