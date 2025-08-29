// Theme Toggle with prefers-color-scheme support
(function() {
    'use strict';
    
    // Get stored theme or default to 'auto' (follows system preference)
    const getStoredTheme = () => localStorage.getItem('theme') || 'auto';
    
    // Get the computed theme (what should actually be applied)
    const getComputedTheme = (theme) => {
        if (theme === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
    };
    
    // Apply theme to document
    const applyTheme = (theme) => {
        if (theme === 'auto') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    };
    
    // Store theme preference
    const storeTheme = (theme) => {
        localStorage.setItem('theme', theme);
    };
    
    // Initialize theme on page load
    const initTheme = () => {
        const storedTheme = getStoredTheme();
        applyTheme(storedTheme);
        updateToggleButton(storedTheme);
    };
    
    // Update toggle button state (if exists)
    const updateToggleButton = (theme) => {
        const toggleBtn = document.querySelector('[data-theme-toggle]');
        if (toggleBtn) {
            toggleBtn.textContent = getThemeButtonText(theme);
            toggleBtn.setAttribute('aria-label', `Current theme: ${theme}`);
        }
    };
    
    // Get button text for current theme
    const getThemeButtonText = (theme) => {
        const texts = {
            'light': '🌙 Dark',
            'dark': '☀️ Light', 
            'auto': '🔄 Auto'
        };
        return texts[theme] || '🔄 Auto';
    };
    
    // Cycle through themes: auto -> light -> dark -> auto
    const cycleTheme = () => {
        const current = getStoredTheme();
        const themes = ['auto', 'light', 'dark'];
        const currentIndex = themes.indexOf(current);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        
        storeTheme(nextTheme);
        applyTheme(nextTheme);
        updateToggleButton(nextTheme);
    };
    
    // Listen for system theme changes when in auto mode
    const handleSystemThemeChange = () => {
        if (getStoredTheme() === 'auto') {
            // Force re-evaluation by removing and re-applying auto theme
            applyTheme('auto');
        }
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addListener(handleSystemThemeChange);
        
        // Setup toggle button if it exists
        const toggleBtn = document.querySelector('[data-theme-toggle]');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', cycleTheme);
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initTheme();
            setupEventListeners();
        });
    } else {
        initTheme();
        setupEventListeners();
    }
    
    // Expose theme functions globally for manual control
    window.themeToggle = {
        cycle: cycleTheme,
        set: (theme) => {
            if (['auto', 'light', 'dark'].includes(theme)) {
                storeTheme(theme);
                applyTheme(theme);
                updateToggleButton(theme);
            }
        },
        get: getStoredTheme,
        getComputed: () => getComputedTheme(getStoredTheme())
    };
})();
