public with sharing class lwc_DetailStudentCtrl {
    @AuraEnabled(cacheable=true)
    public static Student__c getStudent(String recordId) {
        try {
            return [
                SELECT 
                    Id, StudentCode__c, Lastname__c, Firstname__c, Birthday__c, 
                    Gender__c, Class_look__c, LearningStatus__c,
                    Class_look__r.Name
                FROM Student__c 
                WHERE Id = :recordId
                LIMIT 1
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error getting student: ' + e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<Semester__c> getAllInformationForStudent(Id studentId) {
   try{
        return [SELECT Id, Name, StartDate__c, EndDate__c, // semester
                (SELECT Id, Status__c, AverageScore__c,  // subject scor 
                    Student_look__r.Name, subject_look__r.Name, Semester_look__r.Name,
                    (SELECT Id, Score__c, Name, ExamType__c, SubjectScore_look__c FROM subjectscore_look__r)  //score
                FROM semester_look__r WHERE Student_look__r.Id = :studentId)
                FROM Semester__c];
    }catch(Exception ex){
        throw new AuraHandledException('Error retrieve student score information records: ' + ex.getMessage());
    }
}