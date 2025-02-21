import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getStudent from '@salesforce/apex/lwc_DetailStudentCtrl.getStudent';

export default class lwc_DetailStudent extends NavigationMixin(LightningElement) {
    @api recordId;
    student;
    error;

    @wire(getStudent, { recordId: '$recordId' })
    wiredStudent({ error, data }) {
        if (data) {
            console.log('Received student data:', JSON.stringify(data)); // Add logging
            this.student = data;
            this.error = undefined;
        } else if (error) {
            console.error('Error loading student:', error); // Add logging
            this.error = error;
            this.student = undefined;
        }
    }

    get hasStudent() {
        console.log('hasStudent check:', this.student); // Add logging
        return this.student != null;
    }

    // Computed getters for formatted values
    get formattedBirthday() {
        return this.student?.Birthday__c ? new Date(this.student.Birthday__c).toLocaleDateString() : '';
    }

    get formattedGender() {
        return this.student?.Gender__c === 'Male' ? '男性' : 
               this.student?.Gender__c === 'Female' ? '女性' : '';
    }

    get formattedLearningStatus() {
        const statusMap = {
            'InProgress': '進行中',
            'Completed': '完了',
            'NotStarted': '未開始'
        };
        return statusMap[this.student?.LearningStatus__c] || this.student?.LearningStatus__c || '';
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}