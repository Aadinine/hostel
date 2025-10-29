// home.js - COMPLETE VERSION
document.addEventListener('DOMContentLoaded', function() {
    // Get student name from localStorage
    const studentName = localStorage.getItem('studentName');
    const regno = localStorage.getItem('regno');

    if (studentName && regno) {
        document.getElementById('welcomeMessage').innerHTML = 
            `Welcome, ${studentName}<br><small>${regno}</small>`;
    } else {
        // If no student name in storage, redirect to login
        alert('❌ Please login first');
        window.location.href = 'main.html';
        return;
    }

    // Check current booking
    checkCurrentBooking();
});

// Room selection function
function selectRoomType(roomType) {
    if (roomType === 4) {
        window.location.href = 'four.html';
    } else if (roomType === 3) {
        window.location.href = 'three.html';
    } else if (roomType === 2){
        window.location.href = 'two.html';
    } else if (roomType === 1){
        window.location.href = 'one.html';
    }
}

// Check and display current booking
async function checkCurrentBooking() {
    const studentReg = localStorage.getItem('regno');
    const leaveRoomBtn = document.getElementById('leaveRoomBtn');
    
    console.log('Checking booking for:', studentReg);
    
    if (!studentReg) return;
    
    try {
        // FIXED URL: Added the missing ?
        const response = await fetch(`http://localhost:3000/check_booking?regno=${studentReg}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        console.log('API Response:', result);
        
        if (result.hasBooking) {
            console.log('Booking found, showing button');
            // Show leave room button
            leaveRoomBtn.style.display = 'block';
        } else {
            console.log('No booking found, hiding button');
            // Hide leave room button if no booking
            leaveRoomBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking booking:', error);
        leaveRoomBtn.style.display = 'none';
    }
}

// Leave room function
async function leaveRoom() {
    const studentName = localStorage.getItem('studentName');
    const studentReg = localStorage.getItem('regno');
    
    if (!studentReg) {
        alert('❌ Please login first');
        return;
    }
    
    if (!confirm('Are you sure you want to leave your room? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/leave_room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                regno: studentReg,
                name: studentName
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Successfully left the room!');
            // Hide leave room button and refresh page
            document.getElementById('leaveRoomBtn').style.display = 'none';
            location.reload(); // Refresh to update UI
        } else {
            alert('❌ ' + result.message);
        }
    } catch (error) {
        console.error('Error leaving room:', error);
        alert('❌ Error leaving room. Please try again.');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('studentName');
    localStorage.removeItem('regno');
    window.location.href = 'main.html';
}