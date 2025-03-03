import type { Config } from "tailwindcss";

export default {
	darkMode: ["class", "class"]
	,
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			screens: {
				ctab: {
					max: '950px'
				},
				cphone: {
					max: '600px'
				},
				cphone_small: {
					max: '400px'
				},
				cbecom: {
					max: "1150px"
				},
				cbecomn: {
					min: "1150px"
				},
				becomphone: {
					max: "405px"
				}
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				'gradient-start': '#0795ec75',
				'gradient-end': '#222e5575',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			keyframes: {
				skeleton: {
					'0%': {
						opacity: '0%'
					},
					'50%': {
						opacity: '100%'
					},
					'100%': {
						opacity: '0%'
					}
				},
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'slide-top': {
					'0%': { transform: 'translateY(100px)', opacity: "0%" },
					'100%': { transform: 'translateY(0)', opacity: "100%" },
				},
			},
			animation: {
				"skeleton": 'skeleton 1.4s infinite',
				'slide-top': 'slide-top 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [
		require("tailwind-scrollbar"),
		require("tailwindcss-animate"),
		require('@tailwindcss/typography'),
	],
} satisfies Config;
