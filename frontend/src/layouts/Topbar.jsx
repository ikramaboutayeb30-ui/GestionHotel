import {
  DarkModeRounded,
  KeyboardArrowDownRounded,
  LightModeRounded,
  LogoutRounded,
  MenuOpenRounded,
  MenuRounded,
  NotificationsNoneRounded,
  SearchRounded,
  SettingsRounded,
} from '@mui/icons-material'
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  InputBase,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser, selectCurrentUser } from '../features/auth/authSlice'
import { openMobileSidebar, toggleSidebar, toggleTheme } from '../features/ui/uiSlice'
import { getPageTitle } from './navigation'

function Topbar() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const mode = useSelector((state) => state.ui.themeMode)
  const user = useSelector(selectCurrentUser)
  const signingOut = useSelector((state) => state.auth.status === 'signingOut')
  const [profileAnchor, setProfileAnchor] = useState(null)
  const pageTitle = getPageTitle(location.pathname)
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Utilisateur'
  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'HU'

  async function handleLogout() {
    setProfileAnchor(null)
    await dispatch(logoutUser())
    navigate('/login', { replace: true })
  }

  return (
    <AppBar
      color="inherit"
      elevation={0}
      position="sticky"
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar sx={{ height: 72, minHeight: '72px !important', px: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Tooltip title="Ouvrir la navigation">
            <IconButton
              aria-label="Ouvrir la navigation"
              onClick={() => dispatch(openMobileSidebar())}
              sx={{ display: { lg: 'none' } }}
            >
              <MenuRounded />
            </IconButton>
          </Tooltip>
          <Tooltip title="Réduire la navigation">
            <IconButton
              aria-label="Réduire la navigation"
              onClick={() => dispatch(toggleSidebar())}
              sx={{ display: { xs: 'none', lg: 'inline-flex' } }}
            >
              <MenuOpenRounded />
            </IconButton>
          </Tooltip>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" noWrap>
              {pageTitle}
            </Typography>
            <Typography color="text.secondary" variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {new Intl.DateTimeFormat('fr-MA', { dateStyle: 'full' }).format(new Date())}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ flex: 1 }} />

        <Box
          sx={{
            alignItems: 'center',
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2.5,
            display: { xs: 'none', md: 'flex' },
            height: 42,
            maxWidth: 320,
            mr: 2,
            px: 1.5,
            width: '28vw',
          }}
        >
          <SearchRounded color="action" fontSize="small" />
          <InputBase
            placeholder="Rechercher clients, chambres…"
            inputProps={{ 'aria-label': 'Rechercher' }}
            sx={{ fontSize: '0.83rem', ml: 1, width: '100%' }}
          />
          <Typography color="text.disabled" variant="caption">
            Ctrl K
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Tooltip title={mode === 'light' ? 'Mode sombre' : 'Mode clair'}>
            <IconButton aria-label="Changer le thème" onClick={() => dispatch(toggleTheme())}>
              {mode === 'light' ? <DarkModeRounded fontSize="small" /> : <LightModeRounded fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton aria-label="Notifications">
              <Badge color="error" variant="dot" overlap="circular">
                <NotificationsNoneRounded fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: { xs: 0.5, sm: 1 } }} />
          <Stack
            component="button"
            direction="row"
            spacing={1}
            onClick={(event) => setProfileAnchor(event.currentTarget)}
            aria-label="Ouvrir le menu du profil"
            sx={{
              bgcolor: 'transparent',
              alignItems: 'center',
              border: 0,
              borderRadius: 2,
              color: 'text.primary',
              cursor: 'pointer',
              font: 'inherit',
              p: 0.5,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', height: 36, width: 36 }}>
              {initials}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
              <Typography variant="subtitle2">{fullName}</Typography>
              <Typography color="text.secondary" variant="caption">
                {user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
              </Typography>
            </Box>
            <KeyboardArrowDownRounded sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }} />
          </Stack>
        </Stack>

        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={() => setProfileAnchor(null)}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        >
          <MenuItem onClick={() => { setProfileAnchor(null); navigate('/settings') }}>
            <ListItemIcon><SettingsRounded fontSize="small" /></ListItemIcon>
            Paramètres de l’hôtel
          </MenuItem>
          <Divider />
          <MenuItem disabled={signingOut} onClick={handleLogout}>
            <ListItemIcon><LogoutRounded color="error" fontSize="small" /></ListItemIcon>
            <Typography color="error">Se déconnecter</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default Topbar
