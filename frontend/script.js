document.addEventListener('DOMContentLoaded', function () {
    // Handle modals
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const closeButtons = document.querySelectorAll('.close');

    // Open login modal
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });

    // Open signup modal
    signupBtn.addEventListener('click', () => {
        signupModal.style.display = 'block';
    });

    // Close modals when 'x' clicked
    closeButtons.forEach(close => {
        close.addEventListener('click', () => {
            closeModals();
        });
    });

    function closeModals() {
        loginModal.style.display = 'none';
        signupModal.style.display = 'none';
    }

    // Handle Login
    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const userId = document.getElementById('loginUserId').value;
        const password = document.getElementById('loginPassword').value;

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userId, password })
        }).then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                if (data.role === 'admin') {
                    window.location.href = 'admin.html';
                } else if (data.role === 'vendor') {
                    window.location.href = 'vendor.html';
                } else {
                    window.location.href = 'user.html';
                }
            }
        }).catch(error => alert('Error: ' + error.message));
    });

    // Handle Sign Up
    document.getElementById('signupForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('signupName').value;
        const role = document.getElementById('signupRole').value;
        const password = document.getElementById('signupPassword').value;

        fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, role, password })
        }).then(response => response.json())
        .then(data => {
            if (data.userId) {
                document.getElementById('generatedUserId').innerText = `Your User ID is: ${data.userId}`;
                setTimeout(() => {
                    closeModals();
                }, 5000);
            }
        }).catch(error => alert('Error: ' + error.message));
    });
});