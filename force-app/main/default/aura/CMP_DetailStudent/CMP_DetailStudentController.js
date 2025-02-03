({
    doInit: function(component, event, helper) {
        // Không cần gọi getStudentDetails vì data đã được truyền qua attribute
        console.log('Detail Student Init:', component.get("v.student"));
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