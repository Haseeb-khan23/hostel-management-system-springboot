document.addEventListener('DOMContentLoaded', () => {

    loadStudents();
    setupEventListeners();

});


function setupEventListeners() {

    const modal = document.getElementById('studentModal');
    const addBtn = document.getElementById('addStudentBtn');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('studentForm');


    // Safety check.
    // Prevents "Cannot read properties of null" errors
    // if this JS is accidentally loaded on another page.
    if (!modal || !form) {
        return;
    }


    if (addBtn) {

        addBtn.addEventListener('click', async () => {

            form.reset();

            document.getElementById('studentId').value = '';

            document.getElementById('modalTitle').textContent =
                'Add Student';


            await loadAvailableRooms();


            modal.classList.remove('hidden');

        });

    }


    const hideModal = () => {

        if (modal) {
            modal.classList.add('hidden');
        }

    };


    if (closeBtn) {

        closeBtn.addEventListener(
            'click',
            hideModal
        );

    }


    if (cancelBtn) {

        cancelBtn.addEventListener(
            'click',
            hideModal
        );

    }


    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        const id =
            document.getElementById('studentId').value;

        const selectedRoom =
            document.getElementById('studentRoom').value;

        const payload = {
            name:
                document.getElementById('studentName').value.trim(),

            mobileNo:
                document.getElementById('studentPhone').value.trim(),

            course:
                document.getElementById('studentCourse').value.trim(),

            address:
                document.getElementById('studentAddress').value.trim(),

            paymentStatus:
                document.getElementById('studentPaymentStatus').value
        };

        try {

            if (id) {

                /*
                 * Updating existing student.
                 * Login credentials are NOT changed here.
                 */

                const currentStudent =
                    await api.get(`/students/${id}`);

                await api.put(
                    `/students/${id}`,
                    payload
                );

                /*
                 * Change room only if the selected room
                 * is different from the current room.
                 */

                if (
                    selectedRoom &&
                    selectedRoom !== currentStudent.roomNumber
                ) {

                    await api.put(
                        `/students/${id}/room/${encodeURIComponent(selectedRoom)}`
                    );

                }

                showAlert(
                    'Student updated successfully',
                    'success'
                );

            } else {

                /*
                 * Creating a new student requires
                 * a unique username and password.
                 */

                const username =
                    document.getElementById('studentUsername').value.trim();

                const password =
                    document.getElementById('studentPassword').value;

                if (!username || !password) {
                    throw new Error(
                        'Username and password are required.'
                    );
                }

                payload.user = {
                    username: username,
                    password: password
                };

                /*
                 * First create the student.
                 * Room is assigned separately afterwards.
                 */

                const createdStudent =
                    await api.post(
                        '/students',
                        payload
                    );

                /*
                 * Assign selected room.
                 */

                if (selectedRoom) {

                    await api.post(
                        `/students/${createdStudent.id}/room/${encodeURIComponent(selectedRoom)}`
                    );

                }

                showAlert(
                    'Student created successfully',
                    'success'
                );
            }

            hideModal();

            loadStudents();

        } catch (err) {

            showAlert(
                err.message ||
                'Failed to save student.'
            );
        }

    });

}


/*
 * Load only rooms that still have available capacity.
 *
 * Available means:
 *
 * currentOccupants < capacity
 *
 * There is NO "status" field in the Room entity.
 */
