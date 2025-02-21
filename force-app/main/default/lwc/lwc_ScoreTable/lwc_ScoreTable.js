import { LightningElement, wire, track, api } from 'lwc';
import getStudentScores from '@salesforce/apex/LWC_DetailStudentCtrl.getStudentScores';

export default class LwcScoreTable extends LightningElement {
    @api studentId;
    @track semesters = [];
    @track selectedSemester = '';
    @track semesterOptions = [];
    @track totalCredits = 0;
    @track averageGPA = 0;
    @track error;

    @wire(getStudentScores, { studentId: '$studentId' })
    wiredScores({ error, data }) {
        if (data) {
            console.log('Received student scores:', JSON.stringify(data));
            this.error = undefined;
            this.processData(data);
        } else if (error) {
            console.error('Error fetching student scores:', error);
            this.error = error;
            this.semesters = [];
            this.totalCredits = 0;
            this.averageGPA = 0;
        }
    }

    get hasData() {
        return this.studentId && this.semesters && this.semesters.length > 0;
    }

    processData(data) {
        if (!data || !Array.isArray(data)) {
            this.semesters = [];
            this.semesterOptions = [{ label: '全て', value: '' }];
            this.totalCredits = 0;
            this.averageGPA = 0;
            return;
        }

        this.semesterOptions = [{ label: '全て', value: '' }];
        this.semesters = data.map(semester => {
            this.semesterOptions.push({ 
                label: semester.semesterName || 'Unnamed Semester', 
                value: semester.semesterId || 'default' 
            });
            return {
                Id: semester.semesterId || 'default',
                Name: semester.semesterName || 'Unnamed Semester',
                StartDate: semester.startDate || null,
                EndDate: semester.endDate || null,
                totalCredits: semester.totalCredits || 0,
                semesterGPA: semester.semesterGPA || 0,
                SubjectScores: (semester.subjectScores || []).map(score => ({
                    Id: score.subjectId || 'default',
                    SubjectCode__c: score.subjectCode || 'N/A',
                    SubjectName__c: score.subjectName || 'N/A',
                    Credits__c: score.credits || 0,
                    ProgressScore__c: score.progressScore || 0,
                    PracticalScore__c: score.practicalScore || 0,
                    MidtermScore__c: score.midtermScore || 0,
                    FinalScore__c: score.finalScore || 0,
                    AverageScore__c: score.averageScore || 0
                }))
            };
        });

        // Calculate overall totals
        this.totalCredits = this.semesters.reduce((sum, sem) => sum + (sem.totalCredits || 0), 0);
        this.averageGPA = this.semesters.length > 0 
            ? (this.semesters.reduce((sum, sem) => sum + (sem.semesterGPA * sem.totalCredits), 0) / this.totalCredits).toFixed(2)
            : 0;
    }

    handleSemesterChange(event) {
        this.selectedSemester = event.target.value;
    }

    get displayedSemesters() {
        if (this.selectedSemester) {
            return this.semesters.filter(sem => sem.Id === this.selectedSemester);
        }
        return this.semesters;
    }
}