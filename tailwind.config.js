/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './invisalign-day/**/*.html', './js/**/*.js'],
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      colors: {
        navy: '#0B2B5C',
        invis: '#1E73BE',
        sky: '#5BB8F5',
        gold: '#F2B632',
        cloud: '#F4F6FA',
      },
      fontFamily: {
        heading: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        script: ['"Kaushan Script"', 'cursive'],
      },
      maxWidth: { content: '1140px' },
      boxShadow: {
        card: '0 10px 30px -12px rgba(11, 43, 92, 0.25)',
        lift: '0 14px 28px -10px rgba(11, 43, 92, 0.35)',
      },
    },
  },
  plugins: [],
};
