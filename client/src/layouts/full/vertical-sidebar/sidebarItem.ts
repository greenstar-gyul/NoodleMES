import {
  CircleIcon,
  WindmillIcon,
  TypographyIcon,
  ShadowIcon,
  PaletteIcon,
  KeyIcon,
  BugIcon,
  DashboardIcon,
  BrandChromeIcon,
  HelpIcon
} from 'vue-tabler-icons';

export interface menu {
  header?: string;
  title?: string;
  icon?: object;
  to?: string;
  divider?: boolean;
  chip?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
}

const sidebarItem: menu[] = [
  { header: 'Dashboard' },
  {
    title: 'Default',
    icon: DashboardIcon,
    to: '/dashboard/default'
  },
  { divider: true },
  { header: 'Pages' },
  {
    title: '기준정보',
    to: '/auth',
    children: [
      {
        title: 'Login',
        icon: CircleIcon,
        to: '/auth/login'
      },
      {
        title: 'Register',
        icon: CircleIcon,
        to: '/auth/register'
      }
    ]
  },
  {
    title: '주문',
    to: '/auth',
    children: [
      {
        title: 'Login',
        icon: CircleIcon,
        to: '/auth/login'
      },
      {
        title: 'Register',
        icon: CircleIcon,
        to: '/auth/register'
      }
    ]
  },
  {
    title: '생산',
    to: '/auth',
    children: [
      {
        title: 'Login',
        icon: CircleIcon,
        to: '/auth/login'
      },
      {
        title: 'Register',
        icon: CircleIcon,
        to: '/auth/register'
      }
    ]
  },
  {
    title: '품질',
    to: '/auth',
    children: [
      {
        title: 'Login',
        icon: CircleIcon,
        to: '/auth/login'
      },
      {
        title: 'Register',
        icon: CircleIcon,
        to: '/auth/register'
      }
    ]
  },
  {
    title: '설비',
    to: '/auth',
    children: [
      {
        title: 'Login',
        icon: CircleIcon,
        to: '/auth/login'
      },
      {
        title: 'Register',
        icon: CircleIcon,
        to: '/auth/register'
      }
    ]
  },
  {
    title: '자재',
    to: '/auth',
    children: [
      {
        title: 'Login',
        icon: CircleIcon,
        to: '/auth/login'
      },
      {
        title: 'Register',
        icon: CircleIcon,
        to: '/auth/register'
      }
    ]
  },
];

export default sidebarItem;
