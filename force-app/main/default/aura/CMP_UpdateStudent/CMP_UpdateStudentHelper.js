({
    loadStudent : function(component) {
        return new Promise(function(resolve, reject) {
            var action = component.get("c.getStudent");
            action.setParams({
                recordId: component.get("v.recordId")
            });
            
            action.setCallback(this, function(response) {
                if (response.getState() === "SUCCESS") {
                    var student = response.getReturnValue();
                    console.log('Student data from server:', student);
                    
                    if (student) {
                        // Make sure all required fields exist
                        student = Object.assign({}, student, {
                            Gender__c: student.Gender__c || '',
                            Class_look__c: student.Class_look__c || '',
                            LearningStatus__c: student.LearningStatus__c || ''
                        });
                    }
                    
                    component.set("v.student", student);
                    resolve(student);
                } else {
                    console.error('Error loading student:', response.getError());
                    reject(response.getError());
                }
            });
            $A.enqueueAction(action);
        });
    },
    
    loadPicklistValues : function(component) {
        return Promise.all([
            this.loadGenderOptions(component),
            this.loadClassOptions(component),
            this.loadLearningStatusOptions(component)
        ]).then(function() {
            console.log('All picklist values loaded');
            return Promise.resolve();
        }).catch(function(error) {
            console.error('Error loading picklist values:', error);
            return Promise.reject(error);
        });
    },

    loadGenderOptions: function(component) {
        return new Promise(function(resolve, reject) {
            var action = component.get("c.getGenderOptions");
            action.setCallback(this, function(response) {
                if (response.getState() === "SUCCESS") {
                    component.set("v.genderOptions", response.getReturnValue());
                    resolve();
                } else {
                    reject(response.getError());
                }
            });
            $A.enqueueAction(action);
        });
    },

    loadClassOptions: function(component) {
        return new Promise(function(resolve, reject) {
            var action = component.get("c.getClassOptions");
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var options = response.getReturnValue();
                    options.unshift({
                        'label': '--なし--',
                        'value': ''
                    });
                    component.set("v.classOptions", options);
                    resolve();
                } else {
                    reject(response.getError());
                }
            });
            $A.enqueueAction(action);
        });
    },

    loadLearningStatusOptions: function(component) {
        return new Promise(function(resolve, reject) {
            var action = component.get("c.getStatusOptions");
            action.setCallback(this, function(response) {
                if (response.getState() === "SUCCESS") {
                    var options = response.getReturnValue();
                    // Log để debug options
                    console.log('Status Options loaded:', options);
                    
                    // Log giá trị hiện tại của student
                    var student = component.get("v.student");
                    console.log('Current student status:', student ? student.LearningStatus__c : 'No student');
                    
                    component.set("v.statusOptions", options);
                    resolve();
                } else {
                    console.error('Error loading status options:', response.getError());
                    reject(response.getError());
                }
            });
            $A.enqueueAction(action);
        });
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