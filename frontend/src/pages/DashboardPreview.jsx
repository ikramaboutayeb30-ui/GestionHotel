import { ArrowForwardRounded, CalendarMonthRounded, FactCheckRounded, HotelRounded, KingBedRounded, PaymentsRounded, PeopleAltRounded } from '@mui/icons-material'
import { Alert, Avatar, Box, Button, Card, CardContent, CircularProgress, Divider, LinearProgress, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import StatusChip from '../components/common/StatusChip'
import { fetchDashboard } from '../features/dashboard/dashboardSlice'
import { formatCurrency, formatDate } from '../utils/format'

function MetricCard({ color, icon: Icon, label, note, value }) {
  return <Card><CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}><Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}><Box><Typography color="text.secondary" variant="body2">{label}</Typography><Typography sx={{ fontSize: '1.55rem', fontWeight: 760, mt: 0.7 }}>{value}</Typography></Box><Avatar variant="rounded" sx={(theme) => ({ bgcolor: alpha(theme.palette[color].main, 0.12), color: `${color}.main`, height: 44, width: 44 })}><Icon fontSize="small" /></Avatar></Stack><Typography color="text.secondary" variant="caption" sx={{ display: 'block', mt: 2 }}>{note}</Typography></CardContent></Card>
}

function DashboardPreview() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { data, error, loading } = useSelector((state) => state.dashboard)
  const user = useSelector((state) => state.auth.user)
  useEffect(() => { dispatch(fetchDashboard()) }, [dispatch])

  if (loading && !data) return <Box sx={{ display: 'grid', minHeight: 320, placeItems: 'center' }}><CircularProgress /></Box>
  const d = data || {}
  const metrics = [
    { label: 'Taux d’occupation', value: `${d.occupancyRate || 0} %`, note: `${d.occupied || 0} chambre(s) occupée(s)`, icon: HotelRounded, color: 'primary' },
    { label: 'Chambres prêtes', value: d.roomReady || 0, note: `sur ${d.roomActive || 0} chambre(s) active(s)`, icon: KingBedRounded, color: 'info' },
    { label: 'Arrivées aujourd’hui', value: d.arrivals || 0, note: `${d.departures || 0} départ(s) prévu(s)`, icon: CalendarMonthRounded, color: 'secondary' },
    { label: 'Recettes du jour', value: formatCurrency(d.revenueToday || 0), note: 'Paiements comptabilisés aujourd’hui', icon: PaymentsRounded, color: 'success' },
  ]

  return <Stack spacing={3}>
    <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, gap: 2, justifyContent: 'space-between' }}><Box><Typography variant="h2">Bonjour, {user?.firstName || 'équipe de l’hôtel'}</Typography><Typography color="text.secondary" sx={{ mt: 0.5 }}>Voici la situation de votre établissement aujourd’hui.</Typography></Box><Button onClick={() => navigate('/reservations')} startIcon={<CalendarMonthRounded />} variant="contained">Nouvelle réservation</Button></Stack>
    {error && <Alert action={<Button color="inherit" onClick={() => dispatch(fetchDashboard())}>Réessayer</Button>} severity="error">{error}</Alert>}
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' } }}>{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</Box>
    <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.5fr) minmax(300px, .7fr)' } }}>
      <Card><CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}><Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2.25 }}><Box><Typography variant="h4">Arrivées du jour</Typography><Typography color="text.secondary" variant="body2">{d.arrivals || 0} client(s) attendu(s)</Typography></Box><Button endIcon={<ArrowForwardRounded />} onClick={() => navigate('/reservations')} size="small">Tout voir</Button></Stack><Divider />
        {d.recentArrivals?.length ? <Stack divider={<Divider flexItem />}>{d.recentArrivals.map((item) => <Stack key={item.id} direction="row" spacing={1.5} sx={{ alignItems: 'center', px: 2.5, py: 1.75 }}><Avatar sx={{ bgcolor: 'action.selected', color: 'primary.main', fontSize: '.76rem', fontWeight: 750 }}>{`${item.guest?.firstName?.[0] || ''}${item.guest?.lastName?.[0] || ''}`}</Avatar><Box sx={{ flex: 1, minWidth: 0 }}><Typography noWrap variant="subtitle2">{item.guest?.firstName} {item.guest?.lastName}</Typography><Typography color="text.secondary" variant="caption">{item.room?.roomNumber ? `Chambre ${item.room.roomNumber}` : item.roomType?.name || 'Non affectée'} · {formatDate(item.arrivalDate)}</Typography></Box><StatusChip value={item.status} /></Stack>)}</Stack> : <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Aucune arrivée prévue aujourd’hui.</Typography></Box>}
      </CardContent></Card>
      <Card><CardContent sx={{ p: 2.5 }}><Typography variant="h4">Vue opérationnelle</Typography><Typography color="text.secondary" variant="body2">Indicateurs utiles du jour</Typography><Stack spacing={2.5} sx={{ mt: 3 }}><Box><Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}><Typography variant="subtitle2">Chambres prêtes</Typography><Typography color="text.secondary" variant="caption">{d.roomReady || 0}/{d.roomActive || 0}</Typography></Stack><LinearProgress color="success" value={d.roomActive ? Math.min(100, (d.roomReady / d.roomActive) * 100) : 0} variant="determinate" sx={{ borderRadius: 3, height: 7 }} /></Box><Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}><Avatar sx={{ bgcolor: 'action.selected', color: 'warning.main' }}><FactCheckRounded /></Avatar><Box><Typography variant="subtitle2">{d.pendingRequests || 0} demande(s) en attente</Typography><Typography color="text.secondary" variant="caption">À traiter par la réception</Typography></Box></Stack><Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}><Avatar sx={{ bgcolor: 'action.selected', color: 'info.main' }}><PeopleAltRounded /></Avatar><Box><Typography variant="subtitle2">{d.guestTotal || 0} client(s)</Typography><Typography color="text.secondary" variant="caption">Fiches enregistrées</Typography></Box></Stack></Stack><Button fullWidth onClick={() => navigate('/rooms')} sx={{ mt: 3 }} variant="outlined">Ouvrir le planning des chambres</Button></CardContent></Card>
    </Box>
  </Stack>
}

export default DashboardPreview
