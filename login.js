async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (data.success) {
            localStorage.setItem("userName", data.name);  // Store name in localStorage
            localStorage.setItem("profilePic", data.profilePic);
            window.location.href = "../dashboard.html"; // Redirect to dashboard
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert("Error logging in.");
    }
}




document.getElementById("forgotPassword").addEventListener("click", function() {
    let forgotPasswordModal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
    forgotPasswordModal.show();
});
function sendOTP() {
    const email = document.getElementById("resetEmail").value;
    
    fetch("http://localhost:5000/send-otp", { // Corrected API URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    })
    .then(response => {
        if (!response.ok) {
            console.log(response);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert("OTP sent to your email");
            let otpModal = new bootstrap.Modal(document.getElementById('otpModal'));
            otpModal.show();
        } else {
            alert("Error sending OTP");
        }
    })
    .catch(error => console.error("Error:", error));
}

function verifyOTP() {
    const email = document.getElementById("resetEmail").value;
    const otp = document.getElementById("otp").value;

    fetch("http://localhost:5000/verify-otp", { // Corrected API URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert("OTP Verified! Logging in...");
            localStorage.setItem("user", JSON.stringify({ email: data.email, profilePic: data.profilePic }));
            window.location.href = "/dashboard.html"; 
        } else {
            alert("Invalid OTP, try again!");
        }
    })
    .catch(error => console.error("Error:", error));
}
