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
                
                // Navigate back to search after 2 seconds
                window.setTimeout(
                    $A.getCallback(function() {
                        var navEvt = $A.get("e.force:navigateToComponent");
                        navEvt.setParams({
                            componentDef: "c:CMP_SearchStudent"
                        });
                        navEvt.fire();
                    }), 2000
                );
            } else if (state === "ERROR") {
                var errors = response.getError();
                helper.showToast('Error', errors[0].message, 'error');
            }
        });
        
        $A.enqueueAction(action);
    },

    handleCancel: function(component, event, helper) {
        var navEvt = $A.get("e.force:navigateToComponent");
        navEvt.setParams({
            componentDef: "c:CMP_SearchStudent"
        });
        navEvt.fire();
    }
})