export const Shortcuts = {
    init() {
        document.addEventListener('keydown', (e) => {
            // F2: Focar na busca de produtos
            if (e.key === 'F2') {
                e.preventDefault();
                const search = document.getElementById('product-search');
                if(search) search.focus();
            }

            // F4: Finalizar Venda (Se tiver itens)
            if (e.key === 'F4') {
                e.preventDefault();
                const btn = document.getElementById('finish-sale');
                // Checa se o botão está visível
                if(btn && btn.offsetParent !== null) btn.click();
            }
            
            // ESC: Fechar Modais
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal-overlay.open');
                if (openModal) openModal.classList.remove('open');
            }
        });
    }
};