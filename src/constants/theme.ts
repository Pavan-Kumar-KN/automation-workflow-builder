// Unified Theme System for Workflow Builder
// Consistent typography, colors, and spacing across all components

export const THEME = {
  // Typography - Consistent font system
  TYPOGRAPHY: {
    // Font sizes with specific use cases
    FONT_SIZE: {
      XS: 'text-xs',      // 12px - Small labels, captions, helper text
      SM: 'text-sm',      // 14px - Body text, buttons, inputs, form labels
      BASE: 'text-base',  // 16px - Default body text
      LG: 'text-lg',      // 18px - Section headers, modal titles
      XL: 'text-xl',      // 20px - Page titles
      '2XL': 'text-2xl',  // 24px - Main headings
    },
    
    // Font weights
    FONT_WEIGHT: {
      NORMAL: 'font-normal',      // 400 - Regular text
      MEDIUM: 'font-medium',      // 500 - Emphasized text, labels
      SEMIBOLD: 'font-semibold',  // 600 - Headings, important labels
      BOLD: 'font-bold',          // 700 - Strong emphasis
    },
    
    // Line heights
    LINE_HEIGHT: {
      TIGHT: 'leading-tight',     // 1.25 - Headings
      NORMAL: 'leading-normal',   // 1.5 - Body text
      RELAXED: 'leading-relaxed', // 1.625 - Long form content
    }
  },

  // Colors - Consistent color palette
  COLORS: {
    // Text colors
    TEXT: {
      PRIMARY: 'text-gray-900',     // Main text
      SECONDARY: 'text-gray-600',   // Secondary text
      MUTED: 'text-gray-500',       // Muted text, placeholders
      LIGHT: 'text-gray-400',       // Very light text
      WHITE: 'text-white',          // White text
    },
    
    // Background colors
    BACKGROUND: {
      PRIMARY: 'bg-white',          // Main background
      SECONDARY: 'bg-gray-50',      // Secondary background
      TERTIARY: 'bg-gray-100',      // Tertiary background
      DARK: 'bg-gray-900',          // Dark background
    },
    
    // Border colors
    BORDER: {
      DEFAULT: 'border-gray-200',   // Default borders
      LIGHT: 'border-gray-100',     // Light borders
      DARK: 'border-gray-300',      // Darker borders
      FOCUS: 'border-blue-500',     // Focus states
    },
    
    // Status colors
    STATUS: {
      SUCCESS: 'text-green-600',
      WARNING: 'text-amber-500',
      ERROR: 'text-red-600',
      INFO: 'text-blue-600',
    }
  },

  // Spacing - Consistent spacing system
  SPACING: {
    PADDING: {
      XS: 'p-1',      // 4px
      SM: 'p-2',      // 8px
      MD: 'p-3',      // 12px
      LG: 'p-4',      // 16px
      XL: 'p-6',      // 24px
      '2XL': 'p-8',   // 32px
    },
    
    MARGIN: {
      XS: 'm-1',      // 4px
      SM: 'm-2',      // 8px
      MD: 'm-3',      // 12px
      LG: 'm-4',      // 16px
      XL: 'm-6',      // 24px
      '2XL': 'm-8',   // 32px
    },
    
    GAP: {
      XS: 'gap-1',    // 4px
      SM: 'gap-2',    // 8px
      MD: 'gap-3',    // 12px
      LG: 'gap-4',    // 16px
      XL: 'gap-6',    // 24px
    }
  }
};

