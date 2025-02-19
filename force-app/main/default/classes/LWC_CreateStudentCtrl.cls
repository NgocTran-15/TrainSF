public with sharing class LWC_CreateStudentCtrl {
    public LWC_CreateStudentCtrl() {

    }
    @AuraEnabled(cacheable=true)
    public static List<picklistWrapper> getGenderOptions() {
        List<picklistWrapper> options = new List<picklistWrapper>();
        
        // Add a default "None" option
        options.add(new picklistWrapper('--なし--', ''));

        // Retrieve picklist values for Gender__c
        Schema.DescribeFieldResult fieldResult = Student__c.Gender__c.getDescribe();
        List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
    
        // Loop through picklist values and add to the list
        for (Schema.PicklistEntry value : picklistValues) {
            options.add(new picklistWrapper(value.getLabel(), value.getValue()));
        }

        return options;
    }

    @AuraEnabled(cacheable=true)
    public static List<picklistWrapper> getClassOptions() {
        List<picklistWrapper> options = new List<picklistWrapper>();
        options.add(new picklistWrapper('--なし--', ''));

        try {
            for (Class__c cls : [SELECT Id, Name FROM Class__c]) {
                options.add(new picklistWrapper(cls.Name, cls.Id));
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching classes: ' + e.getMessage());
        }

        return options;
    }

    @AuraEnabled(cacheable=true)
    public static List<picklistWrapper> getLearningStatusOptions() {
        List<picklistWrapper> options = new List<picklistWrapper>();
        options.add(new picklistWrapper('--なし--', ''));

        Schema.DescribeFieldResult fieldResult = Student__c.LearningStatus__c.getDescribe();
        List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
        
        for (Schema.PicklistEntry entry : picklistValues) {
            options.add(new picklistWrapper(entry.getLabel(), entry.getValue()));
        }

        return options;
    }

    @AuraEnabled
    public static String createStudent(Student__c student) {
        Savepoint sp = Database.setSavepoint();
        
        try {
            // Log input data
            System.debug('Received student data: ' + JSON.serializePretty(student));
            
            // Validate required fields
            List<String> missingFields = new List<String>();
            
            if (String.isBlank(student.Lastname__c)) {
                missingFields.add('姓');
            }
            if (String.isBlank(student.Firstname__c)) {
                missingFields.add('名');
            }
            if (student.Birthday__c == null) {
                missingFields.add('生年月日');
            }
            if (String.isBlank(student.Gender__c)) {
                missingFields.add('性別');
            }
            if (String.isBlank(student.Class_look__c)) {
                missingFields.add('クラス');
            }
            if (String.isBlank(student.LearningStatus__c)) {
                missingFields.add('ステータス');
            }
            
            if (!missingFields.isEmpty()) {
                throw new AuraHandledException('以下のフィールドは必須です: ' + String.join(missingFields, ', '));
            }

            // Validate age
            if (student.Birthday__c != null) {
                Date today = Date.today();
                Integer age = today.year() - student.Birthday__c.year();
                if (today.month() < student.Birthday__c.month() || 
                    (today.month() == student.Birthday__c.month() && 
                     today.day() < student.Birthday__c.day())) {
                    age--;
                }
                if (age < 18) {
                    throw new AuraHandledException('学生は18歳以上である必要があります。');
                }
            }

            try {
                insert student;
                System.debug('Student created successfully. Id: ' + student.Id);
                return student.Id;
            } catch (DmlException e) {
                Database.rollback(sp);
                System.debug('DML Error: ' + e.getMessage());
                throw new AuraHandledException('保存に失敗しました: ' + e.getMessage());
            }
            
        } catch (Exception e) {
            Database.rollback(sp);
            System.debug('Error in createStudent: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class picklistWrapper {
        @AuraEnabled public String label;
        @AuraEnabled public String value;
        
        public picklistWrapper(String label, String value) {
            this.label = label;
            this.value = value;
        }
    }
}