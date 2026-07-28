const STUDENT_API_URL = "http://localhost:8080/api/students";
const ROOM_API_URL = "http://localhost:8080/api/rooms";

let allStudents = [];
let allRooms = [];

document.addEventListener("DOMContentLoaded", async () => {
    await fetchStudents();
    await fetchRooms();
});

/* ===================================================
   0. USER FEEDBACK NOTIFICATIONS (TOAST SYSTEM)
=================================================== */
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Tab Switcher
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
}

/* ===================================================
   1. STUDENT MANAGEMENT LOGIC & VALIDATIONS
=================================================== */
async function fetchStudents() {
    try {
        const response = await fetch(STUDENT_API_URL);
        if (!response.ok) throw new Error("Failed");
        allStudents = await response.json();
        renderStudentTable(allStudents);
    } catch (error) {
        showToast("Error connecting to Students API", "error");
    }
}

function renderStudentTable(students) {
    const tableBody = document.getElementById("studentTableBody");
    if (!tableBody) return;
    tableBody.innerHTML = "";
    if (students.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No students found</td></tr>`;
        return;
    }
    students.forEach(s => {
        tableBody.innerHTML += `
            <tr>
                <td>${s.id}</td>
                <td><strong>${s.name}</strong></td>
                <td>${s.roomNumber}</td>
                <td>${s.mobileNo}</td>
                <td>${s.course}</td>
                <td><span style="color: ${s.paymentStatus === 'Paid' ? 'green' : 'red'}; font-weight: bold;">${s.paymentStatus}</span></td>
                <td>
                    <button class="edit-btn" onclick="editStudent(${s.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteStudent(${s.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}

// Client-Side Validation for Student Data
function validateStudentInput(student) {
    if (!student.name || student.name.length < 3) {
        showToast("Full Name must be at least 3 characters long!", "error");
        return false;
    }

    const mobilePattern = /^[6-9]\d{9}$/;
    if (!mobilePattern.test(student.mobileNo)) {
        showToast("Please enter a valid 10-digit mobile number starting with 6-9!", "error");
        return false;
    }

    if (!student.roomNumber) {
        showToast("Please select an available room!", "error");
        return false;
    }

    if (!student.course) {
        showToast("Course field cannot be empty!", "error");
        return false;
    }

    return true;
}

document.getElementById("studentForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const id = document.getElementById("studentId").value;
    const mobileNo = document.getElementById("mobileNo").value.trim();
    const name = document.getElementById("name").value.trim();
    const course = document.getElementById("course").value.trim();
    const address = document.getElementById("address").value.trim();
    const newRoomNo = document.getElementById("roomNumberSelect").value;
    const paymentStatus = document.getElementById("paymentStatus").value;

    const studentData = { name, roomNumber: newRoomNo, mobileNo, course, address, paymentStatus };

    // ⚡ Client-Side Validation Trigger
    if (!validateStudentInput(studentData)) return;

    const isUpdate = Boolean(id);
    const url = isUpdate ? `${STUDENT_API_URL}/${id}` : STUDENT_API_URL;
    const method = isUpdate ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(studentData)
        });

        if (res.ok) {
            const savedStudent = await res.json().catch(() => studentData);

            if (!isUpdate) {
                allStudents.push(savedStudent.id ? savedStudent : { ...studentData, id: Date.now() });
            } else {
                const index = allStudents.findIndex(s => String(s.id) === String(id));
                if (index !== -1) allStudents[index] = { ...studentData, id: parseInt(id) };
            }

            renderStudentTable(allStudents);
            syncRoomOccupancyFromStudents();

            showToast(`Student ${isUpdate ? 'Updated' : 'Added'} Successfully!`, "success");
            resetStudentForm();
        } else {
            const errText = await res.text();
            showToast(errText || `Failed to ${isUpdate ? 'update' : 'add'} student`, "error");
        }
    } catch (err) {
        showToast("Server Connection Error", "error");
    }
});

