import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material'
import { useState } from 'react'

function EntityFormDialog({ title, initialValues, fields, error, loading, onClose, onSubmit }) {
  const [values, setValues] = useState(initialValues)
  const change = (name) => (event) => setValues((current) => ({ ...current, [name]: event.target.value }))

  return (
    <Dialog fullWidth maxWidth="md" onClose={loading ? undefined : onClose} open>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" id="entity-form" onSubmit={(event) => { event.preventDefault(); onSubmit(values) }} sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          {fields.map((field) => field.render ? <Box key={field.name} sx={{ gridColumn: field.fullWidth ? { sm: '1 / -1' } : undefined }}>{field.render(values, setValues)}</Box> : (
            <TextField
              key={field.name} disabled={field.disabled} fullWidth label={field.label} minRows={field.multiline ? 3 : undefined}
              multiline={field.multiline} onChange={change(field.name)} required={field.required} select={Boolean(field.options)}
              type={field.type || 'text'} value={values[field.name] ?? ''} helperText={field.helperText}
              slotProps={(field.type === 'date' || field.type === 'time') ? { inputLabel: { shrink: true }, htmlInput: { min: field.min, max: field.max, step: field.step } } : { htmlInput: { min: field.min, max: field.max, step: field.step } }}
              sx={{ gridColumn: field.fullWidth ? { sm: '1 / -1' } : undefined }}
            >
              {field.options?.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}><Button disabled={loading} onClick={onClose}>Annuler</Button><Button disabled={loading} form="entity-form" type="submit" variant="contained">{loading ? 'Enregistrement…' : 'Enregistrer'}</Button></DialogActions>
    </Dialog>
  )
}
export default EntityFormDialog

