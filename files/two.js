// Load rooms and student info when page loads
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadStudentInfo();
    loadtwoSeaterRooms();
});
// Check if user is logged in
function checkAuthentication() {
    const studentName = localStorage.getItem('studentName');
    const studentReg = localStorage.getItem('regno');
    
    if (!studentName || !studentReg) {
        alert('❌ Please login first');
        window.location.href = 'main.html';
        return;
    }
}
// Load student info from localStorage
function loadStudentInfo() {
    const studentName = localStorage.getItem('studentName');
    const studentReg = localStorage.getItem('regno');
    
    if (studentName) {
        document.getElementById('studentName').textContent = studentName;
    }
    
    if (studentReg) {
        document.getElementById('studentReg').textContent = studentReg;
    } else {
        // If reg number not stored, you might want to get it from somewhere else
        document.getElementById('studentReg').textContent = 'Registration Number';
    }
}

// Load 2-seater rooms from MongoDB
async function loadtwoSeaterRooms() {
    try {
        const response = await fetch('http://localhost:3000/two_seater_rooms');
        const rooms = await response.json();
        
        displayRooms(rooms);
    } catch (error) {
        console.error('Error loading rooms:', error);
        document.getElementById('roomsGrid').innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center">
                    Failed to load rooms. Please try again.
                </div>
            </div>
        `;
    }
}

// Display rooms in grid format
function displayRooms(rooms) {
    const roomsGrid = document.getElementById('roomsGrid');
    
    if (rooms.length === 0) {
        roomsGrid.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info text-center">
                    No 2-seater rooms available.
                </div>
            </div>
        `;
        return;
    }
    
    roomsGrid.innerHTML = rooms.map(room => {
        const availableSlots = countAvailableSlots(room);
        const isFull = availableSlots === 0;
        
        return `
        <div class="col-md-6 col-lg-3">
            <div class="room-card ${isFull ? 'full-room' : ''}" onclick="viewRoomDetails(${room.roomnum})">
                <div class="room-header">
                    <div class="room-number">Room ${room.roomnum}</div>
                    <div class="room-status">
                        ${availableSlots}/2 slots available
                        ${isFull ? ' - FULL' : ''}
                    </div>
                </div>
                <div class="student-slots">
                    ${createSlotHTML(room, 'st1')}
                    ${createSlotHTML(room, 'st2')}
                </div>
            </div>
        </div>
        `;
    }).join('');
}
// Count available slots in a room
function countAvailableSlots(room) {
    let available = 0;
    if (room.st1 === null) available++;
    if (room.st2 === null) available++;
    return available;
}

// Create HTML for each student slot
function createSlotHTML(room, slotName) {
    const isAvailable = room[slotName] === null;
    const slotNumber = slotName.replace('st', '');
    
    return `
        <div class="slot ${isAvailable ? 'slot-available' : 'slot-occupied'}">
            <div class="slot-label">Slot ${slotNumber}</div>
            <div class="slot-icon">${isAvailable ? '✅' : '❌'}</div>
            <div class="slot-status">${isAvailable ? 'Free' : 'Taken'}</div>
        </div>
    `;
}

// Function to view room details
function viewRoomDetails(roomNumber) {
    window.location.href = `room_details_two.html?room=${roomNumber}`;
}

// Go back to home page
function goBack() {
    window.location.href = 'home.html';
}