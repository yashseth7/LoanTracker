// theme.js
// Energetic, modern, finance-focused theme

const theme = {
  colors: {
    background: '#0A0F1F',        // deep navy → strong focus
    card: '#10172A',              // cleaner, smoother

    primary: '#00D084',           // energetic emerald
    primarySoft: '#22E6A8',       // lighter green for actions

    text: '#F2F6FF',              // bright, clean white
    textMuted: '#99A3C2',         // soft bluish-muted text

    accent: '#00E0FF',            // electric cyan highlight
    accent2: '#FFCE4F',           // profit/gain color

    danger: '#FF4E4E',            // clear red for warnings
    success: '#00E68E',           // positive green
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
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
  },

  shadow: {
    card: {
      shadowColor: '#00D084',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
  },
};

export default theme;
