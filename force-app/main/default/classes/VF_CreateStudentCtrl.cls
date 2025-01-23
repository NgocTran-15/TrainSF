public with sharing class VF_CreateStudentCtrl {
    public Student__c student { get; set; }

    public VF_CreateStudentCtrl() {
        student = new Student__c();
    }

    public PageReference save() {
        try {
            insert student;
            
            // Tạo PageReference để chuyển hướng
            PageReference pageRef = Page.VF_SearchStudent;
            pageRef.setRedirect(true);
            return pageRef;
            
        } catch (DmlException e) {
            ApexPages.addMessages(e);
            return null;
        }
    }

    public PageReference cancel() {
        PageReference pageRef = Page.VF_SearchStudent;
        pageRef.setRedirect(true);
        return pageRef;
    }
}