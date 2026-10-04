const API_URL = 'http://localhost:5000/api/student';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('appForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Check if we are editing an existing user
    const urlParams = new URLSearchParams(window.location.search);
    let studentId = urlParams.get('id');

    // Fallback to localStorage if clicking around the sidebar
    if (!studentId) {
        studentId = localStorage.getItem('currentStudentId');
    }

    if (studentId) {
        // Save to localStorage for other tabs
        localStorage.setItem('currentStudentId', studentId);
        loadStudentData(studentId);
    } else {
        // Fresh form
        localStorage.removeItem('currentStudentId');
        
        // Hide the Update button when creating a new user
        const updateBtn = document.querySelector('button[value="save"]');
        if (updateBtn) updateBtn.style.display = 'none';
    }
});

async function loadStudentData(id) {
    const statusBanner = document.getElementById('statusMessage');
    if (statusBanner) statusBanner.innerText = 'Loading student information...';

    try {
        const response = await fetch(`${API_URL}/${id}`);
        const data = await response.json();

        if (data.success) {
            // Function to populate a specific section's fields
            const populateSection = (sectionData, prefix) => {
                if (!sectionData) return;
                for (const key in sectionData) {
                    let searchKey = key;
                    if (key === 'PWDIDNo') searchKey = 'PWDID';
                    if (key === 'HobbiesRecreationalActivities') searchKey = 'Hobbies';

                    const input = document.querySelector(`[name="${prefix}.${searchKey}"]`);
                    if (input && sectionData[key] !== null) {
                        // Handle date fields properly if needed (trim time)
                        if (input.type === 'date' && typeof sectionData[key] === 'string') {
                            input.value = sectionData[key].split('T')[0];
                        } else if (input.tagName === 'SELECT' && input.hasAttribute('data-yesno') || typeof sectionData[key] === 'boolean') {
                            // If the field is a boolean or a yesno dropdown, map it to 1/0 or Yes/No depending on options
                            // Usually 1 for true and 0 for false is universally understood by forms
                            input.value = sectionData[key] ? '1' : '0';
                        } else {
                            input.value = sectionData[key];
                        }
                    }
                }
            };

            // Populate all possible fields on whatever page we are on
            populateSection(data.general, 'general');
            populateSection(data.family, 'family');
            populateSection(data.education, 'education');
            populateSection(data.sibling, 'sibling');
            populateSection(data.medical, 'medical');
            populateSection(data.other, 'otherinfos');
            populateSection(data.enrollment, 'enrollment');

            const gen = data.general || {};
            if (statusBanner) {
                statusBanner.innerText = `Student: ${gen.FirstName || ''} ${gen.LastName || ''} (ID: ${id})`;
                statusBanner.style.backgroundColor = '#e0f2fe';
            }
        } else {
            if (statusBanner) {
                statusBanner.innerText = `Failed to load student data.`;
                statusBanner.style.backgroundColor = '#f8d7da';
            }
        }
    } catch (error) {
        console.error('Failed to fetch student:', error);
        if (statusBanner) statusBanner.innerText = `Error connecting to database.`;
    }
}

// Save Data Function
async function handleFormSubmit(e) {
    e.preventDefault();
    const action = e.submitter ? e.submitter.value : 'next';
    const formData = new FormData(e.target);
    const payload = {};

    formData.forEach((value, key) => {
        const cleanKey = key.replace(/^(general|family|education|sibling|medical|otherinfos|enrollment)\./, '');
        payload[cleanKey] = value;
    });

    // If we are editing, attach the ID to the payload
    const existingId = localStorage.getItem('currentStudentId');
    if (existingId) {
        payload.StudentID = existingId;
    }

    // Determine the correct backend endpoint based on the current page
    const currentPage = window.location.pathname.split('/').pop() || 'GeneralInformation.html';
    let endpoint = '/general';
    
    if (currentPage === 'FamilyBG.html') endpoint = '/family';
    else if (currentPage === 'EducBg.html') endpoint = '/education';
    else if (currentPage === 'Sibling.html') endpoint = '/sibling';
    else if (currentPage === 'MedicalBG.html' || currentPage === 'Medical.html') endpoint = '/medical';
    else if (currentPage === 'OtherInfos.html') endpoint = '/other';
    else if (currentPage === 'Enrollment.html') endpoint = '/enrollment';

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST', // Backend handles UPSERT for all endpoints
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        const statusBanner = document.getElementById('statusMessage');

        if (result.success) {
            // Save the generated student ID to localStorage so the next tabs know who we are editing
            localStorage.setItem('currentStudentId', result.studentId || existingId);
            
            if (action === 'save') {
                alert('Saved Successfully!');
                if (statusBanner) {
                    statusBanner.innerText = 'Saved Successfully!';
                    statusBanner.style.backgroundColor = '#d4edda';
                }
                return; // Stop here, do not redirect
            }

            // Redirect to the correct next tab
            const currentPage = window.location.pathname.split('/').pop();
            let nextPage = 'FamilyBG.html';
            
            if (currentPage === 'GeneralInformation.html') nextPage = 'FamilyBG.html';
            else if (currentPage === 'FamilyBG.html') nextPage = 'EducBg.html';
            else if (currentPage === 'EducBg.html') nextPage = 'Sibling.html';
            else if (currentPage === 'Sibling.html') nextPage = 'MedicalBG.html';
            else if (currentPage === 'MedicalBG.html' || currentPage === 'Medical.html') nextPage = 'OtherInfos.html';
            else if (currentPage === 'OtherInfos.html') nextPage = 'Enrollment.html';
            
            if (currentPage === 'Enrollment.html') {
                alert('Success! Student application and enrollment form has been completely processed.');
                window.location.href = 'Users.html';
            } else {
                window.location.href = nextPage;
            }
        } else {
            if (statusBanner) {
                statusBanner.innerText = `Error: ${result.error}`;
                statusBanner.style.backgroundColor = '#f8d7da';
            } else {
                alert(`Error: ${result.error}`);
            }
        }
    } catch (error) {
        console.error('Save failed:', error);
    }
}
