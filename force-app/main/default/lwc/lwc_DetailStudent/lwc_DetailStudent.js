import { LightningElement, wire } from 'lwc';
import getStudent from '@salesforce/apex/lwc_DetailStudentCtrl.getStudent';

export default class Lwc_DetailStudent extends LightningElement {
    recordId = 'a00dL00000ZK8yBQAT';
    student = {};
    error;
    isLoading = true;

    @wire(getStudent, { recordId: '$recordId' })
    wiredStudent({ error, data }) {
        this.isLoading = false;
        if (data) {
            this.student = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.student = {};
        }
    }

    get className() {
        return this.student?.Class_look__r?.Name || '';
    }
    
    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}