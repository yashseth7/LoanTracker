// // theme.js
// // Energetic, modern, finance-focused theme

// const theme = {
//   colors: {
//     background: '#0A0F1F',        // deep navy → strong focus
//     card: '#10172A',              // cleaner, smoother

//     primary: '#00D084',           // energetic emerald
//     primarySoft: '#22E6A8',       // lighter green for actions

//     text: '#F2F6FF',              // bright, clean white
//     textMuted: '#99A3C2',         // soft bluish-muted text

//     accent: '#00E0FF',            // electric cyan highlight
//     accent2: '#FFCE4F',           // profit/gain color

//     danger: '#FF4E4E',            // clear red for warnings
//     success: '#00E68E',           // positive green
//   },

//   spacing: {
//     xs: 4,
//     sm: 8,
//     md: 12,
//     lg: 16,
//     xl: 24,
//     xxl: 32,
//   },

//   radius: {
//     sm: 6,
//     md: 10,
//     lg: 16,
//     xl: 24,
//   },

//   shadow: {
//     card: {
//       shadowColor: '#00D084',
//       shadowOpacity: 0.08,
//       shadowRadius: 12,
//       elevation: 4,
//     },
//   },
// };

// export default theme;

// theme.js
// Premium Fintech Gloss Theme (purple + teal + gold)

const theme = {
  colors: {
    background: '#0B0A14',       // deep dark purple-black
    card: '#141322',             // glassy dark card

    primary: '#7B61FF',          // bright purple (action)
    primarySoft: '#9C85FF',      // softer purple (buttons)

    text: '#F5F2FF',             // soft white with purple tint
    textMuted: '#A79EC8',        // desaturated lavender

    accent: '#2DE5E0',           // neon teal highlight
    accent2: '#FFD86B',          // warm gold for money values

    danger: '#FF5C8A',           // reddish-pink warning
    success: '#3DFFB5',          // bright mint green
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  radius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
  },

  shadow: {
    card: {
      shadowColor: '#7B61FF',
      shadowOpacity: 0.12,
      shadowRadius: 18,
      elevation: 6,
    },
  },

  gradients: {
    primary: ['#7B61FF', '#2DE5E0'], // purple → teal
    cardShine: ['#1A1828', '#0F0E18'],
  },
};

export default theme;
