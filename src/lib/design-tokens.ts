// Design System Tokens for Sheikh Shop
export const designTokens = {
    colors: {
        // Primary Brand Colors
        primary: {
            50: '#fef3c7',
            100: '#fde68a',
            200: '#fcd34d',
            300: '#fbbf24',
            400: '#f59e0b',
            500: '#d97706',
            600: '#b45309',
            700: '#92400e',
            800: '#78350f',
            900: '#451a03',
            950: '#451a03',
        },
        // Secondary Colors
        secondary: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
        },
        // Neutral Colors
        neutral: {
            50: '#fafaf9',
            100: '#f5f5f4',
            200: '#e7e5e4',
            300: '#d6d3d1',
            400: '#a8a29e',
            500: '#78716c',
            600: '#57534e',
            700: '#44403c',
            800: '#292524',
            900: '#1c1917',
            950: '#0c0a09',
        },
        // Semantic Colors
        success: {
            50: '#f0fdf4',
            500: '#22c55e',
            600: '#16a34a',
        },
        error: {
            50: '#fef2f2',
            500: '#ef4444',
            600: '#dc2626',
        },
        warning: {
            50: '#fffbeb',
            500: '#f59e0b',
            600: '#d97706',
        },
    },

    spacing: {
        xs: '0.25rem',    // 4px
        sm: '0.5rem',     // 8px
        md: '1rem',       // 16px
        lg: '1.5rem',     // 24px
        xl: '2rem',       // 32px
        '2xl': '3rem',    // 48px
        '3xl': '4rem',    // 64px
        '4xl': '6rem',    // 96px
    },

    borderRadius: {
        none: '0',
        sm: '0.25rem',    // 4px
        md: '0.5rem',     // 8px
        lg: '0.75rem',    // 12px
        xl: '1rem',       // 16px
        '2xl': '1.5rem',  // 24px
        full: '9999px',
    },

    typography: {
        fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
        },
        fontSize: {
            xs: '0.75rem',    // 12px
            sm: '0.875rem',   // 14px
            base: '1rem',     // 16px
            lg: '1.125rem',   // 18px
            xl: '1.25rem',    // 20px
            '2xl': '1.5rem',  // 24px
            '3xl': '1.875rem', // 30px
            '4xl': '2.25rem',  // 36px
            '5xl': '3rem',     // 48px
            '6xl': '3.75rem',  // 60px
        },
        fontWeight: {
            light: '300',
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
            extrabold: '800',
            black: '900',
        },
        lineHeight: {
            none: '1',
            tight: '1.25',
            snug: '1.375',
            normal: '1.5',
            relaxed: '1.625',
            loose: '2',
        },
    },

    shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    },

    animations: {
        duration: {
            fast: '150ms',
            normal: '300ms',
            slow: '500ms',
            slower: '700ms',
        },
        easing: {
            linear: 'linear',
            ease: 'ease',
            'ease-in': 'ease-in',
            'ease-out': 'ease-out',
            'ease-in-out': 'ease-in-out',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        },
    },

    breakpoints: {
        xs: '475px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        '3xl': '1600px',
        '4xl': '1920px',
    },

    zIndex: {
        hide: '-1',
        auto: 'auto',
        base: '0',
        docked: '10',
        dropdown: '1000',
        sticky: '1100',
        banner: '1200',
        overlay: '1300',
        modal: '1400',
        popover: '1500',
        skipLink: '1600',
        toast: '1700',
        tooltip: '1800',
    },
} as const;

// Utility functions
export const getColor = (color: string) => {
    const [category, shade] = color.split('.');
    const colorCategory = designTokens.colors[category as keyof typeof designTokens.colors];
    if (colorCategory && shade) {
        return (colorCategory as any)[shade] || color;
    }
    return color;
};

export const getSpacing = (size: keyof typeof designTokens.spacing) => designTokens.spacing[size];
export const getBorderRadius = (size: keyof typeof designTokens.borderRadius) => designTokens.borderRadius[size]; 