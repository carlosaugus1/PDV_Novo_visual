import { store } from '../state/store.js';
import { DataService } from '../services/dataService.js';
import { uiUtils } from '../utils/uiUtils.js';
import { CartModule } from './cart.js';
import { SalesModule } from './sales.js';
import { Formatters } from '../utils/formatters.js';

export const OrdersModule = {
    async init() {
        store.state.openOrders = await DataService.load('openOrders') || [];
        this.renderGrid();
        this.bindEvents();
    },

    renderGrid() {
        const grid = document.getElementById('open-orders-grid');
        grid.innerHTML = '';
        
        const badge = document.getElementById('open-orders-count');
        badge.textContent = store.state.openOrders.length;
        badge.style.display = store.state.openOrders.length > 0 ? 'inline-block' : 'none';

        store.state.openOrders.forEach(o => {
            const div = document.createElement('div');
            div.className = 'prod-card open-order-card';
            div.style.cssText = "padding:15px; height:auto; cursor:pointer;";
            div.innerHTML = `<h4>${o.customerName}</h4><div style="color:var(--primary); font-weight:bold; font-size:1.2rem;">R$ ${o.total.toFixed(2)}</div>`;
            div.addEventListener('click', () => this.openDetails(o.id));
            grid.appendChild(div);
        });
    },

    openDetails(id) {
        const o = store.state.openOrders.find(x => x.id === id);
        if(!o) return;
        store.state.ui.tempOpenOrder = o;
        
        document.getElementById('open-order-title').textContent = o.customerName;
        document.getElementById('open-order-total').textContent = `R$ ${o.total.toFixed(2)}`;
        
        const list = document.getElementById('open-order-items-list');
        list.innerHTML = o.items.map(i => `<div style="display:flex; justify-content:space-between; padding:5px; border-bottom:1px dashed #eee;"><span>${i.name}</span><span>${i.totalPrice.toFixed(2)}</span></div>`).join('');
        
        uiUtils.openModal('open-order-modal');
    },

    async saveHoldSale() {
        const name = document.getElementById('customer-name').value;
        const existId = document.getElementById('existing-order-select').value;
        const sub = store.state.cart.reduce((s, i) => s + i.totalPrice, 0);

        if (existId) {
            const order = store.state.openOrders.find(o => o.id == existId);
            order.items.push(...store.state.cart);
            order.total += sub;
            uiUtils.notify('Itens adicionados', 'success');
        } else {
            if (!name) return uiUtils.notify('Digite um nome', 'error');
            store.state.openOrders.push({
                id: Formatters.generateID(), 
                customerName: name, 
                items: [...store.state.cart], 
                total: sub,
                deliveryInfo: { mode: store.state.ui.deliveryMode, fee: 0 }
            });
            uiUtils.notify('Comanda criada', 'success');
        }
        await DataService.save('openOrders', store.state.openOrders);
        this.renderGrid();
        SalesModule.resetUI();
        uiUtils.closeModal('hold-sale-modal');
    },

    async closeOrder(id) {
        store.state.openOrders = store.state.openOrders.filter(o => o.id !== id);
        await DataService.save('openOrders', store.state.openOrders);
        this.renderGrid();
    },

    loadToCart() {
        const order = store.state.ui.tempOpenOrder;
        store.state.cart = [...order.items];
        store.state.ui.editingOrderId = order.id;
        
        uiUtils.closeModal('open-order-modal');
        document.querySelector('[data-tab="venda"]').click();
        
        document.getElementById('edit-mode-bar').style.display = 'flex';
        document.getElementById('edit-mode-name').textContent = order.customerName;
        CartModule.render();
    },

    bindEvents() {
        document.getElementById('hold-sale').addEventListener('click', () => {
            if (store.state.cart.length === 0) return uiUtils.notify('Carrinho Vazio', 'error');
            const sel = document.getElementById('existing-order-select');
            sel.innerHTML = '<option value="">-- Nova Comanda --</option>';
            store.state.openOrders.forEach(o => sel.innerHTML += `<option value="${o.id}">${o.customerName} (R$ ${o.total.toFixed(2)})</option>`);
            uiUtils.openModal('hold-sale-modal');
        });

        document.getElementById('save-hold-sale-btn').addEventListener('click', () => this.saveHoldSale());
        document.getElementById('close-hold-sale-btn').addEventListener('click', () => uiUtils.closeModal('hold-sale-modal'));
        document.getElementById('add-cart-to-open-order-btn').addEventListener('click', () => this.loadToCart());
        document.getElementById('close-open-order-btn').addEventListener('click', () => uiUtils.closeModal('open-order-modal'));
        document.getElementById('cancel-edit-mode').addEventListener('click', () => {
             if(confirm('Cancelar edição? O carrinho será limpo.')) SalesModule.resetUI();
        });
    }
};