// js/main.js

const API_BASE_URL = "http://localhost:8080/api";

// --- 1. KHỞI TẠO DỮ LIỆU MẪU (MOCK DATA) ---
let students = [];
let totalStudents = 0;
let subjects = [
    {code: "IT101", name: "Nhập môn Lập trình", credits: 3},
    {code: "IT202", name: "Cấu trúc dữ liệu và giải thuật", credits: 4},
    {code: "MA101", name: "Toán Cao cấp A1", credits: 3},
];

let teachers = [
    {id: "GV001", name: "TS. Nguyễn Thị Hồng", dept: "CNTT", title: "Giảng viên chính", email: "hong.nt@edu.vn"},
    {id: "GV002", name: "ThS. Trần Văn Hùng", dept: "Kinh Tế", title: "Giảng viên", email: "hung.tv@edu.vn"},
];

let classes = [
    {
        id: "MT01",
        subjectCode: "MA101",
        teacherId: "GV001",
        name: "Toán A1 - Ca 1",
        schedule: "T2 (1-3), T4 (4-6)",
        maxStudents: 50
    },
    {
        id: "LPT02",
        subjectCode: "IT101",
        teacherId: "GV002",
        name: "Lập trình C - Lớp 2",
        schedule: "T3 (7-9), T6 (1-3)",
        maxStudents: 45
    },
];

let enrollments = [
    {studentId: "B19DCCN001", classId: "MT01", scores: {cc: 8, gk: 7.5, ck: 8.5}},
    {studentId: "B19DCCN002", classId: "MT01", scores: {cc: 9, gk: 8, ck: 9}},
    {studentId: "B19DCCN003", classId: "MT01", scores: {cc: 7, gk: 6, ck: 7}},
];

let studentModalInstance;
let subjectModalInstance;
let teacherModalInstance;
let classDetailModalInstance;

let editingIndex = -1; // Cho SV
let editingSubjectIndex = -1; // Cho Môn học
let editingTeacherIndex = -1; // Cho Giảng viên
let currentPage = 0;
let pageSize = 10;
let totalPages = 0;
let searchQuery = "";


// ============================================================
// 2. KHỞI TẠO ỨNG DỤNG & CÀI ĐẶT BAN ĐẦU
// ============================================================

function initApp() {
    if (!localStorage.getItem('jwt')) {
        window.location.href = 'login';
    }

    const studentModalElement = document.getElementById('studentModal');
    if (studentModalElement) studentModalInstance = new bootstrap.Modal(studentModalElement);
    const subjectModalElement = document.getElementById('subjectModal');
    if (subjectModalElement) subjectModalInstance = new bootstrap.Modal(subjectModalElement);
    const instructorModalElement = document.getElementById('instructorModal');
    if (instructorModalElement) instructorModalInstance = new bootstrap.Modal(instructorModalElement);
    const classDetailModalElement = document.getElementById('classDetailModal');
    if (classDetailModalElement) classDetailModalInstance = new bootstrap.Modal(classDetailModalElement);
    document.getElementById('dashboard-screen').classList.remove('d-none');

    switchView('view-dashboard');
    renderTable();
    updateStats();

}

document.addEventListener("DOMContentLoaded", initApp);


