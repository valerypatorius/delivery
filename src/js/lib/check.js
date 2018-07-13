const BREAKPOINTS = {
    mobile: 680,
    largeDesktop: 1200
};

/**
 * Check if screen size is mobile
 */
export const isMobile = () => {
    return !window.matchMedia(`(min-width: ${BREAKPOINTS.mobile}px)`).matches;
};

export const isLargeDesktop = () => {
    return window.matchMedia(`(min-width: ${BREAKPOINTS.largeDesktop}px)`).matches;
};