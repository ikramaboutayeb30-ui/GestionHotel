import { SaveRounded } from '@mui/icons-material'
import { Alert, Box, Button, Card, CardContent, CircularProgress, MenuItem, Snackbar, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PageHeader from '../components/common/PageHeader'
import { fetchHotel, saveHotel } from '../features/hotel/hotelSlice'

const defaults = {
  name: '', description: '', email: '', phone: '', address: '', city: '', country: 'Maroc',
  currencyCode: 'MAD', timezone: 'Africa/Casablanca', checkInTime: '14:00', checkOutTime: '12:00',
  taxPercentage: 0, logoUrl: '',
}

function SettingsPage() {
  const dispatch = useDispatch()
  const { data, error, loading, saving } = useSelector((state) => state.hotel)
  const [values, setValues] = useState(defaults)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    dispatch(fetchHotel()).unwrap().then((hotel) => setValues({ ...defaults, ...hotel, checkInTime: hotel.checkInTime?.slice(0, 5) || '', checkOutTime: hotel.checkOutTime?.slice(0, 5) || '' })).catch(() => {})
  }, [dispatch])

  const setField = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }))
  async function submit(event) {
    event.preventDefault()
    try { await dispatch(saveHotel(values)).unwrap(); setSaved(true) } catch { /* L'erreur Redux est affichée. */ }
  }

  if (loading && !data) return <Box sx={{ display: 'grid', minHeight: 320, placeItems: 'center' }}><CircularProgress /></Box>

  return (
    <Stack spacing={3}>
      <PageHeader title="Paramètres de l’hôtel" description="Identité, coordonnées et règles opérationnelles de votre établissement." />
      {error && <Alert severity="error">{error}</Alert>}
      <Card>
        <CardContent component="form" onSubmit={submit} sx={{ p: { xs: 2.5, md: 4 }, '&:last-child': { pb: { xs: 2.5, md: 4 } } }}>
          <Typography variant="h4">Informations générales</Typography>
          <Box sx={{ display: 'grid', gap: 2.25, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, mt: 2.5 }}>
            <TextField required label="Nom de l’hôtel" value={values.name} onChange={setField('name')} />
            <TextField label="Adresse e-mail" type="email" value={values.email || ''} onChange={setField('email')} />
            <TextField label="Téléphone" placeholder="+212 5…" value={values.phone || ''} onChange={setField('phone')} />
            <TextField label="Ville" value={values.city || ''} onChange={setField('city')} />
            <TextField label="Adresse" value={values.address || ''} onChange={setField('address')} sx={{ gridColumn: { md: '1 / -1' } }} />
            <TextField label="Pays" value={values.country || ''} onChange={setField('country')} />
            <TextField label="Logo (URL)" value={values.logoUrl || ''} onChange={setField('logoUrl')} />
            <TextField label="Description" multiline minRows={3} value={values.description || ''} onChange={setField('description')} sx={{ gridColumn: { md: '1 / -1' } }} />
          </Box>
          <Typography variant="h4" sx={{ mt: 4 }}>Exploitation et facturation</Typography>
          <Box sx={{ display: 'grid', gap: 2.25, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, mt: 2.5 }}>
            <TextField select label="Devise" value={values.currencyCode} onChange={setField('currencyCode')}><MenuItem value="MAD">Dirham marocain (MAD)</MenuItem><MenuItem value="EUR">Euro (EUR)</MenuItem><MenuItem value="USD">Dollar américain (USD)</MenuItem></TextField>
            <TextField label="Fuseau horaire" value={values.timezone} onChange={setField('timezone')} helperText="Recommandé : Africa/Casablanca" />
            <TextField label="Heure d’arrivée" type="time" value={values.checkInTime || ''} onChange={setField('checkInTime')} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Heure de départ" type="time" value={values.checkOutTime || ''} onChange={setField('checkOutTime')} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Taxe (%)" type="number" value={values.taxPercentage} onChange={setField('taxPercentage')} slotProps={{ htmlInput: { min: 0, max: 100, step: 0.01 } }} helperText="Valeur configurable selon votre situation fiscale." />
          </Box>
          <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 4 }}><Button disabled={saving} startIcon={saving ? <CircularProgress color="inherit" size={18} /> : <SaveRounded />} type="submit" variant="contained">{saving ? 'Enregistrement…' : 'Enregistrer les paramètres'}</Button></Stack>
        </CardContent>
      </Card>
      <Snackbar autoHideDuration={3500} message="Paramètres enregistrés" onClose={() => setSaved(false)} open={saved} />
    </Stack>
  )
}

export default SettingsPage
