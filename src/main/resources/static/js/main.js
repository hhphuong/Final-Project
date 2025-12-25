// js/main.js

const API_BASE_URL = "http://localhost:8080/api";

// --- 1. KHỞI TẠO DỮ LIỆU MẪU (MOCK DATA) ---
let students = [
    // { id: "B19DCCN001", name: "Nguyễn Văn An", class: "D19CQCN01", faculty: "CNTT", email: "an.nguyen@edu.vn", status: "Active" },
    // { id: "B19DCCN002", name: "Trần Thị Bích", class: "D19CQKT02", faculty: "KT", email: "bich.tran@edu.vn", status: "Active" },
    // { id: "B19DCCN003", name: "Lê Hoàng Nam", class: "D19CQCN01", faculty: "CNTT", email: "nam.le@edu.vn", status: "Reserved" },
];

let subjects = [
    { code: "IT101", name: "Nhập môn Lập trình", credits: 3 },
    { code: "IT202", name: "Cấu trúc dữ liệu và giải thuật", credits: 4 },
    { code: "MA101", name: "Toán Cao cấp A1", credits: 3 },
];

let teachers = [
    { id: "GV001", name: "TS. Nguyễn Thị Hồng", dept: "CNTT", title: "Giảng viên chính", email: "hong.nt@edu.vn" },
    { id: "GV002", name: "ThS. Trần Văn Hùng", dept: "Kinh Tế", title: "Giảng viên", email: "hung.tv@edu.vn" },
];

let classes = [
    { id: "MT01", subjectCode: "MA101", teacherId: "GV001", name: "Toán A1 - Ca 1", schedule: "T2 (1-3), T4 (4-6)", maxStudents: 50 },
    { id: "LPT02", subjectCode: "IT101", teacherId: "GV002", name: "Lập trình C - Lớp 2", schedule: "T3 (7-9), T6 (1-3)", maxStudents: 45 },
];

let enrollments = [
    { studentId: "B19DCCN001", classId: "MT01", scores: { cc: 8, gk: 7.5, ck: 8.5 } },
    { studentId: "B19DCCN002", classId: "MT01", scores: { cc: 9, gk: 8, ck: 9 } },
    { studentId: "B19DCCN003", classId: "MT01", scores: { cc: 7, gk: 6, ck: 7 } },
];

let studentModalInstance;
let subjectModalInstance;
let teacherModalInstance;
let classDetailModalInstance;

let editingIndex = -1; // Cho SV
let editingSubjectIndex = -1; // Cho Môn học
let editingTeacherIndex = -1; // Cho Giảng viên


// ============================================================
// 2. KHỞI TẠO ỨNG DỤNG & CÀI ĐẶT BAN ĐẦU
// ============================================================

function initApp() {
    // A. Khởi tạo Modal Bootstrap instances (RẤT QUAN TRỌNG)
    const studentModalElement = document.getElementById('studentModal');
    if (studentModalElement) studentModalInstance = new bootstrap.Modal(studentModalElement);
    const subjectModalElement = document.getElementById('subjectModal');
    if (subjectModalElement) subjectModalInstance = new bootstrap.Modal(subjectModalElement);
    const instructorModalElement = document.getElementById('instructorModal');
    if (instructorModalElement) instructorModalInstance = new bootstrap.Modal(instructorModalElement);
    const classDetailModalElement = document.getElementById('classDetailModal');
    if (classDetailModalElement) classDetailModalInstance = new bootstrap.Modal(classDetailModalElement);

    // B. Gán sự kiện Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}
document.addEventListener("DOMContentLoaded", initApp);


// ============================================================
// 3. LOGIC AUTHENTICATION & SPA SWITCHING
// ============================================================

// function handleLogin(e) {
//     e.preventDefault();
//     const username = document.getElementById('username').value;
//     const password = document.getElementById('password').value;



//     if(username === 'admin' && password === '123') {
//         // Ẩn/Hiện màn hình
//         document.getElementById('login-screen').classList.add('d-none');
//         document.getElementById('login-screen').classList.remove('d-flex'); 
//         document.getElementById('dashboard-screen').classList.remove('d-none');
        
//         // Chuyển view mặc định và cập nhật số liệu
//         switchView('view-dashboard'); 
//         updateStats();
//     } else {
//         alert("Sai tài khoản! (Thử: admin / 123)");
//         document.getElementById('password').value = ''; 
//     }
// }

// js/main.js

// ... (Đảm bảo API_BASE_URL được khai báo ở đầu file hoặc import từ api.js)

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginData = {
        email: username,
        password: password
    };
    
    // Gửi yêu cầu POST đến API xác thực
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
        
        // --- XỬ LÝ KHI ĐĂNG NHẬP THÀNH CÔNG (HTTP Status 200/201) ---
        
        // Thường thì response.data sẽ chứa token hoặc thông tin người dùng
        const jwt = response.data.token;
        //Lưu jwt vào local storage 
        localStorage.setItem('jwt', jwt);
        
        // Lưu token hoặc trạng thái đăng nhập vào localStorage (Nếu cần bảo mật hơn)
        // localStorage.setItem('userToken', userData.token); 

        // Ẩn/Hiện màn hình
        document.getElementById('login-screen').classList.add('d-none');
        document.getElementById('login-screen').classList.remove('d-flex'); 
        document.getElementById('dashboard-screen').classList.remove('d-none');
        
        // Chuyển view mặc định và cập nhật số liệu
        switchView('view-dashboard'); 
        updateStats();

    } catch (error) {
        // --- XỬ LÝ KHI ĐĂNG NHẬP THẤT BẠI (Thường là HTTP Status 401/403) ---
        
        console.error("Lỗi đăng nhập:", error);
        
        let errorMessage = "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.";
        
        // Kiểm tra nếu có response từ server để lấy thông báo lỗi cụ thể
        if (error.response && error.response.data && error.response.data.message) {
             errorMessage = error.response.data.message; // Lấy thông báo lỗi từ server
        } else if (error.code === 'ERR_NETWORK') {
             errorMessage = "Lỗi kết nối. Vui lòng kiểm tra API Server (Có đang chạy không?)";
        }
        
        alert(errorMessage);
        document.getElementById('password').value = ''; 
    }
}

