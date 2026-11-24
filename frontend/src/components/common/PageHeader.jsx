import { Box, Button, Stack, Typography } from '@mui/material'
import { AddRounded } from '@mui/icons-material'

function PageHeader({ title, description, actionLabel, onAction, canAction = true }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, gap: 2, justifyContent: 'space-between' }}>
      <Box><Typography variant="h2">{title}</Typography><Typography color="text.secondary" sx={{ mt: 0.5 }}>{description}</Typography></Box>
      {actionLabel && canAction && <Button onClick={onAction} startIcon={<AddRounded />} variant="contained">{actionLabel}</Button>}
    </Stack>
  )
}
export default PageHeader

