import { DataService } from '../services/dataService.js';
import { store } from '../state/store.js';
import { uiUtils } from '../utils/uiUtils.js';
import { Formatters } from '../utils/formatters.js';
import { CartModule } from './cart.js';

export const ProductsModule = {
    async init() {
        store.state.products = await DataService.getProducts();
        this.renderGrid();
        this.bindEvents();
    },

    renderGrid() {
        const term = document.getElementById('product-search').value.toLowerCase();
        const grid = document.getElementById('products-grid');
        const quickWrapper = document.getElementById('quick-add-wrapper');
        
        grid.innerHTML = '';
        if (quickWrapper) quickWrapper.innerHTML = '';

        store.state.products.forEach(p => {
            // Quick Add (Água, etc)
            if ((p.id == 1 || p.id == 2) && quickWrapper) {
                const chip = document.createElement('div');
                chip.className = 'quick-chip';
                chip.dataset.id = p.id;
                chip.innerHTML = `<span>${p.name}</span><strong>${Formatters.currency(p.price)}</strong>`;
                chip.addEventListener('click', () => CartModule.addProduct(p));
                quickWrapper.appendChild(chip);
            }

            // Grid Principal
            if (p.name.toLowerCase().includes(term)) {
                const hasImg = p.image && p.image.length > 5;
                const imgHtml = hasImg ? `<img src="${p.image}" class="prod-img">` : `<div class="prod-placeholder" style="font-size:3rem; opacity:0.3;">🍦</div>`;
                
                const card = document.createElement('div');
                card.className = 'prod-card';
                card.dataset.id = p.id;
                card.innerHTML = `
                    <div class="prod-img-area">${imgHtml}</div>
                    <div class="prod-info">
                        <div class="prod-name">${p.name}</div>
                        <div class="prod-price">${Formatters.currency(p.price)}</div>
                    </div>
                    <div class="prod-actions">
                        <button class="edit-prod-btn" data-id="${p.id}">✎</button>
                    </div>`;

                // Event Delegation manual para evitar conflito
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.edit-prod-btn')) {
                        this.openModal(p.id);
                    } else {
                        CartModule.addProduct(p);
                    }
                });

                grid.appendChild(card);
            }
        });
    },

    openModal(id) {
        store.state.ui.editingProduct = id;
        const btnDelete = document.getElementById('delete-prod-btn');

        if (id) {
            const p = store.state.products.find(x => x.id == id);
            document.getElementById('prod-modal-title').textContent = 'Editar Produto';
            document.getElementById('prod-name').value = p.name;
            document.getElementById('prod-price').value = p.price;
            document.getElementById('prod-category-select').value = p.category;
            document.getElementById('prod-image').value = p.image || '';
            btnDelete.style.display = 'block';
        } else {
            document.getElementById('prod-modal-title').textContent = 'Novo Produto';
            document.getElementById('prod-name').value = '';
            document.getElementById('prod-price').value = '';
            document.getElementById('prod-category-select').value = '';
            document.getElementById('prod-image').value = '';
            btnDelete.style.display = 'none';
        }
        uiUtils.openModal('product-modal');
    },

    async save() {
        const name = document.getElementById('prod-name').value;
        const price = parseFloat(document.getElementById('prod-price').value);
        let category = document.getElementById('prod-category-select').value;
        const customCat = document.getElementById('prod-category').value;
        if (!category && customCat) category = customCat;
        const image = document.getElementById('prod-image').value;

        if (!name || !price) return uiUtils.notify('Nome e Preço obrigatórios', 'error');

        if (store.state.ui.editingProduct) {
            const idx = store.state.products.findIndex(p => p.id == store.state.ui.editingProduct);
            if (idx > -1) store.state.products[idx] = { ...store.state.products[idx], name, price, category, image };
        } else {
            store.state.products.push({ id: Date.now(), name, price, category, image });
        }

        await DataService.save('products', store.state.products);
        this.renderGrid();
        uiUtils.closeModal('product-modal');
        uiUtils.notify('Produto Salvo', 'success');
    },

    bindEvents() {
        document.getElementById('product-search').addEventListener('input', () => this.renderGrid());
        document.getElementById('btn-open-add-prod').addEventListener('click', () => this.openModal(null));
        document.getElementById('save-prod-btn').addEventListener('click', () => this.save());
        document.getElementById('close-prod-modal').addEventListener('click', () => uiUtils.closeModal('product-modal'));
        document.getElementById('delete-prod-btn').addEventListener('click', async () => {
            if(confirm('Excluir?')) {
                store.state.products = store.state.products.filter(p => p.id != store.state.ui.editingProduct);
                await DataService.save('products', store.state.products);
                this.renderGrid();
                uiUtils.closeModal('product-modal');
            }
        });
    }
};