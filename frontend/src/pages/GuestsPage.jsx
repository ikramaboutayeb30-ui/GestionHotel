import {
  AddRounded,
  DeleteOutlineRounded,
  EditOutlined,
  PeopleAltRounded,
  RefreshRounded,
  SearchRounded,
} from '@mui/icons-material'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import GuestFormDialog from '../features/guests/GuestFormDialog'
import {
  clearGuestMutationError,
  createGuest,
  deleteGuest,
  fetchGuests,
  updateGuest,
} from '../features/guests/guestSlice'
import { selectHasPermission } from '../features/auth/authSlice'

function GuestsPage() {
  const dispatch = useDispatch()
  const { error, loading, mutationError, rows, submitting, total } = useSelector((state) => state.guests)
  const canManage = useSelector(selectHasPermission('guest.manage'))
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [sortModel, setSortModel] = useState([{ field: 'createdAt', sort: 'desc' }])
  const [formOpen, setFormOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState(null)
  const [guestToDelete, setGuestToDelete] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPaginationModel((current) => ({ ...current, page: 0 }))
    }, 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const loadGuests = useCallback(() => {
    const activeSort = sortModel[0]
    dispatch(
      fetchGuests({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: search || undefined,
        sortBy: activeSort?.field || 'createdAt',
        sortOrder: activeSort?.sort || 'desc',
      }),
    )
  }, [dispatch, paginationModel, search, sortModel])

  useEffect(() => {
    loadGuests()
  }, [loadGuests])

  function openCreateDialog() {
    dispatch(clearGuestMutationError())
    setSelectedGuest(null)
    setFormOpen(true)
  }

  const openEditDialog = useCallback((guest) => {
    dispatch(clearGuestMutationError())
    setSelectedGuest(guest)
    setFormOpen(true)
  }, [dispatch])

  async function handleSave(values) {
    const action = selectedGuest
      ? updateGuest({ id: selectedGuest.id, values })
      : createGuest(values)
    try {
      await dispatch(action).unwrap()
      setFormOpen(false)
      setNotice({ message: selectedGuest ? 'Client mis à jour' : 'Client ajouté', severity: 'success' })
      loadGuests()
    } catch {
      // The Redux mutation error is displayed inside the form.
    }
  }

  async function handleDelete() {
    try {
      await dispatch(deleteGuest(guestToDelete.id)).unwrap()
      setGuestToDelete(null)
      setNotice({ message: 'Client supprimé', severity: 'success' })
      loadGuests()
    } catch {
      // The Redux mutation error is displayed in the confirmation dialog.
    }
  }

  const columns = useMemo(() => {
    const baseColumns = [
      {
        field: 'firstName',
        headerName: 'Client',
        flex: 1.4,
        minWidth: 230,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', height: '100%' }}>
            <Avatar sx={{ bgcolor: 'action.selected', color: 'primary.main', fontSize: '0.76rem', fontWeight: 750, height: 36, width: 36 }}>
              {`${row.firstName?.[0] || ''}${row.lastName?.[0] || ''}`.toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>{row.firstName} {row.lastName}</Typography>
              <Typography color="text.secondary" variant="caption" noWrap>{row.email || 'E-mail non renseigné'}</Typography>
            </Box>
          </Stack>
        ),
      },
      { field: 'phone', headerName: 'Téléphone', flex: 0.85, minWidth: 150 },
      {
        field: 'nationality',
        headerName: 'Nationalité',
        flex: 0.75,
        minWidth: 130,
        valueFormatter: (value) => value || '—',
      },
      {
        field: 'identificationNumber',
        headerName: 'Pièce d’identité',
        flex: 0.9,
        minWidth: 160,
        valueFormatter: (value) => value || '—',
      },
      {
        field: 'createdAt',
        headerName: 'Ajouté le',
        minWidth: 130,
        valueFormatter: (value) => value ? new Intl.DateTimeFormat('fr-MA', { dateStyle: 'medium' }).format(new Date(value)) : '—',
      },
    ]

    if (canManage) {
      baseColumns.push({
        field: 'actions',
        headerName: '',
        align: 'right',
        headerAlign: 'right',
        sortable: false,
        filterable: false,
        width: 110,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
            <Tooltip title="Modifier le client">
              <IconButton aria-label={`Modifier ${row.firstName} ${row.lastName}`} onClick={() => openEditDialog(row)} size="small">
                <EditOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Supprimer le client">
              <IconButton
                aria-label={`Supprimer ${row.firstName} ${row.lastName}`}
                color="error"
                onClick={() => { dispatch(clearGuestMutationError()); setGuestToDelete(row) }}
                size="small"
              >
                <DeleteOutlineRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      })
    }
    return baseColumns
  }, [canManage, dispatch, openEditDialog])

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, gap: 2, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h2">Clients</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Gérez les fiches clients, leurs coordonnées et leurs pièces d’identité.
          </Typography>
        </Box>
        {canManage && <Button onClick={openCreateDialog} startIcon={<AddRounded />} variant="contained">Ajouter un client</Button>}
      </Stack>

      {error && (
        <Alert
          action={<Button color="inherit" onClick={loadGuests} size="small">Réessayer</Button>}
          severity="error"
        >
          {error}
        </Alert>
      )}

      <Card sx={{ overflow: 'hidden' }}>
        <Box
          sx={{
            alignItems: { sm: 'center' },
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            justifyContent: 'space-between',
            p: 2,
          }}
        >
          <TextField
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Nom, téléphone, e-mail ou CIN…"
            size="small"
            value={searchInput}
            sx={{ maxWidth: 420, width: '100%' }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment>,
              },
            }}
          />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'action.selected', color: 'primary.main', height: 34, width: 34 }}>
                <PeopleAltRounded fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="subtitle2">{total.toLocaleString('fr-MA')} client(s)</Typography>
                <Typography color="text.secondary" variant="caption">Fiches enregistrées</Typography>
              </Box>
            </Stack>
            <Tooltip title="Actualiser">
              <IconButton aria-label="Actualiser les clients" disabled={loading} onClick={loadGuests}>
                <RefreshRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Box sx={{ height: 620, width: '100%' }}>
          <DataGrid
            columns={columns}
            disableRowSelectionOnClick
            loading={loading}
            onPaginationModelChange={setPaginationModel}
            onSortModelChange={(model) => {
              setSortModel(model)
              setPaginationModel((current) => ({ ...current, page: 0 }))
            }}
            pageSizeOptions={[10, 25, 50]}
            pagination
            paginationMode="server"
            paginationModel={paginationModel}
            rowCount={total}
            rowHeight={68}
            rows={rows}
            sortingMode="server"
            sortModel={sortModel}
            sx={{
              border: 0,
              '& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover' },
              '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
              '& .MuiDataGrid-cell': { borderColor: 'divider' },
              '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
            }}
          />
        </Box>
      </Card>

      {formOpen && (
        <GuestFormDialog
          error={mutationError}
          guest={selectedGuest}
          loading={submitting}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSave}
          open
        />
      )}

      <Dialog maxWidth="xs" onClose={submitting ? undefined : () => setGuestToDelete(null)} open={Boolean(guestToDelete)}>
        <DialogTitle>Supprimer ce client ?</DialogTitle>
        <DialogContent>
          {mutationError && <Alert severity="error" sx={{ mb: 2 }}>{mutationError}</Alert>}
          <Typography color="text.secondary">
            {guestToDelete
              ? `${guestToDelete.firstName} ${guestToDelete.lastName} sera supprimé définitivement. Un client ayant un historique de réservation ne peut pas être supprimé.`
              : ''}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button disabled={submitting} onClick={() => setGuestToDelete(null)}>Annuler</Button>
          <Button color="error" disabled={submitting} onClick={handleDelete} variant="contained">
            {submitting ? 'Suppression…' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        autoHideDuration={3500}
        onClose={() => setNotice(null)}
        open={Boolean(notice)}
        message={notice?.message}
      />
    </Stack>
  )
}

export default GuestsPage
