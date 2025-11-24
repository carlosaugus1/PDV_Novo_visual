document.addEventListener('DOMContentLoaded', () => {
    const App = {
        state: {
            cart: [],
            manualSaleCart: [],
            salesHistory: {},
            expenses: {}, 
            openOrders: [], 
            products: [
                { id: 1, name: "Água", price: 3.00, category: "Bebidas", image: "" }, 
                { id: 2, name: "Água com Gás", price: 3.50, category: "Bebidas", image: "" },

            ],
            config: {
                açaíPricePerKg: 43.90,
                sorvetePricePerKg: 43.90, 
                deletePassword: '1015',
            },
            discount: { active: false, percentage: 10, targets: { acai: false, sorvete: false } },
            ui: {
                currentWeightedProduct: 'acai', 
                currentPaymentMethod: null,
                manualSalePaymentMethod: null,
                openOrderPaymentMethod: null,
                deliveryMode: 'balcao', 
                isAdminLoggedIn: false,
                today: new Date().toISOString().split('T')[0],
                tempOpenOrder: null,
                saleToDelete: null,
                expenseToDelete: null,
                lastSale: null
            }
        },
        
        DOM: {},

        init() {
            this.cacheDOM();
            this.storage.load();
            this.checkThursdayDiscount();
            this.bindEvents();
            this.render.all();
            this.render.discountControls();
            
            // Inicia na aba Venda
            this.handlers.switchTab('venda');
        },

        checkThursdayDiscount() {
            const isThursday = new Date().getDay() === 4;
            if (isThursday && !sessionStorage.getItem('discountChecked')) {
                this.state.discount.active = true;
                this.state.discount.targets.acai = true;
                sessionStorage.setItem('discountChecked', 'true');
            }
        },

        cacheDOM() {
            // Lista completa de IDs usados no HTML novo
            const ids = [
                'current-date', 'page-title',
                'weight-input', 'add-to-cart', 'calculated-price', 'weighted-product-price-display',
                'cart-items', 'subtotal', 'total', 'finish-sale', 'confirm-payment', 
                'cash-input', 'cash-received', 'change-amount',
                'delivery-mode-selector', 'delivery-info-section', 'delivery-customer-name', 
                'delivery-customer-address', 'delivery-fee',
                'product-search', 'products-categories-list', 'products-grid',
                'open-orders-grid', 'open-orders-count',
                'history-date', 'sales-history', 'history-summary', 'history-products-total', 
                'history-delivery-total', 'history-expenses-total', 'history-grand-total',
                'new-expense-name', 'new-expense-desc', 'new-expense-value', 'add-new-expense-btn', 
                'expense-date', 'expenses-history-list', 'expenses-total-today',
                'discount-active-check', 'discount-config-area', 'discount-percentage', 
                'discount-target-acai', 'discount-target-sorvete', 'save-discount-config', 'discount-balloon', 'discount-details',
                'login-section', 'admin-controls-panel', 'username', 'password', 'login-btn', 'logout-btn',
                'acai-price', 'sorvete-price', 'update-acai-price', 'update-sorvete-price', 
                'new-product-name', 'new-product-price', 'new-product-category', 'add-new-product-btn', 
                'products-management',
                'hold-sale', 'hold-sale-modal', 'customer-name', 'existing-order-select', 'save-hold-sale-btn', 'close-hold-sale-btn',
                'manual-sale-modal', 'manual-product-select', 'manual-acai-weight-section', 'manual-acai-weight', 
                'manual-add-item-btn', 'manual-sale-cart-items', 'manual-sale-total', 'save-manual-sale-btn', 'close-manual-sale-btn',
                'open-order-modal', 'open-order-title', 'open-order-timer', 'open-order-items-list', 'open-order-total',
                'open-order-cash-input', 'open-order-cash-received', 'open-order-change-amount', 
                'confirm-open-order-payment', 'close-open-order-btn',
                'receipt-modal', 'receipt-content', 'print-receipt-btn', 'close-receipt-btn',
                'password-modal', 'confirm-delete-password', 'confirm-delete', 'cancel-delete', 'notification'
            ];
            
            ids.forEach(id => {
                const el = document.getElementById(id);
                if(el) this.DOM[id] = el;
            });
        },

        bindEvents() {
            // Navegação Abas
            document.querySelectorAll('.nav-item').forEach(nav => {
                nav.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Encontra o elemento com o dataset, caso clique no icone
                    const target = e.currentTarget; 
                    const tab = target.dataset.tab;
                    if(tab) this.handlers.switchTab(tab);
                });
            });

            // Venda Principal (Pesagem)
            if(this.DOM['weight-input']) {
                this.DOM['weight-input'].addEventListener('input', (e) => this.handlers.calculateWeightedPrice(e));
                this.DOM['add-to-cart'].addEventListener('click', () => this.handlers.addWeightedProductToCart());
            }

            // Seleção Tipo Açaí/Sorvete
            document.querySelectorAll('.type-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    this.handlers.selectWeightedProduct(e.currentTarget.dataset.type);
                });
            });

            // Botões Rápidos (Delegação de Evento para funcionar com elementos criados dinamicamente)
            document.addEventListener('click', (e) => {
                // Adicionar Produto Rápido
                const quickBtn = e.target.closest('.quick-chip');
                if (quickBtn) {
                    const id = parseInt(quickBtn.dataset.id);
                    const prod = this.state.products.find(p => p.id === id);
                    if(prod) this.handlers.addProductToCart(prod);
                }
                
                // Remover do Carrinho
                const removeBtn = e.target.closest('.remove-item');
                if(removeBtn) {
                    this.handlers.removeFromCart(removeBtn.dataset.index);
                }

                // Excluir Item Histórico
                const trashBtn = e.target.closest('.icon-trash');
                if(trashBtn) {
                    this.handlers.requestDeleteSale(trashBtn.dataset.id, trashBtn.dataset.date);
                }
                
                // Excluir Despesa
                if(e.target.classList.contains('delete-expense')) {
                     this.handlers.requestDeleteExpense(e.target.dataset.id, e.target.dataset.date);
                }

                // Reimprimir
                const printBtn = e.target.closest('.icon-print');
                if(printBtn) {
                    this.handlers.reprintSale(printBtn.dataset.id, printBtn.dataset.date);
                }
            });

            // Carrinho - Ações
            this.DOM['finish-sale'].addEventListener('click', () => this.handlers.preparePayment());
            document.getElementById('cancel-sale').addEventListener('click', () => this.handlers.cancelSale());
            
            // Pagamento - Seleção
            document.querySelectorAll('.pay-opt').forEach(el => {
                el.addEventListener('click', (e) => {
                    const container = e.currentTarget.parentElement.id;
                    const method = e.currentTarget.dataset.method;
                    
                    // Remove selected apenas deste container
                    document.querySelectorAll(`#${container} .pay-opt`).forEach(m => m.classList.remove('selected'));
                    e.currentTarget.classList.add('selected');

                    if(container === 'manual-payment-options') this.state.ui.manualSalePaymentMethod = method;
                    else if(container === 'open-order-payment-options') this.handlers.selectOpenOrderPaymentMethod(method);
                    else this.handlers.selectPaymentMethod(method);
                });
            });

            this.DOM['confirm-payment'].addEventListener('click', () => this.handlers.confirmPayment());
            this.DOM['cash-received'].addEventListener('input', () => this.handlers.calculateChange());

            // Toggle Entrega
            document.querySelectorAll('.toggle-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.handlers.selectDeliveryMode(e.currentTarget.dataset.mode);
                });
            });

            // Comandas
            this.DOM['hold-sale'].addEventListener('click', () => this.handlers.requestHoldSale());
            this.DOM['save-hold-sale-btn'].addEventListener('click', () => this.handlers.saveHoldSale());
            this.DOM['close-hold-sale-btn'].addEventListener('click', () => this.utils.closeModal('hold-sale-modal'));
            
            // Abrir Comanda Grid
            this.DOM['open-orders-grid'].addEventListener('click', (e) => {
                const card = e.target.closest('.open-order-card'); // Usa closest para pegar o card mesmo clicando no texto
                if(card) this.handlers.openOrderDetails(parseInt(card.dataset.id));
            });
            
            this.DOM['close-open-order-btn'].addEventListener('click', () => this.utils.closeModal('open-order-modal'));
            this.DOM['confirm-open-order-payment'].addEventListener('click', () => this.handlers.finalizeOpenOrderPayment());
            this.DOM['open-order-cash-received'].addEventListener('input', () => {
                const val = parseFloat(this.DOM['open-order-cash-received'].value) || 0;
                const total = this.state.ui.tempOpenOrder.total;
                this.DOM['open-order-change-amount'].textContent = (val - total).toFixed(2);
            });

            // Manual Sale
            document.getElementById('add-manual-sale-btn').addEventListener('click', () => this.handlers.openManualSaleModal());
            this.DOM['close-manual-sale-btn'].addEventListener('click', () => this.utils.closeModal('manual-sale-modal'));
            this.DOM['manual-add-item-btn'].addEventListener('click', () => this.handlers.addManualItem());
            this.DOM['save-manual-sale-btn'].addEventListener('click', () => this.handlers.saveManualSale());
            this.DOM['manual-product-select'].addEventListener('change', (e) => {
                 const isWeight = e.target.value.includes('_kg');
                 this.DOM['manual-acai-weight-section'].style.display = isWeight ? 'block' : 'none';
            });

            // Despesas
            this.DOM['add-new-expense-btn'].addEventListener('click', () => this.handlers.addNewExpense());
            this.DOM['expense-date'].addEventListener('change', (e) => this.render.expenses(e.target.value));

            // Admin e Outros
            this.DOM['discount-active-check'].addEventListener('change', (e) => {
                const area = this.DOM['discount-config-area'];
                if(e.target.checked) { area.style.opacity = '1'; area.style.pointerEvents = 'all'; } 
                else { area.style.opacity = '0.5'; area.style.pointerEvents = 'none'; }
            });
            this.DOM['save-discount-config'].addEventListener('click', () => this.handlers.saveDiscountConfig());
            this.DOM['login-btn'].addEventListener('click', () => this.handlers.login());
            this.DOM['logout-btn'].addEventListener('click', () => this.handlers.logout());
            this.DOM['product-search'].addEventListener('input', () => this.render.products());
            this.DOM['history-date'].addEventListener('change', (e) => this.render.history(e.target.value));
            
            // Sub-abas Admin
            document.querySelectorAll('.admin-sub-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    document.querySelectorAll('.admin-sub-tab').forEach(t => {
                        t.classList.remove('active');
                        t.style.borderBottom = 'none';
                        t.style.color = 'var(--text-light)';
                    });
                    e.currentTarget.classList.add('active');
                    e.currentTarget.style.borderBottom = '2px solid var(--primary)';
                    e.currentTarget.style.color = 'var(--primary)';
                    
                    document.querySelectorAll('.admin-sub-content').forEach(c => c.style.display = 'none');
                    document.getElementById(`admin-${e.currentTarget.dataset.subtab}-content`).style.display = 'block';
                });
            });

            // Modais Genéricos
            this.DOM['close-receipt-btn'].addEventListener('click', () => this.utils.closeModal('receipt-modal'));
            this.DOM['print-receipt-btn'].addEventListener('click', () => this.handlers.printReceipt(this.state.ui.lastSale));
            this.DOM['cancel-delete'].addEventListener('click', () => {
                this.utils.closeModal('password-modal');
                this.DOM['confirm-delete-password'].value = '';
            });
            this.DOM['confirm-delete'].addEventListener('click', () => this.handlers.confirmDelete());
        },

        handlers: {
            switchTab(tabName) {
                // Visual Abas
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                const nav = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
                if(nav) nav.classList.add('active');

                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                const pane = document.getElementById(`${tabName}-tab`);
                if(pane) pane.classList.add('active');

                // Atualiza Título
                const titles = { 'venda': 'Nova Venda', 'produtos': 'Catálogo', 'comandas': 'Comandas', 'historico': 'Histórico', 'despesas': 'Despesas', 'admin': 'Administrativo' };
                if(this.DOM['page-title']) this.DOM['page-title'].textContent = titles[tabName] || 'PDV';

                if(tabName === 'despesas') App.render.expenses(this.state.ui.today);
            },

            // --- Venda ---
            selectWeightedProduct(type) {
                this.state.ui.currentWeightedProduct = type;
                this.render.weightedProductPrice();
            },
            calculateWeightedPrice(e) {
                const weight = parseFloat(e.target.value) || 0;
                const priceKg = this.state.ui.currentWeightedProduct === 'acai' ? this.state.config.açaíPricePerKg : this.state.config.sorvetePricePerKg;
                this.DOM['calculated-price'].textContent = ((weight/1000) * priceKg).toFixed(2);
            },
            addWeightedProductToCart() {
                const weight = parseFloat(this.DOM['weight-input'].value);
                if (!weight || weight <= 0) return this.utils.notify('Digite um peso válido!', 'error');
                
                const type = this.state.ui.currentWeightedProduct;
                const pricePerKg = type === 'acai' ? this.state.config.açaíPricePerKg : this.state.config.sorvetePricePerKg;
                const name = type === 'acai' ? 'Açaí (KG)' : 'Sorvete (KG)';
                
                let finalPrice = (weight / 1000) * pricePerKg;
                let discountInfo = null;

                if (this.state.discount.active && this.state.discount.targets[type]) {
                    const valDesc = (finalPrice * this.state.discount.percentage) / 100;
                    finalPrice -= valDesc;
                    discountInfo = { percentage: this.state.discount.percentage, amount: valDesc };
                }

                this.state.cart.push({ id: Date.now(), name, pricePerKg, weightGrams: weight, totalPrice: finalPrice, discountInfo, type: "weight" });
                this.render.cart();
                this.DOM['weight-input'].value = '';
                this.DOM['calculated-price'].textContent = '0.00';
                this.utils.notify('Item adicionado!', 'success');
            },
            addProductToCart(product) {
                this.state.cart.push({ id: Date.now(), name: product.name, totalPrice: product.price, type: "product" });
                this.render.cart();
                this.utils.notify(`${product.name} adicionado`, 'success');
            },
            removeFromCart(index) {
                this.state.cart.splice(index, 1);
                this.render.cart();
            },

            // --- Pagamento e Entrega ---
            selectDeliveryMode(mode) {
                this.state.ui.deliveryMode = mode;
                document.querySelectorAll('.toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
                // Animação de entrada
                const infoSection = this.DOM['delivery-info-section'];
                if(mode === 'entrega') {
                    infoSection.style.display = 'block';
                } else {
                    infoSection.style.display = 'none';
                }
                this.render.cart();
            },
            preparePayment() {
                if(this.state.cart.length === 0) return this.utils.notify('Carrinho vazio!', 'error');
                this.DOM['confirm-payment'].style.display = 'block';
                this.DOM['finish-sale'].style.display = 'none';
                // Scroll suave para baixo no carrinho
                const cartList = document.querySelector('.cart-list');
                cartList.scrollTop = cartList.scrollHeight;
            },
            selectPaymentMethod(method) {
                this.state.ui.currentPaymentMethod = method;
                this.DOM['cash-input'].style.display = method === 'cash' ? 'block' : 'none';
            },
            calculateChange() {
                const received = parseFloat(this.DOM['cash-received'].value) || 0;
                const total = parseFloat(this.DOM['total'].textContent.replace('R$ ', '').replace(',', '.'));
                const change = received - total;
                this.DOM['change-amount'].textContent = change > 0 ? change.toFixed(2) : '0.00';
            },
            confirmPayment() {
                const { cart, ui } = this.state;
                if(!ui.currentPaymentMethod) return this.utils.notify('Selecione o pagamento', 'error');
                
                const subtotal = cart.reduce((acc, i) => acc + i.totalPrice, 0);
                const fee = ui.deliveryMode === 'entrega' ? (parseFloat(this.DOM['delivery-fee'].value)||0) : 0;
                const total = subtotal + fee;

                let cashReceived = 0;
                let change = 0;
                if(ui.currentPaymentMethod === 'cash') {
                    cashReceived = parseFloat(this.DOM['cash-received'].value) || 0;
                    if(cashReceived < total) return this.utils.notify('Valor insuficiente!', 'error');
                    change = cashReceived - total;
                }

                const sale = {
                    id: Date.now(),
                    date: new Date().toLocaleString('pt-BR'),
                    dateKey: ui.today,
                    items: [...cart],
                    total,
                    paymentMethod: ui.currentPaymentMethod,
                    cashReceived,
                    change,
                    deliveryInfo: { mode: ui.deliveryMode, name: this.DOM['delivery-customer-name'].value, address: this.DOM['delivery-customer-address'].value, fee }
                };

                if(!this.state.salesHistory[ui.today]) this.state.salesHistory[ui.today] = [];
                this.state.salesHistory[ui.today].unshift(sale);
                this.storage.saveSalesHistory();

                this.utils.notify('Venda Finalizada!', 'success');
                this.state.ui.lastSale = sale;
                this.handlers.resetSale();
                this.utils.showReceiptModal(sale);
            },
            resetSale() {
                this.state.cart = [];
                this.state.ui.currentPaymentMethod = null;
                this.DOM['cash-received'].value = '';
                this.DOM['confirm-payment'].style.display = 'none';
                this.DOM['finish-sale'].style.display = 'block';
                this.DOM['cash-input'].style.display = 'none';
                document.querySelectorAll('.pay-opt').forEach(m => m.classList.remove('selected'));
                this.render.cart();
            },
            cancelSale() { if(confirm('Esvaziar carrinho?')) this.handlers.resetSale(); },

            // --- Comandas ---
            requestHoldSale() {
                if(this.state.cart.length === 0) return this.utils.notify('Carrinho vazio', 'error');
                const select = this.DOM['existing-order-select'];
                select.innerHTML = '<option value="new">-- Nova Comanda --</option>';
                this.state.openOrders.forEach(o => select.innerHTML += `<option value="${o.id}">${o.customerName}</option>`);
                this.utils.openModal('hold-sale-modal');
            },
            saveHoldSale() {
                const name = document.getElementById('customer-name').value;
                const orderId = document.getElementById('existing-order-select').value;
                
                if(orderId === 'new' && !name) return this.utils.notify('Digite o nome!', 'error');

                if(orderId === 'new') {
                    const subtotal = this.state.cart.reduce((s,i)=>s+i.totalPrice, 0);
                    const fee = this.state.ui.deliveryMode === 'entrega' ? (parseFloat(this.DOM['delivery-fee'].value)||0) : 0;
                    this.state.openOrders.push({
                         id: Date.now(), customerName: name, items: [...this.state.cart], total: subtotal + fee,
                         createdAt: new Date(), deliveryInfo: { mode: this.state.ui.deliveryMode, fee }
                    });
                } else {
                    const order = this.state.openOrders.find(o => o.id == orderId);
                    if(order) {
                        order.items.push(...this.state.cart);
                        order.total += this.state.cart.reduce((s,i)=>s+i.totalPrice,0);
                    }
                }
                this.storage.saveOpenOrders();
                this.render.openOrders();
                this.handlers.resetSale();
                this.utils.closeModal('hold-sale-modal');
                this.utils.notify('Comanda Salva', 'success');
            },
            openOrderDetails(id) {
                const order = this.state.openOrders.find(o => o.id === id);
                if(!order) return;
                this.state.ui.tempOpenOrder = order;
                document.getElementById('open-order-title').textContent = `Comanda: ${order.customerName}`;
                document.getElementById('open-order-total').textContent = `R$ ${order.total.toFixed(2)}`;
                
                const list = document.getElementById('open-order-items-list');
                list.innerHTML = order.items.map(i => `<div style="display:flex; justify-content:space-between; padding:5px; border-bottom:1px dashed #eee;"><span>${i.name}</span><span>R$ ${i.totalPrice.toFixed(2)}</span></div>`).join('');
                
                this.utils.openModal('open-order-modal');
            },
            selectOpenOrderPaymentMethod(method) {
                this.state.ui.openOrderPaymentMethod = method;
                document.getElementById('open-order-cash-input').style.display = method === 'cash' ? 'block' : 'none';
            },
            finalizeOpenOrderPayment() {
                if(!this.state.ui.openOrderPaymentMethod) return this.utils.notify('Selecione pagamento', 'error');
                const order = this.state.ui.tempOpenOrder;
                
                const sale = {
                    id: order.id, date: new Date().toLocaleString('pt-BR'), dateKey: this.state.ui.today,
                    items: order.items, total: order.total, paymentMethod: this.state.ui.openOrderPaymentMethod,
                    change: 0 // Simplificado
                };

                if(!this.state.salesHistory[this.state.ui.today]) this.state.salesHistory[this.state.ui.today] = [];
                this.state.salesHistory[this.state.ui.today].unshift(sale);
                this.state.openOrders = this.state.openOrders.filter(o => o.id !== order.id);
                this.storage.saveSalesHistory(); this.storage.saveOpenOrders();
                
                this.render.openOrders();
                this.utils.closeModal('open-order-modal');
                this.utils.notify('Comanda Finalizada', 'success');
            },

            // --- Histórico Ações ---
            requestDeleteSale(id, date) {
                this.state.ui.saleToDelete = { id: parseInt(id), date };
                this.utils.openModal('password-modal');
            },
            confirmDelete() {
                if(this.DOM['confirm-delete-password'].value === this.state.config.deletePassword) {
                    const { id, date } = this.state.ui.saleToDelete;
                    const idx = this.state.salesHistory[date].findIndex(s => s.id === id);
                    if(idx > -1) {
                        this.state.salesHistory[date].splice(idx, 1);
                        this.storage.saveSalesHistory();
                        this.render.history(date);
                        this.utils.notify('Venda excluída', 'success');
                    }
                    this.utils.closeModal('password-modal');
                    this.DOM['confirm-delete-password'].value = '';
                } else {
                    this.utils.notify('Senha incorreta', 'error');
                }
            },
            
            // --- Outros ---
            login() {
                const u = this.DOM['username'].value;
                const p = this.DOM['password'].value;
                if((u==='admin' && p==='qwe102030') || (u==='brenomacedo' && p==='070824')) {
                    document.getElementById('login-section').style.display = 'none';
                    document.getElementById('admin-controls-panel').style.display = 'block';
                } else this.utils.notify('Erro de login', 'error');
            },
            logout() {
                document.getElementById('login-section').style.display = 'block';
                document.getElementById('admin-controls-panel').style.display = 'none';
            },
            saveDiscountConfig() {
                const active = document.getElementById('discount-active-check').checked;
                this.state.discount = {
                    active, percentage: parseFloat(document.getElementById('discount-percentage').value),
                    targets: { acai: document.getElementById('discount-target-acai').checked, sorvete: document.getElementById('discount-target-sorvete').checked }
                };
                this.render.activeDiscountIndicator();
                this.utils.notify('Promoção Atualizada', 'success');
            },
            addNewExpense() {
                const name = document.getElementById('new-expense-name').value;
                const val = parseFloat(document.getElementById('new-expense-value').value);
                if(!name || !val) return this.utils.notify('Preencha os dados', 'error');
                
                if(!this.state.expenses[this.state.ui.today]) this.state.expenses[this.state.ui.today] = [];
                this.state.expenses[this.state.ui.today].unshift({ id: Date.now(), name, value: val });
                this.storage.saveExpenses();
                this.render.expenses(this.state.ui.today);
                document.getElementById('new-expense-name').value = '';
                document.getElementById('new-expense-value').value = '';
            },
            openManualSaleModal() {
                const select = document.getElementById('manual-product-select');
                select.innerHTML = '<option value="">Selecione...</option><option value="acai_kg">Açaí KG</option><option value="sorvete_kg">Sorvete KG</option>';
                this.state.products.forEach(p => select.innerHTML += `<option value="${p.id}">${p.name} - R$ ${p.price}</option>`);
                this.state.manualSaleCart = [];
                this.render.manualSaleCart();
                this.utils.openModal('manual-sale-modal');
            },
            addManualItem() {
                const val = document.getElementById('manual-product-select').value;
                if(!val) return;
                if(val.includes('_kg')) {
                    const w = parseFloat(document.getElementById('manual-acai-weight').value);
                    const pKg = val === 'acai_kg' ? this.state.config.açaíPricePerKg : this.state.config.sorvetePricePerKg;
                    this.state.manualSaleCart.push({ id: Date.now(), name: val, totalPrice: (w/1000)*pKg });
                } else {
                    const p = this.state.products.find(x => x.id == val);
                    this.state.manualSaleCart.push({ id: Date.now(), name: p.name, totalPrice: p.price });
                }
                this.render.manualSaleCart();
            },
            saveManualSale() {
                if(!this.state.manualSaleCart.length) return;
                const total = this.state.manualSaleCart.reduce((s,i)=>s+i.totalPrice,0);
                const sale = { id: Date.now(), date: new Date().toLocaleString(), dateKey: this.state.ui.today, items: this.state.manualSaleCart, total, paymentMethod: this.state.ui.manualSalePaymentMethod, change: 0 };
                if(!this.state.salesHistory[this.state.ui.today]) this.state.salesHistory[this.state.ui.today] = [];
                this.state.salesHistory[this.state.ui.today].unshift(sale);
                this.storage.saveSalesHistory();
                this.utils.closeModal('manual-sale-modal');
                this.utils.notify('Venda Manual Salva', 'success');
            },
            printReceipt(sale) {
                 const win = window.open('','','width=300,height=600');
                 win.document.write(`<html><body style="font-family:monospace; font-size:12px;"><h3>Açaí da Serra</h3><p>${sale.date}</p><hr>`);
                 sale.items.forEach(i => win.document.write(`<div>${i.name} ${i.weightGrams?`(${i.weightGrams}g)`:''} ... R$ ${i.totalPrice.toFixed(2)}</div>`));
                 if(sale.deliveryInfo && sale.deliveryInfo.fee) win.document.write(`<div>Taxa Entrega ... R$ ${sale.deliveryInfo.fee.toFixed(2)}</div>`);
                 win.document.write(`<hr><b>TOTAL: R$ ${sale.total.toFixed(2)}</b></body></html>`);
                 win.print(); win.close();
            }
        },

        render: {
            all() {
                this.weightedProductPrice(); this.cart(); this.products(); this.history(App.state.ui.today); this.openOrders(); this.expenses(App.state.ui.today);
                document.getElementById('current-date').textContent = new Date().toLocaleDateString('pt-BR');
            },
            weightedProductPrice() {
                const p = App.state.ui.currentWeightedProduct === 'acai' ? App.state.config.açaíPricePerKg : App.state.config.sorvetePricePerKg;
                App.DOM['weighted-product-price-display'].textContent = p.toFixed(2);
            },
            cart() {
                const list = document.getElementById('cart-items');
                list.innerHTML = '';
                let sub = 0;
                if(!App.state.cart.length) list.innerHTML = '<div style="text-align:center; padding:20px; color:#999;">Carrinho vazio 🛒</div>';
                else {
                    App.state.cart.forEach((i, idx) => {
                        sub += i.totalPrice;
                        list.innerHTML += `
                            <div class="cart-item">
                                <div class="cart-item-info">
                                    <strong>${i.name}</strong>
                                    <small>R$ ${i.totalPrice.toFixed(2)} ${i.discountInfo?`(-${i.discountInfo.percentage}%)`:''}</small>
                                </div>
                                <button class="remove-item" data-index="${idx}">×</button>
                            </div>
                        `;
                    });
                }
                const fee = App.state.ui.deliveryMode === 'entrega' ? (parseFloat(App.DOM['delivery-fee'].value)||0) : 0;
                App.DOM['subtotal'].textContent = `R$ ${sub.toFixed(2)}`;
                App.DOM['total'].textContent = `R$ ${(sub+fee).toFixed(2)}`;
            },
            products() {
                const term = App.DOM['product-search'].value.toLowerCase();
                const grid = App.DOM['products-grid'];
                grid.innerHTML = '';
                // Botões Rápidos
                const quickBox = document.querySelector('.quick-add-buttons');
                quickBox.innerHTML = '';
                App.state.products.forEach(p => {
                    if(p.name.toLowerCase().includes(term)) {
                        const div = document.createElement('div');
                        div.className = 'prod-card';
                        div.innerHTML = `<div>${p.name}</div><div class="prod-price">R$ ${p.price.toFixed(2)}</div>`;
                        div.onclick = () => App.handlers.addProductToCart(p);
                        grid.appendChild(div);
                        
                        if(p.category !== 'Geral') {
                            const btn = document.createElement('div');
                            btn.className = 'quick-chip';
                            btn.dataset.id = p.id;
                            btn.innerHTML = `<span>${p.name}</span><strong>R$ ${p.price.toFixed(2)}</strong>`;
                            quickBox.appendChild(btn);
                        }
                    }
                });
            },
            history(date) {
                const list = App.DOM['sales-history'];
                list.innerHTML = '';
                const sales = App.state.salesHistory[date] || [];
                let t = 0;
                sales.forEach(s => {
                    t += s.total;
                    const itemsText = s.items.map(i => `${i.name} ${i.weightGrams?`(${i.weightGrams}g)`:''}`).join(', ').substring(0, 50) + '...';
                    list.innerHTML += `
                        <div class="sale-card">
                            <div class="sale-header"><span>${s.date.split(' ')[1]}</span><span>ID: ${s.id.toString().slice(-4)}</span></div>
                            <div class="sale-price">R$ ${s.total.toFixed(2)}</div>
                            <div class="sale-items">${itemsText}</div>
                            <div class="sale-footer">
                                <div class="payment-badge">${s.paymentMethod === 'pix' ? '💠' : s.paymentMethod === 'card' ? '💳' : '💵'} ${s.paymentMethod.toUpperCase()}</div>
                                <div class="action-icons">
                                    <button class="icon-print" data-id="${s.id}" data-date="${date}">🖨️</button>
                                    <button class="icon-trash" data-id="${s.id}" data-date="${date}">🗑️</button>
                                </div>
                            </div>
                        </div>
                    `;
                });
                App.DOM['history-grand-total'].textContent = `R$ ${t.toFixed(2)}`;
            },
            openOrders() {
                const grid = App.DOM['open-orders-grid'];
                grid.innerHTML = '';
                const orders = App.state.openOrders;
                document.getElementById('open-orders-count').textContent = orders.length;
                document.getElementById('open-orders-count').style.display = orders.length ? 'block' : 'none';
                if(!orders.length) grid.innerHTML = '<div style="color:#999;">Sem comandas</div>';
                else {
                    orders.forEach(o => {
                        grid.innerHTML += `<div class="prod-card open-order-card" data-id="${o.id}"><h4>${o.customerName}</h4><div style="color:var(--primary); font-weight:bold;">R$ ${o.total.toFixed(2)}</div></div>`;
                    });
                }
            },
            activeDiscountIndicator() {
                const d = App.state.discount;
                const b = document.getElementById('discount-balloon');
                if(d.active) { b.style.display = 'flex'; document.getElementById('discount-details').textContent = `${d.percentage}% OFF Ativo!`; } 
                else b.style.display = 'none';
            },
            discountControls() { document.getElementById('discount-active-check').checked = App.state.discount.active; },
            manualSaleCart() {
                const l = document.getElementById('manual-sale-cart-items');
                l.innerHTML = ''; let t=0;
                App.state.manualSaleCart.forEach(i=>{t+=i.totalPrice; l.innerHTML+=`<div>${i.name} - R$ ${i.totalPrice.toFixed(2)}</div>`});
                document.getElementById('manual-sale-total').textContent = `R$ ${t.toFixed(2)}`;
            },
            expenses(date) {
                const l = document.getElementById('expenses-history-list'); l.innerHTML = '';
                let t=0; (App.state.expenses[date]||[]).forEach(e=>{ t+=e.value; l.innerHTML+=`<div style="color:red; border-bottom:1px solid #eee; padding:5px;">${e.name} - R$ ${e.value.toFixed(2)}</div>`; });
                document.getElementById('expenses-total-today').textContent = `R$ ${t.toFixed(2)}`;
            }
        },

        utils: {
            notify(msg, type) {
                const n = document.getElementById('notification');
                n.querySelector('.toast-msg').textContent = msg;
                n.className = `toast show ${type}`;
                setTimeout(() => n.classList.remove('show'), 3000);
            },
            openModal(id) { document.getElementById(id).classList.add('open'); },
            closeModal(id) { document.getElementById(id).classList.remove('open'); },
            showReceiptModal(sale) {
                 const content = `DATA: ${sale.date}\n----------------\n` + sale.items.map(i=>`${i.name} .. R$ ${i.totalPrice.toFixed(2)}`).join('\n') + `\n----------------\nTOTAL: R$ ${sale.total.toFixed(2)}`;
                 document.getElementById('receipt-content').innerText = content;
                 this.openModal('receipt-modal');
            }
        },

        storage: {
            load() {
                const sh = localStorage.getItem('salesHistory'); if(sh) App.state.salesHistory = JSON.parse(sh);
                const ex = localStorage.getItem('expenses'); if(ex) App.state.expenses = JSON.parse(ex);
                const pr = localStorage.getItem('products'); if(pr) App.state.products = JSON.parse(pr);
                const oo = localStorage.getItem('openOrders'); if(oo) App.state.openOrders = JSON.parse(oo);
                // Configs (preços, etc)
            },
            saveSalesHistory() { localStorage.setItem('salesHistory', JSON.stringify(App.state.salesHistory)); },
            saveExpenses() { localStorage.setItem('expenses', JSON.stringify(App.state.expenses)); },
            saveProducts() { localStorage.setItem('products', JSON.stringify(App.state.products)); },
            saveOpenOrders() { localStorage.setItem('openOrders', JSON.stringify(App.state.openOrders)); }
        }
    };
    App.init();
});