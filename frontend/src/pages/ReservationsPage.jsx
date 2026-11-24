import { CancelOutlined, CheckCircleOutlineRounded, DeleteOutlineRounded, EditOutlined, HotelRounded, SearchRounded } from '@mui/icons-material'
import { Box, Card, IconButton, InputAdornment, Stack, TextField, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ConfirmDialog from '../components/common/ConfirmDialog'; import EntityFormDialog from '../components/common/EntityFormDialog'; import PageHeader from '../components/common/PageHeader'; import StatusChip from '../components/common/StatusChip'
import { selectHasPermission } from '../features/auth/authSlice'; import { fetchGuests } from '../features/guests/guestSlice'; import { fetchRoomTypes } from '../features/rooms/roomSlice'
import { addReservation, clearReservationError, editReservation, fetchReservations, removeReservation, setReservationStatus } from '../features/reservations/reservationSlice'
import { formatDate, formatMoney } from '../utils/format'

const today = new Date().toISOString().slice(0, 10)
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
const empty = { guestId: '', roomTypeId: '', arrivalDate: today, departureDate: tomorrow, adults: 1, children: 0, nightlyRate: '', discountAmount: 0, source: 'PHONE', notes: '' }

function ReservationsPage() {
  const dispatch = useDispatch(); const state = useSelector((s) => s.reservations); const guests = useSelector((s) => s.guests.rows); const roomTypes = useSelector((s) => s.rooms.roomTypes)
  const canCreate = useSelector(selectHasPermission('reservation.create')); const canUpdate = useSelector(selectHasPermission('reservation.update')); const canCancel = useSelector(selectHasPermission('reservation.cancel'))
  const [search, setSearch] = useState(''); const [pagination, setPagination] = useState({ page: 0, pageSize: 10 }); const [editing, setEditing] = useState(null); const [form, setForm] = useState(false); const [statusAction, setStatusAction] = useState(null); const [deleting, setDeleting] = useState(null)
  const load = useCallback(() => dispatch(fetchReservations({ page: pagination.page + 1, limit: pagination.pageSize, search: search || undefined })), [dispatch, pagination, search])
  useEffect(() => { dispatch(fetchGuests({ page: 1, limit: 100 })); dispatch(fetchRoomTypes()) }, [dispatch]); useEffect(() => { const timer = setTimeout(load, 300); return () => clearTimeout(timer) }, [load])
  const fields = useMemo(() => [
    { name: 'guestId', label: 'Client', required: true, options: guests.map((x) => ({ value: x.id, label: `${x.firstName} ${x.lastName} · ${x.phone}` })) },
    { name: 'roomTypeId', label: 'Type de chambre', required: true, options: roomTypes.filter((x) => x.status === 'ACTIVE').map((x) => ({ value: x.id, label: `${x.name} · ${formatMoney(x.basePrice)}` })) },
    { name: 'arrivalDate', label: 'Date d’arrivée', type: 'date', min: today, required: true }, { name: 'departureDate', label: 'Date de départ', type: 'date', min: today, required: true },
    { name: 'adults', label: 'Adultes', type: 'number', min: 1, required: true }, { name: 'children', label: 'Enfants', type: 'number', min: 0, required: true },
    { name: 'nightlyRate', label: 'Tarif par nuit (MAD)', type: 'number', min: 0, step: '.01', required: true }, { name: 'discountAmount', label: 'Remise totale (MAD)', type: 'number', min: 0, step: '.01' },
    { name: 'source', label: 'Source', options: [{ value: 'PHONE', label: 'Téléphone' }, { value: 'EMAIL', label: 'E-mail' }, { value: 'WALK_IN', label: 'Comptoir' }, { value: 'WEBSITE', label: 'Site web' }] },
    { name: 'notes', label: 'Notes et demandes particulières', multiline: true, fullWidth: true },
  ], [guests, roomTypes])
  const columns = useMemo(() => [
    { field: 'confirmationNumber', headerName: 'Référence', minWidth: 155 },
    { field: 'guest', headerName: 'Client', flex: 1, minWidth: 180, valueGetter: (_v, row) => row.guest ? `${row.guest.firstName} ${row.guest.lastName}` : '—' },
    { field: 'room', headerName: 'Chambre', minWidth: 130, valueGetter: (_v, row) => row.room ? `${row.room.roomNumber} · ${row.roomType?.name || ''}` : row.roomType?.name || '—' },
    { field: 'arrivalDate', headerName: 'Arrivée', minWidth: 125, valueFormatter: formatDate }, { field: 'departureDate', headerName: 'Départ', minWidth: 125, valueFormatter: formatDate },
    { field: 'totalAmount', headerName: 'Total', minWidth: 140, valueFormatter: formatMoney }, { field: 'status', headerName: 'Statut', minWidth: 125, renderCell: ({ value }) => <StatusChip value={value} /> },
    { field: 'actions', headerName: '', width: 150, sortable: false, renderCell: ({ row }) => <Stack direction="row" sx={{ alignItems: 'center', height: '100%' }}>
      {canUpdate && row.status === 'CONFIRMED' && <><Tooltip title="Modifier"><IconButton size="small" onClick={() => { dispatch(clearReservationError()); setEditing(row); setForm(true) }}><EditOutlined fontSize="small" /></IconButton></Tooltip><Tooltip title="Enregistrer l’arrivée"><IconButton color="success" size="small" onClick={() => setStatusAction({ row, status: 'CHECKED_IN', label: 'enregistrer l’arrivée' })}><HotelRounded fontSize="small" /></IconButton></Tooltip></>}
      {canUpdate && row.status === 'CHECKED_IN' && <Tooltip title="Enregistrer le départ"><IconButton color="success" size="small" onClick={() => setStatusAction({ row, status: 'CHECKED_OUT', label: 'enregistrer le départ' })}><CheckCircleOutlineRounded fontSize="small" /></IconButton></Tooltip>}
      {canCancel && row.status === 'CONFIRMED' && <Tooltip title="Annuler"><IconButton color="error" size="small" onClick={() => setStatusAction({ row, status: 'CANCELLED', label: 'annuler la réservation' })}><CancelOutlined fontSize="small" /></IconButton></Tooltip>}
      {canCancel && ['CANCELLED', 'NO_SHOW'].includes(row.status) && <Tooltip title="Supprimer"><IconButton color="error" size="small" onClick={() => setDeleting(row)}><DeleteOutlineRounded fontSize="small" /></IconButton></Tooltip>}
    </Stack> },
  ], [canCancel, canUpdate, dispatch])
  async function save(values) { try { await dispatch(editing ? editReservation({ id: editing.id, values }) : addReservation(values)).unwrap(); setForm(false); load() } catch { /* affiché */ } }
  async function applyStatus() { try { await dispatch(setReservationStatus({ id: statusAction.row.id, status: statusAction.status })).unwrap(); setStatusAction(null); load() } catch { /* affiché */ } }
  async function remove() { try { await dispatch(removeReservation(deleting.id)).unwrap(); setDeleting(null); load() } catch { /* affiché */ } }
  return <Stack spacing={3}><PageHeader title="Réservations" description="Gérez les séjours, arrivées, départs et annulations." actionLabel="Nouvelle réservation" canAction={canCreate} onAction={() => { dispatch(clearReservationError()); setEditing(null); setForm(true) }} /><Card><Box sx={{ borderBottom: '1px solid', borderColor: 'divider', p: 2 }}><TextField size="small" placeholder="Référence, client ou chambre…" value={search} onChange={(e) => setSearch(e.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> } }} /></Box><Box sx={{ height: 610 }}><DataGrid columns={columns} disableRowSelectionOnClick loading={state.loading} pagination paginationMode="server" paginationModel={pagination} onPaginationModelChange={setPagination} pageSizeOptions={[10, 25, 50]} rowCount={state.total} rowHeight={62} rows={state.rows} sx={{ border: 0 }} /></Box></Card>{form && <EntityFormDialog title={editing ? `Modifier ${editing.confirmationNumber}` : 'Nouvelle réservation'} initialValues={editing ? { ...empty, ...editing } : empty} fields={fields} error={state.mutationError} loading={state.submitting} onClose={() => setForm(false)} onSubmit={save} />}<ConfirmDialog open={Boolean(statusAction)} title="Confirmer l’opération" message={statusAction ? `Voulez-vous ${statusAction.label} ${statusAction.row.confirmationNumber} ?` : ''} error={state.mutationError} loading={state.submitting} onClose={() => setStatusAction(null)} onConfirm={applyStatus} confirmLabel="Confirmer" /><ConfirmDialog open={Boolean(deleting)} title="Supprimer la réservation ?" message="Seules les réservations annulées sans paiement peuvent être supprimées." error={state.mutationError} loading={state.submitting} onClose={() => setDeleting(null)} onConfirm={remove} confirmLabel="Supprimer" /></Stack>
}
export default ReservationsPage
