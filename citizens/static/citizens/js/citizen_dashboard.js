/**
 * Citizen Dashboard JavaScript - Enhanced
 *
 * Features:
 * - Tab switching with smooth scrolling
 * - Keyboard navigation
 * - Copy to clipboard functionality
 * - Animated stat counters
 * - Enhanced hover effects
 */

(function() {
    'use strict';

    /**
     * Initialize dashboard on load
     */
    function initDashboard() {
        console.log('🚀 Citizen Dashboard: Initializing enhanced features');

        // Initialize all features
        initTabNavigation();
        initKeyboardShortcuts();
        initCopyToClipboard();
        initStatCounters();
        initTooltips();
        initTableEnhancements();

        console.log('✅ Citizen Dashboard: All features initialized');
    }

    /**
     * Initialize tab navigation with smooth scrolling
     */
    function initTabNavigation() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(function(tab) {
            tab.addEventListener('click', function(e) {
                // Smooth scroll to tabs container
                const tabsContainer = document.querySelector('.tabs-container');
                if (tabsContainer) {
                    setTimeout(function() {
                        tabsContainer.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, 100);
                }
            });
        });
    }

    /**
     * Keyboard shortcuts for navigation
     */
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Tab navigation with Ctrl+Arrow keys
            if (e.ctrlKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                e.preventDefault();
                navigateTabs(e.key === 'ArrowRight' ? 1 : -1);
            }

            // Ctrl+E for edit
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                const editBtn = document.querySelector('.header-actions .button[href*="change"]');
                if (editBtn) editBtn.click();
            }
        });
    }

    /**
     * Navigate between tabs
     */
    function navigateTabs(direction) {
        const tabs = Array.from(document.querySelectorAll('.tab'));
        const activeTab = document.querySelector('.tab.active');

        if (!activeTab) return;

        const currentIndex = tabs.indexOf(activeTab);
        const nextIndex = currentIndex + direction;

        if (nextIndex >= 0 && nextIndex < tabs.length) {
            tabs[nextIndex].click();
        }
    }

    /**
     * Add copy-to-clipboard functionality for contact info
     */
    function initCopyToClipboard() {
        // Add copy buttons to phone and email fields
        const contactFields = document.querySelectorAll('.info-table td');

        contactFields.forEach(function(field) {
            const text = field.textContent.trim();

            // Check if it's a phone number or email
            if (text.match(/^\+?\d[\d\s()-]+$/) || text.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                // Add copy icon
                const copyBtn = document.createElement('span');
                copyBtn.innerHTML = ' 📋';
                copyBtn.style.cssText = 'cursor: pointer; opacity: 0.5; transition: opacity 0.2s; margin-left: 8px;';
                copyBtn.title = 'Αντιγραφή';

                copyBtn.addEventListener('mouseover', function() {
                    this.style.opacity = '1';
                });

                copyBtn.addEventListener('mouseout', function() {
                    this.style.opacity = '0.5';
                });

                copyBtn.addEventListener('click', function() {
                    copyToClipboard(text, this);
                });

                field.appendChild(copyBtn);
            }
        });
    }

    /**
     * Copy text to clipboard with visual feedback
     */
    function copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(function() {
            // Visual feedback
            const original = button.innerHTML;
            button.innerHTML = ' ✅';
            button.style.opacity = '1';

            setTimeout(function() {
                button.innerHTML = original;
                button.style.opacity = '0.5';
            }, 2000);
        }).catch(function(err) {
            console.error('Copy failed:', err);
            button.innerHTML = ' ❌';
            setTimeout(function() {
                button.innerHTML = ' 📋';
            }, 2000);
        });
    }

    /**
     * Animate stat counters on load
     */
    function initStatCounters() {
        const statValues = document.querySelectorAll('.stat-value');

        statValues.forEach(function(stat) {
            const text = stat.textContent.trim();
            const number = parseInt(text);

            if (!isNaN(number) && number > 0) {
                animateCounter(stat, 0, number, 1000);
            }
        });
    }

    /**
     * Animate a number counter
     */
    function animateCounter(element, start, end, duration) {
        const originalText = element.textContent;
        const range = end - start;
        const increment = range / (duration / 16); // 60fps
        let current = start;

        const timer = setInterval(function() {
            current += increment;
            if (current >= end) {
                element.textContent = originalText;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    /**
     * Initialize tooltips for icons and actions
     */
    function initTooltips() {
        // Add title attributes to buttons that don't have them
        const buttons = document.querySelectorAll('.button, .action-link');

        buttons.forEach(function(btn) {
            if (!btn.title) {
                const text = btn.textContent.trim();
                btn.title = text;
            }
        });
    }

    /**
     * Enhance table interactions
     */
    function initTableEnhancements() {
        const tables = document.querySelectorAll('.data-table');

        tables.forEach(function(table) {
            // Add row click to expand (if needed in future)
            const rows = table.querySelectorAll('tbody tr');

            rows.forEach(function(row) {
                // Add subtle hover highlight
                row.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateX(4px)';
                });

                row.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateX(0)';
                });
            });
        });
    }

    /**
     * Initialize on DOM ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDashboard);
    } else {
        initDashboard();
    }

    // Print button handler (if added in future)
    window.printDashboard = function() {
        window.print();
    };

})();
