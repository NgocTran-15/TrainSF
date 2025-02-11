Sure, here's the content for the file: /createStudent/createStudent/createStudent.js

import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getGenderOptions from '@salesforce/apex/LWC_CreateStudentCtrl.getGenderOptions';
import getClassOptions from '@salesforce/apex/LWC_CreateStudentCtrl.getClassOptions';
import getLearningStatusOptions from '@salesforce/apex/LWC_CreateStudentCtrl.getLearningStatusOptions';
import createStudent from '@salesforce/apex/LWC_CreateStudentCtrl.createStudent';

export default class CreateStudent extends LightningElement {
    @track student = {
        Lastname__c: '',
        Firstname__c: '',
        Birthday__c: '',
        Gender__c: '',
        Class_look__c: '',
        LearningStatus__c: ''
    };

    @track genderOptions = [];
    @track classOptions = [];
    @track learningStatusOptions = [];

    @wire(getGenderOptions)
    wiredGenderOptions({ error, data }) {
        if (data) {
            this.genderOptions = data.map(item => ({
                label: item.picklistLabel,
                value: item.pickListValue
            }));
        } else if (error) {
            console.error("Error fetching gender options:", error);
        }
    }

    @wire(getClassOptions)
    wiredClassOptions({ error, data }) {
        if (data) {
            this.classOptions = data.map(item => ({
                label: item.picklistLabel,
                value: item.pickListValue
            }));
        } else if (error) {
            console.error("Error fetching class options:", error);
        }
    }

    @wire(getLearningStatusOptions)
    wiredLearningStatusOptions({ error, data }) {
        if (data) {
            this.learningStatusOptions = data.map(item => ({
                label: item.picklistLabel,
                value: item.pickListValue
            }));
        } else if (error) {
            console.error("Error fetching learning status options:", error);
        }
    }

    handleChange(event) {
        const field = event.target.name;
        this.student[field] = event.target.value;
    }

    handleSave() {
        const { Lastname__c, Firstname__c, Gender__c, Class_look__c, LearningStatus__c } = this.student;
        if (!Lastname__c || !Firstname__c || !Gender__c || !Class_look__c || !LearningStatus__c) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please fill all required fields.',
                    variant: 'error'
                })
            );
            return;
        }

        createStudent({ ...this.student })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Student record created successfully!',
                        variant: 'success'
                    })
                );
                this.closeModal();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body ? error.body.message : 'An error occurred.',
                        variant: 'error'
                    })
                );
            });
    }
}