document.addEventListener('DOMContentLoaded', async () => {

    const username =
        localStorage.getItem('username') || 'User';

    const role =
        localStorage.getItem('role') || '-';

    document.getElementById(
        'userDisplayName'
    ).textContent = username;

    document.getElementById(
        'userRoleBadge'
    ).textContent = role;


    if (role === 'ADMIN') {

        await loadAdminDashboard();

    } else if (role === 'STUDENT') {

        await loadStudentDashboard();

    }

});


async function loadAdminDashboard() {

    try {

        const d =
            await api.get('/dashboard/admin');

        document.getElementById(
            'statStudents'
        ).textContent = d.totalStudents ?? 0;

        document.getElementById(
            'statRooms'
        ).textContent = d.totalRooms ?? 0;

        document.getElementById(
            'statOccupiedRooms'
        ).textContent = d.occupiedRooms ?? 0;

        document.getElementById(
            'statAvailableRooms'
        ).textContent = d.availableRooms ?? 0;

        document.getElementById(
            'statPendingPayments'
        ).textContent = d.pendingPayments ?? 0;

        document.getElementById(
            'statPendingComplaints'
        ).textContent = d.pendingComplaints ?? 0;

    } catch (e) {

        showAlert(
            e.message ||
            'Unable to load dashboard.'
        );

    }

}


async function loadStudentDashboard() {

    const stats =
        document.getElementById('adminStats');

    const roomCard =
        document.getElementById('studentRoomCard');


    // Students should not see admin statistics.
    if (stats) {
        stats.classList.add('hidden');
    }


    try {

        const student =
            await api.get('/students/my');


        roomCard.classList.remove('hidden');


        if (!student.roomNumber) {

            document.getElementById(
                'myRoomNumber'
            ).textContent = 'Not Assigned';

            document.getElementById(
                'myRoomType'
            ).textContent = '-';

            document.getElementById(
                'myRoomCapacity'
            ).textContent = '-';

            document.getElementById(
                'myRoomOccupants'
            ).textContent = '-';

            return;
        }


        const rooms =
            await api.get('/rooms');


        const room =
            rooms.find(
                r => r.roomNumber === student.roomNumber
            );


        document.getElementById(
            'myRoomNumber'
        ).textContent =
            student.roomNumber;


        if (room) {

            document.getElementById(
                'myRoomType'
            ).textContent =
                room.roomType || '-';

            document.getElementById(
                'myRoomCapacity'
            ).textContent =
                room.capacity ?? '-';

            document.getElementById(
                'myRoomOccupants'
            ).textContent =
                room.currentOccupants ?? '-';

        } else {

            document.getElementById(
                'myRoomType'
            ).textContent = '-';

            document.getElementById(
                'myRoomCapacity'
            ).textContent = '-';

            document.getElementById(
                'myRoomOccupants'
            ).textContent = '-';

        }

    } catch (e) {

        showAlert(
            e.message ||
            'Unable to load room information.'
        );

    }

}