public class ListCtrl {
    // Properties for search filters
    public String studentCode { get; set; }
    public String firstName { get; set; }
    public String lastName { get; set; }
    public String classCode { get; set; }
    public String gender { get; set; }
    public Date birthDate { get; set; }
    public String searchName { get; set; }

    // Property for search results and selected students
    public List<Student__c> students { get; set; }
    public List<Id> selectedStudents { get; set; }  // List to store selected student IDs

    public class StudentWrapper {
        public Student__c student { get; set; }
        public Boolean selected { get; set; }
        
        public StudentWrapper(Student__c student) {
            this.student = student;
            this.selected = false;
        }
    }
    
    public List<StudentWrapper> studentWrappers { get; set; }

    // Pagination properties
    public Integer pageSize = 6;
    public Integer pageNumber { get; set; }
    public Integer totalRecords { get; set; }
    public Integer totalPages { get; set; }
    public Integer selectedPage { get; set; }
    public List<Integer> pageNumbers { get; set; }
    
    // Add new properties
    public List<SelectOption> classOptions { get; set; }
    
    // Giữ lại thuộc tính này vì nó được sử dụng cho chức năng xem chi tiết
    public String selectedStudentId { get; set; }

    // Add new property for single student deletion
    public String studentToDelete { get; set; }

    // Constructor
    public ListCtrl() {
        pageSize = 6;
        pageNumber = 1;
        students = new List<Student__c>();
        classOptions = new List<SelectOption>();
        loadClassOptions();
        search();
    }

    // Pagination methods
    public Boolean getHasPrevious() {
        System.debug('getHasPrevious check: ' + pageNumber);
        return pageNumber > 1;
    }
    
    public Boolean getHasNext() {
        return pageNumber < totalPages;
    }
    
    public void first() {
        pageNumber = 1;
        search();
    }
    
    public void previous() {
        System.debug('Current page before previous: ' + pageNumber);
        pageNumber = Math.max(1, pageNumber - 1);  // Đảm bảo không xuống dưới 1
        System.debug('Current page after previous: ' + pageNumber);
        search();
    }
    
    public void next() {
        pageNumber = pageNumber + 1;
        search();
    }
    
    public void last() {
        pageNumber = totalPages;
        search();
    }
    
    public void initializePagination() {
        String countQuery = 'SELECT COUNT() FROM Student__c';
        totalRecords = Database.countQuery(countQuery);
        totalPages = Math.ceil(totalRecords * 1.0 / pageSize).intValue();
        
        // Generate page numbers
        pageNumbers = new List<Integer>();
        Integer startPage = Math.max(1, pageNumber - 2);
        Integer endPage = Math.min(totalPages, pageNumber + 2);
        
        // Always show 5 pages if possible
        if (endPage - startPage < 4) {
            if (startPage == 1) {
                endPage = Math.min(5, totalPages);
            } else {
                startPage = Math.max(1, endPage - 4);
            }
        }
        
        for(Integer i = startPage; i <= endPage; i++) {
            pageNumbers.add(i);
        }
    }
    
    public void goToPage() {
        if(selectedPage != null && selectedPage > 0 && selectedPage <= totalPages) {
            pageNumber = selectedPage;
            search();
        }
    }

    // Action methods
    public PageReference viewStudent() {
        if(String.isNotBlank(selectedStudentId)) {
            PageReference pageRef = new PageReference('/apex/VF_DetailStudent');
            pageRef.getParameters().put('id', selectedStudentId);
            pageRef.setRedirect(true);
            return pageRef;
        }
        return null;
    }
    
    public PageReference createStudent() {
        PageReference pageRef = Page.VF_CreateStudent;
        pageRef.setRedirect(true);
        return pageRef;
    }

    // Search method
    public void search() {
        String query = 'SELECT Id, Name, StudentCode__c, LastName__c, FirstName__c, ' +
                      'Birthday__c, Gender__c, Class_look__c, Class_look__r.Name ' +
                      'FROM Student__c WHERE Id != null';
        
        // Add filters
        if (String.isNotBlank(studentCode)) {
            query += ' AND StudentCode__c LIKE \'%' + String.escapeSingleQuotes(studentCode) + '%\'';
        }
        if (String.isNotBlank(searchName)) {
            String searchTerm = '%' + String.escapeSingleQuotes(searchName) + '%';
            query += ' AND (LastName__c LIKE :searchTerm OR FirstName__c LIKE :searchTerm)';
        }
        if (String.isNotBlank(classCode)) {
            query += ' AND Class_look__c = :classCode';
        }
        if (String.isNotBlank(gender)) {
            query += ' AND Gender__c = \'' + String.escapeSingleQuotes(gender) + '\'';
        }
        if (birthDate != null) {
            query += ' AND Birthday__c = :birthDate';
        }
        
        // Thay đổi ORDER BY thành DESC
        query += ' ORDER BY StudentCode__c DESC LIMIT ' + pageSize + ' OFFSET ' + (pageSize * (pageNumber - 1));
        
        try {
            studentWrappers = new List<StudentWrapper>();
            for(Student__c student : Database.query(query)) {
                studentWrappers.add(new StudentWrapper(student));
            }
            
            initializePagination();
        } catch(Exception e) {
            ApexPages.addMessage(new ApexPages.Message(
                ApexPages.Severity.ERROR,
                'クエリエラー: ' + e.getMessage()
            ));
        }
    }

    // Clear filters
    public void clearFilters() {
        studentCode = '';
        searchName = '';
        classCode = '';
        gender = '';
        birthDate = null;
        search();
    }

    // Add method to load class options
    private void loadClassOptions() {
        classOptions = new List<SelectOption>();
        classOptions.add(new SelectOption('', '--なし--'));
        for (Class__c classRecord : [SELECT Id, Name FROM Class__c ORDER BY Name]) {
            classOptions.add(new SelectOption(classRecord.Id, classRecord.Name));
        }
    }

    // Delete single student
    public void deleteStudent() {
        if(String.isNotBlank(studentToDelete)) {
            try {
                Student__c studentToRemove = [SELECT Id FROM Student__c WHERE Id = :studentToDelete LIMIT 1];
                delete studentToRemove;
                ApexPages.addMessage(new ApexPages.Message(
                    ApexPages.Severity.INFO,
                    '学生が正常に削除されました。'
                ));
                search(); // Refresh the list
            } catch(Exception e) {
                ApexPages.addMessage(new ApexPages.Message(
                    ApexPages.Severity.ERROR,
                    '削除エラー: ' + e.getMessage()
                ));
            }
        }
    }
    
    // Delete selected students
    public void deleteSelectedStudents() {
        List<Student__c> studentsToDelete = new List<Student__c>();
        
        for(StudentWrapper wrapper : studentWrappers) {
            if(wrapper.selected) {
                studentsToDelete.add(wrapper.student);
            }
        }
        
        if(!studentsToDelete.isEmpty()) {
            try {
                delete studentsToDelete;
                ApexPages.addMessage(new ApexPages.Message(
                    ApexPages.Severity.INFO,
                    studentsToDelete.size() + '人の学生が正常に削除されました。'
                ));
                search(); // Refresh the list
            } catch(Exception e) {
                ApexPages.addMessage(new ApexPages.Message(
                    ApexPages.Severity.ERROR,
                    '削除エラー: ' + e.getMessage()
                ));
            }
        }
    }
    
    // Execute delete after confirmation
    public void executeDelete() {
        if(String.isNotBlank(studentToDelete)) {
            deleteStudent();
        } else {
            deleteSelectedStudents();
        }
    }
}