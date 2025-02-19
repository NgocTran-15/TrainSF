public with sharing class lwc_SearchStudentCtrl {
    
    @AuraEnabled(cacheable=true)
    public static List<Map<String,String>> getClassOptions() {
        List<Map<String,String>> options = new List<Map<String,String>>();
        options.add(new Map<String,String>{'label' => '--なし--', 'value' => ''});
        
        for(Class__c cls : [SELECT Id, Name FROM Class__c ORDER BY Name]) {
            options.add(new Map<String,String>{
                'label' => cls.Name,
                'value' => cls.Id
            });
        }
        return options;
    }

    @AuraEnabled
    public static SearchResult searchStudents(String studentCode, String searchName, 
                                            String classCode, String gender, Date birthDate,
                                            Integer pageSize, Integer pageNumber) {
        try {
            // Get Custom Setting
            StudentManageSetting__c setting = StudentManageSetting__c.getOrgDefaults();
            Integer maxRecords = (setting != null && setting.S_MaxRecord__c != null) ? 
                               Integer.valueOf(setting.S_MaxRecord__c) : 10000;
            
            // Build query
            String query = 'SELECT Id, StudentCode__c, Lastname__c, Firstname__c, ' +
                         'Birthday__c, Gender__c, Class_look__c, Class_look__r.Name ' +
                         'FROM Student__c WHERE Id != null';
            
            // Add filters
            if (String.isNotBlank(studentCode)) {
                query += ' AND StudentCode__c LIKE \'%' + String.escapeSingleQuotes(studentCode) + '%\'';
            }
            if (String.isNotBlank(searchName)) {
                String searchTerm = '%' + String.escapeSingleQuotes(searchName) + '%';
                query += ' AND (Lastname__c LIKE :searchTerm OR Firstname__c LIKE :searchTerm)';
            }
            if (String.isNotBlank(classCode)) {
                query += ' AND Class_look__c = :classCode';
            }
            if (String.isNotBlank(gender)) {
                query += ' AND Gender__c = :gender';
            }
            if (birthDate != null) {
                query += ' AND Birthday__c = :birthDate';
            }
            
            // Count total records
            Integer totalRecords = Database.countQuery(query.replaceFirst('SELECT.*?FROM', 'SELECT COUNT() FROM'));
            totalRecords = Math.min(totalRecords, maxRecords);
            
            // Calculate pagination
            Integer offset = (pageNumber - 1) * pageSize;
            Integer totalPages = Math.ceil(Decimal.valueOf(totalRecords) / pageSize).intValue();
            
            // Add pagination to query
            query += ' ORDER BY StudentCode__c DESC LIMIT :pageSize OFFSET :offset';
            
            // Execute query
            List<Student__c> students = Database.query(query);
            
            return new SearchResult(students, totalRecords, totalPages);
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteStudents(List<String> studentIds) {
        try {
            delete [SELECT Id FROM Student__c WHERE Id IN :studentIds];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteStudent(String studentId) {
        try {
            delete [SELECT Id FROM Student__c WHERE Id = :studentId LIMIT 1];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Student__c getStudent(String recordId) {
        try {
            return [SELECT Id, StudentCode__c, Lastname__c, Firstname__c, 
                          Birthday__c, Gender__c, Class_look__c, Class_look__r.Name,
                          LearningStatus__c
                   FROM Student__c 
                   WHERE Id = :recordId 
                   LIMIT 1];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Student__c createStudent(Student__c studentData) {
        try {
            // Simply insert the student data without setting StudentCode__c
            insert studentData;
            return studentData;
        } catch (Exception e) {
            throw new AuraHandledException('Error creating student: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static Student__c updateStudent(Student__c studentData) {
        try {
            update studentData;
            return studentData;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating student: ' + e.getMessage());
        }
    }

    public class SearchResult {
        @AuraEnabled public List<Student__c> students { get; set; }
        @AuraEnabled public Integer totalRecords { get; set; }
        @AuraEnabled public Integer totalPages { get; set; }
        
        public SearchResult(List<Student__c> students, Integer totalRecords, Integer totalPages) {
            this.students = students;
            this.totalRecords = totalRecords;
            this.totalPages = totalPages;
        }
    }
}