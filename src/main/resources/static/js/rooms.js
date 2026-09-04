document.addEventListener('DOMContentLoaded', () => {
    loadRooms();
    setupEventListeners();
});


function setupEventListeners() {

    const modal =
        document.getElementById('roomModal');

    const addBtn =
        document.getElementById('addRoomBtn');

    const closeBtn =
        document.getElementById('closeModal');

    const cancelBtn =
        document.getElementById('cancelBtn');

    const form =
        document.getElementById('roomForm');


    if (addBtn) {

        addBtn.addEventListener('click', () => {

            form.reset();

            document.getElementById(
                'roomId'
            ).value = '';

            document.getElementById(
                'modalTitle'
            ).textContent = 'Add Room';

            modal.classList.remove('hidden');
        });
    }


    const hideModal = () =>
        modal.classList.add('hidden');


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


    if (form) {

        form.addEventListener(
            'submit',
            async (e) => {

                e.preventDefault();

                const id =
                    document.getElementById(
                        'roomId'
                    ).value;

                const payload = {

                    roomNumber:
                        document.getElementById(
                            'roomNumber'
                        ).value.trim(),

                    roomType:
                        document.getElementById(
                            'roomType'
                        ).value,

                    capacity:
                        parseInt(
                            document.getElementById(
                                'capacity'
                            ).value,
                            10
                        ),

                    price:
                        parseFloat(
                            document.getElementById(
                                'price'
                            ).value
                        )
                };


                try {

                    if (id) {

                        await api.put(
                            `/rooms/${id}`,
                            payload
                        );

                        showAlert(
                            'Room details updated successfully',
                            'success'
                        );

                    } else {

                        await api.post(
                            '/rooms',
                            payload
                        );

                        showAlert(
                            'Room created successfully',
                            'success'
                        );
                    }

                    hideModal();
                    loadRooms();

                } catch (err) {

                    showAlert(
                        err.message ||
                        'Failed to save room.'
                    );
                }
            }
        );
    }
}


async function loadRooms() {

    const tableBody =
        document.getElementById(
            'roomsTableBody'
        );

    const role =
        localStorage.getItem('role');


    try {

        const rooms =
            await api.get('/rooms');


        if (!rooms || rooms.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        class="text-center">
                        No rooms registered.
                    </td>
                </tr>
            `;

            return;
        }


        tableBody.innerHTML =
            rooms.map(room => {

                const occupants =
                    Number(
                        room.currentOccupants || 0
                    );

                const capacity =
                    Number(
                        room.capacity || 0
                    );

                const availableSeats =
                    capacity - occupants;

                const isAvailable =
                    availableSeats > 0;


                return `
                    <tr>

                        <td>${room.id}</td>

                        <td>
                            ${room.roomNumber}
                        </td>

                        <td>
                            ${room.roomType}
                        </td>

                        <td>
                            ${capacity}
                        </td>

                        <td>
                            ${occupants}
                        </td>

                        <td>
                            <span class="badge ${
                                isAvailable
                                    ? 'badge-success'
                                    : 'badge-warning'
                            }">
                                ${
                                    isAvailable
                                        ? availableSeats
                                        : 'Full'
                                }
                            </span>
                        </td>

                        <td>
                            ₹${room.price}
                        </td>

                        <td class="admin-only">

                            <button
                                class="btn btn-sm btn-secondary"
                                onclick="editRoom(${room.id})">
                                Edit
                            </button>

                            <button
                                class="btn btn-sm btn-danger"
                                onclick="deleteRoom(${room.id})">
                                Delete
                            </button>

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


async function editRoom(id) {

    try {

        const room =
            await api.get(`/rooms/${id}`);


        const occupants =
            Number(
                room.currentOccupants || 0
            );

        const capacity =
            Number(
                room.capacity || 0
            );





        document.getElementById(
            'roomId'
        ).value = room.id;


        document.getElementById(
            'roomNumber'
        ).value = room.roomNumber;


        document.getElementById(
            'roomType'
        ).value = room.roomType;


        document.getElementById(
            'capacity'
        ).value = room.capacity;


        document.getElementById(
            'price'
        ).value = room.price;


        document.getElementById(
            'modalTitle'
        ).textContent = 'Edit Room';


        document.getElementById(
            'roomModal'
        ).classList.remove('hidden');


    } catch (err) {

        showAlert(
            err.message ||
            'Failed to load room details.'
        );
    }
}


async function deleteRoom(id) {

    if (
        !confirm(
            'Are you sure you want to delete this room?'
        )
    ) {
        return;
    }


    try {

        const room =
            await api.get(`/rooms/${id}`);


        const occupants =
            Number(
                room.currentOccupants || 0
            );

        const capacity =
            Number(
                room.capacity || 0
            );





        await api.delete(`/rooms/${id}`);


        showAlert(
            'Room removed successfully',
            'success'
        );


        loadRooms();


    } catch (err) {

        showAlert(
            err.message ||
            'Failed to delete room.'
        );
    }
}