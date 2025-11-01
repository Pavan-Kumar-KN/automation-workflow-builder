// Responsive Design System for Workflow Builder
// Consistent sizing across all components

export const RESPONSIVE_SIZES = {
  // Node dimensions
  NODE: {
    WIDTH: {
      MOBILE: 'w-[200px]',
      TABLET: 'w-[240px]', 
      DESKTOP: 'w-[280px]'
    },
    HEIGHT: {
      MOBILE: 'h-[55px]',
      TABLET: 'h-[65px]',
      DESKTOP: 'h-[70px]'
    },
    PADDING: {
      MOBILE: 'px-3 py-2',
      TABLET: 'px-4 py-3',
      DESKTOP: 'px-4 py-3'
    }
  },

  // Icon sizes
  ICON: {
    SMALL: {
      MOBILE: 'w-4 h-4',
      TABLET: 'w-5 h-5', 
      DESKTOP: 'w-6 h-6'
    },
    MEDIUM: {
      MOBILE: 'w-5 h-5',
      TABLET: 'w-6 h-6',
      DESKTOP: 'w-8 h-8'
    },
    LARGE: {
      MOBILE: 'w-6 h-6',
      TABLET: 'w-8 h-8',
      DESKTOP: 'w-10 h-10'
    }
  },

  // Text sizes
  TEXT: {
    TITLE: {
      MOBILE: 'text-xs',
      TABLET: 'text-sm',
      DESKTOP: 'text-sm'
    },
    SUBTITLE: {
      MOBILE: 'text-xs',
      TABLET: 'text-xs',
      DESKTOP: 'text-xs'
    },
    BUTTON: {
      MOBILE: 'text-xs',
      TABLET: 'text-sm',
      DESKTOP: 'text-sm'
    }
  },

  // Spacing
  SPACING: {
    GAP: {
      MOBILE: 'gap-1',
      TABLET: 'gap-2',
      DESKTOP: 'gap-3'
    },
    MARGIN: {
      MOBILE: 'm-1',
      TABLET: 'm-2', 
      DESKTOP: 'm-2'
    }
  },

  // Edge elements
  EDGE: {
    PLUS_BUTTON: {
      MOBILE: 'w-5 h-4',
      TABLET: 'w-6 h-5',
      DESKTOP: 'w-6 h-5'
    },
    PLUS_ICON: {
      MOBILE: 'w-3 h-3',
      TABLET: 'w-4 h-4',
      DESKTOP: 'w-4 h-4'
    }
  }
};

// Responsive class combinations for common patterns
export const RESPONSIVE_CLASSES = {
  // Node container
  NODE_CONTAINER: `${RESPONSIVE_SIZES.NODE.WIDTH.MOBILE} ${RESPONSIVE_SIZES.NODE.HEIGHT.MOBILE} 
                   sm:${RESPONSIVE_SIZES.NODE.WIDTH.TABLET} sm:${RESPONSIVE_SIZES.NODE.HEIGHT.TABLET}
                   lg:${RESPONSIVE_SIZES.NODE.WIDTH.DESKTOP} lg:${RESPONSIVE_SIZES.NODE.HEIGHT.DESKTOP}
                   ${RESPONSIVE_SIZES.NODE.PADDING.MOBILE} sm:${RESPONSIVE_SIZES.NODE.PADDING.TABLET} lg:${RESPONSIVE_SIZES.NODE.PADDING.DESKTOP}`,

  // Node icon (medium size)
  NODE_ICON: `${RESPONSIVE_SIZES.ICON.MEDIUM.MOBILE} sm:${RESPONSIVE_SIZES.ICON.MEDIUM.TABLET} lg:${RESPONSIVE_SIZES.ICON.MEDIUM.DESKTOP}`,

  // Node title text
  NODE_TITLE: `${RESPONSIVE_SIZES.TEXT.TITLE.MOBILE} sm:${RESPONSIVE_SIZES.TEXT.TITLE.TABLET} lg:${RESPONSIVE_SIZES.TEXT.TITLE.DESKTOP} font-medium`,

  // Node subtitle text
  NODE_SUBTITLE: `${RESPONSIVE_SIZES.TEXT.SUBTITLE.MOBILE} sm:${RESPONSIVE_SIZES.TEXT.SUBTITLE.TABLET} lg:${RESPONSIVE_SIZES.TEXT.SUBTITLE.DESKTOP} text-gray-500`,

  // Edge plus button
  EDGE_PLUS_BUTTON: `${RESPONSIVE_SIZES.EDGE.PLUS_BUTTON.MOBILE} sm:${RESPONSIVE_SIZES.EDGE.PLUS_BUTTON.TABLET} lg:${RESPONSIVE_SIZES.EDGE.PLUS_BUTTON.DESKTOP}`,

  // Edge plus icon
  EDGE_PLUS_ICON: `${RESPONSIVE_SIZES.EDGE.PLUS_ICON.MOBILE} sm:${RESPONSIVE_SIZES.EDGE.PLUS_ICON.TABLET} lg:${RESPONSIVE_SIZES.EDGE.PLUS_ICON.DESKTOP}`
};

// Breakpoint utilities
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024
};

// Helper function to get current breakpoint
export const getCurrentBreakpoint = () => {
  if (typeof window === 'undefined') return 'DESKTOP';
  
  const width = window.innerWidth;
  if (width < BREAKPOINTS.MOBILE) return 'MOBILE';
  if (width < BREAKPOINTS.DESKTOP) return 'TABLET';
  return 'DESKTOP';
};
