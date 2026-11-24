import { BlockRounded, EditOutlined } from '@mui/icons-material'
import { Avatar, Box, Card, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ConfirmDialog from '../components/common/ConfirmDialog'; import PageHeader from '../components/common/PageHeader'; import StatusChip from '../components/common/StatusChip'; import UserFormDialog from '../features/users/UserFormDialog'
import { addUser, clearUserError, deactivateUser, editUser, fetchPermissions, fetchUsers } from '../features/users/userSlice'
import { formatDateTime } from '../utils/format'

function UsersPage() {
  const dispatch = useDispatch(); const state = useSelector((s) => s.users); const currentUser = useSelector((s) => s.auth.user); const [editing, setEditing] = useState(null); const [form, setForm] = useState(false); const [deactivating, setDeactivating] = useState(null)
  const load = useCallback(() => dispatch(fetchUsers()), [dispatch]); useEffect(() => { load(); dispatch(fetchPermissions()) }, [dispatch, load])
  const columns = useMemo(() => [
    { field: 'firstName', headerName: 'Utilisateur', flex: 1, minWidth: 220, renderCell: ({ row }) => <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', height: '100%' }}><Avatar sx={{ bgcolor: 'action.selected', color: 'primary.main', fontSize: '.75rem', height: 36, width: 36 }}>{`${row.firstName[0]}${row.lastName[0]}`}</Avatar><Box><Typography variant="subtitle2">{row.firstName} {row.lastName}</Typography><Typography color="text.secondary" variant="caption">{row.email}</Typography></Box></Stack> },
    { field: 'role', headerName: 'Rôle', minWidth: 150, renderCell: ({ value }) => <StatusChip value={value} /> }, { field: 'status', headerName: 'Statut', minWidth: 120, renderCell: ({ value }) => <StatusChip value={value} /> },
    { field: 'permissions', headerName: 'Permissions', minWidth: 130, valueGetter: (_v, row) => row.role === 'ADMIN' ? 'Toutes' : `${row.permissions?.length || 0} accordée(s)` },
    { field: 'lastLoginAt', headerName: 'Dernière connexion', minWidth: 180, valueFormatter: formatDateTime },
    { field: 'actions', headerName: '', width: 100, sortable: false, renderCell: ({ row }) => <Stack direction="row" sx={{ alignItems: 'center', height: '100%' }}><Tooltip title="Modifier"><IconButton size="small" onClick={() => { dispatch(clearUserError()); setEditing(row); setForm(true) }}><EditOutlined fontSize="small" /></IconButton></Tooltip>{row.status === 'ACTIVE' && String(row.id) !== String(currentUser?.id) && <Tooltip title="Désactiver"><IconButton color="error" size="small" onClick={() => setDeactivating(row)}><BlockRounded fontSize="small" /></IconButton></Tooltip>}</Stack> },
  ], [currentUser?.id, dispatch])
  async function save(values) { const clean = { ...values }; if (!clean.password) delete clean.password; try { await dispatch(editing ? editUser({ id: editing.id, values: clean }) : addUser(clean)).unwrap(); setForm(false); load() } catch { /* affiché */ } }
  async function deactivate() { try { await dispatch(deactivateUser(deactivating.id)).unwrap(); setDeactivating(null); load() } catch { /* affiché */ } }
  return <Stack spacing={3}><PageHeader title="Utilisateurs" description="Gérez les comptes du personnel et leurs autorisations." actionLabel="Nouvel utilisateur" onAction={() => { dispatch(clearUserError()); setEditing(null); setForm(true) }} /><Card><Box sx={{ height: 620 }}><DataGrid columns={columns} disableRowSelectionOnClick loading={state.loading} pageSizeOptions={[10, 25]} rowHeight={64} rows={state.rows} sx={{ border: 0 }} /></Box></Card>{form && <UserFormDialog user={editing} permissions={state.permissions} error={state.mutationError} loading={state.submitting} onClose={() => setForm(false)} onSubmit={save} />}<ConfirmDialog open={Boolean(deactivating)} title="Désactiver cet utilisateur ?" message={deactivating ? `${deactivating.firstName} ${deactivating.lastName} ne pourra plus se connecter.` : ''} error={state.mutationError} loading={state.submitting} onClose={() => setDeactivating(null)} onConfirm={deactivate} confirmLabel="Désactiver" /></Stack>
}
export default UsersPage
