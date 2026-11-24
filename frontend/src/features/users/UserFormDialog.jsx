import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup, MenuItem, TextField, Typography } from '@mui/material'
import { useState } from 'react'

const empty = { firstName: '', lastName: '', email: '', phone: '', password: '', role: 'USER', status: 'ACTIVE', permissionIds: [] }
function UserFormDialog({ user, permissions, error, loading, onClose, onSubmit }) {
  const [values, setValues] = useState(() => user ? { ...empty, ...user, password: '', permissionIds: user.permissionIds || [] } : empty)
  const change = (name) => (event) => setValues((v) => ({ ...v, [name]: event.target.value }))
  const togglePermission = (id) => setValues((v) => ({ ...v, permissionIds: v.permissionIds.includes(id) ? v.permissionIds.filter((x) => x !== id) : [...v.permissionIds, id] }))
  return <Dialog fullWidth maxWidth="md" open onClose={loading ? undefined : onClose}><DialogTitle>{user ? 'Modifier l’utilisateur' : 'Nouvel utilisateur'}</DialogTitle><DialogContent dividers>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<Box component="form" id="user-form" onSubmit={(e) => { e.preventDefault(); onSubmit(values) }} sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
    <TextField label="Prénom" required value={values.firstName} onChange={change('firstName')} /><TextField label="Nom" required value={values.lastName} onChange={change('lastName')} />
    <TextField label="E-mail" type="email" required value={values.email} onChange={change('email')} /><TextField label="Téléphone" value={values.phone || ''} onChange={change('phone')} />
    <TextField label={user ? 'Nouveau mot de passe (facultatif)' : 'Mot de passe'} type="password" required={!user} value={values.password} onChange={change('password')} />
    <TextField label="Rôle" select value={values.role} onChange={change('role')}><MenuItem value="USER">Utilisateur</MenuItem><MenuItem value="ADMIN">Administrateur</MenuItem></TextField>
    {user && <TextField label="Statut" select value={values.status} onChange={change('status')}><MenuItem value="ACTIVE">Actif</MenuItem><MenuItem value="INACTIVE">Inactif</MenuItem></TextField>}
    {values.role === 'USER' && <Box sx={{ gridColumn: { sm: '1 / -1' }, mt: 1 }}><Typography variant="h5">Permissions accordées</Typography><Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>Cochez uniquement les fonctions nécessaires à cet utilisateur.</Typography><FormGroup sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>{permissions.map((permission) => <FormControlLabel key={permission.id} control={<Checkbox checked={values.permissionIds.includes(permission.id)} onChange={() => togglePermission(permission.id)} />} label={permission.name} />)}</FormGroup></Box>}
  </Box></DialogContent><DialogActions sx={{ px: 3, py: 2 }}><Button disabled={loading} onClick={onClose}>Annuler</Button><Button disabled={loading} form="user-form" type="submit" variant="contained">{loading ? 'Enregistrement…' : 'Enregistrer'}</Button></DialogActions></Dialog>
}
export default UserFormDialog

