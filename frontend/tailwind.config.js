/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          light: '#EEF2FF',
          dark: '#4338CA'
        },
        secondary: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          light: '#F5F3FF'
        },
        darkSidebar: '#111827',
        cardBg: '#FFFFFF',
        canvasBg: '#F8FAFC',
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          critical: '#EF4444',
          info: '#3B82F6'
        },
        brandText: {
          primary: '#111827',
          secondary: '#6B7280',
          muted: '#9CA3AF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'premium': '0 4px 20px -2px rgba(99, 102, 241, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04)'
      }
    },
  },
  plugins: [],
}
