({
    doInit : function(component, event, helper) {
        // Load all picklist values first
        Promise.all([
            helper.loadGenderOptions(component),
            helper.loadClassOptions(component),
            helper.loadLearningStatusOptions(component)
        ]).then(function() {
            // After loading picklist values, get the student data
            var student = component.get("v.student");
            if (student) {
                console.log('Initial student data:', student);
                // Force refresh of the UI
                component.set("v.student", Object.assign({}, student));
            }
            console.log('Loaded options:', {
                gender: component.get("v.genderOptions"),
                class: component.get("v.classOptions"),
                status: component.get("v.statusOptions")
            });
        }).catch(function(error) {
            console.error('Error in initialization:', error);
        });
    },
    
    handleFieldChange : function(component, event, helper) {
        var fieldName = event.getSource().get("v.fieldName");
        var value = event.getSource().get("v.value");
        console.log('Field changed:', fieldName, value);
        
        var student = component.get("v.student");
        if (student) {
            student[fieldName] = value;
            component.set("v.student", student);
            console.log('Updated student:', student);
        }
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
                helper.showToast('Success', '更新成功', 'success');
                // Sửa lại thành Component Event
                var closeModalEvent = component.getEvent("closeModalEvent");
                closeModalEvent.fire();
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
        // Fire Component Event
        var closeModalEvent = component.getEvent("closeModalEvent");
        closeModalEvent.fire();
    },
    
    handleClose : function(component, event, helper) {
        var closeModalEvent = component.getEvent("closeModalEvent");
        closeModalEvent.fire();
    },

    fireCloseModalEvent : function(component, event, helper) {
        var closeModalEvent = component.getEvent("closeModalEvent"); // ✅ 
        closeModalEvent.fire();
    }
})