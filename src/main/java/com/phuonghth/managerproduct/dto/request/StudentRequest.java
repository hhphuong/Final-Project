package com.phuonghth.managerproduct.dto.request;

public class StudentRequest {
    private String studentCode;
    private String name;
    private String email;
    private String studentClass;
    private String faculty;
    private String status;

    public String getStudentCode() { return studentCode; }
    public void setStudentCode(String studentCode) { this.studentCode = studentCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStudentClass() { return studentClass; }
    public void setStudentClass(String studentClass) { this.studentClass = studentClass; }

    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
