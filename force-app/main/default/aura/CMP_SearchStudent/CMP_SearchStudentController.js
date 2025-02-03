({
    doInit : function(component, event, helper) {
        helper.loadClassOptions(component);
        helper.search(component);
    },
    
    handleSearch : function(component, event, helper) {
        component.set("v.pageNumber", 1);
        helper.search(component);
    },
    
    handleClear : function(component, event, helper) {
        // Reset all search fields
        component.set("v.studentCode", "");
        component.set("v.searchName", "");
        component.set("v.classCode", "");
        component.set("v.gender", "");
        component.set("v.birthDate", null);
        
        // Reset pagination
        component.set("v.pageNumber", 1);
        
        // Perform search with cleared filters
        helper.search(component);
    },
    
    handleCreate : function(component, event, helper) {
        component.set("v.showCreateModal", true);
    },
    
    openDetailModal: function(component, event, helper) {
        try {
            var studentId = event.getSource().get("v.value");
            console.log('Opening detail modal for student ID:', studentId);
            
            if (!studentId) {
                console.error('No student ID found');
                return;
            }
            
            var action = component.get("c.getStudent");
            action.setParams({ recordId: studentId });
            
            action.setCallback(this, function(response) {
                var state = response.getState();
                console.log('Response state:', state);
                
                if (state === "SUCCESS") {
                    var student = response.getReturnValue();
                    if (student) {
                        console.log('Student found:', student);
                        component.set("v.selectedStudent", student);
                        component.set("v.showViewModal", true);
                    } else {
                        helper.showToast('Error', '学生データが見つかりません。', 'error');
                    }
                } else {
                    console.error('Error:', response.getError());
                    helper.showToast('Error', '学生データの取得に失敗しました。', 'error');
                }
            });
            
            $A.enqueueAction(action);
        } catch (error) {
            console.error('Error in openDetailModal:', error);
            helper.showToast('Error', '予期せぬエラーが発生しました。', 'error');
        }
    },
    
    handleEdit : function(component, event, helper) {
        var studentId = event.getSource().get("v.value");
        console.log('Edit Student ID:', studentId);
        
        var action = component.get("c.getStudent");
        action.setParams({
            recordId: studentId
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var student = response.getReturnValue();
                console.log('Retrieved Student for Edit:', student);
                if (student) {
                    component.set("v.selectedStudent", student);
                    component.set("v.showEditModal", true);
                }
            } else {
                console.error('Error:', response.getError());
                helper.showToast('Error', 'Failed to retrieve student details', 'error');
            }
        });
        
        $A.enqueueAction(action);
    },
    
    handleDelete : function(component, event, helper) {
        var studentId = event.getSource().get("v.value");
        component.set("v.deleteId", studentId);
        component.set("v.showDeleteModal", true);
    },
    
    handleBulkDelete : function(component, event, helper) {
        var selectedIds = component.get("v.selectedIds");
        if (selectedIds && selectedIds.length > 0) {
            component.set("v.showDeleteModal", true);
        } else {
            helper.showToast('Warning', '削除する学生を選択してください。', 'warning');
        }
    },
    
    confirmDelete : function(component, event, helper) {
        var deleteId = component.get("v.deleteId");
        var selectedIds = component.get("v.selectedIds");
        
        if (deleteId) {
            // Xóa đơn
            helper.deleteStudent(component, deleteId);
        } else if (selectedIds && selectedIds.length > 0) {
            // Xóa hàng loạt
            helper.deleteStudents(component, selectedIds);
        }
        
        component.set("v.showDeleteModal", false);
        component.set("v.deleteId", null);
    },
    
    closeDeleteModal : function(component, event, helper) {
        component.set("v.showDeleteModal", false);
        component.set("v.deleteId", null);
    },
    
    handleSelectAll : function(component, event, helper) {
        var selectAll = component.get("v.selectedAll");
        var students = component.get("v.students");
        var selectedIds = component.get("v.selectedIds");
        
        students.forEach(function(student) {
            student.selected = selectAll;
            var index = selectedIds.indexOf(student.Id);
            if (selectAll && index === -1) {
                selectedIds.push(student.Id);
            } else if (!selectAll && index > -1) {
                selectedIds.splice(index, 1);
            }
        });
        
        component.set("v.students", students);
        component.set("v.selectedIds", selectedIds);
    },
    
    handleCheckboxChange : function(component, event, helper) {
        var selectedId = event.getSource().get("v.value");
        var students = component.get("v.students");
        var selectedIds = component.get("v.selectedIds");
        var isSelected = event.getSource().get("v.checked");
        
        // Update selectedIds array
        var index = selectedIds.indexOf(selectedId);
        if (isSelected && index === -1) {
            selectedIds.push(selectedId);
        } else if (!isSelected && index > -1) {
            selectedIds.splice(index, 1);
        }
        
        // Update student selection status
        students.forEach(function(student) {
            if (student.Id === selectedId) {
                student.selected = isSelected;
            }
        });
        
        // Update selectedAll status
        component.set("v.selectedAll", students.length === selectedIds.length);
        component.set("v.selectedIds", selectedIds);
        component.set("v.students", students);
    },
    
    handleFirst : function(component, event, helper) {
        component.set("v.pageNumber", 1);
        helper.search(component);
    },
    
    handlePrevious : function(component, event, helper) {
        var pageNumber = component.get("v.pageNumber");
        component.set("v.pageNumber", pageNumber - 1);
        helper.search(component);
    },
    
    handleNext : function(component, event, helper) {
        var pageNumber = component.get("v.pageNumber");
        component.set("v.pageNumber", pageNumber + 1);
        helper.search(component);
    },
    
    handleLast : function(component, event, helper) {
        var totalPages = component.get("v.totalPages");
        component.set("v.pageNumber", totalPages);
        helper.search(component);
    },
    
    handlePageChange : function(component, event, helper) {
        var pageNumber = parseInt(event.getSource().get("v.value"));
        component.set("v.pageNumber", pageNumber);
        helper.search(component);
    },
    
    closeCreateModal : function(component, event, helper) {
        component.set("v.showCreateModal", false);
    },
    
    closeViewModal : function(component, event, helper) {
        component.set("v.showViewModal", false);
        component.set("v.selectedStudent", null);
    },
    
    closeEditModal : function(component, event, helper) {
        component.set("v.showEditModal", false);
        component.set("v.selectedStudent", null);
        // Refresh the student list after editing
        helper.search(component);
    },
    
    closeDetailStudentModal : function(component, event, helper) {
        component.set("v.isDetailStudentModalOpen", false);
    },
    
    handleCloseModal : function(component, event, helper) {
        component.set("v.showCreateModal", false);
    }
})