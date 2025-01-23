({
    loadStudent : function(component) {
        var action = component.get("c.getStudent");
        action.setParams({
            recordId: component.get("v.recordId")
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.student", response.getReturnValue());
            } else {
                console.error('Error loading student');
            }
        });
        $A.enqueueAction(action);
    },
    
    loadPicklistValues : function(component) {
        // Load Gender Options
        var action1 = component.get("c.getGenderOptions");
        action1.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                component.set("v.genderOptions", response.getReturnValue());
            }
        });
        
        // Enhanced Class Options loading with better error handling
        var action2 = component.get("c.getClassOptions");
        action2.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var classOptions = response.getReturnValue();
                console.log('Class Options:', classOptions);
                if (classOptions && classOptions.length > 0) {
                    component.set("v.classOptions", classOptions);
                } else {
                    console.warn('No class options returned');
                }
            } else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.error("Error loading class options:", errors[0]);
                        // Show detailed error toast
                        var toastEvent = $A.get("e.force:showToast");
                        toastEvent.setParams({
                            "title": "Error Loading Classes",
                            "message": errors[0].message,
                            "type": "error",
                            "mode": "sticky"
                        });
                        toastEvent.fire();
                    }
                }
            }
        });
        
        // Load Status Options
        var action3 = component.get("c.getStatusOptions");
        action3.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                component.set("v.statusOptions", response.getReturnValue());
            }
        });
        
        $A.enqueueAction(action1);
        $A.enqueueAction(action2);
        $A.enqueueAction(action3);
    },
    
    saveStudent : function(component) {
        var student = component.get("v.student");
        var action = component.get("c.updateStudent");
        action.setParams({
            student: student
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                // Show success toast
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Success!",
                    "message": "Student updated successfully.",
                    "type": "success"
                });
                toastEvent.fire();
                
                // Navigate back
                this.navigateBack(component);
            } else {
                // Show error toast
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error!",
                    "message": "Error updating student.",
                    "type": "error"
                });
                toastEvent.fire();
            }
        });
        $A.enqueueAction(action);
    },
    
    navigateBack : function(component) {
        var navEvt = $A.get("e.force:navigateToURL");
        navEvt.setParams({
            "url": "/" + component.get("v.recordId")
        });
        navEvt.fire();
    },
    
    showToast : function(title, message, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title: title,
            message: message,
            type: type,
            duration: 2000 // Thời gian hiển thị thông báo
        });
        toastEvent.fire();
    },
    
    navigateToSearch : function() {
        var navEvt = $A.get("e.force:navigateToComponent");
        navEvt.setParams({
            componentDef: "c:CMP_SearchStudent"
        });
        navEvt.fire();
    }
})