async function loadAvailableRooms(
    selectedRoomNumber = ''
) {

    const roomSelect =
        document.getElementById('studentRoom');


    if (!roomSelect) {
        return;
    }


    try {

        const rooms =
            await api.get('/rooms');


        roomSelect.innerHTML =
            '<option value="">Select an available room</option>';


        const availableRooms =
            rooms.filter(room => {

                const occupants =
                    Number(room.currentOccupants || 0);

                const capacity =
                    Number(room.capacity || 0);

                return occupants < capacity;

            });


        availableRooms.forEach(room => {

            const option =
                document.createElement('option');


            option.value =
                room.roomNumber;


            const remainingSeats =
                Number(room.capacity) -
                Number(room.currentOccupants || 0);


            option.textContent =
                `${room.roomNumber} - ${room.roomType} (${remainingSeats} seat${remainingSeats === 1 ? '' : 's'} available)`;


            roomSelect.appendChild(option);

        });


        /*
         * While editing:
         *
         * If the student's current room is full,
         * keep it in the dropdown as "Current room".
         *
         * This prevents an edit of the student's name/address
         * from forcing an unnecessary room change.
         */

        if (
            selectedRoomNumber &&
            !availableRooms.some(
                room =>
                    room.roomNumber === selectedRoomNumber
            )
        ) {

            const currentRoom =
                rooms.find(
                    room =>
                        room.roomNumber === selectedRoomNumber
                );


            if (currentRoom) {

                const option =
                    document.createElement('option');


                option.value =
                    currentRoom.roomNumber;


                option.textContent =
                    `${currentRoom.roomNumber} - ${currentRoom.roomType} (Current room)`;


                roomSelect.appendChild(option);

            }

        }


        if (selectedRoomNumber) {

            roomSelect.value =
                selectedRoomNumber;

        }


    } catch (err) {

        roomSelect.innerHTML =
            '<option value="">Unable to load rooms</option>';


        showAlert(
            err.message ||
            'Failed to load rooms.'
        );

    }

}


/*
 * Load all students.
 */
async function loadStudents() {

    const tableBody =
        document.getElementById(
            'studentsTableBody'
        );


    if (!tableBody) {
        return;
    }


    try {

        const students =
            await api.get('/students');


        if (
            !students ||
            students.length === 0
        ) {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        class="text-center">
                        No students found.
                    </td>
                </tr>
            `;

            return;

        }


        tableBody.innerHTML =
            students.map(student => `

                <tr>

                    <td>
                        ${student.id}
                    </td>

                    <td>
                        ${student.name || 'N/A'}
                    </td>

                    <td>
                        ${student.mobileNo || 'N/A'}
                    </td>

                    <td>
                        ${student.course || 'N/A'}
                    </td>

                    <td>
                        ${student.address || 'N/A'}
                    </td>

                    <td>
                        ${student.roomNumber || 'Not Assigned'}
                    </td>

                    <td>
                        ${student.paymentStatus || 'PENDING'}
                    </td>

                    <td class="admin-only">

                        <button
                            class="btn btn-sm btn-secondary"
                            onclick="editStudent(${student.id})">
                            Edit
                        </button>

                        <button
                            class="btn btn-sm btn-danger"
                            onclick="deleteStudent(${student.id})">
                            Delete
                        </button>

                    </td>

                </tr>

            `).join('');


        /*
         * common.js normally handles this.
         * This keeps the table correct even if common.js
         * runs before the dynamic rows are inserted.
         */

        const role =
            localStorage.getItem('role');


        if (role === 'ROLE_STUDENT') {

            tableBody
                .querySelectorAll('.admin-only')
                .forEach(element => {

                    element.classList.add('hidden');

                });

        }


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


/*
 * Edit student.
 */
async function editStudent(id) {

    try {

        const student =
            await api.get(`/students/${id}`);


        document.getElementById(
            'studentId'
        ).value = student.id;


        document.getElementById(
            'studentName'
        ).value = student.name || '';


        document.getElementById(
            'studentPhone'
        ).value = student.mobileNo || '';


        document.getElementById(
            'studentCourse'
        ).value = student.course || '';


        document.getElementById(
            'studentAddress'
        ).value = student.address || '';


        document.getElementById(
            'studentPaymentStatus'
        ).value =
            student.paymentStatus || 'PENDING';


        /*
         * Load rooms first, then select the student's
         * current room.
         */

        await loadAvailableRooms(
            student.roomNumber || ''
        );


        document.getElementById(
            'modalTitle'
        ).textContent = 'Edit Student';


        const modal =
            document.getElementById('studentModal');


        if (modal) {

            modal.classList.remove('hidden');

        }


    } catch (err) {

        showAlert(
            err.message ||
            'Failed to fetch student details.'
        );

    }

}


/*
 * Delete student.
 */
async function deleteStudent(id) {

    if (
        !confirm(
            'Are you sure you want to delete this student record?'
        )
    ) {
        return;
    }


    try {

        await api.delete(
            `/students/${id}`
        );


        showAlert(
            'Student record deleted successfully',
            'success'
        );


        loadStudents();


    } catch (err) {

        showAlert(
            err.message ||
            'Failed to delete student.'
        );

    }

}