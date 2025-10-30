// Load room details when page loads
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadStudentInfo();
    loadRoomDetails();
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
    }
}

// Load room details from URL parameters
async function loadRoomDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomNumber = urlParams.get('room');
    
    if (!roomNumber) {
        alert('No room specified');
        window.location.href = 'three.html';
        return;
    }
    
    // Set room number in header
    document.getElementById('roomNumber').textContent = `Room ${roomNumber}`;
    
    try {
        // Fetch room details from server - FIXED ROUTE NAME
        const response = await fetch(`http://localhost:3000/room_details_three?room=${roomNumber}`);
        const room = await response.json();
        
        displayStudents(room);
    } catch (error) {
        console.error('Error loading room details:', error);
        document.getElementById('studentsList').innerHTML = `
            <div class="alert alert-danger text-center">
                Failed to load room details. Please try again.
            </div>
        `;
    }
}

// Display students in the room
function displayStudents(room) {
    const studentsList = document.getElementById('studentsList');
    
    let studentsHTML = '';
    
    // Check each slot and display if student object exists
    if (room.st1 && room.st1.name) {
        studentsHTML += createStudentHTML('Student 1', room.st1);
    }
    
    if (room.st2 && room.st2.name) {
        studentsHTML += createStudentHTML('Student 2', room.st2);
    }
    
    if (room.st3 && room.st3.name) {
        studentsHTML += createStudentHTML('Student 3', room.st3);
    }

    
    // If no students in room
    if (studentsHTML === '') {
        studentsHTML = `
            <div class="empty-slot">
                <h4>No students in this room</h4>
                <p class="mb-0">All 3 slots are available</p>
            </div>
        `;
    }
    
    studentsList.innerHTML = studentsHTML;
}

// Create HTML for each student
function createStudentHTML(slot, studentData) {
    return `
        <div class="student-item">
            <div class="student-slot">${slot}</div>
            <div class="student-name">${studentData.name}</div>
            <div class="student-reg">${studentData.regno}</div>
        </div>
    `;
}

// Select room function - Books the room for current student
async function selectRoom() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomNumber = parseInt(urlParams.get('room'));
    const studentName = localStorage.getItem('studentName');
    const studentReg = localStorage.getItem('regno');

    if (!studentName || !studentReg) {
        alert('❌ Please login first');
        window.location.href = 'main.html';
        return;
    }

    try {
        // get the current room details to find available slot
        const response = await fetch(`http://localhost:3000/room_details_three?room=${roomNumber}`);
        const room = await response.json();

        // Find first available slot
        let availableSlot = null;
        if (room.st1 === null) availableSlot = 'st1';
        else if (room.st2 === null) availableSlot = 'st2';
        else if (room.st3 === null) availableSlot = 'st3';

        if (!availableSlot) {
            alert('❌ Room is full! No available slots.');
            return;
        }

        // Book the room by updating the available slot 

        const bookResponse = await fetch('http://localhost:3000/book_room_three', {  
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                roomNumber: roomNumber,
                slot: availableSlot,
                student: {
                    name: studentName,
                    regno: studentReg
                }
            })
        });

        const result = await bookResponse.json();

        if (result.success) {
            alert(`✅ Room ${roomNumber} booked successfully! Slot: ${availableSlot}`);
            // Refresh the page to show updated room details
            loadRoomDetails();
        } else {
            alert('❌ ' + result.message);
        }

    } catch (error) {
        console.error('Error booking room:', error);
        alert('❌ Error booking room. Please try again.');
    }
}

// Go back to home page
function goHome() {
    window.location.href = 'home.html';
}