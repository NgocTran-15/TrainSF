import { LightningElement, track } from 'lwc';

export default class ScoreTable extends LightningElement {
    @track semesterData = [];
    totalCredits = 0;
    averageScore = 0;

    connectedCallback() {
        this.loadSampleData();
    }

    loadSampleData() {
        const mockData = [
            {
                id: 'sem1',
                name: '学期2, 2023 - 2024',
                subjects: [
                    { id: 'MH006', code: 'MH003', name: 'Natural Processing Language', credits: 4, progressScore: 10, practicalScore: 4, midtermScore: 3, finalScore: 3, averageScore: 3.80 },
                    { id: 'MH007', code: 'MH007', name: 'Calculus', credits: 2, progressScore: 3, practicalScore: 5, midtermScore: 3, finalScore: 6, averageScore: 5.20 },
                ],
                semesterAverage: 5.26
            },
            {
                id: 'sem2',
                name: '学期1, 2023 - 2024',
                subjects: [
                    { id: 'MH008', code: 'MH008', name: 'E-Commerce', credits: 3, progressScore: 9, practicalScore: 3, midtermScore: 3, finalScore: 3, averageScore: 3.60 }
                ],
                semesterAverage: 3.60
            }
        ];

        let totalCredits = 0;
        let totalScore = 0;
        let totalSubjects = 0;

        mockData.forEach(semester => {
            semester.subjects.forEach(subject => {
                totalCredits += subject.credits;
                totalScore += subject.averageScore;
                totalSubjects++;

                // Phân loại màu cho điểm trung bình
                subject.scoreClass = subject.averageScore < 4 ? 'low-score' : 'high-score';
            });
        });

        this.semesterData = mockData;
        this.totalCredits = totalCredits;
        this.averageScore = totalSubjects ? (totalScore / totalSubjects).toFixed(2) : 'N/A';
    }

    handleExportPDF() {
        console.log('Exporting to PDF...');
        // Chức năng xuất PDF có thể thêm vào sau
    }
}