function logout() {
    if(confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        document.getElementById('dashboard-screen').classList.add('d-none');
        document.getElementById('login-screen').classList.remove('d-none');
        document.getElementById('login-screen').classList.add('d-flex');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }
}

function switchView(viewId) {
    // 1. Ẩn tất cả các view-section
    const views = document.querySelectorAll('.view-section');
    views.forEach(v => {
        v.classList.add('d-none');
        v.classList.remove('fade-in'); 
    });

    // 2. Hiện view được chọn
    const target = document.getElementById(viewId);
    if(target) {
        target.classList.remove('d-none');
        target.classList.add('fade-in'); 
        
        // 3. GỌI HÀM RENDER TƯƠNG ỨNG
        if (viewId === 'view-students') {
            renderTable(); 
        } else if (viewId === 'view-subjects') {
            renderSubjectTable();
        } else if (viewId === 'view-instructors') {
            renderTeacherList();
        } else if (viewId === 'view-classes') {
            renderClassList();
        } else if (viewId === 'view-dashboard') {
            updateStats();
        }
    }

    // 4. Cập nhật trạng thái Active trên Sidebar
    const links = document.querySelectorAll('.sidebar .list-group-item');
    links.forEach(l => l.classList.remove('active'));
    
    // Logic tìm ID link
    const linkId = 'link-' + viewId.split('-')[1];
    const activeLink = document.getElementById(linkId);
    if(activeLink) {
        activeLink.classList.add('active');
    }
}

// ============================================================
// 4. LOGIC THỐNG KÊ (UPDATE STATS)
// ============================================================

function updateStats() {
    // Cập nhật tổng số SV trên dashboard và các view khác
    const totalStdElement = document.getElementById('totalStd');
    if(totalStdElement) {
         totalStdElement.innerText = students.length;
    }
    
    // Cập nhật số lượng Môn học
    const totalSubjectElement = document.getElementById('totalSubjects');
    if (totalSubjectElement) {
        totalSubjectElement.innerText = subjects.length;
    }

    // Cập nhật số lượng Giảng viên
    const totalTeachersElement = document.getElementById('totalTeachers');  
    if (totalTeachersElement) {
        totalTeachersElement.innerText = teachers.length;
    }

    // Cập nhật số lượng Lớp học
    const totalClassElement = document.getElementById('totalClass');
    if (totalClassElement) {
        totalClassElement.innerText = classes.length;
    }
}


