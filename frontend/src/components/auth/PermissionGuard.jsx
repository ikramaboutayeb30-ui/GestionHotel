import { useSelector } from 'react-redux'
import { userHasPermission } from '../../features/auth/authSlice'
import ForbiddenPage from '../../pages/ForbiddenPage'

function PermissionGuard({ permission, children }) {
  const user = useSelector((state) => state.auth.user)
  return userHasPermission(user, permission) ? children : <ForbiddenPage />
}

export default PermissionGuard

