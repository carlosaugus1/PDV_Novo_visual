import { DataService } from './services/dataService.js';
import { AuthService } from './services/authService.js';
import { store } from './state/store.js';
import { uiUtils } from './utils/uiUtils.js';
import { Shortcuts } from './utils/shortcuts.js';

import { ProductsModule } from './modules/products.js';
import { CartModule } from './modules/cart.js';
import { SalesModule } from './modules/sales.js';
import { OrdersModule } from './modules/orders.js';
import { ExpensesModule } from './modules/expenses.js';
import { AdminModule } from './modules/admin.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Sistema Revvo Milk Iniciando...');

    // 1. Carregar Configs
    store.state.config = await DataService.getConfig();
    
    // 2. Auth
    await AuthService.init();

    // 3. Inicializar Módulos
    try {
        await Promise.all([
            ProductsModule.init(),
            SalesModule.loadHistory(),
            OrdersModule.init(),
            ExpensesModule.init()
        ]);
        
        CartModule.init();
        AdminModule.init();
        uiUtils.bindPasswordModal();
        Shortcuts.init(); // Inicia os atalhos de teclado (F2, F4, ESC)

        // Data Topo
        document.getElementById('current-date').textContent = new Date().toLocaleDateString('pt-BR');
        
        setupTabs();

    } catch (error) {
        console.error(error);
        uiUtils.notify('Erro ao carregar sistema', 'error');
    }
});

function setupTabs() {
    const navs = document.querySelectorAll('.nav-item');
    navs.forEach(nav => {
        nav.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            nav.classList.add('active');
            const id = nav.dataset.tab;
            document.getElementById(`${id}-tab`).classList.add('active');
            
            // Refreshes específicos
            if(id === 'historico') SalesModule.renderHistory();
            if(id === 'despesas') ExpensesModule.renderList();
        });
    });
}