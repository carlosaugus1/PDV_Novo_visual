import { Settings } from '../config/settings.js';

// Seed de dados para primeira execução
const seedProducts = [
    { id: 1, name: "Água", price: 2.00, category: "Bebidas", image: "" }, 
    { id: 2, name: "Água com Gás", price: 3.00, category: "Bebidas", image: "" },
    { id: 3, name: "Supra Pistache", price: 12.50, category: "Supra", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXdZW31v_iUiSoUuM6zkbzQnT4Avj2d2j-CA&s" }, 
    { id: 4, name: "Supra Castanha", price: 9.50, category: "Supra", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqIGaCqPtoWrTVq06RvZdFQRj4Js6DcdA0yA&s" },
    { id: 5, name: "Supra Chocolate", price: 9.50, category: "Supra", image: "https://ibassets.com.br/ib.item.image.large/l-c1e59bba6d0047a69b0d26b2c3a76b49.jpeg" }, 
    { id: 6, name: "Supra Chocolate Branco", price: 9.50, category: "Supra", image: "https://ibassets.com.br/ib.item.image.large/l-923e34c488414cee80e6f53bda981e6f.jpeg" },
    { id: 7, name: "Supra Cookies & Cream", price: 9.50, category: "Supra", image: "https://ibassets.com.br/ib.item.image.large/l-5895829e67c34909aae0956d2323f465.png" }, 
    { id: 8, name: "Supra Mouse de Limão", price: 9.50, category: "Supra", image: "https://ibassets.com.br/ib.item.image.large/l-d254bd57310e4eb18e60a3982e65f5ce.jpeg" },
    { id: 9, name: "Açaí e Banana", price: 4.75, category: "Original", image: "https://ibassets.com.br/ib.item.image.large/l-3542c1f326c946cf85715ac58aae3b0f.jpeg" }, 
    { id: 10, name: "Cajá", price: 4.75, category: "Original", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGZ4zDf1DskLCut5mpOOVj8stQZWvtAt3s-w&s" },
    { id: 11, name: "Castanha", price: 4.75, category: "Original", image: "https://blogboasdicas.com/wp-content/uploads/2019/04/Pardal-Castanha-Sorvete-Lancamento-e1554990588692.jpeg" }, 
    { id: 12, name: "Coco", price: 4.75, category: "Original", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbyEeyMfWRzDgtIiAuKifNnM9iWkDf5B93lA&s" },
    { id: 13, name: "Milho", price: 4.75, category: "Original", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyYpyGG0M3frKXkRTP4Ayyr-0p2EvG03B8tg&s" }, 
    { id: 14, name: "Tapioca", price: 4.75, category: "Original", image: "https://ibassets.com.br/ib.item.image.large/l-37b6382ac04744089b05121fde5bced0.jpeg" },
    { id: 15, name: "Vita Açaí", price: 6.00, category: "Vita", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9fDFsO3A7l4GS5IaW0zOh_Ef8LXVTbar_cw&s" }, 
    { id: 16, name: "Vita Morango", price: 6.00, category: "Vita", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyUDbUXVxyOl6mdmS0B9nrTSGnQf3_TYsR9Q&s" },
    { id: 17, name: "Vita Cajá", price: 6.00, category: "Vita", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSZSqWvd-npezB_t0a5tWL5NpOsPK3Dqonmw&s" }, 
    { id: 18, name: "Vita Whey Chocolate", price: 6.50, category: "Vita Whey", image: "https://cdnimages.ligafiles.com.br/preset=thumbnail_180/item_images/11775/687509c26930dwc6nf.webp" },
    { id: 19, name: "Vita Whey Amendoim", price: 6.50, category: "Vita Whey", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9h5z22KNZo61-5aS7CvR7YkL7Rsm7zl1VXg&s" }, 
    { id: 20, name: "Limão", price: 3.75, category: "Pardal Livre- Zero Lac", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxF0t6jnG84AHI6XfpBVEc9wQ6xzaew-ImYA&s" },
    { id: 21, name: "Maracujá", price: 3.75, category: "Pardal Livre- Zero Lac", image: "https://cdnimages.ligafiles.com.br/preset=thumbnail_180/item_images/11770/6874f6e1e4dacj2cp6.webp" }, 
    { id: 22, name: "Tangerina", price: 3.75, category: "Pardal Livre- Zero Lac", image: "https://cdnimages.ligafiles.com.br/preset=thumbnail_180/item_images/11770/6874f6e20960edpc67.webp" },
    { id: 23, name: "Brigadeiro", price: 4.00, category: "Clássicos", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLoTC_wGAUzvoKcICswgUfAudu2yZM12h9dw&s" }, 
    { id: 24, name: "Flocos", price: 4.00, category: "Clássicos", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmps59oBbaTRueUq5i409uv30twSt72uewhQ&s" },
    { id: 25, name: "Chocolate", price: 4.00, category: "Clássicos", image: "https://ibassets.com.br/ib.item.image.large/l-44dd99e6f3c94d3c950cde03ef1c3bb2.jpeg" }, 
    { id: 26, name: "Morango", price: 4.00, category: "Clássicos", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMcsX94xe0SvAgtFxYNKIB5oqDIRMqfPSfnw&s" },
    { id: 27, name: "Doce de Leite", price: 3.50, category: "Fun", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbPLXXLJR7gVSE7T4mAIZTVabUWUJJJtQowQ&s" }, 
    { id: 28, name: "Leite Condensado", price: 3.50, category: "Fun", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFE6XnJqiIwxB66asiqAD3tzbAPRZb2rhJUw&s" },
    { id: 29, name: "Morango com L. Cond.", price: 3.50, category: "Fun", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvqWtB0fuPqs1gmX9l6C_-AWaecBaknJY9IA&s" }, 
    { id: 30, name: "Pedacinho do Céu", price: 3.50, category: "Fun", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmQUncqZGlI5iJRY0M_zuNgK5oemaDdZBhSg&s" },
    { id: 31, name: "Chiclete", price: 3.50, category: "Fun Zero Lac", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdeqz_a0LnKAm_UhxVqP_zmuVXNr6396uzgg&s" }, 
    { id: 32, name: "Uva", price: 3.50, category: "Fun Zero Lac", image: "https://ibassets.com.br/ib.item.image.large/l-7582fc7ac1324786afb5e35db60f7669.jpeg" }
];

export const DataService = {
    async load(key) {
        return new Promise(resolve => {
            const data = localStorage.getItem(key);
            resolve(data ? JSON.parse(data) : null);
        });
    },

    async save(key, data) {
        return new Promise(resolve => {
            localStorage.setItem(key, JSON.stringify(data));
            resolve(true);
        });
    },

    async getProducts() {
        let prods = await this.load('products');
        if (!prods || prods.length < 5) {
            prods = seedProducts;
            await this.save('products', prods);
        }
        return prods;
    },

    async getConfig() {
        const cfg = await this.load('appConfig');
        return { ...Settings.defaults, ...cfg };
    }
};