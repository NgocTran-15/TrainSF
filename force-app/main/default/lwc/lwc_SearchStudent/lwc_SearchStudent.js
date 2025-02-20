import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import searchStudents from '@salesforce/apex/lwc_SearchStudentCtrl.searchStudents';
import getClassOptions from '@salesforce/apex/lwc_SearchStudentCtrl.getClassOptions';
import deleteStudents from '@salesforce/apex/lwc_SearchStudentCtrl.deleteStudents';
import deleteStudent from '@salesforce/apex/lwc_SearchStudentCtrl.deleteStudent';
import getStudent from '@salesforce/apex/lwc_SearchStudentCtrl.getStudent';

export default class Lwc_SearchStudent extends LightningElement {
    // Track properties
    @track students = [];
    @track pageNumber = 1;
    @track pageSize = 10;
    @track totalPages = 0;
    @track totalRecords = 0;
    @track pageNumbers = [];
    @track selectedAll = false;
    @track selectedIds = [];
    @track classOptions = [];
    @track showDeleteModal = false;
    @track showViewModal = false;
    @track showCreateModal = false;
    @track showEditModal = false;
    @track selectedStudent = null;
    @track isLoading = false;
    @track showUpdateModal = false;
    @track selectedStudentId;
    @track hasSearched = false; // Add new track property to track if search was performed

    // Search filters
    @track studentCode = '';
    @track searchName = '';
    @track classCode = '';
    @track gender = '';
    @track birthDate = null;

    // Computed properties
    get hasSearchCriteria() {
        return !!(this.studentCode || this.searchName || this.classCode || 
                 this.gender || this.birthDate);
    }

    get isDeleteDisabled() {
        return this.selectedIds.length === 0;
    }

    get isFirstPage() {
        return this.pageNumber === 1;
    }

    get isLastPage() {
        return this.pageNumber === this.totalPages;
    }

    get selectedCount() {
        return this.selectedIds.length;
    }

    get genderOptions() {
        return [
            { label: '--なし--', value: '' },
            { label: '男性', value: 'Male' },
            { label: '女性', value: 'Female' }
        ];
    }

    get isClearDisabled() {
        return !(this.studentCode || this.searchName || this.classCode || 
                this.gender || this.birthDate);
    }

    // Lifecycle hooks
    connectedCallback() {
        // Just call search directly since we're using wire for class options
        this.search();
    }

    // Wire service for class options
    @wire(getClassOptions)
    wiredClassOptions({ error, data }) {
        if (data) {
            this.classOptions = data;
        } else if (error) {
            this.showToast('Error', 'クラスオプションの読み込みに失敗しました。', 'error');
        }
    }

    // Event handlers
    handleSearchFieldChange(event) {
        const field = event.target.label;
        const value = event.target.value;
        
        switch(field) {
            case '学生コード':
                this.studentCode = value;
                break;
            case '名前':
                this.searchName = value;
                break;
            case 'クラス':
                this.classCode = value;
                break;
            case '性別':
                this.gender = value;
                break;
            case '生年月日':
                this.birthDate = value;
                break;
        }

        // Reset hasSearched flag when user starts entering new search criteria
        this.hasSearched = false;
    }

    handleSearch() {
        // Reset selection when performing new search
        this.selectedIds = [];
        this.selectedAll = false;
        this.pageNumber = 1;
        this.hasSearched = true;
        this.search();
    }

    handleClear() {
        // Clear search criteria
        this.studentCode = '';
        this.searchName = '';
        this.classCode = '';
        this.gender = '';
        this.birthDate = null;
        
        // Reset the input fields
        const inputs = this.template.querySelectorAll('lightning-input, lightning-combobox');
        inputs.forEach(input => {
            input.value = '';
        });
        // Don't trigger search or reset pagination
    }

    handleCreate() {
        this.showCreateModal = true;
    }

    handleEdit(event) {
        event.preventDefault();
        event.stopPropagation();
        const studentId = event.target.dataset.id;
        // Find the student in the existing data
        const student = this.students.find(s => s.Id === studentId);
        if (student) {
            this.selectedStudent = student;
            this.selectedStudentId = studentId;
            this.showUpdateModal = true;
        }
    }

