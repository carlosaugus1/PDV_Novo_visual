import { store } from '../state/store.js';
import { DataService } from '../services/dataService.js';
import { uiUtils } from '../utils/uiUtils.js';
import { Formatters } from '../utils/formatters.js';

export const ExpensesModule = {
    async init() {
        store.state.expenses = await DataService.load('expenses') || {};
        this.renderList();
        this.bindEvents();
    },

    async add() {
        const name = document.getElementById('new-expense-name').value;
        const val = parseFloat(document.getElementById('new-expense-value').value);
        if (!name || !val) return uiUtils.notify('Preencha os dados', 'error');
        
        const dateKey = store.state.ui.today;
        if (!store.state.expenses[dateKey]) store.state.expenses[dateKey] = [];
        
        store.state.expenses[dateKey].push({ id: Formatters.generateID(), name, value: val });
        await DataService.save('expenses', store.state.expenses);
        
        this.renderList();
        document.getElementById('new-expense-name').value = '';
        document.getElementById('new-expense-value').value = '';
    },

    renderList() {
        const date = document.getElementById('expense-date').value || store.state.ui.today;
        const list = document.getElementById('expenses-history-list');
        list.innerHTML = '';
        const exps = store.state.expenses[date] || [];
        
        let t = 0;
        exps.forEach(e => {
            t += e.value;
            list.innerHTML += `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:#fff; margin-bottom:5px; border-radius:10px;">
                <div>${e.name} - R$ ${e.value.toFixed(2)}</div>
            </div>`;
        });
        document.getElementById('expenses-total-today').textContent = `R$ ${t.toFixed(2)}`;
    },

    bindEvents() {
        document.getElementById('add-new-expense-btn').addEventListener('click', () => this.add());
        document.getElementById('expense-date').addEventListener('change', () => this.renderList());
    }
};