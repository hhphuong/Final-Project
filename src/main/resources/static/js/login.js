const API_BASE_URL = "http://localhost:8080/api";

function initApp() {
    if (localStorage.getItem('jwt')) {
        window.location.href = '/';
    }
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginData = {
        email: username,
        password: password
    };

    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);

        const jwt = response.data.token;
        localStorage.setItem('jwt', jwt);

        window.location.href = '/';

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);

        let errorMessage = "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.";

        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        } else if (error.code === 'ERR_NETWORK') {
            errorMessage = "Lỗi kết nối. Vui lòng kiểm tra API Server (Có đang chạy không?)";
        }

        alert(errorMessage);
        document.getElementById('password').value = '';
    }
}

document.addEventListener("DOMContentLoaded", initApp);