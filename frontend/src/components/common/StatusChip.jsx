import { Chip } from '@mui/material'

const labels = {
  ACTIVE: 'Actif', INACTIVE: 'Inactif', CLEAN: 'Propre', DIRTY: 'À nettoyer', IN_PROGRESS: 'En cours', INSPECTED: 'Inspectée',
  OUT_OF_SERVICE: 'Hors service', MAINTENANCE: 'Maintenance', PENDING: 'En attente', CONTACTED: 'Contactée', APPROVED: 'Approuvée',
  REJECTED: 'Refusée', EXPIRED: 'Expirée', CONVERTED: 'Convertie', CONFIRMED: 'Confirmée', CHECKED_IN: 'Arrivé', CHECKED_OUT: 'Parti',
  CANCELLED: 'Annulée', NO_SHOW: 'Non présenté', COMPLETED: 'Effectué', FAILED: 'Échoué', REFUNDED: 'Remboursé',
  ADMIN: 'Administrateur', USER: 'Utilisateur', CASH: 'Espèces', CARD: 'Carte', BANK_TRANSFER: 'Virement', ONLINE: 'En ligne', OTHER: 'Autre',
  DEPOSIT: 'Acompte', PAYMENT: 'Paiement', REFUND: 'Remboursement', WEBSITE: 'Site web', PHONE: 'Téléphone', EMAIL: 'E-mail', WALK_IN: 'Comptoir',
}
const colors = {
  ACTIVE: 'success', CLEAN: 'success', INSPECTED: 'success', APPROVED: 'success', CONVERTED: 'success', CONFIRMED: 'success', COMPLETED: 'success', CHECKED_IN: 'info',
  PENDING: 'warning', CONTACTED: 'info', IN_PROGRESS: 'info', MAINTENANCE: 'warning', DIRTY: 'warning',
  INACTIVE: 'default', OUT_OF_SERVICE: 'default', EXPIRED: 'default', CHECKED_OUT: 'default',
  REJECTED: 'error', CANCELLED: 'error', NO_SHOW: 'error', FAILED: 'error', REFUNDED: 'secondary',
}

function StatusChip({ value, size = 'small' }) {
  return <Chip color={colors[value] || 'default'} label={labels[value] || value || '—'} size={size} variant="outlined" />
}
export default StatusChip
