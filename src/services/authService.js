import { DataService } from './dataService.js';
import { store } from '../state/store.js';
import { uiUtils } from '../utils/uiUtils.js';

export const AuthService = {
    async init() {
        const saved = await DataService.load('savedLogin');
        if (saved && saved.active) {
            store.state.ui.isLoggedIn = true;
            document.getElementById('login-overlay').style.display = 'none';
            uiUtils.notify('Bem-vindo de volta!', 'success');
        } else {
            document.getElementById('login-overlay').style.display = 'flex';
        }

        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('system-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const pass = document.getElementById('sys-password').value;
            const remember = document.getElementById('remember-me').checked;
            
            // Senha admin ou fallback
            if (pass === store.state.config.adminPass || pass === '1234') {
                document.getElementById('login-overlay').style.display = 'none';
                store.state.ui.isLoggedIn = true;
                if (remember) DataService.save('savedLogin', { active: true });
                uiUtils.notify('Bem-vindo!', 'success');
            } else {
                uiUtils.notify('Senha incorreta', 'error');
            }
        });

        document.getElementById('logout-btn').addEventListener('click', () => {
            DataService.save('savedLogin', { active: false });
            location.reload();
        });
    }
};