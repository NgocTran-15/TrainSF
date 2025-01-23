public with sharing class VF_UpdateStudentCtrl {
    public Student__c student { get; set; }
    
    public VF_UpdateStudentCtrl() {
        // Get student Id from URL parameter
        String studentId = ApexPages.currentPage().getParameters().get('id');
        if (String.isNotBlank(studentId)) {
            getStudentById(studentId);
        }
    }
    
    private void getStudentById(String studentId) {
        try {
            student = [SELECT Id, Firstname__c, Lastname__c, Gender__c, Birthday__c,
                             LearningStatus__c, Class_look__c
                      FROM Student__c
                      WHERE Id = :studentId
                      LIMIT 1];
            ApexPages.addMessage(new ApexPages.Message(
                ApexPages.Severity.CONFIRM, 
                '学生情報が正常に取得されました。'
            ));
        } catch (QueryException e) {
            ApexPages.addMessage(new ApexPages.Message(
                ApexPages.Severity.ERROR, 
                '学生情報の取得中にエラーが発生しました: ' + e.getMessage()
            ));
            student = new Student__c();
        }
    }
    
    public PageReference cancel() {
        PageReference pageRef = Page.VF_SearchStudent;
        pageRef.setRedirect(true);
        return pageRef;
    }
    
    public PageReference SaveStudent() {
        try {
            update student;
            ApexPages.addMessage(new ApexPages.Message(
                ApexPages.Severity.CONFIRM, 
                '学生情報が正常に更新されました。'
            ));
            return cancel(); // Return to search view after successful update
        } catch (Exception e) {
            ApexPages.addMessage(new ApexPages.Message(
                ApexPages.Severity.ERROR, 
                '学生情報の更新中にエラーが発生しました: ' + e.getMessage()
            ));
            return null;
        }
    }
}
