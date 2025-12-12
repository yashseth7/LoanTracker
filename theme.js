const theme = {
  colors: {
    background: '#0B0A14', // deep dark purple-black
    backgroundAlt: '#0F0E18', // slight variation for headers/cards

    card: '#141322', // glossy dark card
    cardElevated: '#1A1828', // for charts & summary cards

    primary: '#7B61FF', // bright purple action
    primarySoft: '#9C85FF', // softer tint for buttons

    text: '#F5F2FF', // soft white with purple tint
    textMuted: '#A79EC8', // lavender muted
    textFaded: '#6D6790', // for placeholder + low importance

    accent: '#2DE5E0', // neon teal
    accent2: '#FFD86B', // warm gold for money/pnl
    accent3: '#FF9CF3', // pink-magenta glow for special highlights

    success: '#3DFFB5', // mint green
    danger: '#FF5C8A', // pink-red
    warning: '#FFC670', // orange warning

    border: '#2A263B', // subtle border
    borderLight: '#3C3755', // lighter version for input highlights

    overlay: 'rgba(0,0,0,0.55)', // for modals / blur backgrounds

    chartLine: '#FFD86B', // golden-yellow line for PNL
    chartDot: '#FF9CF3', // pink dot highlights
    chartGrid: 'rgba(255,255,255,0.09)', // faint grid lines
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    giant: 48, // new → for large padding sections
  },

  radius: {
    xs: 6,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    pill: 999, // new → for rounded buttons/tags
  },

  shadow: {
    card: {
      shadowColor: '#7B61FF',
      shadowOpacity: 0.18,
      shadowRadius: 20,
      elevation: 8,
    },
    glow: {
      shadowColor: '#2DE5E0',
      shadowOpacity: 0.25,
      shadowRadius: 30,
      elevation: 12,
    },
  },

  gradients: {
    primary: ['#7B61FF', '#2DE5E0'], // purple → teal
    cardShine: ['#1A1828', '#0F0E18'],
    golden: ['#F7D774', '#D6A84E'], // new → for PNL positive
    danger: ['#FF5C8A', '#D63B68'], // new → for PNL negative
    success: ['#3DFFB5', '#15C98C'], // new
  },

  blur: {
    lightGlass: 'rgba(255,255,255,0.06)',
    darkGlass: 'rgba(0,0,0,0.2)',
  },

  sizing: {
    cardMinHeight: 120,
    buttonHeight: 44,
    chartHeight: 220,
  },

  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
};

export default theme;