function editStudent(id) {
    const s = allStudents.find(item => item.id == id);
    if (!s) return;

    document.getElementById("studentId").value = s.id;
    document.getElementById("name").value = s.name || "";
    document.getElementById("mobileNo").value = s.mobileNo || "";
    document.getElementById("course").value = s.course || "";
    document.getElementById("address").value = s.address || "";
    document.getElementById("paymentStatus").value = s.paymentStatus || "Pending";

    populateRoomDropdown(s.roomNumber);

    document.getElementById("studentFormTitle").innerText = "Edit Student Details";
    document.getElementById("studentSubmitBtn").innerText = "Update Student";
    document.getElementById("studentCancelBtn").style.display = "inline-block";
}

async function deleteStudent(id) {
    if (!confirm("Delete student record?")) return;
    try {
        const res = await fetch(`${STUDENT_API_URL}/${id}`, { method: "DELETE" });
        if (res.ok) {
            showToast("Student deleted successfully!", "success");
            await fetchStudents();
        } else {
            showToast("Failed to delete student", "error");
        }
    } catch (err) {
        showToast("Delete request failed", "error");
    }
}

function resetStudentForm() {
    document.getElementById("studentForm").reset();
    document.getElementById("studentId").value = "";
    document.getElementById("studentFormTitle").innerText = "Add New Student";
    document.getElementById("studentSubmitBtn").innerText = "Add Student";
    document.getElementById("studentCancelBtn").style.display = "none";
    populateRoomDropdown();
}

function filterStudents() {
    const q = document.getElementById("searchInput").value.toLowerCase();
    const filtered = allStudents.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.roomNumber.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q) ||
        s.mobileNo.includes(q)
    );
    renderStudentTable(filtered);
}

function updateDashboardCards() {
    // Total Students
    const studentCountElem = document.getElementById("totalStudentsCount");
    if (studentCountElem) studentCountElem.innerText = allStudents ? allStudents.length : 0;

    // Pending Payments Count
    const pendingCount = allStudents ? allStudents.filter(s => s.paymentStatus === 'Pending').length : 0;
    const pendingElem = document.getElementById("pendingPaymentsCount");
    if (pendingElem) pendingElem.innerText = pendingCount;

    // Total Rooms & Beds Left
    const totalRoomsElem = document.getElementById("totalRoomsCount");
    const availableBedsElem = document.getElementById("availableBedsCount");

    if (totalRoomsElem && availableBedsElem) {
        if (allRooms && allRooms.length > 0) {
            totalRoomsElem.firstChild.textContent = allRooms.length + " ";
            const totalCapacity = allRooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
            const totalOccupants = allRooms.reduce((sum, r) => sum + (r.currentOccupants || 0), 0);
            const bedsLeft = Math.max(0, totalCapacity - totalOccupants);
            availableBedsElem.innerText = bedsLeft;
        } else {
            totalRoomsElem.firstChild.textContent = "0 ";
            availableBedsElem.innerText = "0";
        }
    }
}
/* ===================================================
   2. ROOM MANAGEMENT LOGIC & VALIDATIONS
=================================================== */
async function fetchRooms() {
    try {
        const response = await fetch(ROOM_API_URL);
        if (!response.ok) throw new Error("Failed");
        allRooms = await response.json();

        renderRoomTable(allRooms);
        syncRoomOccupancyFromStudents();
    } catch (error) {
        showToast("Error connecting to Rooms API", "error");
    }
}

