document.addEventListener('DOMContentLoaded', () => {

    const role = localStorage.getItem('role');

    setupComplaintPage(role);
    loadComplaints(role);

});


function setupComplaintPage(role) {

    const form = document.getElementById('complaintForm');
    const modal = document.getElementById('complaintModal');
    const addBtn = document.getElementById('addComplaintBtn');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');

    const studentGroup =
        document.getElementById('complaintStudentGroup');

    const studentInput =
        document.getElementById('complaintStudentId');

    const statusGroup =
        document.getElementById('complaintStatusGroup');


    if (role === 'STUDENT') {

        if (studentGroup) {
            studentGroup.classList.add('hidden');
        }

        if (studentInput) {
            studentInput.required = false;
        }

        if (statusGroup) {
            statusGroup.classList.add('hidden');
        }

    }


    if (addBtn) {

        addBtn.addEventListener('click', () => {

            form.reset();

            document.getElementById('complaintId').value = '';

            document.getElementById('modalTitle').textContent =
                'New Complaint';


            if (role === 'ADMIN') {

                studentGroup.classList.remove('hidden');
                studentInput.required = true;

                statusGroup.classList.add('hidden');

            } else {

                studentGroup.classList.add('hidden');
                studentInput.required = false;

                statusGroup.classList.add('hidden');

            }


            modal.classList.remove('hidden');

        });

    }


    const hideModal = () => {

        modal.classList.add('hidden');

    };


    if (closeBtn) {
        closeBtn.addEventListener('click', hideModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideModal);
    }


    form.onsubmit = saveComplaint;

}


async function loadComplaints(role) {

    const body =
        document.getElementById('complaintsTableBody');

    try {

        const endpoint =
            role === 'STUDENT'
                ? '/complaints/my'
                : '/complaints';


        const complaints =
            await api.get(endpoint);


        if (!complaints.length) {

            body.innerHTML =
                '<tr><td colspan="7" class="text-center">' +
                'No complaints found.' +
                '</td></tr>';

            return;
        }


        body.innerHTML = complaints.map(c => {

            let actions = '-';


            if (role === 'ADMIN') {

                actions =
                    `<button class="btn btn-sm btn-secondary"
                        onclick="editComplaint(${c.id})">
                        Edit
                    </button>

                    <button class="btn btn-sm btn-danger"
                        onclick="deleteComplaint(${c.id})">
                        Delete
                    </button>`;

            }


            return `
                <tr>

                    <td>${c.id}</td>

                    <td>
                        ${c.student?.id ?? '-'}
                        ${c.student?.name
                            ? `<br>${escapeHtml(c.student.name)}`
                            : ''}
                    </td>

                    <td>
                        ${escapeHtml(c.title)}
                    </td>

                    <td>
                        ${escapeHtml(c.description)}
                    </td>

                    <td>
                        <span class="badge ${
                            c.status === 'RESOLVED'
                                ? 'badge-success'
                                : c.status === 'IN_PROGRESS'
                                    ? 'badge-warning'
                                    : 'badge-danger'
                        }">
                            ${c.status}
                        </span>
                    </td>

                    <td>
                        ${formatDate(c.createdAt)}
                    </td>

                    <td>
                        ${actions}
                    </td>

                </tr>
            `;

        }).join('');


    } catch (e) {

        body.innerHTML =
            `<tr>
                <td colspan="7" class="text-center">
                    ${escapeHtml(e.message)}
                </td>
            </tr>`;

    }

}


function fillComplaint(c) {

    document.getElementById('complaintId').value =
        c.id;

    document.getElementById('complaintStudentId').value =
        c.student?.id || '';

    document.getElementById('complaintTitle').value =
        c.title;

    document.getElementById('complaintDescription').value =
        c.description;

    document.getElementById('complaintStatus').value =
        c.status;

    document.getElementById('complaintStatusGroup')
        .classList.remove('hidden');

    document.getElementById('complaintStudentGroup')
        .classList.remove('hidden');

    document.getElementById('modalTitle').textContent =
        'Edit Complaint';

    document.getElementById('complaintModal')
        .classList.remove('hidden');

}


async function editComplaint(id) {

    if (localStorage.getItem('role') !== 'ADMIN') {
        return;
    }

    try {

        const complaint =
            await api.get(`/complaints/${id}`);

        fillComplaint(complaint);

    } catch (e) {

        showAlert(e.message);

    }

}


async function saveComplaint(e) {

    e.preventDefault();


    const role =
        localStorage.getItem('role');


    const id =
        document.getElementById('complaintId').value;


    const payload = {

        title:
            document.getElementById('complaintTitle')
                .value
                .trim(),

        description:
            document.getElementById('complaintDescription')
                .value
                .trim()

    };


    try {

        if (role === 'ADMIN') {

            const studentId =
                document.getElementById('complaintStudentId')
                    .value;


            if (id) {

                payload.status =
                    document.getElementById('complaintStatus')
                        .value;

                await api.put(
                    `/complaints/${id}`,
                    payload
                );

            } else {

                await api.post(
                    `/complaints/student/${studentId}`,
                    payload
                );

            }

        } else {

            await api.post(
                '/complaints/my',
                payload
            );

        }


        document.getElementById('complaintModal')
            .classList.add('hidden');


        showAlert(
            id
                ? 'Complaint updated.'
                : 'Complaint created.',
            'success'
        );


        loadComplaints(role);


    } catch (e) {

        showAlert(e.message);

    }

}


async function deleteComplaint(id) {

    if (localStorage.getItem('role') !== 'ADMIN') {
        return;
    }


    if (!confirm('Delete this complaint?')) {
        return;
    }


    try {

        await api.delete(
            `/complaints/${id}`
        );


        showAlert(
            'Complaint deleted.',
            'success'
        );


        loadComplaints('ADMIN');


    } catch (e) {

        showAlert(e.message);

    }

}