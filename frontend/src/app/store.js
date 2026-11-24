import { configureStore } from '@reduxjs/toolkit'
import authReducer, { sessionExpired, sessionRefreshed } from '../features/auth/authSlice'
import guestReducer from '../features/guests/guestSlice'
import dashboardReducer from '../features/dashboard/dashboardSlice'
import hotelReducer from '../features/hotel/hotelSlice'
import paymentReducer from '../features/payments/paymentSlice'
import requestReducer from '../features/requests/requestSlice'
import reportReducer from '../features/reports/reportSlice'
import reservationReducer from '../features/reservations/reservationSlice'
import roomReducer from '../features/rooms/roomSlice'
import userReducer from '../features/users/userSlice'
import uiReducer from '../features/ui/uiSlice'
import { configureAuthHandlers } from '../services/apiClient'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    guests: guestReducer,
    hotel: hotelReducer,
    payments: paymentReducer,
    requests: requestReducer,
    reports: reportReducer,
    reservations: reservationReducer,
    rooms: roomReducer,
    users: userReducer,
    ui: uiReducer,
  },
})

configureAuthHandlers({
  onSessionExpired: () => store.dispatch(sessionExpired()),
  onSessionRefreshed: ({ user }) => store.dispatch(sessionRefreshed(user)),
})

store.subscribe(() => {
  window.localStorage.setItem('hotel-theme-mode', store.getState().ui.themeMode)
})
