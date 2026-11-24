import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'

function ConfirmDialog({ open, title, message, error, loading, confirmLabel = 'Confirmer', onClose, onConfirm }) {
  return (
    <Dialog maxWidth="xs" onClose={loading ? undefined : onClose} open={open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<Typography color="text.secondary">{message}</Typography></DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}><Button disabled={loading} onClick={onClose}>Annuler</Button><Button color="error" disabled={loading} onClick={onConfirm} variant="contained">{loading ? 'Traitement…' : confirmLabel}</Button></DialogActions>
    </Dialog>
  )
}
export default ConfirmDialog

