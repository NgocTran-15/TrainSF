({
    loadStudent: function(component) {
        const recordId = component.get("v.recordId");
        
        if (!recordId) {
            console.error("Record ID is missing");
            this.showToast("エラー", "レコードIDが見つかりません", "error");
            return;
        }

        const action = component.get("c.getStudent");
        action.setParams({ "recordId": recordId });

        action.setCallback(this, function(response) {
            const state = response.getState();
            if (state === "SUCCESS") {
                const studentData = response.getReturnValue();
                if (studentData) {
                    component.set("v.student", studentData);
                } else {
                    this.showToast("エラー", "学生データが見つかりません", "error");
                }
            } else if (state === "ERROR") {
                const errors = response.getError();
                let errorMessage = "データの取得中にエラーが発生しました";
                if (errors && errors[0] && errors[0].message) {
                    errorMessage = errors[0].message;
                }
                this.showToast("エラー", errorMessage, "error");
            }
        });

        $A.enqueueAction(action);
    },

    showToast: function(title, message, type) {
        const toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type
        });
        toastEvent.fire();
    }
})