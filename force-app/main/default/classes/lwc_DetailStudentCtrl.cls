public with sharing class lwc_DetailStudentCtrl {
    @AuraEnabled(cacheable=true)
    public static Student__c getStudent(String recordId) {
        try {
            Student__c student = [
                SELECT 
                    Id, StudentCode__c, Lastname__c, Firstname__c, Birthday__c, 
                    Gender__c, Class_look__c, LearningStatus__c,
                    Class_look__r.Name
                FROM Student__c 
                WHERE Id = :recordId
                LIMIT 1
            ];
            
            if (student.LearningStatus__c != null) {
                Schema.DescribeFieldResult fieldResult = Student__c.LearningStatus__c.getDescribe();
                List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
                for(Schema.PicklistEntry entry : ple) {
                    if (entry.getValue() == student.LearningStatus__c) {
                        student.LearningStatus__c = entry.getLabel();
                        break;
                    }
                }
            }
            
            return student;
        } catch (Exception e) {
            throw new AuraHandledException('Error getting student: ' + e.getMessage());
        }
    }
}