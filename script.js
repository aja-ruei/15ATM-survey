// Toggle between landing page and survey
document.getElementById('start-survey-btn').addEventListener('click', function () {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('survey-form').classList.remove('hidden');
    window.scrollTo(0, 0);
});

// Question selection logic
document.querySelectorAll('.rating-item, .choice-item').forEach(item => {
    item.addEventListener('click', function () {
        const parent = this.parentElement;
        parent.querySelectorAll('.rating-item, .choice-item').forEach(sibling => sibling.classList.remove('selected'));
        this.classList.add('selected');

        // Update hidden input if exists
        const hiddenInput = parent.querySelector('input[type="hidden"]');
        if (hiddenInput) {
            hiddenInput.value = this.getAttribute('data-value') || this.innerText;
        }

        // Hide error message on selection
        const questionEl = this.closest('.question');
        if (questionEl) {
            const errorMsg = questionEl.querySelector('.error-message');
            if (errorMsg) errorMsg.classList.add('hidden');
        }
    });
});

// Checkbox limit logic
const maxSelections = 3;
const checkboxes = document.querySelectorAll('input[name="satisfied_features"]');

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function (e) {
        const checkedCount = document.querySelectorAll('input[name="satisfied_features"]:checked').length;
        const questionEl = this.closest('.question');
        if (questionEl) {
            const errorMsg = questionEl.querySelector('.error-message');
            // Hide error if at least one selected
            if (checkedCount > 0 && errorMsg) errorMsg.classList.add('hidden');
        }


        // If checking the box would exceed limit
        if (checkedCount > maxSelections) {
            this.checked = false; // Prevent checking
            // e.preventDefault(); // Sometimes needed for certain events, but change fires after.
        }

        updateCheckboxState();
    });
});

function updateCheckboxState() {
    const checkedCount = document.querySelectorAll('input[name="satisfied_features"]:checked').length;
    const allCheckboxes = document.querySelectorAll('input[name="satisfied_features"]');

    allCheckboxes.forEach(cb => {
        if (!cb.checked) {
            if (checkedCount >= maxSelections) {
                cb.disabled = true;
                cb.parentElement.style.opacity = '0.5';
                cb.parentElement.style.cursor = 'not-allowed';
            } else {
                cb.disabled = false;
                cb.parentElement.style.opacity = '1';
                cb.parentElement.style.cursor = 'pointer';
            }
        }
    });
}

document.getElementById('survey-form').onsubmit = (e) => {
    e.preventDefault();

    // Reset errors
    document.querySelectorAll('.error-message').forEach(el => el.classList.add('hidden'));

    // Validation flag
    let isValid = true;
    let firstErrorElement = null;

    // Helper to show error
    const showError = (questionElement) => {
        if (!questionElement) return;
        const errorMsg = questionElement.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.classList.remove('hidden');
        }
        if (!firstErrorElement) {
            firstErrorElement = questionElement;
        }
        isValid = false;
    };

    // Robust Validation: Check each question container for a filled hidden input or checkbox
    document.querySelectorAll('.survey-section > .question, .demographics-section .question').forEach((questionEl) => {
        // Skip optional questions (like Question 10 with a textarea)
        if (questionEl.querySelector('textarea')) return;

        const hiddenInput = questionEl.querySelector('input[type="hidden"]');
        const checkboxes = questionEl.querySelectorAll('input[type="checkbox"]');

        if (hiddenInput && !hiddenInput.value) {
            showError(questionEl);
        } else if (checkboxes.length > 0) {
            const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
            if (checkedCount === 0) {
                showError(questionEl);
            }
        }
    });


    if (!isValid) {
        if (firstErrorElement) {
            firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    // Collect form data for console log
    console.log('Textarea (feedback) value:', document.querySelector('textarea[name="feedback"]')?.value);
    const formData = new FormData(e.target);
    const data = {};
    formData.forEach((value, key) => {
        if (data[key]) {
            if (!Array.isArray(data[key])) {
                data[key] = [data[key]];
            }
            data[key].push(value);
        } else {
            data[key] = value;
        }
    });
    console.log('問卷已送出！', data);

    // If valid, switch to completion page
    document.getElementById('survey-form').classList.add('hidden');
    document.getElementById('completion-page').classList.remove('hidden');
    window.scrollTo(0, 0);
};
