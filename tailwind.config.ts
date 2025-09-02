
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ["Inter", "Open Sans", "sans-serif"],
				serif: ["Playfair Display", "Merriweather", "serif"],
				body: ["Open Sans", "Inter", "sans-serif"],
			},
			fontSize: {
				'title-main': ['2rem', { lineHeight: '2.5rem', fontWeight: '600' }],       // 32px
				'title-section': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],    // 24px
				'subtitle': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '500' }],     // 20px
				'body-lg': ['1rem', { lineHeight: '1.75rem', fontWeight: '400' }],         // 16px
				'body': ['0.875rem', { lineHeight: '1.5rem', fontWeight: '400' }],         // 14px
				'body-sm': ['0.75rem', { lineHeight: '1.25rem', fontWeight: '400' }],      // 12px
				'work-title': ['0.9375rem', { lineHeight: '1.375rem', fontWeight: '600' }], // 15px
				'composer': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400', fontStyle: 'italic' }], // 14px italic
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				lyrical: {
					50: '#f9f7f4',
					100: '#f1ede5',
					200: '#e2d8ca',
					300: '#d0bc9f',
					400: '#b99c74',
					500: '#a68355',
					600: '#8c6944',
					700: '#735338',
					800: '#614733',
					900: '#523c2e',
					950: '#2c1f18',
				},
				gold: {
					50: '#fbf8eb',
					100: '#f7efc7',
					200: '#f0dc8a',
					300: '#e8c54d',
					400: '#e2b32b',
					500: '#d49a1c',
					600: '#b77616',
					700: '#955516',
					800: '#7a4417',
					900: '#663917',
					950: '#391d09',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				composer: 'hsl(var(--composer-text))',
				'secondary-text': 'hsl(var(--secondary-text))'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.95)', opacity: '0' }
				},
				'slide-in': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-out': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-100%)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'fade-out': 'fade-out 0.6s ease-out',
				'scale-in': 'scale-in 0.6s ease-out',
				'scale-out': 'scale-out 0.6s ease-out',
				'slide-in': 'slide-in 0.6s ease-out',
				'slide-out': 'slide-out 0.6s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
