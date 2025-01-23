public with sharing class CMP_DetailStudentCtrl {
    @AuraEnabled
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
            
            // Get picklist values
            student.Gender__c = getPicklistValue('Student__c', 'Gender__c', student.Gender__c);
            student.LearningStatus__c = getPicklistValue('Student__c', 'LearningStatus__c', student.LearningStatus__c);
            
            return student;
        } catch (Exception e) {
            throw new AuraHandledException('学生データの取得中にエラーが発生しました: ' + e.getMessage());
        }
    }

    private static String getPicklistValue(String objectName, String fieldName, String apiValue) {
        Schema.DescribeFieldResult fieldResult = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap().get(fieldName).getDescribe();
        for (Schema.PicklistEntry entry : fieldResult.getPicklistValues()) {
            if (entry.getValue() == apiValue) {
                return entry.getLabel(); // Return the label (Japanese value)
            }
        }
        return null; // Return null if not found
    }
}