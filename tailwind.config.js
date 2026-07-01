/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // IDV Axle: quase-preto quente (ink) + off-white/bone (paper).
        ink: '#111110',
        paper: '#f3f1ea',
        bone: '#e9e6dc',
        // Acento monocromático: rampa ancorada no ink (substitui o antigo azul "sky").
        // Mantém os utilitários sky-* existentes, agora na cor da marca.
        sky: {
          50: '#f5f4f1',
          100: '#e8e6df',
          200: '#d5d0c4',
          300: '#b1ab9b',
          400: '#807a6b',
          500: '#3f3b33',
          600: '#2c2920',
          700: '#211e17',
          800: '#191712',
          900: '#12110f',
        },
      },
      fontFamily: {
        // Corpo/UI: grotesca neutra. Títulos/marca: grotesca geométrica (IDV).
        sans: ['"General Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"General Sans"', '"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.18em',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-fast': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out',
        'fade-in-fast': 'fade-in-fast 0.2s ease-out',
        'pulse-soft': 'pulse-soft 1.8s ease-in-out infinite',
        'slide-up': 'slide-up 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
