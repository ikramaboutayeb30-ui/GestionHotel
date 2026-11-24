import { DeleteOutlineRounded, EditOutlined, SearchRounded } from '@mui/icons-material'
import { Box, Card, IconButton, InputAdornment, Stack, TextField, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ConfirmDialog from '../components/common/ConfirmDialog'; import EntityFormDialog from '../components/common/EntityFormDialog'; import PageHeader from '../components/common/PageHeader'; import StatusChip from '../components/common/StatusChip'
import { selectHasPermission } from '../features/auth/authSlice'
import { addRoom, clearRoomError, editRoom, fetchRooms, fetchRoomTypes, removeRoom } from '../features/rooms/roomSlice'

const empty = { roomTypeId: '', roomNumber: '', floor: '', operationalStatus: 'ACTIVE', housekeepingStatus: 'CLEAN', notes: '' }
function RoomsPage() {
  const dispatch = useDispatch(); const state = useSelector((s) => s.rooms); const canManage = useSelector(selectHasPermission('room.manage'))
  const [search, setSearch] = useState(''); const [pagination, setPagination] = useState({ page: 0, pageSize: 25 }); const [editing, setEditing] = useState(null); const [form, setForm] = useState(false); const [deleting, setDeleting] = useState(null)
  const load = useCallback(() => dispatch(fetchRooms({ page: pagination.page + 1, limit: pagination.pageSize, search: search || undefined })), [dispatch, pagination, search])
  useEffect(() => { dispatch(fetchRoomTypes()) }, [dispatch]); useEffect(() => { const timer = setTimeout(load, 300); return () => clearTimeout(timer) }, [load])
  const fields = useMemo(() => [
    { name: 'roomNumber', label: 'Numéro de chambre', required: true }, { name: 'floor', label: 'Étage' },
    { name: 'roomTypeId', label: 'Type de chambre', required: true, options: state.roomTypes.map((x) => ({ value: x.id, label: x.name })) },
    { name: 'operationalStatus', label: 'État opérationnel', options: [{ value: 'ACTIVE', label: 'Active' }, { value: 'MAINTENANCE', label: 'Maintenance' }, { value: 'OUT_OF_SERVICE', label: 'Hors service' }] },
    { name: 'housekeepingStatus', label: 'État ménage', options: [{ value: 'CLEAN', label: 'Propre' }, { value: 'DIRTY', label: 'À nettoyer' }, { value: 'IN_PROGRESS', label: 'En cours' }, { value: 'INSPECTED', label: 'Inspectée' }] },
    { name: 'notes', label: 'Notes', multiline: true, fullWidth: true },
  ], [state.roomTypes])
  const columns = useMemo(() => [
    { field: 'roomNumber', headerName: 'Chambre', minWidth: 120, flex: .5 }, { field: 'floor', headerName: 'Étage', width: 100, valueFormatter: (v) => v || '—' },
    { field: 'roomType', headerName: 'Type', flex: 1, minWidth: 170, valueGetter: (_v, row) => row.roomType?.name || '—' },
    { field: 'operationalStatus', headerName: 'État', width: 145, renderCell: ({ value }) => <StatusChip value={value} /> },
    { field: 'housekeepingStatus', headerName: 'Ménage', width: 145, renderCell: ({ value }) => <StatusChip value={value} /> },
    ...(canManage ? [{ field: 'actions', headerName: '', width: 100, sortable: false, renderCell: ({ row }) => <Stack direction="row" sx={{ alignItems: 'center', height: '100%' }}><Tooltip title="Modifier"><IconButton size="small" onClick={() => { dispatch(clearRoomError()); setEditing(row); setForm(true) }}><EditOutlined fontSize="small" /></IconButton></Tooltip><Tooltip title="Supprimer"><IconButton size="small" color="error" onClick={() => { dispatch(clearRoomError()); setDeleting(row) }}><DeleteOutlineRounded fontSize="small" /></IconButton></Tooltip></Stack> }] : []),
  ], [canManage, dispatch])
  async function save(values) { try { await dispatch(editing ? editRoom({ id: editing.id, values }) : addRoom(values)).unwrap(); setForm(false); load() } catch { /* affiché */ } }
  async function remove() { try { await dispatch(removeRoom(deleting.id)).unwrap(); setDeleting(null) } catch { /* affiché */ } }
  return <Stack spacing={3}><PageHeader title="Chambres" description="Suivez la disponibilité opérationnelle et l’état du ménage." actionLabel="Ajouter une chambre" canAction={canManage} onAction={() => { dispatch(clearRoomError()); setEditing(null); setForm(true) }} /><Card><Box sx={{ borderBottom: '1px solid', borderColor: 'divider', p: 2 }}><TextField size="small" placeholder="Rechercher une chambre…" value={search} onChange={(e) => setSearch(e.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> } }} /></Box><Box sx={{ height: 580 }}><DataGrid columns={columns} disableRowSelectionOnClick loading={state.loading} pagination paginationMode="server" paginationModel={pagination} onPaginationModelChange={setPagination} pageSizeOptions={[10, 25, 50]} rowCount={state.total} rows={state.rooms} sx={{ border: 0 }} /></Box></Card>{form && <EntityFormDialog title={editing ? `Modifier la chambre ${editing.roomNumber}` : 'Nouvelle chambre'} initialValues={editing || empty} fields={fields} error={state.mutationError} loading={state.submitting} onClose={() => setForm(false)} onSubmit={save} />}<ConfirmDialog open={Boolean(deleting)} title="Supprimer la chambre ?" message="Une chambre ayant un historique de réservations ne peut pas être supprimée." error={state.mutationError} loading={state.submitting} onClose={() => setDeleting(null)} onConfirm={remove} confirmLabel="Supprimer" /></Stack>
}
export default RoomsPage
