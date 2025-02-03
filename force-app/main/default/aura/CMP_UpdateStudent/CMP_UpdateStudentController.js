({
    doInit : function(component, event, helper) {
        console.log('Init Student:', component.get("v.student"));
        helper.loadPicklistValues(component);
    },
    
    handleFieldChange : function(component, event, helper) {
        var fieldName = event.getSource().get("v.fieldName");
        var value = event.getSource().get("v.value");
        console.log('Field changed:', fieldName, value);
        
        // Update the student object
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