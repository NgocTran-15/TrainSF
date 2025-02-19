public with sharing class lwc_UpdateStudentCtrl {
    @AuraEnabled
    public static List<Map<String, String>> getGenderOptions() {
        List<Map<String, String>> options = new List<Map<String, String>>();
        Schema.DescribeFieldResult fieldResult = Student__c.Gender__c.getDescribe();
        
        for(Schema.PicklistEntry entry : fieldResult.getPicklistValues()) {
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
            
            if (fieldResult.getType() == Schema.DisplayType.REFERENCE) {
                String query = 'SELECT Id, Name FROM Class__c ORDER BY Name';
                for(SObject record : Database.query(query)) {
                    options.add(new Map<String, String>{
                        'label' => (String)record.get('Name'),
                        'value' => (String)record.get('Id')
                    });
                }
            }
            return options;
        } catch(Exception e) {
            throw new AuraHandledException('Error retrieving class options: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static List<Map<String, String>> getStatusOptions() {
        List<Map<String, String>> options = new List<Map<String, String>>();
        Schema.DescribeFieldResult fieldResult = Student__c.LearningStatus__c.getDescribe();
        
        for(Schema.PicklistEntry entry : fieldResult.getPicklistValues()) {
            if(entry.isActive()) {
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
            return [SELECT Id, StudentCode__c, Lastname__c, Firstname__c, 
                          Birthday__c, Gender__c, Class_look__c, Class_look__r.Name,
                          LearningStatus__c 
                   FROM Student__c 
                   WHERE Id = :recordId];
        } catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void saveStudent(Student__c student) {
        try {
            upsert student;
        } catch(Exception e) {
            throw new AuraHandledException('Error saving student: ' + e.getMessage());
        }
    }
}