// ============================================================
// 5. CRUD SINH VIÊN (STUDENT)
// ============================================================



    async function renderTable() {
        const jwt = localStorage.getItem('jwt');
        if (!jwt) {
            alert("Bạn chưa đăng nhập!");
            // Có thể chuyển hướng về trang login nếu cần: window.location.href = 'login.html';
            return;
        }

        try {
            // 1. Gọi API lấy danh sách sinh viên
            const response = await axios.get(`${API_BASE_URL}/students`, {
                headers: {
                    'Authorization': `Bearer ${jwt}`
                }
            });

            // Giả sử API trả về cấu hình phân trang nên lấy .content
            // Nếu API trả về list trực tiếp thì dùng: students = response.data;
            students = response.data.content;

            const tbody = document.getElementById('tableBody');
            if (!tbody) return;

            // 2. Render dữ liệu ra bảng
            tbody.innerHTML = '';
            students.forEach((s, index) => {
                let statusBadge = s.status === 'Active' ? '<span class="badge bg-success">Đang học</span>' : '<span class="badge bg-warning text-dark">Bảo lưu</span>';
                // Dùng s.studentClass và s.faculty theo đúng Entity/Dto ở Backend bạn đã tạo
                let facultyName = s.faculty === 'CNTT' ? 'Công Nghệ Thông Tin' : s.faculty === 'KT' ? 'Kinh Tế' : 'Điện Tử';

                const row = `
                    <tr>
                        <td class="text-center">${index + 1}</td>
                        <td class="fw-bold text-primary">${s.studentCode || s.id}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <img src="https://ui-avatars.com/api/?name=${s.name}&background=random" class="rounded-circle me-2" width="30">
                                <span>${s.name}</span>
                            </div>
                        </td>
                        <td>${s.studentClass || s.class}</td>
                        <td>${facultyName}</td>
                        <td>${statusBadge}</td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="editStudent(${index})"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent(${s.id})"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });

            updateStats();

        } catch (error) {
            // 3. Xử lý lỗi
            console.error("Lỗi khi lấy danh sách sinh viên:", error);

            if (error.response) {
                // Server trả về lỗi (401, 403, 500...)
                if (error.response.status === 401) {
                    alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
                    localStorage.removeItem('jwt');
                    location.reload();
                } else {
                    alert("Lỗi server: " + (error.response.data.message || "Không thể lấy dữ liệu"));
                }
            } else if (error.request) {
                // Không kết nối được tới server
                alert("Không thể kết nối tới Server. Hãy chắc chắn Backend đang chạy!");
            } else {
                alert("Có lỗi xảy ra: " + error.message);
            }
        }
    }

function openModal() {
    // Logic mở Modal sinh viên
    if (!studentModalInstance) return; 
    editingIndex = -1; 
    document.getElementById('studentForm').reset();
    document.getElementById('modalTitle').innerText = "Thêm mới Sinh viên";
    document.getElementById('stdId').disabled = false; 
    studentModalInstance.show();
}

function editStudent(index) {
    // ⚠️ ĐÃ SỬA LỖI: Thêm check Modal và tối ưu logic đổ dữ liệu
    if (!studentModalInstance) return; 
    
    editingIndex = index;
    const s = students[index];

    document.getElementById('modalTitle').innerText = "Cập nhật Sinh viên";
    document.getElementById('stdId').value = s.id;
    document.getElementById('stdId').disabled = true; // KHÓA MÃ SV KHI SỬA
    document.getElementById('stdName').value = s.name;
    document.getElementById('stdClass').value = s.class;
    document.getElementById('stdFaculty').value = s.faculty;
    document.getElementById('stdEmail').value = s.email;
    document.getElementById('stdStatus').value = s.status;

    studentModalInstance.show();
}

function saveStudent() {
    // ... Logic lưu sinh viên (giữ nguyên) ...
    const id = document.getElementById('stdId').value;
    const name = document.getElementById('stdName').value;
    const lop = document.getElementById('stdClass').value;
    const fac = document.getElementById('stdFaculty').value;
    const email = document.getElementById('stdEmail').value;
    const status = document.getElementById('stdStatus').value;

    if(!id || !name) { alert("Vui lòng nhập Mã SV và Họ tên!"); return; }

    const newStd = { id, name, class: lop, faculty: fac, email, status };

    if(editingIndex === -1) {
        if(students.some(s => s.id === id)) { alert("Mã sinh viên này đã tồn tại!"); return; }
        students.push(newStd);
    } else {
        students[editingIndex] = newStd;
    }
    studentModalInstance.hide();
    renderTable();
}

function deleteStudent(index) {
    if(confirm("Bạn có chắc muốn xóa sinh viên này không?")) {
        students.splice(index, 1);
        renderTable();
    }
}


// ============================================================
// 6. CRUD MÔN HỌC (SUBJECTS)
// ============================================================

function renderSubjectTable() {
    const tbody = document.getElementById('subjectTableBody');
    const totalElement = document.getElementById('totalSubjects');
    
    if (!tbody || !totalElement) return;
    tbody.innerHTML = '';
    totalElement.innerText = `Có ${subjects.length} Môn học`;

    subjects.forEach((subject, index) => {
        const row = `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td class="fw-bold">${subject.code}</td>
                <td>${subject.name}</td>
                <td class="text-center">${subject.credits}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-success me-1" onclick="openSubjectModal(${index})">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteSubject(${index})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function openSubjectModal(index = -1) {
    // ⚠️ ĐÃ SỬA LỖI: Thêm check Modal và tối ưu logic đổ dữ liệu
    if (!subjectModalInstance) return; 

    editingSubjectIndex = index;
    const modalTitle = document.getElementById('subjectModalTitle');
    const form = document.getElementById('subjectForm');
    form.reset();
    document.getElementById('subjectCode').disabled = false;
    
    if (index === -1) {
        modalTitle.innerText = "Thêm Môn Học Mới";
    } else {
        modalTitle.innerText = "Cập nhật Môn Học";
        const subject = subjects[index];
        
        document.getElementById('subjectCode').value = subject.code;
        document.getElementById('subjectCode').disabled = true; // KHÓA MÃ MÔN KHI SỬA
        document.getElementById('subjectName').value = subject.name;
        document.getElementById('subjectCredits').value = subject.credits;
    }

    subjectModalInstance.show();
}

function saveSubject() {
    const code = document.getElementById('subjectCode').value.trim(); //01
    const name = document.getElementById('subjectName').value.trim(); // Java
    const credits = Number(document.getElementById('subjectCredits').value); //3


    if (!code || !name || credits < 1) { alert("Vui lòng nhập Mã Môn, Tên Môn và Số tín chỉ hợp lệ."); return; }
    const newSubject = { code, name, credits };
    
    if (editingSubjectIndex === -1) {
        if (subjects.some(s => s.code === code)) { alert("Mã môn học này đã tồn tại!"); return; }
        subjects.push(newSubject);
    } else {
        subjects[editingSubjectIndex] = newSubject;
    }

    subjectModalInstance.hide();
    renderSubjectTable();
}

function deleteSubject(index) {
    if (confirm(`Bạn có chắc muốn xóa môn ${subjects[index].name}?`)) {
        subjects.splice(index, 1);
        renderSubjectTable();
    }
}


// ============================================================
// 7. CRUD GIẢNG VIÊN (INSTRUCTORS) - LOGIC KHUNG
// ============================================================

function renderTeacherList() {
    const tbody = document.getElementById('teacherTableBody');
    if (!tbody) return; 

    tbody.innerHTML = '';
    teachers.forEach((ins, index) => {
        const row = `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td class="fw-bold text-info">${ins.id}</td>
                <td>${ins.name}</td>
                <td>${ins.title}</td>
                <td>${ins.dept}</td>
                <td>${ins.email}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-info me-1" onclick="openInstructorModal(${index})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteInstructor(${index})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}
function openInstructorModal(index = -1) {
    if (!instructorModalInstance) return;
    editingInstructorIndex = index;
    // Tạm thời chỉ mở modal
    instructorModalInstance.show();
}
function saveInstructor() {
    const insId = document.getElementById('insId').value.trim(); //01
    const insName = document.getElementById('insName').value.trim(); // Java
    const insDept = document.getElementById('insDept').value.trim(); //3
    const insTitle = document.getElementById('insTitle').value.trim();
    const insEmail = document.getElementById('insEmail').value.trim();

    if (!insId || !insName || !insDept || !insTitle || !insEmail) { alert("Vui lòng nhập đầy đủ thông tin giảng viên."); return; }
    const newInstructor = { id: insId, name: insName, dept: insDept, title: insTitle, email: insEmail };

    if (editingInstructorIndex === -1) {
        if (teachers.some(i => i.id === insId)) { alert("Mã giảng viên này đã tồn tại!"); return; }
        teachers.push(newInstructor);
    } else {
        teachers[editingInstructorIndex] = newInstructor;
    }

    instructorModalInstance.hide();
    renderTeacherList();
}
function deleteInstructor(index) {
    if (confirm("Xóa Giảng viên này?")) {
        teachers.splice(index, 1);
        renderTeacherList();
    }
}

// ============================================================
// 8. CRUD LỚP HỌC (CLASSES) - LOGIC KHUNG
// ============================================================

function renderClassList() {
    const tbody = document.getElementById('classListBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    classes.forEach((c, index) => {
        const studentCount = enrollments.filter(e => e.classId === c.id).length;
        const subject = subjects.find(s => s.code === c.subjectCode);
        const teacher = teachers.find(i => i.id === c.teacherId);
        
        const row = `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td class="fw-bold">${c.id}</td>
                <td>${subject ? subject.name : 'N/A'}</td>
                <td>${teacher ? teacher.name : 'N/A'}</td>
                <td>${c.schedule}</td>
                <td>${studentCount} / ${c.maxStudents}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-info text-white" onclick="showClassDetail('${c.id}')">
                        <i class="fa-solid fa-eye"></i> Chi tiết
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function showClassDetail(classId) {
    if (!classDetailModalInstance) return;
    alert(`Hiển thị chi tiết lớp học ID: ${classId}`);
    // Cần thêm logic render chi tiết lớp và điểm số tại đây
    classDetailModalInstance.show(); 
}

// Hàm đóng Modal (Dùng cho nút Đóng/Hủy trong Modal SV)
function closeModal() {
    if(studentModalInstance) studentModalInstance.hide();
}