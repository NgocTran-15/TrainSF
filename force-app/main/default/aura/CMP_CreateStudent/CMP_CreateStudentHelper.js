({
    // ========================================================
    // 1. Lấy giá trị Picklist từ Apex Controller
    // ========================================================
    loadPicklistValues: function(component, fieldName, attributeName) {
        var action = component.get("c.getPicklistValues");
        action.setParams({
            objectType: "Student__c",
            fieldName: fieldName
        });
        
        action.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                var options = response.getReturnValue().map(function(option) {
                    return {
                        label: option.label,
                        value: option.value
                    };
                });
                options.unshift({
                    label: '--なし--',
                    value: ''
                });
                console.log('Loading ' + fieldName + ' options:', options);
                component.set("v." + attributeName, options);
            }
        });
        
        $A.enqueueAction(action);
    },

    // ========================================================
    // 2. Lấy danh sách lớp từ Lookup Field (Class_look__c)
    // ========================================================
    loadClassLookupOptions: function(component) {
        let action = component.get("c.getClassOptions");
        
        action.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                let options = response.getReturnValue().map(function(option) {
                    return {
                        label: option.label,
                        value: option.value
                    };
                });
                options.unshift({
                    label: '--なし--',
                    value: ''
                });
                console.log('Class Options loaded:', options);
                component.set("v.classOptions", options);
            } else {
                console.error('Error loading class options:', response.getError());
            }
        });
        
        $A.enqueueAction(action);
    },

    // ========================================================
    // 3. Hiển thị thông báo Toast
    // ========================================================
    showToast: function(title, message, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title: title,
            message: message,
            type: type,
            duration: 2000
        });
        toastEvent.fire();
    },

    // ========================================================
    // 4. Reset form về trạng thái ban đầu
    // ========================================================
    initializeStudent: function(component) {
        var student = {
            'sobjectType': 'Student__c',
            'Lastname__c': '',
            'Firstname__c': '',
            'Birthday__c': null,
            'Gender__c': '',
            'Class_look__c': '',
            'LearningStatus__c': ''
        };
        component.set("v.student", student);
    },
    
    resetForm: function(component) {
        // Initialize new empty student
        this.initializeStudent(component);
        
        // Reset all input fields
        var fields = component.find(['lastname', 'firstname', 'birthday', 'gender', 'class', 'status']);
        if (Array.isArray(fields)) {
            fields.forEach(function(field) {
                if (field && field.set) {
                    field.set("v.value", "");
                }
            });
        }
    },

    // ========================================================
    // 5. Xử lý lỗi tổng quát
    // ========================================================
    handleErrors: function(component, errors) {
        let errorMsg = "エラーが発生しました: ";
        if (errors && Array.isArray(errors)) {
            errors.forEach(error => {
                errorMsg += error.message ? error.message : "Unknown error";
            });
        } else {
            errorMsg += "予期せぬエラーが発生しました";
        }
        this.showToast("エラー", errorMsg, "error");
    },

    validateFields: function(component, student) {
        console.log('Validating fields:', JSON.stringify(student));
        
        // Check for null student object
        if (!student || !student.sobjectType) {
            this.showToast("エラー", "Invalid student data", "error");
            return false;
        }

        var requiredFields = {
            'lastname': {field: 'Lastname__c', label: '姓'},
            'firstname': {field: 'Firstname__c', label: '名'},
            'birthday': {field: 'Birthday__c', label: '生年月日'},
            'gender': {field: 'Gender__c', label: '性別'},
            'class': {field: 'Class_look__c', label: 'クラス'}
        };
        
        var missingFields = [];
        var isValid = true;
        
        // Validate each required field
        for (let key in requiredFields) {
            let fieldInfo = requiredFields[key];
            let value = student[fieldInfo.field];
            let input = component.find(key);
            
            if (!value) {
                isValid = false;
                missingFields.push(fieldInfo.label);
                if (input && input.setCustomValidity) {
                    input.setCustomValidity(fieldInfo.label + 'は必須です。');
                    input.reportValidity();
                }
            } else if (input && input.setCustomValidity) {
                input.setCustomValidity('');
                input.reportValidity();
            }
        }
        
        if (!isValid) {
            this.showToast("エラー", "必須項目を入力してください: " + missingFields.join(', '), "error");
        }
        
        return isValid;
    },

    saveStudent: function(component) {
        var student = component.get("v.student");
        console.log('Saving student:', JSON.stringify(student));

        var action = component.get("c.createStudent");
        action.setParams({
            student: student
        });

        action.setCallback(this, function(response) {
            var state = response.getState();
            console.log('Server response state:', state);

            if (state === "SUCCESS") {
                this.showToast("成功", "学生情報が保存されました。", "success");
                this.resetForm(component);
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.error('Save errors:', errors);
                
                var errorMsg = errors && errors[0] && errors[0].message ? 
                    errors[0].message : "保存に失敗しました。";
                
                this.showToast("エラー", errorMsg, "error");
            }
        });

        $A.enqueueAction(action);
    },

    loadGenderOptions: function(component) {
        var action = component.get("c.getPicklistValues");
        action.setParams({
            objectType: 'Student__c',
            fieldName: 'Gender__c'
        });
        
        action.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                component.set("v.genderOptions", response.getReturnValue());
            }
        });
        
        $A.enqueueAction(action);
    },
    
    loadClassOptions: function(component) {
        var action = component.get("c.getClassOptions");
        
        action.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                component.set("v.classOptions", response.getReturnValue());
            }
        });
        
        $A.enqueueAction(action);
    }
})