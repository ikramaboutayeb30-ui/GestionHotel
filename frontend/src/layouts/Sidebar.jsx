import { HotelRounded } from '@mui/icons-material'
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { NavLink, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { closeMobileSidebar } from '../features/ui/uiSlice'
import { userHasPermission } from '../features/auth/authSlice'
import { navigationGroups } from './navigation'

export const SIDEBAR_WIDTH = 272
export const SIDEBAR_COLLAPSED_WIDTH = 88

function Brand({ collapsed }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ alignItems: 'center', height: 72, px: collapsed ? 2 : 2.5, flexShrink: 0 }}
    >
      <Avatar
        variant="rounded"
        sx={{
          bgcolor: 'secondary.main',
          color: 'secondary.contrastText',
          height: 40,
          width: 40,
        }}
      >
        <HotelRounded fontSize="small" />
      </Avatar>
      {!collapsed && (
        <Box sx={{ minWidth: 0 }}>
          <Typography color="sidebar.active" sx={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.15 }}>
            Hôtel Suite
          </Typography>
          <Typography color="sidebar.muted" variant="caption">
            Console de gestion
          </Typography>
        </Box>
      )}
    </Stack>
  )
}

function SidebarContent({ collapsed = false, mobile = false }) {
  const dispatch = useDispatch()
  const location = useLocation()
  const user = useSelector((state) => state.auth.user)
  const compact = collapsed && !mobile
  const visibleGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => userHasPermission(user, item.permission)),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Stack sx={{ height: '100%', overflow: 'hidden' }}>
      <Brand collapsed={compact} />
      <Divider sx={{ borderColor: 'sidebar.border' }} />

      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: compact ? 1.25 : 1.5, py: 2 }}>
        {visibleGroups.map((group, groupIndex) => (
          <Box key={group.label} sx={{ mb: groupIndex === visibleGroups.length - 1 ? 0 : 2.5 }}>
            {!compact && (
              <Typography
                color="sidebar.muted"
                variant="overline"
                sx={{ display: 'block', px: 1.25, pb: 0.75 }}
              >
                {group.label}
              </Typography>
            )}
            <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
              {group.items.map((item) => {
                const active = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
                const Icon = item.icon
                const button = (
                  <ListItemButton
                    component={NavLink}
                    to={item.path}
                    onClick={() => mobile && dispatch(closeMobileSidebar())}
                    selected={active}
                    sx={{
                      color: active ? 'sidebar.active' : 'sidebar.text',
                      minHeight: 46,
                      justifyContent: compact ? 'center' : 'initial',
                      px: compact ? 1 : 1.25,
                      '&.Mui-selected': {
                        bgcolor: 'sidebar.activeBackground',
                        '&:hover': { bgcolor: 'sidebar.activeBackground' },
                      },
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: active ? 'sidebar.active' : 'sidebar.muted',
                        minWidth: compact ? 0 : 40,
                        justifyContent: 'center',
                      }}
                    >
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    {!compact && (
                      <ListItemText
                        primary={item.label}
                        slotProps={{ primary: { sx: { fontSize: '0.84rem', fontWeight: active ? 700 : 550 } } }}
                      />
                    )}
                    {!compact && item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          bgcolor: 'secondary.main',
                          color: 'secondary.contrastText',
                          height: 22,
                          minWidth: 26,
                        }}
                      />
                    )}
                  </ListItemButton>
                )

                return compact ? (
                  <Tooltip key={item.path} title={item.label} placement="right">
                    {button}
                  </Tooltip>
                ) : (
                  <Box key={item.path}>{button}</Box>
                )
              })}
            </List>
          </Box>
        ))}
      </Box>

      {!compact && (
        <Box sx={{ p: 1.5 }}>
          <Box
            sx={{
              bgcolor: 'sidebar.elevated',
              border: '1px solid',
              borderColor: 'sidebar.border',
              borderRadius: 2.5,
              p: 1.5,
            }}
          >
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
              <Box sx={{ bgcolor: '#58B58A', borderRadius: '50%', height: 8, width: 8 }} />
              <Box>
                <Typography color="sidebar.active" variant="subtitle2">
                  Hôtel opérationnel
                </Typography>
                <Typography color="sidebar.muted" variant="caption">
                  Tous les services sont disponibles
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      )}
    </Stack>
  )
}

function Sidebar() {
  const dispatch = useDispatch()
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed)
  const mobileOpen = useSelector((state) => state.ui.mobileSidebarOpen)
  const desktopWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  const paperStyles = {
    bgcolor: 'sidebar.background',
    backgroundImage: 'none',
    borderRight: '1px solid',
    borderColor: 'sidebar.border',
    color: 'sidebar.text',
  }

  return (
    <Box
      component="nav"
      aria-label="Navigation principale"
      sx={{
        alignSelf: { lg: 'flex-start' },
        flexShrink: { lg: 0 },
        height: { lg: '100vh' },
        position: { lg: 'sticky' },
        top: { lg: 0 },
        zIndex: (theme) => theme.zIndex.drawer,
      }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => dispatch(closeMobileSidebar())}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { ...paperStyles, height: '100dvh', width: SIDEBAR_WIDTH },
        }}
      >
        <SidebarContent mobile />
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', lg: 'block' },
          height: '100vh',
          width: desktopWidth,
          transition: (theme) => theme.transitions.create('width'),
          '& .MuiDrawer-paper': {
            ...paperStyles,
            height: '100vh',
            position: 'relative',
            transition: (theme) => theme.transitions.create('width'),
            width: desktopWidth,
          },
        }}
      >
        <SidebarContent collapsed={collapsed} />
      </Drawer>
    </Box>
  )
}

export default Sidebar
