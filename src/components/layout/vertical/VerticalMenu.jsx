'use client'

// MUI Imports

import { useEffect, useState } from 'react'

import { useTheme } from '@mui/material/styles'
import {
  Person,
  Dashboard,
  Groups,
  EventAvailable,
  AccountBalance,
  CardMembership,
  PostAdd,
  Pets,
  LocalHospital,
  MedicalServices,
  Inventory,
  Settings,
  LocalOffer,
  ShoppingCart,
  Wallpaper,
  NotificationsActive,
  Category,
  AdminPanelSettings,
  Create,
  Shop,
  OutboundRounded,
  DeliveryDining,
  FoodBank,
  Shop2Sharp,
  VerifiedUserRounded,
  RollerShades,
  AdminPanelSettingsTwoTone,
  AdminPanelSettingsSharp,
  RollerShadesClosedTwoTone,
  Verified,
  OtherHouses,
  House,
  Collections,
  ManageHistorySharp,
  TempleBuddhist,
  Report,
  BrandingWatermark,
  ContentCut
} from '@mui/icons-material'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)



const VerticalMenu = ({ scrollMenu }) => {
  const [permissions, setPermissions] = useState([])

  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { settings } = useSettings()
  const { isBreakpointReached } = useVerticalNav()

  // Vars
  const { transitionDuration } = verticalNavOptions
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  useEffect(() => {
    const savedPermissions = JSON.parse(localStorage.getItem('permissions')) || []
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    const isSuperAdmin = storedUser?.role === 'superadmin'

    // Ensure Groom Profile and Grooming appear after Vet Profile
    const enhancedPermissions = []
    if (Array.isArray(savedPermissions)) {
      savedPermissions.forEach(perm => {
        enhancedPermissions.push(perm)
        if (perm === 'vet') {
          if (!savedPermissions.includes('Groom Profile')) {
            enhancedPermissions.push('Groom Profile')
          }
          if (!savedPermissions.includes('Grooming')) {
            enhancedPermissions.push('Grooming')
          }
        }
      })
    }

    // Handle superadmin if not already added
    if (isSuperAdmin) {
      if (!enhancedPermissions.includes('Groom Profile')) {
        enhancedPermissions.push('Groom Profile')
      }
      if (!enhancedPermissions.includes('Grooming')) {
        enhancedPermissions.push('Grooming')
      }
    }

    setPermissions(Array.from(new Set(enhancedPermissions)))
  }, [])

  // Map permissions to menu items
  const permissionMap = {
    // Dashboard: { href: '/home', icon: <Dashboard />, label: 'Dashboard' },
    Dashboard: {
      icon: <Dashboard />,
      label: 'Dashboard',
      children: [
        { href: '/vetanalytics', label: 'Veterinary', icon: <AdminPanelSettingsTwoTone /> },
        { href: '/profileanalytics', label: 'Profile', icon: <VerifiedUserRounded /> },
        { href: '/matchanalytics', label: 'Match', icon: <VerifiedUserRounded /> },
        { href: '/shopanalytics', label: 'Shop', icon: <VerifiedUserRounded /> },
        { href: '/communityanalytics', label: 'Community', icon: <VerifiedUserRounded /> }
        // { href: '/generalanalytics', label: 'General', icon: <VerifiedUserRounded /> }

        // { href: '/chat ', label: 'Chat', icon: <CreateUserIcon /> }
      ]
    },

    'Create Membership': { href: '/category', icon: <Category />, label: 'Membership' },
    User: { href: '/user/list', icon: <Person />, label: 'Users' },
    Community: { href: '/community', icon: <Groups />, label: 'Community' },
    // pawmanagment: { href: '/pawmanagment', icon: <Pets />, label: 'PawVerse Management' },
    'Pets Management': {
      icon: <ManageHistorySharp />,
      label: 'Pets Management',
      children: [
        { href: '/pawmanagment', icon: <Pets />, label: 'Pets' },
        { href: '/temperament', icon: <TempleBuddhist />, label: 'Temperament' },
        { href: '/disease ', icon: <TempleBuddhist />, label: 'Disease ' }
      ]
    },

    // 'Report User': { href: '/reportuser', icon: <Settings />, label: 'Report User' },
    // 'PawPoint Managment': { href: '/pointmanagment', icon: <NotificationsIcon />, label: 'PawPoint Management' },
    Settings: { href: '/settings', icon: <Settings />, label: 'Settings' },
    Coupons: { href: '/coupons', icon: <LocalOffer />, label: 'Coupons' },
    Accounts: {
      icon: <AccountBalance />,
      label: 'Accounts',
      children: [
        { href: '/role/newrole', label: 'Create Role', icon: <AdminPanelSettingsTwoTone /> },
        { href: '/role/createuser', label: 'Create User', icon: <VerifiedUserRounded /> }
        // { href: '/chat ', label: 'Chat', icon: <CreateUserIcon /> }
      ]
    },
    shop: {
      icon: <ShoppingCart />,
      label: 'Shop Management',
      children: [
        { href: '/shop', label: 'Shop', icon: <Shop2Sharp /> },
        { href: '/orders', label: 'Orders', icon: <DeliveryDining /> },
        { href: '/delivery', label: 'Delivery', icon: <DeliveryDining /> },
        { href: '/collections', label: 'Collections', icon: <FoodBank /> },
        { href: '/brands', label: 'Brands', icon: <BrandingWatermark /> }
      ]
    },

    notification: { href: '/notification', icon: <NotificationsActive />, label: 'Notification' },
    banner: { href: '/banner', icon: <Wallpaper />, label: 'Banner' },
    hospital: { href: '/hospital', icon: <LocalHospital />, label: 'Hospital Profile' },
    vet: { href: '/vet', icon: <MedicalServices />, label: ' Vets Profile' },
    'Groom Profile': { href: '/grooming', icon: <MedicalServices />, label: 'Groom Profile' },

    'Payments Management': { href: '/subcategory', icon: <Create />, label: 'Payments Management' },
    Appointments: {
      icon: <Create />,
      label: 'Appointments',
      children: [
        { href: '/appointments/clinic', label: 'Clinic', icon: <OtherHouses /> },
        { href: '/appointments/house', label: 'In-house', icon: <House /> },
        { href: '/appointments/groom', label: 'Groom', icon: <ContentCut /> },
        { href: '/package', icon: <Collections />, label: 'Package' },
      
      ]
    },
    reports: { href: '/reportuser', label: 'Reports', icon: <Report /> }
  }

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {permissions?.map(permission => {
          const menuItem = permissionMap[permission]
          if (menuItem) {
            if (menuItem.children) {
              return (
                <SubMenu key={permission} label={menuItem.label} icon={menuItem.icon}>
                  {menuItem.children.map(child => (
                    <MenuItem key={child.href} href={child.href} icon={child.icon}>
                      {child.label}
                    </MenuItem>
                  ))}
                </SubMenu>
              )
            }

            return (
              <MenuItem key={permission} href={menuItem.href} icon={menuItem.icon}>
                {menuItem.label}
              </MenuItem>
            )
          }
          return null
        })}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
