import { store } from '../state/store.js';
import { uiUtils } from '../utils/uiUtils.js';
import { Formatters } from '../utils/formatters.js';

export const CartModule = {
    init() {
        this.bindEvents();
        const isThursday = new Date().getDay() === 4;
        if (isThursday && !sessionStorage.getItem('discountChecked')) {
            store.state.discount.active = true;
            store.state.discount.targets.acai = true;
            sessionStorage.setItem('discountChecked', 'true');
        }
    },

    addWeighted() {
        const w = parseFloat(document.getElementById('weight-input').value);
        if (!w) return uiUtils.notify('Informe o peso', 'error');
        
        const type = store.state.ui.currentWeightedProduct;
        const priceKg = type === 'acai' ? store.state.config.açaíPricePerKg : store.state.config.sorvetePricePerKg;
        let total = (w / 1000) * priceKg;
        let discountInfo = null;

        if (store.state.discount.active && store.state.discount.targets[type]) {
            const desc = (total * store.state.discount.percentage) / 100;
            total -= desc;
            discountInfo = { percentage: store.state.discount.percentage, amount: desc };
        }

        store.state.cart.push({
            id: Formatters.generateID(),
            name: type === 'acai' ? 'Açaí (KG)' : 'Sorvete (KG)',
            pricePerKg: priceKg,
            weightGrams: w,
            totalPrice: total,
            discountInfo,
            type: 'weight'
        });
        
        this.render();
        document.getElementById('weight-input').value = '';
        document.getElementById('calculated-price').textContent = '0.00';
    },

    addProduct(prod) {
        store.state.cart.push({ id: Formatters.generateID(), name: prod.name, totalPrice: prod.price, type: 'product' });
        this.render();
        uiUtils.notify('Adicionado!', 'success');
    },

    remove(index) {
        store.state.cart.splice(index, 1);
        this.render();
    },

    render() {
        const list = document.getElementById('cart-items');
        list.innerHTML = '';
        let sub = 0;

        store.state.cart.forEach((i, idx) => {
            sub += i.totalPrice;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <div><strong>${i.name}</strong><br><small>${Formatters.currency(i.totalPrice)}</small></div>
                <button class="remove-item" data-index="${idx}">×</button>
            `;
            itemDiv.querySelector('.remove-item').addEventListener('click', () => this.remove(idx));
            list.appendChild(itemDiv);
        });

        const fee = (store.state.ui.deliveryMode === 'entrega') ? (parseFloat(document.getElementById('delivery-fee').value) || 0) : 0;
        document.getElementById('subtotal').textContent = Formatters.currency(sub);
        document.getElementById('total').textContent = Formatters.currency(sub + fee);
    },

    bindEvents() {
        document.getElementById('add-to-cart').addEventListener('click', () => this.addWeighted());
        
        document.getElementById('weight-input').addEventListener('input', (e) => {
            const w = parseFloat(e.target.value) || 0;
            const price = store.state.ui.currentWeightedProduct === 'acai' ? store.state.config.açaíPricePerKg : store.state.config.sorvetePricePerKg;
            document.getElementById('calculated-price').textContent = ((w / 1000) * price).toFixed(2);
        });

        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                store.state.ui.currentWeightedProduct = e.currentTarget.dataset.type;
                const p = store.state.ui.currentWeightedProduct === 'acai' ? store.state.config.açaíPricePerKg : store.state.config.sorvetePricePerKg;
                document.getElementById('weighted-product-price-display').textContent = p.toFixed(2);
            });
        });

        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                store.state.ui.deliveryMode = e.currentTarget.dataset.mode;
                document.getElementById('delivery-info-section').style.display = store.state.ui.deliveryMode === 'entrega' ? 'block' : 'none';
                this.render();
            });
        });

        document.getElementById('delivery-fee').addEventListener('input', () => this.render());
    }
};