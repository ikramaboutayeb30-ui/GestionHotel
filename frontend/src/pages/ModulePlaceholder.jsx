import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { AddRounded } from '@mui/icons-material'
import { useLocation } from 'react-router-dom'
import { getPageTitle } from '../layouts/navigation'

function ModulePlaceholder() {
  const { pathname } = useLocation()
  const title = getPageTitle(pathname)

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, gap: 2, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h2">{title}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Cet espace est prêt pour le module {title.toLowerCase()}.
          </Typography>
        </Box>
        <Button startIcon={<AddRounded />} variant="contained">Créer</Button>
      </Stack>
      <Card>
        <CardContent sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', minHeight: 360, textAlign: 'center' }}>
          <Box sx={{ maxWidth: 420 }}>
            <Typography variant="h3">Module à venir</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              La navigation, le thème et la structure responsive sont déjà en place.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default ModulePlaceholder
