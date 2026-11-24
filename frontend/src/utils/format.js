export const dateFormatter = new Intl.DateTimeFormat('fr-MA', { dateStyle: 'medium' })
export const dateTimeFormatter = new Intl.DateTimeFormat('fr-MA', { dateStyle: 'medium', timeStyle: 'short' })
export const currencyFormatter = new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 2 })
export function formatDate(value) { return value ? dateFormatter.format(new Date(`${String(value).slice(0, 10)}T00:00:00`)) : '—' }
export function formatDateTime(value) { return value ? dateTimeFormatter.format(new Date(value)) : '—' }
export function formatMoney(value) { return currencyFormatter.format(Number(value || 0)) }
export const formatCurrency = formatMoney