function logout() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        document.getElementById('dashboard-screen').classList.add('d-none');
        localStorage.removeItem('jwt');
        window.location.href = 'login';

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
    if (target) {
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
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// ============================================================
// 4. LOGIC THỐNG KÊ (UPDATE STATS)
// ============================================================

function updateStats() {
    // Cập nhật tổng số SV trên dashboard và các view khác
    const totalStdElement = document.getElementById('totalStd');
    if (totalStdElement) {
        totalStdElement.innerText = totalStudents;
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


async function renderTable(page = 0) {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        alert("Bạn chưa đăng nhập!");
        return;
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/students`, {
            headers: {
                'Authorization': `Bearer ${jwt}`
            },
            params: {
                page: page,
                size: pageSize,
                keyword: searchQuery || null
            }
        });

        students = response.data.content;
        totalStudents = response.data.totalElements;
        totalPages = response.data.totalPages;
        currentPage = response.data.number;

        renderPagination(totalPages);


        const tbody = document.getElementById('tableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        students.forEach((s, index) => {
            let statusBadge = s.status === 'Active' ? '<span class="badge bg-success">Đang học</span>' : '<span class="badge bg-warning text-dark">Bảo lưu</span>';
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
        console.error("Lỗi khi lấy danh sách sinh viên:", error);

        if (error.response) {
            if (error.response.status === 401) {
                alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
                localStorage.removeItem('jwt');
                location.reload();
            } else {
                alert("Lỗi server: " + (error.response.data.message || "Không thể lấy dữ liệu"));
            }
        } else if (error.request) {
            alert("Không thể kết nối tới Server. Hãy chắc chắn Backend đang chạy!");
        } else {
            alert("Có lỗi xảy ra: " + error.message);
        }
    }
}

function renderPagination(totalPages, currentPage) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    // Prev
    pagination.innerHTML += `
        <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">«</a>
        </li>
    `;

    for (let i = 0; i < totalPages; i++) {
        pagination.innerHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">
                    ${i + 1}
                </a>
            </li>
        `;
    }

    // Next
    pagination.innerHTML += `
        <li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">»</a>
        </li>
    `;
}


function changePage(page) {
    if (page < 0 || (typeof totalPages !== 'undefined' && page >= totalPages)) {
        return;
    }
    const tableContainer = document.querySelector('.card');
    if (tableContainer) {
        tableContainer.scrollIntoView({behavior: 'smooth', block: 'start'});
    }

    renderTable(page);
}

function openModal() {
    if (!studentModalInstance) return;
    editingIndex = -1;
    document.getElementById('studentForm').reset();
    document.getElementById('modalTitle').innerText = "Thêm mới Sinh viên";
    document.getElementById('stdId').disabled = false;
    studentModalInstance.show();
}

function editStudent(index) {
    if (!studentModalInstance) return;

    editingIndex = index;
    const s = students[index];

    document.getElementById('modalTitle').innerText = "Cập nhật Sinh viên";
    document.getElementById('stdId').value = s.id;
    document.getElementById('stdId').disabled = true;
    document.getElementById('stdName').value = s.name;
    document.getElementById('stdClass').value = s.class;
    document.getElementById('stdFaculty').value = s.faculty;
    document.getElementById('stdEmail').value = s.email;
    document.getElementById('stdStatus').value = s.status;

    studentModalInstance.show();
}

async function saveStudent() {
    const studentCode = document.getElementById('stdId').value.trim();
    const name = document.getElementById('stdName').value.trim();
    const studentClass = document.getElementById('stdClass').value.trim();
    const faculty = document.getElementById('stdFaculty').value;
    const status = document.getElementById('stdStatus').value;
    const email = document.getElementById('stdEmail').value.trim();

    if (!studentCode || !name) {
        alert("Vui lòng nhập Mã SV và Họ tên!");
        return;
    }

    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        alert("Bạn chưa đăng nhập!");
        return;
    }

    const payload = {
        studentCode: studentCode,
        name: name,
        faculty: faculty,
        status: status,
        studentClass: studentClass,
        email: email
    };

    try {
        // CREATE
        if (editingIndex === -1) {
            await axios.post(`${API_BASE_URL}/students`, payload, {
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                }
            });
        }
        // UPDATE
        else {
            const studentId = students[editingIndex].id;
            await axios.put(`${API_BASE_URL}/students/${studentId}`, payload, {
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                }
            });
        }

        studentModalInstance.hide();
        renderTable(currentPage);

    } catch (error) {
        console.error(error);

        if (error.response) {
            alert(error.response.data.message || "Lỗi server");
        } else {
            alert("Không thể kết nối tới server");
        }
    }
}


async function deleteStudent(studentId) {
    if (!confirm("Bạn có chắc muốn xóa sinh viên này không?")) return;

    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        alert("Bạn chưa đăng nhập!");
        return;
    }

    try {
        await axios.delete(`${API_BASE_URL}/students/${studentId}`, {
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        });

        renderTable(currentPage);

    } catch (error) {
        console.error(error);

        if (error.response) {
            alert(error.response.data.message || "Không thể xóa sinh viên");
        } else {
            alert("Không thể kết nối tới server");
        }
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


    if (!code || !name || credits < 1) {
        alert("Vui lòng nhập Mã Môn, Tên Môn và Số tín chỉ hợp lệ.");
        return;
    }
    const newSubject = {code, name, credits};

    if (editingSubjectIndex === -1) {
        if (subjects.some(s => s.code === code)) {
            alert("Mã môn học này đã tồn tại!");
            return;
        }
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

    if (!insId || !insName || !insDept || !insTitle || !insEmail) {
        alert("Vui lòng nhập đầy đủ thông tin giảng viên.");
        return;
    }
    const newInstructor = {id: insId, name: insName, dept: insDept, title: insTitle, email: insEmail};

    if (editingInstructorIndex === -1) {
        if (teachers.some(i => i.id === insId)) {
            alert("Mã giảng viên này đã tồn tại!");
            return;
        }
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
    classDetailModalInstance.show();
}

function closeModal() {
    if (studentModalInstance) studentModalInstance.hide();
}

function changePageSize() {
    const select = document.getElementById('pageSizeSelect');
    pageSize = parseInt(select.value, 10);

    currentPage = 0;
    renderTable(currentPage);
}

function searchStudents() {
    const input = document.getElementById('searchInput');
    searchQuery = input.value.trim();

    currentPage = 0;
    renderTable(currentPage);
}
