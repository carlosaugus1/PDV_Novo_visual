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

    // 1. Carregar Configurações e Auth
    store.state.config = await DataService.getConfig();
    await AuthService.init();

    // 2. Inicializar Módulos de Dados (Async)
    try {
        uiUtils.toggleLoading(true); // Bloqueia tela enquanto carrega
        
        await Promise.all([
            ProductsModule.init(),
            SalesModule.loadHistory(), // Carrega dados, mas não liga eventos ainda
            OrdersModule.init(),
            ExpensesModule.init()
        ]);
        
        // 3. Inicializar Lógica de UI e Eventos (Sync)
        // AQUI ESTAVA O ERRO: Faltava iniciar o SalesModule para ligar os botões
        SalesModule.init(); 
        
        CartModule.init();
        AdminModule.init();
        uiUtils.bindPasswordModal();
        Shortcuts.init();

        // 4. Interface Final
        document.getElementById('current-date').textContent = new Date().toLocaleDateString('pt-BR');
        setupTabs();
        
        console.log('Sistema Pronto!');

    } catch (error) {
        console.error("Erro fatal:", error);
        uiUtils.notify('Erro ao carregar sistema', 'error');
    } finally {
        uiUtils.toggleLoading(false);
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
            
            if(id === 'historico') SalesModule.renderHistory();
            if(id === 'despesas') ExpensesModule.renderList();
        });
    });
}