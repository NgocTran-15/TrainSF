import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateStudent from '@salesforce/apex/lwc_SearchStudentCtrl.updateStudent';
import getClassOptions from '@salesforce/apex/lwc_SearchStudentCtrl.getClassOptions';

export default class Lwc_UpdateStudent extends LightningElement {
    @api recordId;
    @api student;

    @track studentCode = '';
    @track lastName = '';
    @track firstName = '';
    @track birthDate = null;
    @track gender = '';
    @track classId = '';
    @track learningStatus = '';
    @track classOptions = [];

    connectedCallback() {
        if (this.student) {
            this.studentCode = this.student.StudentCode__c;
            this.lastName = this.student.Lastname__c;
            this.firstName = this.student.Firstname__c;
            this.birthDate = this.student.Birthday__c;
            this.gender = this.student.Gender__c;
            this.classId = this.student.Class_look__c;
            this.learningStatus = this.student.LearningStatus__c;
        }
    }

    get genderOptions() {
        return [
            { label: '男性', value: 'Male' },
            { label: '女性', value: 'Female' }
        ];
    }

    get learningStatusOptions() {
        return [
            { label: '--なし--', value: '' },
            { label: '優秀', value: 'Excellent' },
            { label: '良い', value: 'Good' },
            { label: '普通', value: 'Average' },
            { label: '要努力', value: 'Poor' }
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

    handleFieldChange(event) {
        const field = event.target.label;
        const value = event.target.value;
        
        switch(field) {
            case '学生コード':
                this.studentCode = value;
                break;
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
                Id: this.recordId,
                StudentCode__c: this.studentCode,
                Lastname__c: this.lastName,
                Firstname__c: this.firstName,
                Birthday__c: this.birthDate,
                Gender__c: this.gender,
                Class_look__c: this.classId,
                LearningStatus__c: this.learningStatus
            };

            await updateStudent({ studentData: studentData });
            this.showToast('Success', '学生が正常に更新されました。', 'success');
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