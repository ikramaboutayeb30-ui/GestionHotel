function requirePermission(...requiredPermissions) {
  return (request, response, next) => {
    if (!request.auth) {
      return response.status(401).json({ message: 'Authentification requise' })
    }

    if (request.auth.role === 'ADMIN') {
      return next()
    }

    const allowed = requiredPermissions.every((permission) =>
      request.auth.permissions.includes(permission),
    )

    if (!allowed) {
      return response.status(403).json({ message: 'Vous n’avez pas la permission d’effectuer cette action' })
    }

    return next()
  }
}

module.exports = requirePermission
