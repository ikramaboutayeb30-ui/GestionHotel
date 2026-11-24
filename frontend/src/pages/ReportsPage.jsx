import { AssessmentRounded, HotelRounded, PaymentsRounded, ReceiptLongRounded } from '@mui/icons-material'
import { Alert, Avatar, Box, Button, Card, CardContent, LinearProgress, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PageHeader from '../components/common/PageHeader'
import StatusChip from '../components/common/StatusChip'
import { fetchReport } from '../features/reports/reportSlice'
import { formatDate, formatMoney } from '../utils/format'

const today = new Date().toISOString().slice(0, 10)
const firstDay = `${today.slice(0, 8)}01`

function ReportsPage() {
  const dispatch = useDispatch()
  const { data, error, loading } = useSelector((state) => state.reports)
  const [from, setFrom] = useState(firstDay)
  const [to, setTo] = useState(today)
  useEffect(() => { dispatch(fetchReport({ from, to })) }, [dispatch, from, to])
  const cards = [
    { label: 'Chiffre d’affaires', value: formatMoney(data?.totalRevenue), note: `${data?.paymentCount || 0} opération(s)`, icon: PaymentsRounded, color: 'success.main' },
    { label: 'Réservations', value: data?.reservationCount || 0, note: 'Sur la période', icon: ReceiptLongRounded, color: 'primary.main' },
    { label: 'Taux d’occupation', value: `${data?.occupancyRate || 0} %`, note: `${data?.soldRoomNights || 0} nuitée(s) vendue(s)`, icon: HotelRounded, color: 'info.main' },
  ]
  return <Stack spacing={3}>
    <PageHeader title="Rapports" description="Analysez l’activité et les encaissements sur une période donnée." />
    <Card><CardContent><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}><TextField label="Du" type="date" value={from} onChange={(event) => setFrom(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /><TextField label="Au" type="date" value={to} onChange={(event) => setTo(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /><Button disabled={loading} onClick={() => dispatch(fetchReport({ from, to }))} variant="outlined">Actualiser</Button></Stack></CardContent></Card>
    {loading && <LinearProgress />}{error && <Alert severity="error">{error}</Alert>}
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>{cards.map(({ icon: Icon, ...card }) => <Card key={card.label}><CardContent><Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}><Box><Typography color="text.secondary" variant="body2">{card.label}</Typography><Typography variant="h3" sx={{ mt: 1 }}>{card.value}</Typography><Typography color="text.secondary" variant="caption">{card.note}</Typography></Box><Avatar sx={{ bgcolor: 'action.selected', color: card.color }}><Icon /></Avatar></Stack></CardContent></Card>)}</Box>
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' } }}>
      <Card><CardContent><Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}><AssessmentRounded color="primary" /><Typography variant="h4">Recettes par mode</Typography></Stack>{data?.revenueByMethod?.length ? <Stack spacing={1.5}>{data.revenueByMethod.map((item) => <Stack key={item.method} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}><StatusChip value={item.method} /><Typography fontWeight={700}>{formatMoney(item.amount)}</Typography></Stack>)}</Stack> : <Typography color="text.secondary">Aucun encaissement sur cette période.</Typography>}</CardContent></Card>
      <Card><CardContent><Typography variant="h4" sx={{ mb: 2 }}>Réservations par statut</Typography>{data?.reservationsByStatus?.length ? <Stack spacing={1.5}>{data.reservationsByStatus.map((item) => <Stack key={item.status} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}><StatusChip value={item.status} /><Typography fontWeight={700}>{item.count}</Typography></Stack>)}</Stack> : <Typography color="text.secondary">Aucune réservation sur cette période.</Typography>}</CardContent></Card>
    </Box>
    {data && <Typography color="text.secondary" variant="caption">Période analysée : {formatDate(data.from)} au {formatDate(data.to)} · Devise : MAD</Typography>}
  </Stack>
}

export default ReportsPage
