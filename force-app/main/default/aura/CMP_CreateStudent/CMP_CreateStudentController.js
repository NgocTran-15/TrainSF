// Controller.js
({
    doInit: function(component, event, helper) {
        helper.initializeStudent(component);
        helper.loadPicklistValues(component, "Gender__c", "genderOptions");
        helper.loadPicklistValues(component, "LearningStatus__c", "statusOptions");
        helper.loadClassLookupOptions(component);
        helper.loadGenderOptions(component);
        helper.loadClassOptions(component);
    },
    
    handleSave: function(component, event, helper) {
        // Kiểm tra các trường bắt buộc
        if (!helper.validateFields(component)) {
            return; // Nếu có trường rỗng, không thực hiện lưu
        }

        component.set("v.showSpinner", true);
        
        var action = component.get("c.createStudent");
        action.setParams({
            student: component.get("v.student")
        });
        
        action.setCallback(this, function(response) {
            component.set("v.showSpinner", false);
            
            var state = response.getState();
            if (state === "SUCCESS") {
                helper.showToast('Success', '学生が正常に作成されました。', 'success');
                
                // Fire event thay vì gọi closeModal
                var closeModalEvent = component.getEvent("closeModalEvent");
                closeModalEvent.fire();
            } else if (state === "ERROR") {
                var errors = response.getError();
                helper.showToast('Error', errors[0].message, 'error');
            }
        });
        
        $A.enqueueAction(action);
        
        // After successful save, fire the close event
        var closeEvent = component.getEvent("closeModalEvent");
        closeEvent.fire();
    },

    handleFieldChange: function(component, event, helper) {
        // Clear previous error messages when field changes
        var fieldName = event.getSource().get("v.aura:id");
        var errorMessages = component.get("v.errorMessages");
        delete errorMessages[fieldName];
        component.set("v.errorMessages", errorMessages);
        
        // If birthday field changed, validate age immediately
        if (fieldName === 'birthday') {
            helper.validateFields(component);
        }
    },

    handleCancel: function(component, event, helper) {
        // component event
        var closeModalEvent = component.getEvent("closeModalEvent");
        closeModalEvent.fire();
    }
})