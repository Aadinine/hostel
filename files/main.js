document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    console.log('1. Form submitted');

    const registrationNumber = document.getElementById('registrationNumber').value;
    const password = document.getElementById('password').value;

    console.log('2. Got values:', registrationNumber, password);

    try {

        
        console.log('4. Sending fetch request...');
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ registrationNumber, password }),
        });

        console.log('5. Got response, status:', response.status);
        const result = await response.json();
        console.log('6. Parsed result:', result);

        if (result.success) {
            console.log('7. Login success - redirecting');
            localStorage.setItem('studentName', result.name);
            localStorage.setItem('regno', result.regno);
            window.location.href = 'home.html';
        } else {
            console.log('7. Login failed');
            alert('❌ ' + result.message);
        }
    } catch (error) {
        console.log('8. Catch block - Error:', error.name, error.message);
        if (error.name === 'AbortError') {
            alert('❌ Request timed out. Server is not responding.');
        } else {
            alert('❌ Network error: ' + error.message);
        }
    }
    
    console.log('9. Function completed');
});