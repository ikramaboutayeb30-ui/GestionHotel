import { DeleteOutlineRounded, EditOutlined } from '@mui/icons-material'
import { Box, Card, IconButton, Stack, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EntityFormDialog from '../components/common/EntityFormDialog'
import PageHeader from '../components/common/PageHeader'
import StatusChip from '../components/common/StatusChip'
import { selectHasPermission } from '../features/auth/authSlice'
import { addRoomType, clearRoomError, editRoomType, fetchRoomTypes, removeRoomType } from '../features/rooms/roomSlice'
import { formatMoney } from '../utils/format'

const empty = { name: '', description: '', capacityAdults: 2, capacityChildren: 0, basePrice: '', status: 'ACTIVE' }
const fields = [
  { name: 'name', label: 'Nom du type', required: true }, { name: 'basePrice', label: 'Tarif de base (MAD)', type: 'number', min: 0, step: '0.01', required: true },
  { name: 'capacityAdults', label: 'Capacité adultes', type: 'number', min: 1, required: true }, { name: 'capacityChildren', label: 'Capacité enfants', type: 'number', min: 0, required: true },
  { name: 'status', label: 'Statut', options: [{ value: 'ACTIVE', label: 'Actif' }, { value: 'INACTIVE', label: 'Inactif' }] },
  { name: 'description', label: 'Description', multiline: true, fullWidth: true },
]

function RoomTypesPage() {
  const dispatch = useDispatch(); const { roomTypes, loading, submitting, mutationError } = useSelector((s) => s.rooms)
  const canManage = useSelector(selectHasPermission('room.manage')); const [editing, setEditing] = useState(null); const [form, setForm] = useState(false); const [deleting, setDeleting] = useState(null)
  useEffect(() => { dispatch(fetchRoomTypes()) }, [dispatch])
  const columns = useMemo(() => [
    { field: 'name', headerName: 'Type de chambre', flex: 1, minWidth: 180 },
    { field: 'basePrice', headerName: 'Tarif de base', minWidth: 150, valueFormatter: (v) => formatMoney(v) },
    { field: 'capacityAdults', headerName: 'Adultes', width: 100 }, { field: 'capacityChildren', headerName: 'Enfants', width: 100 },
    { field: 'roomCount', headerName: 'Chambres', width: 110 },
    { field: 'status', headerName: 'Statut', width: 120, renderCell: ({ value }) => <StatusChip value={value} /> },
    ...(canManage ? [{ field: 'actions', headerName: '', width: 100, sortable: false, renderCell: ({ row }) => <Stack direction="row" sx={{ alignItems: 'center', height: '100%' }}><Tooltip title="Modifier"><IconButton onClick={() => { dispatch(clearRoomError()); setEditing(row); setForm(true) }} size="small"><EditOutlined fontSize="small" /></IconButton></Tooltip><Tooltip title="Supprimer"><IconButton color="error" onClick={() => { dispatch(clearRoomError()); setDeleting(row) }} size="small"><DeleteOutlineRounded fontSize="small" /></IconButton></Tooltip></Stack> }] : []),
  ], [canManage, dispatch])
  async function save(values) { try { await dispatch(editing ? editRoomType({ id: editing.id, values }) : addRoomType(values)).unwrap(); setForm(false); dispatch(fetchRoomTypes()) } catch { /* affiché dans la boîte */ } }
  async function remove() { try { await dispatch(removeRoomType(deleting.id)).unwrap(); setDeleting(null) } catch { /* affiché */ } }
  return <Stack spacing={3}><PageHeader title="Types de chambres" description="Configurez les catégories, capacités et tarifs de référence." actionLabel="Ajouter un type" canAction={canManage} onAction={() => { dispatch(clearRoomError()); setEditing(null); setForm(true) }} /><Card><Box sx={{ height: 590 }}><DataGrid columns={columns} disableRowSelectionOnClick loading={loading} pageSizeOptions={[10, 25]} rows={roomTypes} sx={{ border: 0 }} /></Box></Card>{form && <EntityFormDialog title={editing ? 'Modifier le type' : 'Nouveau type de chambre'} initialValues={editing || empty} fields={fields} error={mutationError} loading={submitting} onClose={() => setForm(false)} onSubmit={save} />}<ConfirmDialog open={Boolean(deleting)} title="Supprimer ce type ?" message="La suppression est impossible si des chambres ou réservations l’utilisent." error={mutationError} loading={submitting} onClose={() => setDeleting(null)} onConfirm={remove} confirmLabel="Supprimer" /></Stack>
}
export default RoomTypesPage

