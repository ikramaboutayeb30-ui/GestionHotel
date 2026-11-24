import { Box, CircularProgress, CssBaseline, ThemeProvider } from '@mui/material'
import { lazy, Suspense, useEffect, useMemo } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import PermissionGuard from './components/auth/PermissionGuard'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { restoreUserSession, selectAuth } from './features/auth/authSlice'
import AppLayout from './layouts/AppLayout'
import { createAppTheme } from './theme'

const DashboardPreview = lazy(() => import('./pages/DashboardPreview'))
const GuestsPage = lazy(() => import('./pages/GuestsPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const ModulePlaceholder = lazy(() => import('./pages/ModulePlaceholder'))
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'))
const RequestsPage = lazy(() => import('./pages/RequestsPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const ReservationsPage = lazy(() => import('./pages/ReservationsPage'))
const RoomsPage = lazy(() => import('./pages/RoomsPage'))
const RoomTypesPage = lazy(() => import('./pages/RoomTypesPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))

function PageLoader() {
  return (
    <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', minHeight: 320 }}>
      <CircularProgress size={28} />
    </Box>
  )
}

function App() {
  const dispatch = useDispatch()
  const mode = useSelector((state) => state.ui.themeMode)
  const { initialized } = useSelector(selectAuth)
  const theme = useMemo(() => createAppTheme(mode), [mode])

  useEffect(() => {
    if (!initialized) dispatch(restoreUserSession())
  }, [dispatch, initialized])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          {!initialized ? (
            <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', minHeight: '100vh' }}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <Routes>
              <Route path="login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route index element={<DashboardPreview />} />
                  <Route path="reservations" element={<PermissionGuard permission="reservation.view"><ReservationsPage /></PermissionGuard>} />
                  <Route path="requests" element={<PermissionGuard permission="request.manage"><RequestsPage /></PermissionGuard>} />
                  <Route path="guests" element={<PermissionGuard permission="guest.view"><GuestsPage /></PermissionGuard>} />
                  <Route path="rooms" element={<PermissionGuard permission="room.view"><RoomsPage /></PermissionGuard>} />
                  <Route path="room-types" element={<PermissionGuard permission="room.view"><RoomTypesPage /></PermissionGuard>} />
                  <Route path="payments" element={<PermissionGuard permission="payment.view"><PaymentsPage /></PermissionGuard>} />
                  <Route path="reports" element={<PermissionGuard permission="report.view"><ReportsPage /></PermissionGuard>} />
                  <Route path="users" element={<PermissionGuard permission="user.manage"><UsersPage /></PermissionGuard>} />
                  <Route path="settings" element={<PermissionGuard permission="hotel.manage"><SettingsPage /></PermissionGuard>} />
                  <Route path="*" element={<ModulePlaceholder />} />
                </Route>
              </Route>
            </Routes>
          )}
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
