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
        var navEvt = $A.get("e.force:navigateToComponent");
        navEvt.setParams({
            componentDef: "c:CMP_CreateStudent"
        });
        navEvt.fire();
    },
    
    handleView : function(component, event, helper) {
        var studentId = event.getSource().get("v.value");
        // Navigate to detail page
        var navEvt = $A.get("e.force:navigateToComponent");
        navEvt.setParams({
            componentDef: "c:CMP_DetailStudent",
            componentAttributes: {
                recordId: studentId
            }
        });
        navEvt.fire();
    },
    
    handleEdit : function(component, event, helper) {
        var studentId = event.getSource().get("v.value");
        // Navigate to edit page
        var navEvt = $A.get("e.force:navigateToComponent");
        navEvt.setParams({
            componentDef: "c:CMP_UpdateStudent",
            componentAttributes: {
                recordId: studentId
            }
        });
        navEvt.fire();
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
    }
})