function renderRoomTable(rooms) {
    const tableBody = document.getElementById("roomTableBody");
    if (!tableBody) return;
    tableBody.innerHTML = "";
    if (rooms.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No rooms found</td></tr>`;
        return;
    }
    rooms.forEach(r => {
        const isFull = r.currentOccupants >= r.capacity;
        tableBody.innerHTML += `
            <tr>
                <td>${r.id}</td>
                <td><strong>${r.roomNumber}</strong></td>
                <td>${r.roomType}</td>
                <td>${r.capacity}</td>
                <td>
                    ${r.currentOccupants} / ${r.capacity}
                    <span style="color: ${isFull ? 'red' : 'green'}; font-weight: bold; margin-left: 5px;">
                        (${isFull ? 'Full' : 'Available'})
                    </span>
                </td>
                <td>₹${r.price}</td>
                <td>
                    <button class="edit-btn" onclick="editRoom(${r.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteRoom(${r.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}

// Client-Side Validation for Room Data
function validateRoomInput(room) {
    if (!room.roomNumber) {
        showToast("Room Number is required!", "error");
        return false;
    }
    if (isNaN(room.capacity) || room.capacity <= 0) {
        showToast("Capacity must be greater than 0!", "error");
        return false;
    }
    if (isNaN(room.price) || room.price <= 0) {
        showToast("Monthly Rent must be greater than 0!", "error");
        return false;
    }
    return true;
}

document.getElementById("roomForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const id = document.getElementById("roomId").value;
    let existingOccupant = 0;

    if (id) {
        const existingRoom = allRooms.find(r => r.id == id);
        if (existingRoom) existingOccupant = existingRoom.currentOccupants;
    }

    const roomData = {
        roomNumber: document.getElementById("rRoomNumber").value.trim(),
        roomType: document.getElementById("rRoomType").value,
        capacity: parseInt(document.getElementById("rCapacity").value),
        currentOccupants: existingOccupant,
        price: parseFloat(document.getElementById("rPrice").value)
    };

    // ⚡ Client-Side Validation Trigger
    if (!validateRoomInput(roomData)) return;

    const isUpdate = Boolean(id);
    const url = isUpdate ? `${ROOM_API_URL}/${id}` : ROOM_API_URL;
    const method = isUpdate ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(roomData)
        });
        if (res.ok) {
            showToast(`Room ${isUpdate ? 'Updated' : 'Added'} Successfully!`, "success");
            resetRoomForm();
            await fetchRooms();
        } else {
            const errText = await res.text();
            showToast(errText || `Failed to ${isUpdate ? 'update' : 'add'} room`, "error");
        }
    } catch (err) {
        showToast("Server Connection Error", "error");
    }
});

function editRoom(id) {
    const r = allRooms.find(item => item.id == id);
    if (!r) return;
    document.getElementById("roomId").value = r.id;
    document.getElementById("rRoomNumber").value = r.roomNumber;
    document.getElementById("rRoomType").value = r.roomType;
    document.getElementById("rCapacity").value = r.capacity;
    document.getElementById("rPrice").value = r.price;

    document.getElementById("roomFormTitle").innerText = "Edit Room";
    document.getElementById("roomSubmitBtn").innerText = "Update Room";
    document.getElementById("roomCancelBtn").style.display = "inline-block";
}

async function deleteRoom(id) {
    if (!confirm("Delete room record?")) return;
    try {
        const res = await fetch(`${ROOM_API_URL}/${id}`, { method: "DELETE" });
        if (res.ok) {
            showToast("Room deleted successfully!", "success");
            fetchRooms();
        } else {
            showToast("Failed to delete room", "error");
        }
    } catch (err) { showToast("Delete request failed", "error"); }
}

function resetRoomForm() {
    document.getElementById("roomForm").reset();
    document.getElementById("roomId").value = "";
    document.getElementById("roomFormTitle").innerText = "Add New Room";
    document.getElementById("roomSubmitBtn").innerText = "Add Room";
    document.getElementById("roomCancelBtn").style.display = "none";
}

function populateRoomDropdown(selectedRoomNumber = "") {
    const roomSelect = document.getElementById("roomNumberSelect");
    if (!roomSelect) return;

    roomSelect.innerHTML = `<option value="" disabled selected>Select Available Room *</option>`;

    const availableRooms = allRooms.filter(r =>
        (r.capacity - r.currentOccupants > 0) || String(r.roomNumber) === String(selectedRoomNumber)
    );

    if (availableRooms.length === 0) {
        roomSelect.innerHTML += `<option value="" disabled>No Rooms Available!</option>`;
        return;
    }

    availableRooms.forEach(r => {
        const isSelected = String(r.roomNumber) === String(selectedRoomNumber);
        const bedsLeft = r.capacity - r.currentOccupants;

        roomSelect.innerHTML += `
            <option value="${r.roomNumber}" ${isSelected ? "selected" : ""}>
                Room ${r.roomNumber} (${r.roomType}) - ${bedsLeft <= 0 ? "Current Assigned Room" : bedsLeft + " Beds Left"}
            </option>
        `;
    });
}

function syncRoomOccupancyFromStudents() {
    if (!allRooms.length) return;

    allRooms.forEach(room => {
        const count = allStudents.filter(s => String(s.roomNumber) === String(room.roomNumber)).length;
        room.currentOccupants = count;
    });

    renderRoomTable(allRooms);
    populateRoomDropdown();
    updateDashboardCards();
}