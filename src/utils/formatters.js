export const Formatters = {
    currency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    datePTBR(dateString) {
        if(!dateString) return '--/--/----';
        const parts = dateString.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    },

    // GERADOR DE ID SEGURO
    generateID() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};