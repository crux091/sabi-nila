const API_URL = 'http://localhost:5000/api/student';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('appForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

// Save Data Function
async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {};

    formData.forEach((value, key) => {
        const cleanKey = key.replace(/^(general|family|education)\./, '');
        payload[cleanKey] = value;
    });

    try {
        const response = await fetch(`${API_URL}/general`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        const statusBanner = document.getElementById('statusMessage');

        if (result.success) {
            // Save the generated student ID to localStorage so the next tabs know who we are editing
            localStorage.setItem('currentStudentId', result.studentId);
            // Redirect to the next tab
            window.location.href = 'FamilyBG.html';
        } else {
            statusBanner.innerText = `Error: ${result.error}`;
            statusBanner.style.backgroundColor = '#f8d7da';
        }
    } catch (error) {
        console.error('Save failed:', error);
    }
}
