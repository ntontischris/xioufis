/**
 * Dynamic fieldset show/hide for Military Personnel Admin
 *
 * Shows/hides fieldsets based on selected military type (ΣΤΡΑΤΙΩΤΗΣ or ΜΟΝΙΜΟΣ)
 * Works with both MilitaryPersonnelAdmin and MilitaryPersonnelInline
 *
 * Uses CSS classes for reliable detection:
 * - .military-fieldset-soldier for Στρατιώτης fields
 * - .military-fieldset-permanent for Μόνιμος fields
 */

(function() {
    'use strict';

    /**
     * Toggle fieldsets based on selected type
     */
    function toggleFieldsets(typeSelect) {
        if (!typeSelect) {
            console.warn('MilitaryPersonnel: No type select found');
            return;
        }

        const selectedType = typeSelect.value;
        console.log('MilitaryPersonnel: Type selected:', selectedType);

        // Find the closest form or inline container
        const container = typeSelect.closest('form') ||
                         typeSelect.closest('.inline-related') ||
                         typeSelect.closest('.module');

        if (!container) {
            console.warn('MilitaryPersonnel: No container found');
            return;
        }

        // Find soldier and permanent fieldsets using CSS classes
        const soldierFieldsets = container.querySelectorAll('fieldset.military-fieldset-soldier');
        const permanentFieldsets = container.querySelectorAll('fieldset.military-fieldset-permanent');

        console.log('MilitaryPersonnel: Found', soldierFieldsets.length, 'soldier fieldsets');
        console.log('MilitaryPersonnel: Found', permanentFieldsets.length, 'permanent fieldsets');

        // Hide all conditional fieldsets first
        soldierFieldsets.forEach(function(fieldset) {
            fieldset.classList.remove('visible');
            fieldset.style.display = 'none';
        });

        permanentFieldsets.forEach(function(fieldset) {
            fieldset.classList.remove('visible');
            fieldset.style.display = 'none';
        });

        // Show only the relevant fieldset based on selection
        if (selectedType === 'ΣΤΡΑΤΙΩΤΗΣ') {
            console.log('MilitaryPersonnel: Showing soldier fieldsets');
            soldierFieldsets.forEach(function(fieldset) {
                fieldset.classList.add('visible');
                fieldset.style.display = 'block';
            });
        } else if (selectedType === 'ΜΟΝΙΜΟΣ') {
            console.log('MilitaryPersonnel: Showing permanent fieldsets');
            permanentFieldsets.forEach(function(fieldset) {
                fieldset.classList.add('visible');
                fieldset.style.display = 'block';
            });
        } else {
            console.log('MilitaryPersonnel: No type selected, hiding all conditional fieldsets');
        }
    }

    /**
     * Initialize dynamic fieldsets for a type select element
     */
    function initTypeSelect(typeSelect) {
        console.log('MilitaryPersonnel: Initializing type select', typeSelect.name);

        // Set initial state
        toggleFieldsets(typeSelect);

        // Add change event listener
        typeSelect.addEventListener('change', function() {
            console.log('MilitaryPersonnel: Type changed');
            toggleFieldsets(this);
        });
    }

    /**
     * Find and initialize all type select elements
     */
    function initAllTypeSelects() {
        console.log('MilitaryPersonnel: Initializing all type selects');

        // Main form (MilitaryPersonnelAdmin)
        const mainTypeSelect = document.querySelector('select[name="τυπος"]');
        if (mainTypeSelect) {
            console.log('MilitaryPersonnel: Found main type select');
            initTypeSelect(mainTypeSelect);
        }

        // Inline forms (MilitaryPersonnelInline in CitizenAdmin)
        const inlineTypeSelects = document.querySelectorAll('select[name*="military_personnel"][name$="τυπος"]');
        console.log('MilitaryPersonnel: Found', inlineTypeSelects.length, 'inline type selects');

        inlineTypeSelects.forEach(function(select) {
            initTypeSelect(select);
        });
    }

    /**
     * Initialize on DOM ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('MilitaryPersonnel: DOM loaded, initializing');
            initAllTypeSelects();
        });
    } else {
        console.log('MilitaryPersonnel: DOM already loaded, initializing');
        initAllTypeSelects();
    }

    /**
     * Re-initialize when Django admin adds new inline forms
     * This handles the "Add another" button in inlines
     */
    document.addEventListener('formset:added', function(event) {
        console.log('MilitaryPersonnel: New inline form added');
        // Find type select in the newly added form
        const newForm = event.target;
        const typeSelect = newForm.querySelector('select[name*="military_personnel"][name$="τυπος"]');
        if (typeSelect) {
            initTypeSelect(typeSelect);
        }
    });

})();
