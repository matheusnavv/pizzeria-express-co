export const formatCOP = (amount) => `$${Math.round(amount || 0).toLocaleString('es-CO')}`;
export const formatCOPFull = (amount) => `$${Math.round(amount || 0).toLocaleString('es-CO')} COP`;