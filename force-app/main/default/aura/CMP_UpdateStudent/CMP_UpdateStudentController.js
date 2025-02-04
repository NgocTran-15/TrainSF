({
    doInit : function(component, event, helper) {
        // First load student data
        var action = component.get("c.getStudent");
        action.setParams({
            recordId: component.get("v.recordId")
        });
        
        action.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                var student = response.getReturnValue();
                console.log('Loaded student data:', student);
                
                // Store original status
                var originalStatus = student.LearningStatus__c;
                component.set("v.student", student);
                
                // Then load picklist values
                helper.loadPicklistValues(component).then(function() {
                    // Restore original status
                    var updatedStudent = component.get("v.student");
                    if (updatedStudent) {
                        updatedStudent.LearningStatus__c = originalStatus;
                        console.log('Setting status back to:', originalStatus);
                        component.set("v.student", updatedStudent);
                    }
                });
            }
        });
        $A.enqueueAction(action);
    },
    
    handleFieldChange : function(component, event, helper) {
        var fieldName = event.getSource().get("v.fieldName");
        var value = event.getSource().get("v.value");
        console.log('Field changed:', fieldName, value);
        
        var student = component.get("v.student");
        student[fieldName] = value;
        component.set("v.student", student);
    },
    
    handleSave : function(component, event, helper) {
        var student = component.get("v.student");
        console.log('Saving student:', student);
        
        var action = component.get("c.updateStudent");
        action.setParams({
            student: student
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                helper.showToast('Success', '学生が正常に更新されました。', 'success');
                var closeModal = component.get("v.closeModal");
                if (closeModal) {
                    $A.enqueueAction(closeModal);
                }
            } else if (state === "ERROR") {
                var errors = response.getError();
                if (errors && errors[0] && errors[0].message) {
                    helper.showToast('Error', errors[0].message, 'error');
                } else {
                    helper.showToast('Error', '更新中にエラーが発生しました。', 'error');
                }
            }
        });
        
        $A.enqueueAction(action);
    },
    
    handleCancel : function(component, event, helper) {
        var onclose = component.get("v.onclose");
        if (onclose) {
            onclose.fire(); // Fire the onclose event to close the modal
        }
    },
    
    handleClose : function(component, event, helper) {
        var closeModal = component.get("v.closeModal");
        if (closeModal) {
            $A.enqueueAction(closeModal);
        }
    }
})