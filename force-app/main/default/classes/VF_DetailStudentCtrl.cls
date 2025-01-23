public with sharing class VF_DetailStudentCtrl {
    public Student__c student {get;set;}
    public Boolean isEdit {get;set;}
    
    public VF_DetailStudentCtrl() {
        isEdit = false;
        String studentId = ApexPages.currentPage().getParameters().get('id');
        if (String.isNotBlank(studentId)) {
            getStudentById(studentId);
        }
    }

    private void getStudentById(String studentId){
        try {
            student = [SELECT Id, Firstname__c, Lastname__c, StudentCode__c, 
                             Gender__c, Birthday__c, Class_look__c, Class_look__r.Name
                      FROM Student__c
                      WHERE Id = :studentId
                      LIMIT 1];
            ApexPages.addMessage(new ApexPages.Message(
                ApexPages.Severity.CONFIRM, 
                'Student record retrieved successfully.'
            ));
        } catch (QueryException e) {
            ApexPages.addMessage(new ApexPages.Message(
                ApexPages.Severity.ERROR, 
                'Error retrieving student record: ' + e.getMessage()
            ));
            student = new Student__c();
        }
    }
    
    // Toggle edit mode
    public void toggleEdit() {
        isEdit = !isEdit;
    }
    
    // Save changes
    public PageReference saveChanges() {
        try {
            update student;
            isEdit = false;
            ApexPages.addMessage(new ApexPages.Message(
                ApexPages.Severity.CONFIRM,
                'Student information updated successfully.'
            ));
            return null;
        } catch(Exception e) {
            ApexPages.addMessage(new ApexPages.Message(
                ApexPages.Severity.ERROR,
                'Error updating student: ' + e.getMessage()
            ));
            return null;
        }
    }
    
    // Cancel edit
    public void cancelEdit() {
        isEdit = false;
        // Refresh student data
        getStudentById(student.Id);
    }
    
    // Return to list view
    public PageReference backToList() {
        PageReference pageRef = Page.List;
        pageRef.setRedirect(true);
        return pageRef;
    }
    
    // Delete student
    public PageReference deleteStudent() {
        try {
            delete student;
            ApexPages.addMessage(new ApexPages.Message(
                ApexPages.Severity.CONFIRM,
                'Student deleted successfully.'
            ));
            return backToList();
        } catch(Exception e) {
            ApexPages.addMessage(new ApexPages.Message(
                ApexPages.Severity.ERROR,
                'Error deleting student: ' + e.getMessage()
            ));
            return null;
        }
    }
}