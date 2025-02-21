import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getStudent from '@salesforce/apex/lwc_DetailStudentCtrl.getStudent';

export default class LwcDetailStudent extends NavigationMixin(LightningElement) {
    @api recordId;
    @track student;
    @track error;

    get className() {
        return this.student?.Class_look__r ? this.student.Class_look__r.Name : 'N/A';
    }

    get recordIdDisplay() {
        return this.recordId ? this.recordId : 'Not provided';
    }

    get errorMessage() {
        return this.error?.body ? this.error.body.message : this.error;
    }

    connectedCallback() {
        console.log('DetailStudent recordId:', this.recordId); // Debug log
    }

    @wire(getStudent, { studentId: '$recordId' })
    wiredStudent({ error, data }) {
        if (data) {
            console.log('Received student:', JSON.stringify(data)); // Debug log
            this.student = data;
            this.error = undefined;
        } else if (error) {
            console.error('Error loading student:', error);
            this.error = error;
            this.student = undefined; // Explicitly set to undefined on error
        }
    }

    get hasStudent() {
        console.log('hasStudent check:', this.student); // Debug log
        return this.student && (this.student.Id || Object.keys(this.student).length > 1); // Check for Id or non-empty object
    }

    get formattedGender() {
        return this.student?.Gender__c === 'Male' ? '男性' : 
               this.student?.Gender__c === 'Female' ? '女性' : 'N/A';
    }

    get formattedLearningStatus() {
        if (!this.student?.LearningStatus__c) return 'N/A';
        const statusMap = {
            'InProgress': '進行中',
            'Completed': '完了',
            'NotStarted': '未開始'
        };
        return statusMap[this.student.LearningStatus__c] || this.student.LearningStatus__c;
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}