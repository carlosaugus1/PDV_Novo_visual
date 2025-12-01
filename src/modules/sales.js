import { store } from '../state/store.js';
import { DataService } from '../services/dataService.js';
import { uiUtils } from '../utils/uiUtils.js';
import { CartModule } from './cart.js';
import { Settings } from '../config/settings.js';
import { Formatters } from '../utils/formatters.js';

export const SalesModule = {
    // Carrega dados do localStorage
    async loadHistory() {
        store.state.salesHistory = await DataService.load('salesHistory') || {};
        this.renderHistory();
    },

    // Liga os botões da tela
    init() {
        this.bindEvents();
    },

    async confirmPayment() {
        // Validações Básicas
        if (!store.state.ui.currentPaymentMethod) {
            return uiUtils.notify('Selecione uma forma de Pagamento', 'error');
        }

        if (store.state.cart.length === 0) {
            return uiUtils.notify('Carrinho vazio', 'error');
        }

        // Cálculos
        const sub = store.state.cart.reduce((a, b) => a + b.totalPrice, 0);
        const fee = (store.state.ui.deliveryMode === 'entrega') ? (parseFloat(document.getElementById('delivery-fee').value) || 0) : 0;
        const total = sub + fee;
        const cashVal = parseFloat(document.getElementById('cash-received').value) || 0;

        // Validação de Dinheiro
        if (store.state.ui.currentPaymentMethod === 'cash' && cashVal < total) {
            return uiUtils.notify('Valor recebido insuficiente', 'error');
        }

        // Inicia Processamento
        uiUtils.toggleLoading(true);

        const sale = {
            id: Formatters.generateID(),
            date: new Date().toLocaleString('pt-BR'),
            dateKey: store.state.ui.today,
            items: [...store.state.cart],
            total,
            subtotal: sub,
            paymentMethod: store.state.ui.currentPaymentMethod,
            cashReceived: cashVal,
            change: (store.state.ui.currentPaymentMethod === 'cash') ? (cashVal - total) : 0,
            deliveryInfo: fee > 0 ? {
                name: document.getElementById('delivery-customer-name').value,
                address: document.getElementById('delivery-customer-address').value,
                fee: fee
            } : null
        };

        // Se veio de comanda, fecha a comanda original
        if (store.state.ui.editingOrderId) {
            try {
                // Importação dinâmica para evitar ciclo de dependência
                const { OrdersModule } = await import('./orders.js');
                await OrdersModule.closeOrder(store.state.ui.editingOrderId);
                sale.isFromComanda = true;
            } catch (e) {
                console.error("Erro ao fechar comanda:", e);
            }
        }

        // Salvar no Histórico
        if (!store.state.salesHistory[store.state.ui.today]) {
            store.state.salesHistory[store.state.ui.today] = [];
        }
        store.state.salesHistory[store.state.ui.today].unshift(sale);
        
        await DataService.save('salesHistory', store.state.salesHistory);

        // Finalização UI
        this.printThermalReceipt(sale);
        this.resetUI();
        this.renderHistory();
        
        uiUtils.toggleLoading(false);
        uiUtils.notify('Venda Finalizada com Sucesso!', 'success');
    },

    printThermalReceipt(sale) {
        const win = window.open('', '', 'width=300,height=600');
        
        let itemsHtml = sale.items.map(item => {
            const extra = item.weightGrams ? `(${item.weightGrams}g)` : '';
            return `<div class="line"><span>${item.name} ${extra}</span><span>${item.totalPrice.toFixed(2)}</span></div>`;
        }).join('');

        const methodPT = Settings.paymentMap[sale.paymentMethod] || sale.paymentMethod;
        
        const deliveryHtml = sale.deliveryInfo ? `
            <div class="divider"></div>
            <div class="center">*** ENTREGA ***</div>
            <div>${sale.deliveryInfo.name || 'Cliente'}</div>
            <div>${sale.deliveryInfo.address || '-'}</div>
        ` : '';

        const html = `
        <html>
        <head>
            <title>Recibo</title>
            <style>
                body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 5px; width: 58mm; color: #000; font-weight: bold; }
                .center { text-align: center; }
                .line { display: flex; justify-content: space-between; margin-bottom: 2px; }
                .divider { border-top: 2px solid #000; margin: 5px 0; }
                .big { font-size: 14px; font-weight: 800; }
            </style>
        </head>
        <body>
            <div class="center">
                <div class="big">REVVO MILK</div>
                <div>Guaraciaba do Norte - CE</div>
            </div>
            <div class="divider"></div>
            <div>Data: ${sale.date}</div>
            <div class="divider"></div>
            ${itemsHtml}
            ${sale.deliveryInfo ? `<div class="line"><span>Taxa Entrega</span><span>${sale.deliveryInfo.fee.toFixed(2)}</span></div>` : ''}
            <div class="divider"></div>
            <div class="line big"><span>TOTAL</span><span>R$ ${sale.total.toFixed(2)}</span></div>
            <div class="line"><span>Pagamento</span><span>${methodPT.toUpperCase()}</span></div>
            ${sale.change > 0 ? `<div class="line"><span>Troco</span><span>${sale.change.toFixed(2)}</span></div>` : ''}
            ${deliveryHtml}
            <div class="divider"></div>
            <div class="center">Obrigado pela preferência!</div>
            <script>
                window.onload = function() { 
                    window.print(); 
                    setTimeout(() => window.close(), 500); 
                }
            </script>
        </body>
        </html>`;
        
        win.document.write(html);
        win.document.close();
    },

    renderHistory() {
        const date = document.getElementById('history-date').value || store.state.ui.today;
        const list = document.getElementById('sales-history');
        if(!list) return;
        
        list.innerHTML = '';
        const sales = store.state.salesHistory[date] || [];
        let t = 0;
        
        if (sales.length === 0) list.innerHTML = '<div style="padding:15px; color:#888;">Sem vendas nesta data.</div>';
        
        sales.forEach(s => {
            t += s.total;
            const methodPT = Settings.paymentMap[s.paymentMethod] || s.paymentMethod;
            // Cria elemento DOM para facilitar eventos futuros (como reprint)
            const div = document.createElement('div');
            div.className = 'sale-card';
            div.style.cssText = "margin-bottom:10px; padding:10px; border:1px solid #eee; border-radius:8px; display:flex; justify-content:space-between; align-items:center; background:white;";
            div.innerHTML = `
                <div>
                    <strong>R$ ${s.total.toFixed(2)}</strong><br>
                    <small>${s.date.split(' ')[1]} - ${methodPT}</small>
                </div>
                <button class="btn-sec" style="padding:5px 10px; font-size:0.8rem;">📄</button>
            `;
            // Botão rápido de reprint
            div.querySelector('button').addEventListener('click', () => this.printThermalReceipt(s));
            list.appendChild(div);
        });
        
        const totalEl = document.getElementById('history-grand-total');
        if(totalEl) totalEl.textContent = `R$ ${t.toFixed(2)}`;
    },

    resetUI() {
        store.state.cart = [];
        store.state.ui.currentPaymentMethod = null;
        store.state.ui.editingOrderId = null;
        
        const editBar = document.getElementById('edit-mode-bar');
        if(editBar) editBar.style.display = 'none';
        
        const cashInput = document.getElementById('cash-received');
        if(cashInput) cashInput.value = '';
        
        const changeDisplay = document.getElementById('change-amount');
        if(changeDisplay) changeDisplay.textContent = '0.00';

        document.getElementById('delivery-customer-name').value = '';
        document.getElementById('delivery-customer-address').value = '';
        
        document.getElementById('pre-payment-actions').style.display = 'block';
        document.getElementById('payment-section').style.display = 'none';
        
        document.querySelectorAll('.pay-opt').forEach(m => m.classList.remove('selected'));
        
        CartModule.render();
    },

    bindEvents() {
        // Botão "FINALIZAR VENDA" (Vai para a tela de pagamento)
        const finishBtn = document.getElementById('finish-sale');
        if (finishBtn) {
            finishBtn.addEventListener('click', () => {
                if (store.state.cart.length === 0) return uiUtils.notify('Carrinho vazio', 'error');
                document.getElementById('pre-payment-actions').style.display = 'none';
                document.getElementById('payment-section').style.display = 'block';
                // Rola para baixo para ver as opções
                const cartContainer = document.querySelector('.cart-list');
                if(cartContainer) cartContainer.scrollTop = cartContainer.scrollHeight;
            });
        }

        // Botão "Voltar"
        const backBtn = document.getElementById('back-to-cart');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                document.getElementById('pre-payment-actions').style.display = 'block';
                document.getElementById('payment-section').style.display = 'none';
                store.state.ui.currentPaymentMethod = null;
                document.getElementById('cash-input').style.display = 'none';
                document.querySelectorAll('.pay-opt').forEach(m => m.classList.remove('selected'));
            });
        }

        // Seleção de Pagamento (Dinheiro, Cartão, PIX)
        const paymentOptions = document.getElementById('main-payment-options');
        if (paymentOptions) {
            paymentOptions.addEventListener('click', (e) => {
                const opt = e.target.closest('.pay-opt');
                if (opt) {
                    document.querySelectorAll('#main-payment-options .pay-opt').forEach(m => m.classList.remove('selected'));
                    opt.classList.add('selected');
                    store.state.ui.currentPaymentMethod = opt.dataset.method;
                    
                    const cashInputDiv = document.getElementById('cash-input');
                    cashInputDiv.style.display = opt.dataset.method === 'cash' ? 'block' : 'none';
                    
                    // Foca no input de dinheiro se selecionado
                    if(opt.dataset.method === 'cash') {
                        setTimeout(() => document.getElementById('cash-received').focus(), 100);
                    }
                }
            });
        }

        // Botão Final "CONFIRMAR E IMPRIMIR"
        const confirmBtn = document.getElementById('confirm-payment');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirmPayment());
        }
        
        // Cálculo de Troco
        const cashInput = document.getElementById('cash-received');
        if (cashInput) {
            cashInput.addEventListener('input', (e) => {
                const received = parseFloat(e.target.value) || 0;
                const sub = store.state.cart.reduce((a, b) => a + b.totalPrice, 0);
                const fee = (store.state.ui.deliveryMode === 'entrega') ? (parseFloat(document.getElementById('delivery-fee').value) || 0) : 0;
                const total = sub + fee;
                document.getElementById('change-amount').textContent = (received - total).toFixed(2);
            });
        }

        // Filtro de Data do Histórico
        const historyDate = document.getElementById('history-date');
        if (historyDate) {
            historyDate.addEventListener('change', () => this.renderHistory());
        }
    }
};