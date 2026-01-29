/**
 * theme-manager.js
 * Handles theme persistence and UI toggling
 */

export function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeText = document.getElementById('theme-text');
    
    // 1. Check for saved preference or system default
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Inside theme-manager.js
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            // Match the splash screen's dark background exactly
            document.body.classList.add('bg-zinc-950');
            if (themeText) themeText.innerText = 'Light Mode';
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('bg-zinc-950');
            if (themeText) themeText.innerText = 'Dark Mode';
        }
    };

    // Initial Apply
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }

    // 2. Event Listener for the toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = !document.documentElement.classList.contains('dark');
            applyTheme(isDark ? 'dark' : 'light');
            
            // Save preference
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
}