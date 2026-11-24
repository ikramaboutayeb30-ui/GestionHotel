import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

function AppLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', minWidth: 0 }}>
        <Topbar />
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'hidden',
            p: { xs: 2, sm: 3, xl: 4 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default AppLayout

