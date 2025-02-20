import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createStudent from '@salesforce/apex/CMP_CreateStudentCtrl.createStudent';
import getClassOptions from '@salesforce/apex/CMP_CreateStudentCtrl.getClassOptions';
import getPicklistValues from '@salesforce/apex/CMP_CreateStudentCtrl.getPicklistValues';

export default class Lwc_CreateStudent extends LightningElement {
    @track student = {
        sobjectType: 'Student__c',
        Lastname__c: '',
        Firstname__c: '',
        Birthday__c: null,
        Gender__c: '',
        Class_look__c: '',
        LearningStatus__c: ''
    };
    @track errorMessages = {};
    @track classOptions = [];
    @track statusOptions = [];
    @track showSpinner = false;

    // Remove connectedCallback and replace with async init
    async connectedCallback() {
        try {
            await this.loadPicklistValues();
            await this.loadClassOptionsData();
        } catch (error) {
            this.handleError(error);
        }
    }

    // Add new method to load class options
    async loadClassOptionsData() {
        try {
            const result = await getClassOptions();
            this.classOptions = [
                { label: '--なし--', value: '' },
                ...result.map(opt => ({
                    label: opt.label,
                    value: opt.value
                }))
            ];
        } catch (error) {
            this.handleError(error);
        }
    }

    get genderOptions() {
        return [
            { label: '--なし--', value: '' },
            { label: '男性', value: 'Male' },
            { label: '女性', value: 'Female' }
        ];
    }

    async loadPicklistValues() {
        try {
            const result = await getPicklistValues({
                objectType: 'Student__c',
                fieldName: 'LearningStatus__c'
            });
            this.statusOptions = [
                { label: '--なし--', value: '' },
                ...result.map(opt => ({
                    label: opt.label,
                    value: opt.value
                }))
            ];
        } catch (error) {
            this.handleError(error);
        }
    }

    handleFieldChange(event) {
        const field = event.target;
        const fieldName = field.dataset.field;
        this.student[fieldName] = field.value;
        
        // Clear error message when field changes
        delete this.errorMessages[fieldName];
        this.errorMessages = { ...this.errorMessages };

        // Validate birthday immediately if changed
        if (fieldName === 'Birthday__c') {
            this.validateAge();
        }
    }

    validateAge() {
        if (this.student.Birthday__c) {
            const today = new Date();
            const birthDate = new Date(this.student.Birthday__c);
            let age = today.getFullYear() - birthDate.getFullYear();
            
            if (today.getMonth() < birthDate.getMonth() || 
                (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            if (birthDate > today) {
                this.errorMessages.Birthday__c = '生年月日は未来の日付にすることはできません。';
                return false;
            }
            
            if (age < 18) {
                this.errorMessages.Birthday__c = '学生は18歳以上である必要があります。';
                return false;
            }
        }
        return true;
    }

    validateFields() {
        let isValid = true;
        this.errorMessages = {};

        // Required field validation
        const requiredFields = {
            'Lastname__c': '姓',
            'Firstname__c': '名',
            'Birthday__c': '生年月日',
            'Gender__c': '性別',
            'Class_look__c': 'クラス',
            'LearningStatus__c': 'ステータス'
        };

        Object.entries(requiredFields).forEach(([field, label]) => {
            if (!this.student[field]) {
                this.errorMessages[field] = `${label}は必須です。`;
                isValid = false;
            }
        });

        // Age validation
        if (!this.validateAge()) {
            isValid = false;
        }

        return isValid;
    }

    async handleSave() {
        try {
            if (!this.validateFields()) {
                return;
            }

            this.showSpinner = true;
            const result = await createStudent({ student: this.student });
            
            this.showToast('Success', '学生が正常に作成されました。', 'success');
            this.dispatchEvent(new CustomEvent('refresh'));
            this.handleClose();

        } catch (error) {
            this.handleError(error);
        } finally {
            this.showSpinner = false;
        }
    }

    handleError(error) {
        console.error('Error:', error);
        const message = error.body?.message || error.message || '予期せぬエラーが発生しました。';
        this.showToast('Error', message, 'error');
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