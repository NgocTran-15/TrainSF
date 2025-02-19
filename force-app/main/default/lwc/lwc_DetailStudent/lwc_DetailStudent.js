import { LightningElement, api } from 'lwc';

export default class Lwc_DetailStudent extends LightningElement {
    @api student;

    get hasStudent() {
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

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}