    async loadStudentForEdit(studentId) {
        try {
            this.isLoading = true;
            const student = await getStudent({ recordId: studentId });
            if (student) {
                this.selectedStudent = student;
                this.selectedStudentId = studentId;
                this.showUpdateModal = true;
            }
        } catch (error) {
            this.showToast('Error', '学生データの取得に失敗しました。', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    closeUpdateModal() {
        this.showUpdateModal = false;
        this.selectedStudentId = null;
    }

    refreshData() {
        // Only refresh data when explicitly called
        this.search();
    }

    handleDelete(event) {
        const studentId = event.target.value;
        this.deleteId = studentId;
        this.showDeleteModal = true;
    }

    handleBulkDelete() {
        if (this.selectedIds.length > 0) {
            this.showDeleteModal = true;
        } else {
            this.showToast('Warning', '削除する学生を選択してください。', 'warning');
        }
    }

    handleView(event) {
        event.preventDefault();
        event.stopPropagation();
        const studentId = event.target.dataset.id;
        // Find the student in the existing data
        const student = this.students.find(s => s.Id === studentId);
        if (student) {
            this.selectedStudent = student;
            this.showViewModal = true;
        }
    }

    async loadStudentForView(studentId) {
        try {
            this.isLoading = true;
            const student = await getStudent({ recordId: studentId });
            if (student) {
                this.selectedStudent = student;
                this.showViewModal = true;
            }
        } catch (error) {
            this.showToast('Error', '学生データの取得に失敗しました。', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    openDetailModal(event) {
        event.preventDefault();
        event.stopPropagation();
        const studentId = event.target.dataset.id;
        // Find the student in the existing data
        const student = this.students.find(s => s.Id === studentId);
        if (student) {
            this.selectedStudent = student;
            this.showViewModal = true;
        }
    }

    // Pagination handling
    handleFirst() {
        this.pageNumber = 1;
        this.search();
    }

    handlePrevious() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            this.search();
        }
    }

    handleNext() {
        if (this.pageNumber < this.totalPages) {
            this.pageNumber++;
            this.search();
        }
    }

    handleLast() {
        this.pageNumber = this.totalPages;
        this.search();
    }

    handlePageChange(event) {
        const selectedPage = parseInt(event.target.dataset.page, 10);
        if (this.pageNumber !== selectedPage) {
            this.pageNumber = selectedPage;
            this.search();
        }
    }

    // Modal handling
    closeViewModal() {
        this.showViewModal = false;
        this.selectedStudent = null;
    }

    closeCreateModal() {
        this.showCreateModal = false;
    }

    closeEditModal() {
        this.showEditModal = false;
        this.selectedStudent = null;
        this.search();
    }

    closeDeleteModal() {
        this.showDeleteModal = false;
        this.deleteId = null;
    }

    // Data operations
    async search() {
        try {
            this.isLoading = true;
            const result = await searchStudents({
                studentCode: this.studentCode,
                searchName: this.searchName,
                classCode: this.classCode,
                gender: this.gender,
                birthDate: this.birthDate,
                pageSize: this.pageSize,
                pageNumber: this.pageNumber
            });

            if (result) {
                // Reset selected state for all students
                this.students = result.students.map(student => ({
                    ...student,
                    selected: false // Always start with unselected state for new search results
                }));
                this.totalRecords = result.totalRecords;
                this.totalPages = result.totalPages;
                this.calculatePageNumbers();
                
                // Reset selection status since this is a new search
                this.selectedAll = false;
            }
        } catch (error) {
            this.showToast('Error', error.body.message, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    async loadStudent(studentId) {
        try {
            this.isLoading = true;
            const student = await getStudent({ recordId: studentId });
            if (student) {
                this.selectedStudent = student;
                this.showViewModal = true;
            }
        } catch (error) {
            this.showToast('Error', '学生データの取得に失敗しました。', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    async confirmDelete() {
        try {
            this.isLoading = true;
            if (this.deleteId) {
                await deleteStudent({ studentId: this.deleteId });
                this.showToast('Success', '学生が正常に削除されました。', 'success');
            } else if (this.selectedIds.length > 0) {
                await deleteStudents({ studentIds: this.selectedIds });
                this.showToast('Success', '選択した学生が正常に削除されました。', 'success');
                this.selectedIds = [];
                this.selectedAll = false;
            }
            this.closeDeleteModal();
            this.search();
        } catch (error) {
            this.showToast('Error', '削除中にエラーが発生しました。', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    // Helper methods
    calculatePageNumbers() {
        const maxPagesToShow = 5;
        let startPage = Math.max(1, this.pageNumber - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        // Create page objects with computed properties
        this.pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => {
            const pageNum = startPage + i;
            return {
                number: pageNum,
                isDisabled: pageNum === this.pageNumber,
                variant: pageNum === this.pageNumber ? 'brand' : 'neutral'
            };
        });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }

    refreshData() {
        this.search();
    }

    handleSelectAll(event) {
        const selectAll = event.target.checked;
        this.selectedAll = selectAll;
        
        // Update all student records
        this.students = this.students.map(student => ({
            ...student,
            selected: selectAll
        }));

        // Update selectedIds array
        if (selectAll) {
            this.selectedIds = this.students.map(student => student.Id);
        } else {
            this.selectedIds = [];
        }
    }

    handleCheckboxChange(event) {
        const studentId = event.target.dataset.id;
        const isChecked = event.target.checked;
        
        // Update the selected status in students array
        this.students = this.students.map(student => {
            if (student.Id === studentId) {
                return { ...student, selected: isChecked };
            }
            return student;
        });

        // Update selectedIds array
        if (isChecked) {
            this.selectedIds = [...this.selectedIds, studentId];
        } else {
            this.selectedIds = this.selectedIds.filter(id => id !== studentId);
        }

        // Update selectedAll status
        this.selectedAll = this.students.length > 0 && 
                         this.students.every(student => student.selected);
    }
}