import { store } from '../state/store.js';
import { DataService } from '../services/dataService.js';
import { uiUtils } from '../utils/uiUtils.js';

export const AdminModule = {
    init() {
        const acaiInput = document.getElementById('admin-acai-price');
        const sorveteInput = document.getElementById('admin-sorvete-price');
        
        if (acaiInput) acaiInput.value = store.state.config.açaíPricePerKg;
        if (sorveteInput) sorveteInput.value = store.state.config.sorvetePricePerKg;

        this.bindEvents();
    },

    updateBasePrices() {
        const newAcai = parseFloat(document.getElementById('admin-acai-price').value);
        const newSorvete = parseFloat(document.getElementById('admin-sorvete-price').value);
        
        store.state.config.açaíPricePerKg = newAcai;
        store.state.config.sorvetePricePerKg = newSorvete;
        
        DataService.save('appConfig', store.state.config);
        uiUtils.notify('Preços Atualizados', 'success');
        
        const p = store.state.ui.currentWeightedProduct === 'acai' ? newAcai : newSorvete;
        document.getElementById('weighted-product-price-display').textContent = p.toFixed(2);
    },

    generatePDF(type) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        let title = "", bodyData = [], headers = [], footer = [];
        
        if (type === 'daily') {
            const date = document.getElementById('history-date').value || store.state.ui.today;
            title = `Relatório Diário - ${date}`;
            headers = [['Hora', 'Itens', 'Total']];
            const sales = store.state.salesHistory[date] || [];
            let total = 0;
            sales.forEach(s => {
                total += s.total;
                bodyData.push([s.date.split(' ')[1], s.items.length, `R$ ${s.total.toFixed(2)}`]);
            });
            footer = [['', `TOTAL: R$ ${total.toFixed(2)}`]];
        }

        doc.setFontSize(18);
        doc.text("REVVO MILK", 14, 15);
        doc.setFontSize(12);
        doc.text(title, 14, 22);
        
        doc.autoTable({
            head: headers, body: bodyData, foot: footer, startY: 30, theme: 'grid'
        });
        
        doc.save(`${title}.pdf`);
    },

    bindEvents() {
        document.getElementById('save-base-prices').addEventListener('click', () => this.updateBasePrices());
        
        document.getElementById('generate-monthly-report').addEventListener('click', () => {
            uiUtils.requestPassword('report', () => this.generatePDF('monthly')); 
        });
        
        document.getElementById('export-daily-pdf').addEventListener('click', () => this.generatePDF('daily'));
    }
};