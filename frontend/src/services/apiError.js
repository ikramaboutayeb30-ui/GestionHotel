export function getApiErrorMessage(error, fallback = 'Une erreur est survenue. Veuillez réessayer.') {
  if (error.code === 'ECONNABORTED') {
    return 'Le serveur a mis trop de temps à répondre. Veuillez réessayer.'
  }
  if (!error.response) {
    return 'Connexion au serveur impossible. Vérifiez que le backend est démarré.'
  }
  return error.response.data?.message || fallback
}