// Component-specific theme configurations
export const COMPONENT_STYLES = {
  // Modal/Panel styles
  MODAL: {
    TITLE: `${THEME.TYPOGRAPHY.FONT_SIZE.LG} ${THEME.TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD} ${THEME.COLORS.TEXT.PRIMARY}`,
    SUBTITLE: `${THEME.TYPOGRAPHY.FONT_SIZE.SM} ${THEME.COLORS.TEXT.SECONDARY}`,
    BODY: `${THEME.TYPOGRAPHY.FONT_SIZE.SM} ${THEME.COLORS.TEXT.PRIMARY}`,
    PADDING: THEME.SPACING.PADDING.LG,
  },

  // Form styles
  FORM: {
    LABEL: `${THEME.TYPOGRAPHY.FONT_SIZE.SM} ${THEME.TYPOGRAPHY.FONT_WEIGHT.MEDIUM} ${THEME.COLORS.TEXT.PRIMARY}`,
    INPUT: `${THEME.TYPOGRAPHY.FONT_SIZE.SM} ${THEME.COLORS.TEXT.PRIMARY}`,
    HELP_TEXT: `${THEME.TYPOGRAPHY.FONT_SIZE.XS} ${THEME.COLORS.TEXT.MUTED}`,
    ERROR_TEXT: `${THEME.TYPOGRAPHY.FONT_SIZE.XS} ${THEME.COLORS.STATUS.ERROR}`,
  },

  // Button styles
  BUTTON: {
    PRIMARY: 'text-sm font-medium',
    SECONDARY: 'text-sm font-medium',
    SMALL: 'text-xs font-medium',
  },

  // Node styles
  NODE: {
    TITLE: `${THEME.TYPOGRAPHY.FONT_SIZE.SM} ${THEME.TYPOGRAPHY.FONT_WEIGHT.MEDIUM} ${THEME.COLORS.TEXT.PRIMARY}`,
    SUBTITLE: `${THEME.TYPOGRAPHY.FONT_SIZE.XS} ${THEME.COLORS.TEXT.MUTED}`,
  },

  // Header styles
  HEADER: {
    MAIN_TITLE: `${THEME.TYPOGRAPHY.FONT_SIZE.LG} ${THEME.TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD} ${THEME.COLORS.TEXT.PRIMARY}`,
    SUB_TITLE: `${THEME.TYPOGRAPHY.FONT_SIZE.SM} ${THEME.COLORS.TEXT.SECONDARY}`,
  },

  // Config panel styles
  CONFIG: {
    SECTION_TITLE: 'text-base font-semibold text-gray-900',
    FIELD_LABEL: 'text-sm font-medium text-gray-700',
    FIELD_DESCRIPTION: 'text-xs text-gray-500',
    INPUT: 'text-sm text-gray-900',
  },

  // Publish panel styles
  PUBLISH: {
    TITLE: 'text-lg font-semibold text-gray-900',
    SECTION_HEADER: 'text-base font-semibold text-gray-900',
    LABEL: 'text-sm font-medium text-gray-700',
    DESCRIPTION: 'text-sm text-gray-600',
    VALIDATION_ERROR: 'text-xs text-red-600',
    VALIDATION_WARNING: 'text-xs text-amber-500',
    VALIDATION_INFO: 'text-xs text-blue-600',
  }
};

// Responsive breakpoints
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE: 1280,
};

// Utility functions for consistent styling
export const getThemeClass = (component: keyof typeof COMPONENT_STYLES, variant: string) => {
  return COMPONENT_STYLES[component][variant as keyof typeof COMPONENT_STYLES[typeof component]] || '';
};

// Common class combinations
export const COMMON_CLASSES = {
  // Modal/Panel containers
  MODAL_CONTAINER: `${THEME.COLORS.BACKGROUND.PRIMARY} ${THEME.COLORS.BORDER.DEFAULT} border rounded-lg shadow-lg`,
  MODAL_HEADER: `${THEME.SPACING.PADDING.LG} ${THEME.COLORS.BORDER.DEFAULT} border-b`,
  MODAL_BODY: `${THEME.SPACING.PADDING.LG}`,
  MODAL_FOOTER: `${THEME.SPACING.PADDING.LG} ${THEME.COLORS.BORDER.DEFAULT} border-t ${THEME.COLORS.BACKGROUND.SECONDARY}`,

  // Form elements
  INPUT_FIELD: `${THEME.TYPOGRAPHY.FONT_SIZE.SM} ${THEME.SPACING.PADDING.MD} ${THEME.COLORS.BORDER.DEFAULT} border rounded-md focus:${THEME.COLORS.BORDER.FOCUS} focus:ring-1 focus:ring-blue-500`,
  TEXTAREA_FIELD: `${THEME.TYPOGRAPHY.FONT_SIZE.SM} ${THEME.SPACING.PADDING.MD} ${THEME.COLORS.BORDER.DEFAULT} border rounded-md focus:${THEME.COLORS.BORDER.FOCUS} focus:ring-1 focus:ring-blue-500 resize-none`,
  SELECT_FIELD: `${THEME.TYPOGRAPHY.FONT_SIZE.SM} ${THEME.SPACING.PADDING.MD} ${THEME.COLORS.BORDER.DEFAULT} border rounded-md focus:${THEME.COLORS.BORDER.FOCUS} focus:ring-1 focus:ring-blue-500`,

  // Buttons
  BUTTON_PRIMARY: `${COMPONENT_STYLES.BUTTON.PRIMARY} px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`,
  BUTTON_SECONDARY: `${COMPONENT_STYLES.BUTTON.SECONDARY} px-4 py-2 ${THEME.COLORS.BACKGROUND.PRIMARY} ${THEME.COLORS.TEXT.PRIMARY} ${THEME.COLORS.BORDER.DEFAULT} border rounded-md hover:${THEME.COLORS.BACKGROUND.SECONDARY}`,
  BUTTON_SMALL: `${COMPONENT_STYLES.BUTTON.SMALL} px-3 py-1.5 rounded-md`,

  // Text elements
  SECTION_TITLE: COMPONENT_STYLES.CONFIG.SECTION_TITLE,
  FIELD_LABEL: COMPONENT_STYLES.FORM.LABEL,
  HELP_TEXT: COMPONENT_STYLES.FORM.HELP_TEXT,
  ERROR_TEXT: COMPONENT_STYLES.FORM.ERROR_TEXT,
};
