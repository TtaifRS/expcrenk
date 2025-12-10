
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neutral: {
          50: '#fff',
          100: '#fff', 
          200: '#999', 
          300: '#343434', 
          400: '#212121', 
          500: '#000', 
        },
        bg: {
          primary: '#fff1e5',
        },
        text: {
          primary: '#000',
        },
      },
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        heading: ['Playfair Display', 'serif'],
      },
      fontSize: {
        
        'hero-phrase': 'clamp(4rem, 14vw, 14rem)', 
        'hero-outro': 'clamp(1.25rem, 4vw, 3.75rem)', 
        'hero-desc': 'clamp(0.75rem, 2vw, 1rem)', 
        'gallery-nav': '0.85rem',
        'gallery-preview-name': '0.95rem',
        'gallery-tag': '0.75rem',
        'btn': '1rem',
      },
      spacing: {

        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
        'hero-gap': 'clamp(1rem, 4vw, 12rem)', 
      },
      padding: {
        'hero-intro': 'clamp(0.5rem, 2vw, 1rem)',
        'hero-outro': 'clamp(1rem, 3vw, 2rem)',
      },
      lineHeight: {
        tight: 0.85,
        normal: 1,
        loose: 1.2,
      },
      backdropBlur: {
        xs: '20px',
      },
    },
  },
  plugins: [],
};

export default config;