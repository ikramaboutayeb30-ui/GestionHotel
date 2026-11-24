import { LockRounded } from '@mui/icons-material'
import { Avatar, Box, Button, Card, CardContent, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

function ForbiddenPage() {
  const navigate = useNavigate()

  return (
    <Card>
      <CardContent
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          minHeight: 420,
          p: 4,
          textAlign: 'center',
        }}
      >
        <Box sx={{ maxWidth: 420 }}>
          <Avatar
            sx={{ bgcolor: 'action.selected', color: 'primary.main', height: 56, mx: 'auto', width: 56 }}
          >
            <LockRounded />
          </Avatar>
          <Typography sx={{ mt: 2 }} variant="h3">Accès refusé</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Votre compte ne dispose pas de l’autorisation nécessaire. Contactez un administrateur si vous avez besoin de cet accès.
          </Typography>
          <Button onClick={() => navigate('/')} sx={{ mt: 3 }} variant="contained">Retour au tableau de bord</Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ForbiddenPage
