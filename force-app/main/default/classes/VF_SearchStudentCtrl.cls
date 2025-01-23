public class VF_SearchStudentCtrl {
    // Add Custom Setting property
    private StudentManageSetting__c studentManageSetting;
    
    // Properties for pagination
    public Integer pageSize { get; set; }
    public Integer maxRecords { get; set; }
    public Integer pageNumber { get; set; }
    public Integer totalPages { get; set; }
    public Integer selectedPage { get; set; }
    public List<Integer> pageNumbers { get; set; }
    public Boolean hasPrevious { get { return pageNumber > 1; } }
    public Boolean hasNext { get { return pageNumber < totalPages; } }

    // Properties for search
    public String studentCode { get; set; }
    public String searchName { get; set; }
    public String classCode { get; set; }
    public String gender { get; set; }
    public Date birthDate { get; set; }
    public String selectedStudentId { get; set; }
    public String studentToDelete { get; set; }
    public List<SelectOption> classOptions { get; set; }

    // Wrapper class
    public class StudentWrapper {
        public Student__c student { get; set; }
        public Boolean selected { get; set; }
        
        public StudentWrapper(Student__c student) {
            this.student = student;
            this.selected = false;
        }
    }
    
    public List<StudentWrapper> studentWrappers { get; set; }

    // Add new property for total records
    public Integer totalRecords { get; set; }
    
    // Add property to track if all records are selected
    public Boolean isAllSelected { get; set; }

    // Constructor
    public VF_SearchStudentCtrl() {
        isAllSelected = false;
        // Get Custom Setting
        studentManageSetting = StudentManageSetting__c.getOrgDefaults();
        
        // Initialize pagination with Custom Setting values
        pageSize = Integer.valueOf(studentManageSetting.S_RecordPerPage__c) > 0 
                  ? Integer.valueOf(studentManageSetting.S_RecordPerPage__c) 
                  : 6;
        maxRecords = Integer.valueOf(studentManageSetting.S_MaxRecord__c) > 0 
                    ? Integer.valueOf(studentManageSetting.S_MaxRecord__c) 
                    : 10000;
        pageNumber = 1;
        loadClassOptions();
        search();
    }

    // Phương thức tìm kiếm
    public void search() {
        String query = 'SELECT Id, Name, StudentCode__c, Lastname__c, Firstname__c, ' +
                      'Birthday__c, Gender__c, Class_look__c, Class_look__r.Name ' +
                      'FROM Student__c WHERE Id != null';
        
        // Thêm các điều kiện lọc
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
            query += ' AND Gender__c = \'' + String.escapeSingleQuotes(gender) + '\'';
        }
        if (birthDate != null) {
            query += ' AND Birthday__c = :birthDate';
        }
        
        // Thêm LIMIT và OFFSET với maxRecords
        query += ' ORDER BY StudentCode__c DESC ' +
                'LIMIT ' + Math.min(pageSize, maxRecords) + 
                ' OFFSET ' + Math.min((pageSize * (pageNumber - 1)), maxRecords);
        
        try {
            studentWrappers = new List<StudentWrapper>();
            for(Student__c student : Database.query(query)) {
                studentWrappers.add(new StudentWrapper(student));
            }
            
            // Tính toán tổng số bản ghi dựa trên các điều kiện lọc
            String countQuery = 'SELECT COUNT() FROM Student__c WHERE Id != null';
            // Thêm các điều kiện lọc cho câu truy vấn đếm
            if (String.isNotBlank(studentCode)) {
                countQuery += ' AND StudentCode__c LIKE \'%' + String.escapeSingleQuotes(studentCode) + '%\'';
            }
            if (String.isNotBlank(searchName)) {
                String searchTerm = '%' + String.escapeSingleQuotes(searchName) + '%';
                countQuery += ' AND (Lastname__c LIKE :searchTerm OR Firstname__c LIKE :searchTerm)';
            }
            if (String.isNotBlank(classCode)) {
                countQuery += ' AND Class_look__c = :classCode';
            }
            if (String.isNotBlank(gender)) {
                countQuery += ' AND Gender__c = \'' + String.escapeSingleQuotes(gender) + '\'';
            }
            if (birthDate != null) {
                countQuery += ' AND Birthday__c = :birthDate';
            }
            
            totalRecords = Math.min(Database.countQuery(countQuery), maxRecords);
            totalPages = Math.ceil(totalRecords * 1.0 / pageSize).intValue();
            
            if (totalRecords == 0) {
                pageNumber = 1;
            }
            
            calculateVisiblePages();
            
        } catch(Exception e) {
            ApexPages.addMessage(new ApexPages.Message(
                ApexPages.Severity.ERROR,
                'クエリエラー: ' + e.getMessage()
            ));
        }
    }

    // Các phương thức điều hướng
    public void first() {
        pageNumber = 1;
        calculateVisiblePages();
        search();
    }
    
    public void previous() {
        pageNumber = Math.max(1, pageNumber - 1);
        calculateVisiblePages();
        search();
    }
    
    public void next() {
        pageNumber = Math.min(totalPages, pageNumber + 1);
        calculateVisiblePages();
        search();
    }
    
    public void last() {
        pageNumber = totalPages;
        calculateVisiblePages();
        search();
    }
    
    public void goToPage() {
        pageNumber = selectedPage;
        calculateVisiblePages();
        search();
    }

    // Xóa các bộ lọc tìm kiếm
    public void clearFilters() {
        studentCode = '';
        searchName = '';
        classCode = '';
        gender = '';
        birthDate = null;
        pageNumber = 1;
        search();
    }

    // Tải danh sách các lựa chọn lớp
    private void loadClassOptions() {
        classOptions = new List<SelectOption>();
        classOptions.add(new SelectOption('', '--なし--'));
        for (Class__c cls : [SELECT Id, Name FROM Class__c ORDER BY Name]) {
            classOptions.add(new SelectOption(cls.Id, cls.Name));
        }
    }

    // Phương thức xóa sinh viên
    public void deleteStudent() {
        System.debug('Deleting student: ' + studentToDelete); // Debug log
        
        if (String.isNotBlank(studentToDelete)) {
            try {
                Student__c student = [SELECT Id FROM Student__c WHERE Id = :studentToDelete LIMIT 1];
                delete student;
                
                ApexPages.addMessage(new ApexPages.Message(
                    ApexPages.Severity.INFO,
                    '学生が正常に削除されました。'
                ));
                
                // Reset the ID and refresh the list
                studentToDelete = null;
                search();
            } catch (Exception e) {
                System.debug('Error deleting student: ' + e.getMessage()); // Debug log
                ApexPages.addMessage(new ApexPages.Message(
                    ApexPages.Severity.ERROR,
                    '削除エラー: ' + e.getMessage()
                ));
            }
        }
    }
    
    public void deleteSelectedStudents() {
        List<Student__c> studentsToDelete = new List<Student__c>();
        
        // Nếu tất cả bản ghi được chọn (checkbox header được chọn)
        if (isAllSelected) {
            // Truy vấn tất cả các bản ghi phù hợp trong giới hạn maxRecords
            String query = 'SELECT Id FROM Student__c WHERE Id != null';
            // Thêm các điều kiện lọc như trong tìm kiếm
            if (String.isNotBlank(studentCode)) {
                query += ' AND StudentCode__c LIKE \'%' + String.escapeSingleQuotes(studentCode) + '%\'';
            }
            // ... các điều kiện lọc khác ...
            query += ' LIMIT :maxRecords';
            
            studentsToDelete = Database.query(query);
        } else {
            // Chỉ xóa các bản ghi được chọn trên trang hiện tại
            for (StudentWrapper wrapper : studentWrappers) {
                if (wrapper.selected) {
                    studentsToDelete.add(wrapper.student);
                }
            }
        }
        
        if (!studentsToDelete.isEmpty()) {
            try {
                delete studentsToDelete;
                ApexPages.addMessage(new ApexPages.Message(
                    ApexPages.Severity.INFO,
                    studentsToDelete.size() + '人の学生が正常に削除されました。'
                ));
                search(); // Gọi lại phương thức tìm kiếm để cập nhật danh sách
            } catch (Exception e) {
                ApexPages.addMessage(new ApexPages.Message(
                    ApexPages.Severity.ERROR,
                    '削除エラー: ' + e.getMessage()
                ));
            }
        }
    }
    
    public void executeDelete() {
        if (String.isNotBlank(studentToDelete)) {
            deleteStudent();
        } else {
            deleteSelectedStudents();
        }
    }

    // Điều hướng 
    public PageReference viewStudent() {
        if(String.isNotBlank(selectedStudentId)) {
            PageReference pageRef = Page.VF_DetailStudent;
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

    public void calculatePageNumbers() {
        pageNumbers = new List<Integer>();
        Integer startPage = Math.max(1, pageNumber - 2); // Bắt đầu từ trang hiện tại - 2
        Integer endPage = Math.min(totalPages, startPage + 4); // Kết thúc ở trang hiện tại + 4

        // Điều chỉnh startPage nếu endPage < 5
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (Integer i = startPage; i <= endPage; i++) {
            pageNumbers.add(i);
        }
    }

    // Giả sử bạn có một phương thức để tính tổng số trang
    private Integer calculateTotalPages() {
        // Logic để tính tổng số trang dựa trên số lượng bản ghi
        // Ví dụ: return (totalRecords + pageSize - 1) / pageSize;
        return 10; //  có thể thay đổi giá trị này
    }

    // Phương thức để chuyển đến trang cụ thể
    public PageReference goToPage(Integer pageNum) {
        pageNumber = pageNum;
        calculatePageNumbers(); // Cập nhật lại các trang hiển thị
        // Logic để lấy dữ liệu cho trang hiện tại
        return null; // Giữ lại trang hiện tại
    }

    public void calculateVisiblePages() {
        pageNumbers = new List<Integer>();
        
        // Số lượng trang hiển thị tối đa
        Integer maxVisiblePages = 5;
        
        // Tính toán trang bắt đầu và kết thúc
        Integer startPage;
        Integer endPage;
        
        if (totalPages <= maxVisiblePages) {
            // Nếu tổng số trang ít hơn hoặc bằng 5, hiển thị tất cả
            startPage = 1;
            endPage = totalPages;
        } else {
            // Nếu đang ở gần đầu (3 trang đầu)
            if (pageNumber <= 3) {
                startPage = 1;
                endPage = maxVisiblePages;
            } 
            // Nếu đang ở gần cuối (3 trang cuối)
            else if (pageNumber > totalPages - 3) {
                startPage = totalPages - maxVisiblePages + 1;
                endPage = totalPages;
            } 
            // Nếu đang ở giữa
            else {
                startPage = pageNumber - 2;
                endPage = pageNumber + 2;
            }
        }
        
        // Thêm các số trang vào danh sách hiển thị
        for (Integer i = startPage; i <= endPage; i++) {
            pageNumbers.add(i);
        }
        
        System.debug('Current Page: ' + pageNumber);
        System.debug('Total Pages: ' + totalPages);
        System.debug('Visible Pages: ' + pageNumbers);
    }
}