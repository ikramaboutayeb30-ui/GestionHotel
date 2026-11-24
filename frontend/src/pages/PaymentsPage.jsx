import { DeleteOutlineRounded, EditOutlined, ReplayRounded } from '@mui/icons-material'
import { Box, Card, IconButton, Stack, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ConfirmDialog from '../components/common/ConfirmDialog'; import EntityFormDialog from '../components/common/EntityFormDialog'; import PageHeader from '../components/common/PageHeader'; import StatusChip from '../components/common/StatusChip'
import { selectHasPermission } from '../features/auth/authSlice'; import { addPayment, clearPaymentError, editPayment, fetchPayments, refundPayment, removePayment } from '../features/payments/paymentSlice'; import { fetchReservations } from '../features/reservations/reservationSlice'
import { formatDateTime, formatMoney } from '../utils/format'

const empty = { reservationId: '', amount: '', paymentMethod: 'CASH', paymentType: 'PAYMENT', status: 'COMPLETED', transactionReference: '', paidAt: '', notes: '' }
function PaymentsPage() {
  const dispatch = useDispatch(); const state = useSelector((s) => s.payments); const reservations = useSelector((s) => s.reservations.rows)
  const canCreate = useSelector(selectHasPermission('payment.create')); const canRefund = useSelector(selectHasPermission('payment.refund'))
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10 }); const [editing, setEditing] = useState(null); const [form, setForm] = useState(false); const [refunding, setRefunding] = useState(null); const [deleting, setDeleting] = useState(null)
  const load = useCallback(() => dispatch(fetchPayments({ page: pagination.page + 1, limit: pagination.pageSize })), [dispatch, pagination])
  useEffect(() => { dispatch(fetchReservations({ page: 1, limit: 100 })) }, [dispatch]); useEffect(() => { load() }, [load])
  const fields = useMemo(() => [
    { name: 'reservationId', label: 'Réservation', required: true, disabled: Boolean(editing), options: reservations.map((x) => ({ value: x.id, label: `${x.confirmationNumber} · ${x.guest?.firstName || ''} ${x.guest?.lastName || ''}` })) },
    { name: 'amount', label: 'Montant (MAD)', type: 'number', min: .01, step: '.01', required: true },
    { name: 'paymentMethod', label: 'Mode de paiement', options: [{ value: 'CASH', label: 'Espèces' }, { value: 'CARD', label: 'Carte bancaire' }, { value: 'BANK_TRANSFER', label: 'Virement bancaire' }, { value: 'ONLINE', label: 'Paiement en ligne' }, { value: 'OTHER', label: 'Autre' }] },
    { name: 'paymentType', label: 'Type', disabled: Boolean(editing), options: [{ value: 'PAYMENT', label: 'Paiement' }, { value: 'DEPOSIT', label: 'Acompte' }] },
    { name: 'status', label: 'Statut', options: [{ value: 'COMPLETED', label: 'Effectué' }, { value: 'PENDING', label: 'En attente' }, { value: 'FAILED', label: 'Échoué' }, { value: 'CANCELLED', label: 'Annulé' }] },
    { name: 'transactionReference', label: 'Référence transaction' }, { name: 'notes', label: 'Notes', multiline: true, fullWidth: true },
  ], [editing, reservations])
  const columns = useMemo(() => [
    { field: 'id', headerName: 'N°', width: 80 }, { field: 'reservation', headerName: 'Réservation', minWidth: 170, valueGetter: (_v, row) => row.reservation?.confirmationNumber || '—' },
    { field: 'guest', headerName: 'Client', flex: 1, minWidth: 180, valueGetter: (_v, row) => row.reservation?.guest ? `${row.reservation.guest.firstName} ${row.reservation.guest.lastName}` : '—' },
    { field: 'amount', headerName: 'Montant', minWidth: 140, valueFormatter: formatMoney }, { field: 'paymentMethod', headerName: 'Mode', minWidth: 130, renderCell: ({ value }) => <StatusChip value={value} /> },
    { field: 'paymentType', headerName: 'Type', minWidth: 125, renderCell: ({ value }) => <StatusChip value={value} /> }, { field: 'status', headerName: 'Statut', minWidth: 120, renderCell: ({ value }) => <StatusChip value={value} /> },
    { field: 'paidAt', headerName: 'Date', minWidth: 170, valueFormatter: formatDateTime },
    { field: 'actions', headerName: '', width: 125, sortable: false, renderCell: ({ row }) => <Stack direction="row" sx={{ alignItems: 'center', height: '100%' }}>{canCreate && row.status === 'PENDING' && <Tooltip title="Modifier"><IconButton size="small" onClick={() => { dispatch(clearPaymentError()); setEditing(row); setForm(true) }}><EditOutlined fontSize="small" /></IconButton></Tooltip>}{canRefund && row.status === 'COMPLETED' && row.paymentType !== 'REFUND' && <Tooltip title="Rembourser"><IconButton color="secondary" size="small" onClick={() => { dispatch(clearPaymentError()); setRefunding(row) }}><ReplayRounded fontSize="small" /></IconButton></Tooltip>}{canCreate && ['PENDING', 'FAILED', 'CANCELLED'].includes(row.status) && <Tooltip title="Supprimer"><IconButton color="error" size="small" onClick={() => setDeleting(row)}><DeleteOutlineRounded fontSize="small" /></IconButton></Tooltip>}</Stack> },
  ], [canCreate, canRefund, dispatch])
  async function save(values) { try { await dispatch(editing ? editPayment({ id: editing.id, values }) : addPayment(values)).unwrap(); setForm(false); load() } catch { /* affiché */ } }
  async function refund(values) { try { await dispatch(refundPayment({ id: refunding.id, ...values })).unwrap(); setRefunding(null); load() } catch { /* affiché */ } }
  async function remove() { try { await dispatch(removePayment(deleting.id)).unwrap(); setDeleting(null); load() } catch { /* affiché */ } }
  return <Stack spacing={3}><PageHeader title="Paiements" description="Suivez les encaissements, acomptes et remboursements en dirhams." actionLabel="Nouveau paiement" canAction={canCreate} onAction={() => { dispatch(clearPaymentError()); setEditing(null); setForm(true) }} /><Card><Box sx={{ height: 650 }}><DataGrid columns={columns} disableRowSelectionOnClick loading={state.loading} pagination paginationMode="server" paginationModel={pagination} onPaginationModelChange={setPagination} pageSizeOptions={[10, 25, 50]} rowCount={state.total} rowHeight={62} rows={state.rows} sx={{ border: 0 }} /></Box></Card>{form && <EntityFormDialog title={editing ? 'Modifier le paiement' : 'Nouveau paiement'} initialValues={editing ? { ...empty, ...editing } : empty} fields={fields} error={state.mutationError} loading={state.submitting} onClose={() => setForm(false)} onSubmit={save} />}{refunding && <EntityFormDialog title="Enregistrer un remboursement" initialValues={{ amount: refunding.amount, notes: '' }} fields={[{ name: 'amount', label: 'Montant à rembourser (MAD)', type: 'number', min: .01, max: refunding.amount, step: '.01', required: true }, { name: 'notes', label: 'Motif du remboursement', multiline: true, fullWidth: true }]} error={state.mutationError} loading={state.submitting} onClose={() => setRefunding(null)} onSubmit={refund} />}<ConfirmDialog open={Boolean(deleting)} title="Supprimer le paiement ?" message="Seuls les paiements non comptabilisés peuvent être supprimés." error={state.mutationError} loading={state.submitting} onClose={() => setDeleting(null)} onConfirm={remove} confirmLabel="Supprimer" /></Stack>
}
export default PaymentsPage
