package com.phuonghth.managerproduct.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "role")
public class RoleEntity extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
