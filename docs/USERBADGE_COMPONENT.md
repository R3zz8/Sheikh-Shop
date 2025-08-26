# UserBadge Component Documentation

## Overview

The `UserBadge` component is a professional, reusable user display component designed for premium SaaS dashboards. It provides a beautiful and secure way to display user information in headers, navigation menus, and user interfaces.

## Features

- ✅ **Professional Design** - Modern UI with glassmorphism effects
- ✅ **Gender-Based Icons** - Dynamic icons based on user gender
- ✅ **Role-Based Styling** - Visual indicators for different user roles
- ✅ **Multiple Variants** - Default, compact, and mobile layouts
- ✅ **Avatar Support** - Profile picture with fallback to initials
- ✅ **Responsive Design** - Works seamlessly on all screen sizes
- ✅ **Accessibility** - Proper ARIA labels and keyboard navigation
- ✅ **TypeScript Support** - Fully typed with comprehensive interfaces

## Installation

The component is already integrated into your project. It uses the following dependencies:

```json
{
  "@radix-ui/react-avatar": "^1.0.4",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-tooltip": "^1.0.7",
  "lucide-react": "^0.294.0"
}
```

## Usage

### Basic Usage

```tsx
import UserBadge from '@/components/UserBadge';

function Header() {
  const user = {
    id: '1',
    email: 'john.doe@example.com',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    gender: 'MALE',
    role: 'USER',
    profilePicture: null
  };

  return (
    <header>
      <UserBadge user={user} onLogout={handleLogout} />
    </header>
  );
}
```

### Different Variants

```tsx
// Default variant (dropdown with full user info)
<UserBadge user={user} onLogout={handleLogout} />

// Compact variant (just avatar with tooltip)
<UserBadge user={user} variant="compact" />

// Mobile variant (full-width card layout)
<UserBadge user={user} variant="mobile" onLogout={handleLogout} />
```

## Props

### UserBadgeProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `user` | `User` | ✅ | - | User object with profile information |
| `onLogout` | `() => void` | ❌ | - | Callback function for logout action |
| `className` | `string` | ❌ | - | Additional CSS classes |
| `variant` | `'default' \| 'compact' \| 'mobile'` | ❌ | `'default'` | Component variant |

### User Interface

```typescript
interface User {
  id: string;
  email: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  profilePicture?: string | null;
  role: 'USER' | 'ADMIN' | 'EDITOR' | 'MODERATOR' | 'SUPERADMIN' | 'SYSTEM';
}
```

## Variants

### Default Variant
- **Purpose**: Full-featured user badge with dropdown menu
- **Features**: 
  - Avatar with initials fallback
  - Display name and role
  - Dropdown menu with account options
  - Logout functionality
- **Best for**: Desktop headers and navigation

### Compact Variant
- **Purpose**: Minimal avatar-only display
- **Features**:
  - Small circular avatar
  - Tooltip with user information
  - No dropdown menu
- **Best for**: Space-constrained areas, sidebars

### Mobile Variant
- **Purpose**: Full-width mobile-friendly layout
- **Features**:
  - Large avatar and user info
  - Card-style layout
  - Touch-friendly design
- **Best for**: Mobile menus, user profile sections

## Gender-Based Icons

The component automatically displays appropriate icons based on user gender:

- **MALE**: `User2` icon
- **FEMALE**: `UserCircle2` icon  
- **OTHER**: `Smile` icon
- **Not specified**: `UserCircle2` icon (default)

## Role-Based Styling

Different user roles have distinct visual indicators:

| Role | Icon | Color | Background |
|------|------|-------|------------|
| `SUPERADMIN` | Crown | Amber | Amber/10 |
| `ADMIN` | Shield | Red | Red/10 |
| `MODERATOR` | Shield | Blue | Blue/10 |
| `EDITOR` | Settings | Green | Green/10 |
| `USER` | User2 | Gray | Gray/10 |

## Display Name Logic

The component intelligently determines the display name using this priority:

1. **Username** (if available)
2. **Full Name** (firstName + lastName)
3. **First Name** (if lastName is missing)
4. **Email Prefix** (fallback)

## Avatar Fallback

When no profile picture is available, the component shows initials:

1. **First + Last Name** initials (e.g., "JD" for John Doe)
2. **First Name** initial (e.g., "J" for John)
3. **Username** initial (e.g., "J" for johndoe)
4. **Email** initial (e.g., "J" for john@example.com)

