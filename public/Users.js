document.addEventListener('DOMContentLoaded', () => {
    const userTableBody = document.getElementById('userTableBody');
    const userCountSpan = document.getElementById('userCount');

    // Fetch users automatically when the page loads
    loadUsers();

    async function loadUsers() {
        try {
            // Show initial loading state in the table
            userTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Loading users...</td></tr>';
            
            // Fetch from the backend API
            const response = await fetch('/api/students');
            const data = await response.json();

            if (data.success) {
                renderTable(data.students);
                userCountSpan.textContent = `Showing ${data.students.length} users`;
            } else {
                alert('Failed to load users: ' + data.error);
                userCountSpan.textContent = 'Failed to load users.';
                userTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--danger);">Failed to load data.</td></tr>';
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            userCountSpan.textContent = 'Error connecting to database.';
            userTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--danger);">An error occurred while connecting to the database.</td></tr>';
        }
    }

    function renderTable(students) {
        userTableBody.innerHTML = ''; // Clear loading indicator

        if (students.length === 0) {
            userTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No users found in the database.</td></tr>';
            return;
        }

        students.forEach(student => {
            const tr = document.createElement('tr');
            
            // Format ID nicely
            const displayId = `#${student.StudentID.toString().padStart(4, '0')}`;
            
            tr.innerHTML = `
                <td>${displayId}</td>
                <td>
                    <div style="font-weight: 600; color: var(--text-main);">${student.FirstName} ${student.LastName}</div>
                </td>
                <td>${student.Email || '<span style="color:var(--text-muted)">N/A</span>'}</td>
                <td><span class="badge badge-user">Student</span></td>
                <td><span class="badge badge-active">Active</span></td>
                <td>
                    <button class="btn-icon" title="Edit" onclick="window.location.href='GeneralInformation.html?id=${student.StudentID}'"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon text-danger" title="Delete" onclick="deleteStudent(${student.StudentID})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            userTableBody.appendChild(tr);
        });
    }

    // Attach to window so onclick can reach it
    window.deleteStudent = async function(id) {
        if (confirm('Are you sure you want to completely delete this student? This will delete all their tabs and information. This action cannot be undone.')) {
            try {
                const response = await fetch(`/api/student/${id}`, { method: 'DELETE' });
                const result = await response.json();
                
                if (result.success) {
                    // Check if we are deleting the user we currently have stored in memory
                    if (localStorage.getItem('currentStudentId') == id) {
                        localStorage.removeItem('currentStudentId');
                    }
                    loadUsers(); // Refresh the table
                } else {
                    alert(`Failed to delete student: ${result.error}`);
                }
            } catch (error) {
                console.error('Error deleting student:', error);
                alert('An error occurred while connecting to the database.');
            }
        }
    };
});
