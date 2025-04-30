/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    
  
        extend: {
          screens: {
            'xs': '475px', // Extra small screens (e.g., very small mobile devices)
            'sm': '640px', // Small screens (phones)
            'md0': '624px', // Medium screens (tablets)
            'md1': '730px', // Medium screens (tablets)

            'md': '768px', // Medium screens (tablets)
            'lg': '1024px', // Large screens (laptops)
            'xl': '1280px', // Extra large screens (desktops)
            '2xl': '1536px', // 2X large screens (large desktops)
            '3xl': '1920px', // 3X large screens (4K monitors)
            '4xl': '2560px', // 4X large screens (ultra-wide or very large screens)
          },
          backgroundImage: {
            'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          },
          keyframes: {
            fadeInUp: {
              '0%': {
                opacity: '0',
                transform: 'translateY(20px)',
              },
              '100%': {
                opacity: '1',
                transform: 'translateY(0)',
              },
            },
            slideInRight: {
              '0%': {
                opacity: '0',
                transform: 'translateX(100px)',
              },
              '100%': {
                opacity: '1',
                transform: 'translateX(0)',
              },
            },
          },
          animation: {
            'fade-in-up': 'fadeInUp 1s ease-in-out forwards',
            'slide-in-right': 'slideInRight 1s ease-in-out forwards',
          },
        },
      },
      plugins: [],

    
  

}