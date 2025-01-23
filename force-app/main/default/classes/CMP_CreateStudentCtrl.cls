public with sharing class CMP_CreateStudentCtrl {
    // ===================================================================
    // 1. Lấy giá trị Picklist từ metadata
    // ===================================================================
    @AuraEnabled
    public static List<Map<String, String>> getPicklistValues(String objectType, String fieldName) {
        List<Map<String, String>> options = new List<Map<String, String>>();
        
        Schema.DescribeFieldResult fieldResult = Schema.getGlobalDescribe()
            .get(objectType)
            .getDescribe()
            .fields
            .getMap()
            .get(fieldName)
            .getDescribe();
        
        for (Schema.PicklistEntry entry : fieldResult.getPicklistValues()) {
            if (entry.isActive()) {  // Chỉ lấy các giá trị active
                Map<String, String> option = new Map<String, String>();
                option.put('label', entry.getLabel());
                option.put('value', entry.getValue());
                options.add(option);
            }
        }
        
        return options;
    }

    // ===================================================================
    // 2. Lấy danh sách lớp với cơ chế giới hạn và bảo mật
    // ===================================================================
    @AuraEnabled(cacheable=true)
    public static List<Map<String,String>> getClassLookupOptions() {
        List<Map<String,String>> options = new List<Map<String,String>>();
        
        try {
            // Sử dụng truy vấn an toàn với giới hạn 1000 bản ghi
            for (Class__c cls : [SELECT Id, Name FROM Class__c ORDER BY Name LIMIT 1000]) {
                options.add(new Map<String,String>{
                    'label' => cls.Name,
                    'value' => cls.Id
                });
            }
        } catch (QueryException e) {
            throw new AuraHandledException('Failed to retrieve classes: ' + e.getMessage());
        }
        return options;
    }

    // ===================================================================
    // 3. Lưu dữ liệu Student với validation nâng cao
    // ===================================================================
    @AuraEnabled
    public static Student__c createStudent(Student__c student) {
        try {
            // Detailed validation and logging
            System.debug('Attempting to create student: ' + JSON.serializePretty(student));
            
            // Validate required fields
            List<String> missingFields = new List<String>();
            if (String.isBlank(student.Lastname__c)) missingFields.add('姓');
            if (String.isBlank(student.Firstname__c)) missingFields.add('名');
            if (student.Birthday__c == null) missingFields.add('生年月日');
            if (String.isBlank(student.Gender__c)) missingFields.add('性別');
            if (String.isBlank(student.Class_look__c)) missingFields.add('クラス');
            
            if (!missingFields.isEmpty()) {
                String errorMsg = '以下の項目が必須です: ' + String.join(missingFields, ', ');
                System.debug('Validation failed: ' + errorMsg);
                throw new AuraHandledException(errorMsg);
            }

            // Insert with savepoint for rollback
            Savepoint sp = Database.setSavepoint();
            try {
                insert student;
                System.debug('Student created successfully. Id: ' + student.Id);
                return student;
            } catch (DmlException e) {
                Database.rollback(sp);
                System.debug('DML Error: ' + e.getMessage());
                throw new AuraHandledException('保存に失敗しました: ' + e.getMessage());
            }
            
        } catch (Exception e) {
            System.debug('Error in createStudent: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Map<String, String>> getClassOptions() {
        List<Map<String, String>> options = new List<Map<String, String>>();
        try {
            // Changed query to use correct field names
            for (Class__c cls : [SELECT Id, Name FROM Class__c ORDER BY Name]) {
                options.add(new Map<String, String>{
                    'label' => cls.Name, // Just use Name for label
                    'value' => cls.Id    // Use Id for value since it's a lookup
                });
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving class options: ' + e.getMessage());
        }
        return options;
    }
}