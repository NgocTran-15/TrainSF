({
    doInit : function(component, event, helper) {
        helper.loadStudent(component);
        helper.loadPicklistValues(component);
    },
    
    handleFieldChange : function(component, event, helper) {
        var selectedValue = event.getSource().get("v.value");
        console.log('Field changed:', selectedValue);
        
        // Avoid unnecessary updates that could trigger the change event again
        // Example: If you're updating the same attribute, ensure it doesn't cause a loop
    },
    
    handleSave : function(component, event, helper) {
        // Show spinner hoặc loading state
        component.set("v.showSpinner", true);
        
        var action = component.get("c.saveStudent");
        action.setParams({
            student: component.get("v.student")
        });
        
        action.setCallback(this, function(response) {
            // Hide spinner
            component.set("v.showSpinner", false);
            
            var state = response.getState();
            if (state === "SUCCESS") {
                // Hiển thị thông báo thành công
                helper.showToast('Success', 'Student updated successfully', 'success');
                
                // Chuyển hướng về trang search
                window.setTimeout(
                    $A.getCallback(function() {
                        var navEvt = $A.get("e.force:navigateToComponent");
                        navEvt.setParams({
                            componentDef: "c:CMP_SearchStudent"
                        });
                        navEvt.fire();
                    }), 1000
                );
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.error("Error saving student: ", errors);
                helper.showToast('Error', 'Error updating student', 'error');
            }
        });
        
        $A.enqueueAction(action);
    },
    
    handleCancel : function(component, event, helper) {
        // Navigate back to the search student page
        var navEvt = $A.get("e.force:navigateToComponent");
        navEvt.setParams({
            componentDef: "c:CMP_SearchStudent" // Đảm bảo rằng tên component là chính xác
        });
        navEvt.fire();
    }
})