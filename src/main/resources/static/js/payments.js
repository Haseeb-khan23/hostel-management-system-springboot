document.addEventListener('DOMContentLoaded', () => {
    loadPayments();
    setupEventListeners();
});


function setupEventListeners() {

    const modal = document.getElementById('paymentModal');
    const addBtn = document.getElementById('addPaymentBtn');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('paymentForm');

    if (addBtn) {
        addBtn.addEventListener('click', async () => {

            form.reset();

            await loadStudentsForPayment();

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

    if (form) {
        form.addEventListener('submit', async (e) => {

            e.preventDefault();

            const studentId =
                document.getElementById(
                    'paymentStudentId'
                ).value;

            const amount =
                parseFloat(
                    document.getElementById(
                        'paymentAmount'
                    ).value
                );

            const paymentMethod =
                document.getElementById(
                    'paymentMethod'
                ).value;

            const status =
                document.getElementById(
                    'paymentStatus'
                ).value;

            if (!studentId) {
                showAlert(
                    'Please select a student.'
                );
                return;
            }

            if (!amount || amount <= 0) {
                showAlert(
                    'Amount must be greater than 0.'
                );
                return;
            }

            const payload = {
                amount: amount,
                paymentMethod: paymentMethod,
                status: 'Paid'
            };

            try {

                await api.post(
                    `/payments/student/${studentId}`,
                    payload
                );

                showAlert(
                    'Payment recorded successfully.',
                    'success'
                );

                hideModal();
                loadPayments();

            } catch (err) {

                showAlert(
                    err.message ||
                    'Failed to record payment.'
                );
            }
        });
    }
}


async function loadStudentsForPayment() {

    const studentSelect =
        document.getElementById(
            'paymentStudentId'
        );

    if (!studentSelect) {
        return;
    }

    try {

        const students =
            await api.get('/students');

        studentSelect.innerHTML =
            '<option value="">Select a student</option>';

        if (!students || students.length === 0) {

            studentSelect.innerHTML =
                '<option value="">No students available</option>';

            return;
        }

        students.forEach(student => {

            const option =
                document.createElement('option');

            option.value = student.id;

            option.textContent =
                `${student.name} - Room ${student.roomNumber || 'Not Assigned'}`;

            studentSelect.appendChild(option);
        });

    } catch (err) {

        studentSelect.innerHTML =
            '<option value="">Unable to load students</option>';

        showAlert(
            err.message ||
            'Failed to load students.'
        );
    }
}


async function loadPayments() {

    const tableBody =
        document.getElementById(
            'paymentsTableBody'
        );

    const role =
        localStorage.getItem('role');

    try {

        // Admin can see all payment records.
        // Student can only see their own records
        // if the backend provides such an endpoint.
        if (role === 'ROLE_STUDENT') {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        Payment records are view-only for students.
                    </td>
                </tr>
            `;

            return;
        }

        const payments =
            await api.get('/payments');

        if (!payments || payments.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        No payment records found.
                    </td>
                </tr>
            `;

            return;
        }

        tableBody.innerHTML =
            payments.map(payment => {

                const student =
                    payment.student;

                const studentName =
                    student
                        ? student.name
                        : 'Unknown';

                const roomNumber =
                    student &&
                    student.room
                        ? student.room.roomNumber
                        : 'N/A';

                const status =
                    payment.status || 'PENDING';

                const statusClass =
                    status === 'PAID'
                        ? 'success'
                        : 'warning';

                return `
                    <tr>

                        <td>${payment.id}</td>

                        <td>
                            ${studentName}
                        </td>

                        <td>
                            ${roomNumber}
                        </td>

                        <td>
                            ₹${payment.amount}
                        </td>

                        <td>
                            ${payment.paymentMethod}
                        </td>

                        <td>
                            <span class="badge badge-${statusClass}">
                                ${status}
                            </span>
                        </td>

                        <td>
                            ${
                                payment.paymentDate
                                    ? new Date(
                                        payment.paymentDate
                                    ).toLocaleDateString()
                                    : 'N/A'
                            }
                        </td>

                        <td>
                            <span class="text-muted">No actions</span>
                        </td>

                        </tr>
                `;
            }).join('');

    } catch (err) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="text-center text-danger">
                    ${err.message}
                </td>
            </tr>
        `;
    }
}