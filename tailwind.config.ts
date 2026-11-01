
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
				// Titres : Source Serif 4 ; tout le reste : Source Sans 3
				sans: ['"Source Sans 3"', "system-ui", "sans-serif"],
				serif: ['"Source Serif 4"', "Georgia", "serif"],
				body: ['"Source Sans 3"', "system-ui", "sans-serif"],
			},
			fontSize: {
				'title-main': ['2rem', { lineHeight: '2.5rem', fontWeight: '600' }],       // 32px
				'title-section': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],    // 24px
				'subtitle': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '500' }],     // 20px
				'body-lg': ['1rem', { lineHeight: '1.75rem', fontWeight: '400' }],         // 16px
				'body': ['1rem', { lineHeight: '1.625rem', fontWeight: '400' }],           // 16px
				'body-sm': ['0.875rem', { lineHeight: '1.375rem', fontWeight: '400' }],    // 14px
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
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))'
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
				// « lyrical » = encres et gris chauds ; « gold » = rouge rideau (accent unique)
				lyrical: {
					50: '#f7f6f3',
					100: '#efede8',
					200: '#dedad2',
					300: '#c5bfb3',
					400: '#a39c8f',
					500: '#7d776c',
					600: '#5e5a52',
					700: '#45423c',
					800: '#2e2c28',
					900: '#1f1d1a',
					950: '#15130f',
				},
				gold: {
					50: '#fbf1f2',
					100: '#f6dfe2',
					200: '#ecbcc4',
					300: '#de8f9c',
					400: '#c95a6d',
					500: '#b3304a',
					600: '#9e1b32',
					700: '#84162a',
					800: '#6c1323',
					900: '#58101d',
					950: '#33070f',
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
			// Coins presque droits ; « full » reste rond (avatars, pastilles)
			borderRadius: {
				lg: 'var(--radius)',
				md: 'var(--radius)',
				sm: 'var(--radius)',
				xl: '0.25rem',
				'2xl': '0.375rem',
				'3xl': '0.5rem'
			},
			// Pas d'ombre sur la page (filets à la place) ; ombre réservée aux éléments flottants
			boxShadow: {
				sm: 'none',
				DEFAULT: 'none',
				md: 'none',
				lg: '0 12px 32px -12px rgb(21 19 15 / 0.28)',
				xl: '0 12px 32px -12px rgb(21 19 15 / 0.28)',
				'2xl': '0 16px 40px -12px rgb(21 19 15 / 0.32)'
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
