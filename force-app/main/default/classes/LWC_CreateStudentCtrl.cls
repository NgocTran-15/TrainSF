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
        try {
            // Debug incoming data
            System.debug('Received student data: ' + JSON.serializePretty(student));
            
            if(student == null) {
                throw new AuraHandledException('Student data is null');
            }

            // Create new Student__c to ensure clean data
            Student__c newStudent = new Student__c();
            newStudent.FirstName__c = student.FirstName__c;
            newStudent.LastName__c = student.LastName__c;
            newStudent.Birthday__c = student.Birthday__c;
            newStudent.Gender__c = student.Gender__c;
            newStudent.Class_look__c = student.Class_look__c;
            newStudent.LearningStatus__c = student.LearningStatus__c;

            // Validate required fields with specific messages
            List<String> missingFields = new List<String>();
            
            if (String.isBlank(newStudent.FirstName__c)) missingFields.add('名(FirstName)');
            if (String.isBlank(newStudent.LastName__c)) missingFields.add('姓(LastName)');
            if (newStudent.Birthday__c == null) missingFields.add('生年月日(Birthday)');
            if (String.isBlank(newStudent.Gender__c)) missingFields.add('性別(Gender)');
            if (String.isBlank(newStudent.Class_look__c)) missingFields.add('クラス(Class)');
            if (String.isBlank(newStudent.LearningStatus__c)) missingFields.add('学習状況(LearningStatus)');
            
            if (!missingFields.isEmpty()) {
                throw new AuraHandledException('次のフィールドは必須です: ' + String.join(missingFields, ', '));
            }

            // Debug prepared data
            System.debug('Preparing to insert student: ' + JSON.serializePretty(newStudent));

            insert newStudent;
            return newStudent.Id;

        } catch (DmlException e) {
            System.debug('DML Error: ' + e.getMessage());
            System.debug('DML Error Stack: ' + e.getStackTraceString());
            throw new AuraHandledException('データベースエラー: ' + e.getDmlMessage(0));
        } catch (Exception e) {
            System.debug('General Error: ' + e.getMessage());
            System.debug('Error Stack: ' + e.getStackTraceString());
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