## Styling

The component uses Tailwind CSS with custom design tokens:

### Colors
- **Primary**: Amber gradient (`from-amber-400 to-orange-400`)
- **Background**: Glassmorphism (`bg-white/8 backdrop-blur-sm`)
- **Borders**: Subtle white borders (`border-white/20`)
- **Text**: White and gray variants

### Effects
- **Hover**: Smooth transitions with opacity changes
- **Focus**: Amber ring for accessibility
- **Backdrop**: Blur effects for modern glassmorphism

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and descriptions
- **Focus Management**: Visible focus indicators
- **Touch Targets**: Minimum 44px for mobile devices

## Integration Examples

### Header Integration

```tsx
// src/components/ClientHeader.tsx
import UserBadge from '@/components/UserBadge';

export default function ClientHeader() {
  const { data: user } = useUser();
  
  return (
    <header>
      <div className="flex items-center gap-4">
        {user && (
          <UserBadge 
            user={user} 
            onLogout={handleLogout}
            className="hidden md:flex"
          />
        )}
        <CartDropdown />
      </div>
    </header>
  );
}
```

### Mobile Menu Integration

```tsx
// Mobile menu section
{user && (
  <div className="mb-8">
    <UserBadge 
      user={user} 
      onLogout={handleLogout}
      variant="mobile"
    />
  </div>
)}
```

### Dashboard Integration

```tsx
// Dashboard sidebar
<div className="sidebar">
  <UserBadge 
    user={user} 
    variant="compact"
    className="mb-4"
  />
</div>
```

## Database Schema

The component requires these user fields in your Prisma schema:

```prisma
model User {
  id             String   @id @default(cuid())
  email          String   @unique
  username       String?  @db.VarChar(100)
  firstName      String?  @db.VarChar(100)
  lastName       String?  @db.VarChar(100)
  gender         Gender?
  profilePicture String?  @db.VarChar(500)
  role           UserRole @default(USER)
  // ... other fields
}

enum Gender {
  MALE
  FEMALE
  OTHER
}
```

## Migration

To add the required fields to existing users:

```bash
# Run the migration
npx prisma migrate dev --name add_user_profile_fields

# Update existing users with sample data
npx tsx scripts/update-user-profiles.ts
```

## Testing

Visit `/test-userbadge` to see the component in action with different variants and user types.

## Customization

### Custom Colors

You can customize the component colors by modifying the Tailwind classes in the component:

```tsx
// Example: Change primary color to blue
<AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-400 text-white">
  {initials}
</AvatarFallback>
```

### Custom Icons

To add custom gender icons:

```tsx
const getGenderIcon = () => {
  switch (user.gender) {
    case 'MALE':
      return MaleIcon; // Your custom icon
    case 'FEMALE':
      return FemaleIcon; // Your custom icon
    // ... other cases
  }
};
```

## Performance

- **Lazy Loading**: Dropdown content loads on demand
- **Memoization**: Component is optimized for re-renders
- **Bundle Size**: Minimal impact on bundle size
- **Tree Shaking**: Unused variants are eliminated

## Browser Support

- **Modern Browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **Mobile**: iOS Safari, Chrome Mobile
- **Fallbacks**: Graceful degradation for older browsers

## Troubleshooting

### Common Issues

1. **User data not displaying**
   - Check that user object has required fields
   - Verify database migration was applied

2. **Styling issues**
   - Ensure Tailwind CSS is properly configured
   - Check for conflicting CSS classes

3. **Dropdown not working**
   - Verify Radix UI dependencies are installed
   - Check for JavaScript errors in console

### Debug Mode

Add debug logging to troubleshoot:

```tsx
<UserBadge 
  user={user} 
  onLogout={handleLogout}
  className="debug:border-red-500"
/>
```

## Future Enhancements

- [ ] Profile picture upload functionality
- [ ] Dark/light theme support
- [ ] Custom avatar shapes
- [ ] Animation effects
- [ ] Multi-language support
- [ ] User status indicators (online/offline)

## Contributing

When contributing to the UserBadge component:

1. Maintain the existing design system
2. Add proper TypeScript types
3. Include accessibility features
4. Test across different screen sizes
5. Update documentation

---

*Last updated: August 4, 2025* 