({
    doInit: function(component, event, helper) {
        // Set recordId manually if not provided through implementation
        if (!component.get("v.recordId")) {
            component.set("v.recordId", "a00dL00000ZK8yBQAT");
        }
        helper.loadStudent(component);
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
        var navEvt = $A.get("e.force:navigateToComponent");
        navEvt.setParams({
            componentDef: "c:CMP_SearchStudent"
        });
        navEvt.fire();
    }
})