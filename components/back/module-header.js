
export function initializeModuleHeader() {
    const headerHTML = `
    <nav class="sticky top-0 z-50 bg-white dark:bg-zinc-950 border-b border-solid border-gray-200 dark:border-zinc-800 transition-colors duration-300">
        <div class="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
            <a href="user-page.html" class="text-2xl font-bold flex leading-8">
                <span class="text-indigo-600">Scheduler</span>
                <span class="text-amber-500">TrainingHub</span>
            </a>
            <div class="flex items-center gap-x-3 relative">
                <div id="user-menu-button" class="flex items-center gap-x-2 pl-2 pr-3 py-2 border border-transparent rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                    <span class="relative flex h-8 w-8 overflow-hidden rounded-full">
                        <span class="bg-indigo-600 text-gray-50 flex h-full w-full items-center justify-center text-xs font-bold" id="user-initials"></span>
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="text-neutral-500"><path d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>
                </div>

                <div id="profile-dropdown" class="hidden absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div class="p-4 border-b border-neutral-100 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-800/50">
                        <p id="dropdown-full-name" class="font-bold text-neutral-900 dark:text-zinc-100 truncate">Loading...</p>
                        <p id="dropdown-email" class="text-sm text-neutral-500 dark:text-zinc-400 truncate">Loading...</p>
                    </div>
                    <div class="p-2">
                        <a href="user-page.html" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 dark:text-zinc-300 hover:bg-neutral-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                            Dashboard
                        </a>

                        <button id="theme-toggle" class="w-full flex items-center justify-between px-3 py-2 text-sm text-neutral-700 dark:text-zinc-300 hover:bg-neutral-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                            <div class="flex items-center gap-3">
                                <svg id="moon-icon" class="block dark:hidden" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                                </svg>
                                
                                <svg id="sun-icon" class="hidden dark:block" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                                </svg>

                                <span id="theme-text">Dark Mode</span>
                            </div>
                        </button>

                        <div class="h-px bg-neutral-100 dark:bg-zinc-800 my-1"></div>
                        
                        <button id="logout-btn" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </nav>`;

    const container = document.getElementById('header-container');
    if (container) container.innerHTML = headerHTML;
}