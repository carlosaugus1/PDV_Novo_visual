export const store = {
    state: {
        cart: [],
        openOrders: [],
        salesHistory: {},
        expenses: {},
        products: [],
        
        config: {}, 

        discount: { active: false, percentage: 10, targets: { acai: false, sorvete: false } },

        ui: {
            today: new Date().toISOString().split('T')[0],
            currentWeightedProduct: 'acai',
            currentPaymentMethod: null,
            deliveryMode: 'balcao',
            editingOrderId: null,
            editingProduct: null,
            tempOpenOrder: null,
            detailsItem: null,
            isLoggedIn: false
        }
    }
};