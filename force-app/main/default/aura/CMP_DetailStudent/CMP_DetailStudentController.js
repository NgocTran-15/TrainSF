({
    doInit: function(component, event, helper) {
        var student = component.get("v.student");
        if (student && student.LearningStatus__c) {
            // Get Japanese label for Learning Status
            var action = component.get("c.getLearningStatusLabel");
            action.setParams({
                value: student.LearningStatus__c
            });
            
            action.setCallback(this, function(response) {
                if (response.getState() === "SUCCESS") {
                    var result = response.getReturnValue();
                    if (result && result.label) {
                        student.LearningStatus__c = result.label;
                        component.set("v.student", student);
                    }
                }
            });
            
            $A.enqueueAction(action);
        }
    },

    handleEdit: function(component, event, helper) {
        component.set("v.isEdit", true);
    },

    handleCancel: function(component, event, helper) {
        component.set("v.isEdit", false);
        helper.loadStudent(component);
    },

    handleSuccess: function(component, event, helper) {
        component.set("v.isEdit", false);
        helper.showToast("成功", "学生情報が更新されました", "success");
        $A.get("e.force:refreshView").fire();
    },

    handleClose: function(component, event, helper) {
        var closeModal = component.get("v.closeModal");
        if (closeModal) {
            $A.enqueueAction(closeModal);
        }
    }
})