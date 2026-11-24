import { CheckRounded, CloseRounded, DeleteOutlineRounded, EditOutlined, PhoneInTalkRounded, SearchRounded } from '@mui/icons-material'
import { Box, Card, IconButton, InputAdornment, Stack, TextField, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ConfirmDialog from '../components/common/ConfirmDialog'; import EntityFormDialog from '../components/common/EntityFormDialog'; import PageHeader from '../components/common/PageHeader'; import StatusChip from '../components/common/StatusChip'
import { fetchGuests } from '../features/guests/guestSlice'; import { fetchRoomTypes } from '../features/rooms/roomSlice'
import { addRequest, approveRequest, changeRequestStatus, clearRequestError, editRequest, fetchRequests, removeRequest } from '../features/requests/requestSlice'
import { formatDate, formatMoney } from '../utils/format'

const today = new Date().toISOString().slice(0, 10); const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
const empty = { guestId: '', roomTypeId: '', arrivalDate: today, departureDate: tomorrow, adults: 1, children: 0, quotedAmount: '', source: 'PHONE', specialRequests: '' }

function RequestsPage() {
  const dispatch = useDispatch(); const state = useSelector((s) => s.requests); const guests = useSelector((s) => s.guests.rows); const roomTypes = useSelector((s) => s.rooms.roomTypes)
  const [search, setSearch] = useState(''); const [pagination, setPagination] = useState({ page: 0, pageSize: 10 }); const [editing, setEditing] = useState(null); const [form, setForm] = useState(false); const [action, setAction] = useState(null); const [approval, setApproval] = useState(null); const [deleting, setDeleting] = useState(null)
  const load = useCallback(() => dispatch(fetchRequests({ page: pagination.page + 1, limit: pagination.pageSize, search: search || undefined })), [dispatch, pagination, search])
  useEffect(() => { dispatch(fetchGuests({ page: 1, limit: 100 })); dispatch(fetchRoomTypes()) }, [dispatch]); useEffect(() => { const timer = setTimeout(load, 300); return () => clearTimeout(timer) }, [load])
  const fields = useMemo(() => [
    { name: 'guestId', label: 'Client', required: true, options: guests.map((x) => ({ value: x.id, label: `${x.firstName} ${x.lastName}` })) },
    { name: 'roomTypeId', label: 'Type de chambre', required: true, options: roomTypes.filter((x) => x.status === 'ACTIVE').map((x) => ({ value: x.id, label: x.name })) },
    { name: 'arrivalDate', label: 'Date d’arrivée', type: 'date', min: today, required: true }, { name: 'departureDate', label: 'Date de départ', type: 'date', min: today, required: true },
    { name: 'adults', label: 'Adultes', type: 'number', min: 1, required: true }, { name: 'children', label: 'Enfants', type: 'number', min: 0 },
    { name: 'quotedAmount', label: 'Tarif proposé / nuit (MAD)', type: 'number', min: 0, step: '.01' },
    { name: 'source', label: 'Source', options: [{ value: 'PHONE', label: 'Téléphone' }, { value: 'EMAIL', label: 'E-mail' }, { value: 'WALK_IN', label: 'Comptoir' }, { value: 'WEBSITE', label: 'Site web' }] },
    { name: 'specialRequests', label: 'Demandes particulières', multiline: true, fullWidth: true },
  ], [guests, roomTypes])
  const approveFields = approval ? [{ name: 'nightlyRate', label: 'Tarif par nuit (MAD)', type: 'number', min: 0, step: '.01', required: true }, { name: 'discountAmount', label: 'Remise totale (MAD)', type: 'number', min: 0, step: '.01' }] : []
  const columns = useMemo(() => [
    { field: 'requestNumber', headerName: 'Référence', minWidth: 150 }, { field: 'guest', headerName: 'Client', flex: 1, minWidth: 180, valueGetter: (_v, row) => row.guest ? `${row.guest.firstName} ${row.guest.lastName}` : '—' },
    { field: 'roomType', headerName: 'Type', minWidth: 150, valueGetter: (_v, row) => row.roomType?.name || '—' }, { field: 'arrivalDate', headerName: 'Arrivée', minWidth: 120, valueFormatter: formatDate }, { field: 'departureDate', headerName: 'Départ', minWidth: 120, valueFormatter: formatDate },
    { field: 'quotedAmount', headerName: 'Proposition', minWidth: 135, valueFormatter: (v) => v ? formatMoney(v) : '—' }, { field: 'status', headerName: 'Statut', minWidth: 120, renderCell: ({ value }) => <StatusChip value={value} /> },
    { field: 'actions', headerName: '', minWidth: 180, sortable: false, renderCell: ({ row }) => <Stack direction="row" sx={{ alignItems: 'center', height: '100%' }}>
      {['PENDING', 'CONTACTED'].includes(row.status) && <><Tooltip title="Modifier"><IconButton size="small" onClick={() => { dispatch(clearRequestError()); setEditing(row); setForm(true) }}><EditOutlined fontSize="small" /></IconButton></Tooltip>{row.status === 'PENDING' && <Tooltip title="Marquer comme contactée"><IconButton color="info" size="small" onClick={() => setAction({ row, status: 'CONTACTED', label: 'marquer cette demande comme contactée' })}><PhoneInTalkRounded fontSize="small" /></IconButton></Tooltip>}<Tooltip title="Approuver"><IconButton color="success" size="small" onClick={() => { dispatch(clearRequestError()); setApproval(row) }}><CheckRounded fontSize="small" /></IconButton></Tooltip><Tooltip title="Refuser"><IconButton color="error" size="small" onClick={() => setAction({ row, status: 'REJECTED', label: 'refuser cette demande' })}><CloseRounded fontSize="small" /></IconButton></Tooltip></>}
      {['PENDING', 'REJECTED', 'EXPIRED'].includes(row.status) && <Tooltip title="Supprimer"><IconButton color="error" size="small" onClick={() => setDeleting(row)}><DeleteOutlineRounded fontSize="small" /></IconButton></Tooltip>}
    </Stack> },
  ], [dispatch])
  async function save(values) { try { await dispatch(editing ? editRequest({ id: editing.id, values }) : addRequest(values)).unwrap(); setForm(false); load() } catch { /* affiché */ } }
  async function applyAction() { try { await dispatch(changeRequestStatus({ id: action.row.id, status: action.status })).unwrap(); setAction(null); load() } catch { /* affiché */ } }
  async function approve(values) { try { await dispatch(approveRequest({ id: approval.id, ...values })).unwrap(); setApproval(null); load() } catch { /* affiché */ } }
  async function remove() { try { await dispatch(removeRequest(deleting.id)).unwrap(); setDeleting(null); load() } catch { /* affiché */ } }
  return <Stack spacing={3}><PageHeader title="Demandes de réservation" description="Traitez les demandes reçues par téléphone, e-mail, comptoir ou site web." actionLabel="Nouvelle demande" onAction={() => { dispatch(clearRequestError()); setEditing(null); setForm(true) }} /><Card><Box sx={{ borderBottom: '1px solid', borderColor: 'divider', p: 2 }}><TextField size="small" placeholder="Rechercher une demande…" value={search} onChange={(e) => setSearch(e.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> } }} /></Box><Box sx={{ height: 610 }}><DataGrid columns={columns} disableRowSelectionOnClick loading={state.loading} pagination paginationMode="server" paginationModel={pagination} onPaginationModelChange={setPagination} pageSizeOptions={[10, 25, 50]} rowCount={state.total} rowHeight={62} rows={state.rows} sx={{ border: 0 }} /></Box></Card>{form && <EntityFormDialog title={editing ? `Modifier ${editing.requestNumber}` : 'Nouvelle demande'} initialValues={editing ? { ...empty, ...editing } : empty} fields={fields} error={state.mutationError} loading={state.submitting} onClose={() => setForm(false)} onSubmit={save} />}{approval && <EntityFormDialog title={`Approuver ${approval.requestNumber}`} initialValues={{ nightlyRate: approval.quotedAmount || approval.roomType?.basePrice || '', discountAmount: 0 }} fields={approveFields} error={state.mutationError} loading={state.submitting} onClose={() => setApproval(null)} onSubmit={approve} />}<ConfirmDialog open={Boolean(action)} title="Confirmer" message={action ? `Voulez-vous ${action.label} ?` : ''} error={state.mutationError} loading={state.submitting} onClose={() => setAction(null)} onConfirm={applyAction} /><ConfirmDialog open={Boolean(deleting)} title="Supprimer la demande ?" message="Cette action supprimera définitivement la demande." error={state.mutationError} loading={state.submitting} onClose={() => setDeleting(null)} onConfirm={remove} confirmLabel="Supprimer" /></Stack>
}
export default RequestsPage
