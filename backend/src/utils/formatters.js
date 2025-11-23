// utils/formatters.js

/**
 * Formata um valor numérico para o padrão monetário BRL
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado em Real brasileiro
 */
export function formatCurrency(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return 'R$ 0,00';
    }
    
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Formata uma data para o padrão brasileiro
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data formatada no padrão DD/MM/AAAA
 */
export function formatDate(date) {
    if (!date) return 'Data inválida';
    
    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return 'Data inválida';
        
        return dateObj.toLocaleDateString('pt-BR');
    } catch (error) {
        return 'Data inválida';
    }
}

/**
 * Formata um número para o padrão brasileiro
 * @param {number} number - Número a ser formatado
 * @returns {string} Número formatado
 */
export function formatNumber(number) {
    if (number === null || number === undefined || isNaN(number)) {
        return '0';
    }
    
    return new Intl.NumberFormat('pt-BR').format(number);
}