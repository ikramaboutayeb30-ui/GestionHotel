import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material'
import { useState } from 'react'

const emptyValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  nationality: '',
  identificationType: '',
  identificationNumber: '',
  address: '',
  notes: '',
}

function GuestFormDialog({ guest, loading, error, onClose, onSubmit, open }) {
  const [values, setValues] = useState(() => (guest ? { ...emptyValues, ...guest } : emptyValues))

  function setField(field) {
    return (event) => setValues((current) => ({ ...current, [field]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(values)
  }

  return (
    <Dialog fullWidth maxWidth="md" onClose={loading ? undefined : onClose} open={open}>
      <DialogTitle>{guest ? 'Modifier le client' : 'Ajouter un client'}</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}
        <Box
          component="form"
          id="guest-form"
          onSubmit={handleSubmit}
          sx={{ columnGap: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}
        >
          <TextField
            autoFocus
            fullWidth
            label="Prénom"
            onChange={setField('firstName')}
            required
            value={values.firstName}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Nom"
            onChange={setField('lastName')}
            required
            value={values.lastName}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Téléphone"
            onChange={setField('phone')}
            required
            value={values.phone}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Adresse e-mail"
            onChange={setField('email')}
            type="email"
            value={values.email || ''}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Nationalité"
            onChange={setField('nationality')}
            value={values.nationality || ''}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Type de pièce"
            onChange={setField('identificationType')}
            select
            value={values.identificationType || ''}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Non renseigné</MenuItem>
            <MenuItem value="National ID">CIN</MenuItem>
            <MenuItem value="Passport">Passport</MenuItem>
            <MenuItem value="Residence permit">Carte de séjour</MenuItem>
            <MenuItem value="Driving licence">Permis de conduire</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Numéro de la pièce"
            onChange={setField('identificationNumber')}
            value={values.identificationNumber || ''}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Adresse"
            onChange={setField('address')}
            value={values.address || ''}
            sx={{ gridColumn: { sm: '1 / -1' }, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Notes"
            minRows={3}
            multiline
            onChange={setField('notes')}
            value={values.notes || ''}
            sx={{ gridColumn: { sm: '1 / -1' } }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button disabled={loading} onClick={onClose}>Annuler</Button>
        <Button disabled={loading} form="guest-form" type="submit" variant="contained">
          {loading ? 'Enregistrement…' : guest ? 'Enregistrer' : 'Ajouter le client'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default GuestFormDialog
