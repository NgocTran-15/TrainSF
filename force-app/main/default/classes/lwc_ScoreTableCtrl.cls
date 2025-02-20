public with sharing class lwc_ScoreTableCtrl {
    @AuraEnabled(cacheable=true)
    public static List<SubjectScore__c> getSubjectScores() {
        return [
            SELECT Id, Name, AverageScore__c, Status__c, Semester_look__c, 
                   Student_look__c, Subject_look__c, Credit__c, 
                   ProgressScore__c, PracticalScore__c, MidtermExamScore__c, FinalExamScore__c
            FROM SubjectScore__c
            ORDER BY Semester_look__c DESC, Subject_look__c
        ];
    }
}
