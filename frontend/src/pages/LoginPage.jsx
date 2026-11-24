import {
  DarkModeRounded,
  HotelRounded,
  LightModeRounded,
  LockOutlined,
  VisibilityOffRounded,
  VisibilityRounded,
} from '@mui/icons-material'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { clearAuthError, loginUser, selectAuth } from '../features/auth/authSlice'
import { toggleTheme } from '../features/ui/uiSlice'

function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { authenticated, error, status } = useSelector(selectAuth)
  const mode = useSelector((state) => state.ui.themeMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const loading = status === 'loading'

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  useEffect(() => {
    if (authenticated) {
      navigate(location.state?.from?.pathname || '/', { replace: true })
    }
  }, [authenticated, location.state, navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    await dispatch(loginUser({ email, password }))
  }

  return (
    <Box
      component="main"
      sx={{
        bgcolor: 'background.default',
        display: 'grid',
        minHeight: '100vh',
        placeItems: 'center',
        position: 'relative',
        px: 2,
        py: 4,
      }}
    >
      <Tooltip title={mode === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}>
        <IconButton
          aria-label="Changer le thème"
          onClick={() => dispatch(toggleTheme())}
          sx={{ position: 'absolute', right: 24, top: 24 }}
        >
          {mode === 'light' ? <DarkModeRounded /> : <LightModeRounded />}
        </IconButton>
      </Tooltip>

      <Box sx={{ maxWidth: 1080, width: '100%' }}>
        <Card sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' }, overflow: 'hidden' }}>
          <Box
            sx={{
              bgcolor: 'sidebar.background',
              color: 'sidebar.text',
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 620,
              p: 5,
              position: 'relative',
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Avatar variant="rounded" sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                <HotelRounded />
              </Avatar>
              <Box>
                <Typography color="sidebar.active" variant="h4">Hôtel Suite</Typography>
                <Typography color="sidebar.muted" variant="caption">Console de gestion</Typography>
              </Box>
            </Stack>

            <Box sx={{ maxWidth: 340 }}>
              <Typography color="sidebar.active" sx={{ fontSize: '2.1rem', fontWeight: 760, letterSpacing: '-0.04em', lineHeight: 1.2 }}>
                Toute la gestion de votre hôtel, dans un espace simple et fiable.
              </Typography>
              <Typography color="sidebar.muted" sx={{ mt: 2 }}>
                Gérez les réservations, chambres, clients, paiements et opérations quotidiennes depuis un seul endroit.
              </Typography>
            </Box>

            <Typography color="sidebar.muted" variant="caption">Accès sécurisé du personnel · Hôtel Suite</Typography>
          </Box>

          <CardContent sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', p: { xs: 3, sm: 6 } }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 420, width: '100%' }}>
              <Avatar sx={{ bgcolor: 'action.selected', color: 'primary.main', display: { md: 'none' }, mb: 2 }}>
                <HotelRounded />
              </Avatar>
              <Typography variant="h2">Bon retour</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75, mb: 4 }}>
                Connectez-vous avec votre compte professionnel.
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

              <Stack spacing={2.25}>
                <TextField
                  autoComplete="email"
                  autoFocus
                  fullWidth
                  label="Adresse e-mail"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
                <TextField
                  autoComplete="current-password"
                  fullWidth
                  label="Mot de passe"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start"><LockOutlined fontSize="small" /></InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                            edge="end"
                            onClick={() => setShowPassword((visible) => !visible)}
                          >
                            {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Button disabled={loading} fullWidth size="large" type="submit" variant="contained">
                  {loading ? <CircularProgress color="inherit" size={22} /> : 'Se connecter'}
                </Button>
              </Stack>

              <Typography color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }} variant="caption">
                Accès réservé au personnel autorisé de l’hôtel.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default LoginPage
