import {
  BarChartRounded,
  CalendarMonthRounded,
  DashboardRounded,
  FactCheckRounded,
  GroupRounded,
  KingBedRounded,
  MeetingRoomRounded,
  PaymentsRounded,
  PeopleAltRounded,
  SettingsRounded,
} from '@mui/icons-material'

export const navigationGroups = [
  {
    label: 'Hôtel',
    items: [
      { label: 'Tableau de bord', path: '/', icon: DashboardRounded },
      { label: 'Réservations', path: '/reservations', icon: CalendarMonthRounded, permission: 'reservation.view' },
      { label: 'Demandes', path: '/requests', icon: FactCheckRounded, permission: 'request.manage' },
      { label: 'Clients', path: '/guests', icon: PeopleAltRounded, permission: 'guest.view' },
      { label: 'Chambres', path: '/rooms', icon: KingBedRounded, permission: 'room.view' },
      { label: 'Types de chambres', path: '/room-types', icon: MeetingRoomRounded, permission: 'room.view' },
      { label: 'Paiements', path: '/payments', icon: PaymentsRounded, permission: 'payment.view' },
      { label: 'Rapports', path: '/reports', icon: BarChartRounded, permission: 'report.view' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Utilisateurs', path: '/users', icon: GroupRounded, permission: 'user.manage' },
      { label: 'Paramètres de l’hôtel', path: '/settings', icon: SettingsRounded, permission: 'hotel.manage' },
    ],
  },
]

export function getPageTitle(pathname) {
  const items = navigationGroups.flatMap((group) => group.items)
  return items.find((item) => item.path === pathname)?.label || 'Gestion hôtelière'
}
