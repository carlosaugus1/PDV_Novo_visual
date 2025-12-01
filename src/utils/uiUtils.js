import { store } from '../state/store.js';

export const uiUtils = {
    notify(msg, type) {
        const n = document.getElementById('notification');
        n.querySelector('.toast-msg').textContent = msg;
        n.className = `toast show ${type}`;
        setTimeout(() => n.classList.remove('show'), 3000);
    },

    openModal(id) { document.getElementById(id).classList.add('open'); },
    closeModal(id) { document.getElementById(id).classList.remove('open'); },

    // CONTROLE DE LOADING
    toggleLoading(show) {
        const loader = document.getElementById('global-loading');
        if(show) loader.classList.add('active');
        else loader.classList.remove('active');
    },

    requestPassword(actionType, callback) {
        store.state.ui.pendingAction = callback;
        store.state.ui.passwordActionType = actionType;
        document.getElementById('general-password-input').value = '';
        this.openModal('password-modal');
    },

    bindPasswordModal() {
        document.getElementById('confirm-password-btn').addEventListener('click', () => {
            const input = document.getElementById('general-password-input').value;
            const type = store.state.ui.passwordActionType;
            let correct = false;
            
            if (type === 'delete' && input === store.state.config.deletePassword) correct = true;
            if (type === 'report' && input === store.state.config.reportPassword) correct = true;
            
            if (correct) {
                this.closeModal('password-modal');
                if (store.state.ui.pendingAction) store.state.ui.pendingAction();
            } else {
                this.notify('Senha Incorreta', 'error');
            }
        });

        document.getElementById('cancel-password-btn').addEventListener('click', () => {
            this.closeModal('password-modal');
        });
    }
};