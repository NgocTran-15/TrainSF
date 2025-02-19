import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createStudent from '@salesforce/apex/lwc_SearchStudentCtrl.createStudent';
import getClassOptions from '@salesforce/apex/lwc_SearchStudentCtrl.getClassOptions';
import getLearningStatusOptions from '@salesforce/apex/LWC_CreateStudentCtrl.getLearningStatusOptions';

export default class Lwc_CreateStudent extends LightningElement {
    @track lastName = '';
    @track firstName = '';
    @track birthDate = null;
    @track gender = '';
    @track classId = '';
    @track learningStatus = '';
    @track classOptions = [];
    @track learningStatusOptions = [];

    get genderOptions() {
        return [
            { label: '男性', value: 'Male' },
            { label: '女性', value: 'Female' }
        ];
    }

    @wire(getClassOptions)
    wiredClassOptions({ error, data }) {
        if (data) {
            this.classOptions = data;
        } else if (error) {
            this.showToast('Error', 'クラスオプションの読み込みに失敗しました。', 'error');
        }
    }

    @wire(getLearningStatusOptions)
    wiredLearningStatusOptions({ error, data }) {
        if (data) {
            this.learningStatusOptions = data;
        } else if (error) {
            this.showToast('Error', '学習状況オプションの読み込みに失敗しました。', 'error');
        }
    }

    handleFieldChange(event) {
        const field = event.target.label;
        const value = event.target.value;
        
        switch(field) {
            case '姓':
                this.lastName = value;
                break;
            case '名':
                this.firstName = value;
                break;
            case '生年月日':
                this.birthDate = value;
                break;
            case '性別':
                this.gender = value;
                break;
            case 'クラス':
                this.classId = value;
                break;
            case '学習状況':
                this.learningStatus = value;
                break;
        }
    }

    async handleSave() {
        if (!this.validateFields()) {
            return;
        }

        try {
            const studentData = {
                // Only include necessary fields, excluding StudentCode__c
                Lastname__c: this.lastName,
                Firstname__c: this.firstName,
                Birthday__c: this.birthDate,
                Gender__c: this.gender,
                Class_look__c: this.classId,
                LearningStatus__c: this.learningStatus
            };

            await createStudent({ studentData: studentData });
            this.showToast('Success', '学生が正常に作成されました。', 'success');
            this.dispatchEvent(new CustomEvent('refresh'));
            this.handleClose();
        } catch (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    validateFields() {
        const requiredFields = this.template.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value) {
                field.reportValidity();
                isValid = false;
            }
        });

        return isValid;
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}