import { createSlice } from '@reduxjs/toolkit'

function getInitialMode() {
  if (typeof window === 'undefined') return 'light'
  const savedMode = window.localStorage.getItem('hotel-theme-mode')
  if (savedMode === 'light' || savedMode === 'dark') return savedMode
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    appName: 'Hotel Suite',
    themeMode: getInitialMode(),
    sidebarCollapsed: false,
    mobileSidebarOpen: false,
  },
  reducers: {
    toggleTheme: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light'
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    openMobileSidebar: (state) => {
      state.mobileSidebarOpen = true
    },
    closeMobileSidebar: (state) => {
      state.mobileSidebarOpen = false
    },
  },
})

export const { closeMobileSidebar, openMobileSidebar, toggleSidebar, toggleTheme } = uiSlice.actions
export default uiSlice.reducer
