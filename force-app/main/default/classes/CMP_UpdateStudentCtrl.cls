public with sharing class CMP_UpdateStudentCtrl {
    @AuraEnabled
    public static List<Map<String, String>> getGenderOptions() {
        List<Map<String, String>> options = new List<Map<String, String>>();
        Schema.DescribeFieldResult fieldResult = Student__c.Gender__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        for(Schema.PicklistEntry entry : ple) {
            options.add(new Map<String, String>{
                'label' => entry.getLabel(),
                'value' => entry.getValue()
            });
        }
        return options;
    }
    
    @AuraEnabled
    public static List<Map<String, String>> getClassOptions() {
        try {
            List<Map<String, String>> options = new List<Map<String, String>>();
            Schema.DescribeFieldResult fieldResult = Student__c.Class_look__c.getDescribe();
            Schema.DisplayType fieldType = fieldResult.getType();
            
            System.debug('Field Type: ' + fieldType);
            
            // Handle both Picklist and Lookup/Reference field types
            if (fieldType == Schema.DisplayType.PICKLIST) {
                List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
                for(Schema.PicklistEntry entry : ple) {
                    options.add(new Map<String, String>{
                        'label' => entry.getLabel(),
                        'value' => entry.getValue()
                    });
                }
            } else if (fieldType == Schema.DisplayType.REFERENCE) {
                // If it's a lookup field, get the related Class records
                String referenceTo = fieldResult.getReferenceTo()[0].getDescribe().getName();
                System.debug('Reference To: ' + referenceTo);
                
                // Query the related object (assuming it's Class__c)
                String query = 'SELECT Id, Name FROM ' + referenceTo + ' ORDER BY Name';
                for(SObject record : Database.query(query)) {
                    options.add(new Map<String, String>{
                        'label' => (String)record.get('Name'),
                        'value' => (String)record.get('Id')
                    });
                }
            } else {
                throw new AuraHandledException('Field Class_look__c is neither a picklist nor a lookup field');
            }
            
            System.debug('Options: ' + options);
            return options;
            
        } catch(Exception e) {
            System.debug('Error in getClassOptions: ' + e.getMessage());
            System.debug('Error stack trace: ' + e.getStackTraceString());
            throw new AuraHandledException('Error retrieving class options: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static List<Map<String, String>> getStatusOptions() {
        List<Map<String, String>> options = new List<Map<String, String>>();
        Schema.DescribeFieldResult fieldResult = Student__c.LearningStatus__c.getDescribe();
        
        for(Schema.PicklistEntry entry : fieldResult.getPicklistValues()) {
            if(entry.isActive()) {
                // Log giá trị để debug
                System.debug('Status Option - Label: ' + entry.getLabel() + ', Value: ' + entry.getValue());
                options.add(new Map<String, String>{
                    'label' => entry.getLabel(),
                    'value' => entry.getValue()
                });
            }
        }
        return options;
    }
    
    @AuraEnabled
    public static Student__c getStudent(String recordId) {
        try {
            System.debug('Getting student with ID: ' + recordId);
            Student__c student = [
                SELECT Id, StudentCode__c, Lastname__c, Firstname__c, 
                       Birthday__c, Gender__c, Class_look__c, Class_look__r.Name,
                       LearningStatus__c 
                FROM Student__c 
                WHERE Id = :recordId
            ];
            
            // Log for debugging
            System.debug('Retrieved student: ' + student);
            System.debug('Gender: ' + student.Gender__c);
            System.debug('Class: ' + student.Class_look__c);
            System.debug('Learning Status: ' + student.LearningStatus__c);
            
            return student;
        } catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void updateStudent(Student__c student) {
        try {
            update student;
        } catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void saveStudent(Student__c student) {
        try {
            // Kiểm tra và cập nhật thông tin sinh viên
            upsert student; // Sử dụng upsert để thêm hoặc cập nhật
        } catch (Exception e) {
            throw new AuraHandledException('Error saving student: ' + e.getMessage());
        }
    }
}