import Vue from 'vue'
import Router from 'vue-router'
import AuthHelper from '@/helpers/AuthHelper'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/responses',
    },
    {
      name: 'responses',
      path: '/responses',
      component: () => import('@/components/Responses'),
      meta: {
        requireLogin: true,
        title: 'Form Responses',
        isMenuItem: true,
        icon: 'how_to_reg',
        layout: 'dashboard',
        authorize: ['superadmin', 'callcenter', 'nppd'],
      },
      props: {},
    },
    {
      name: 'callcenter',
      path: '/callcenter',
      component: () => import('@/components/CallCenter'),
      meta: {
        requireLogin: true,
        title: 'Call Center',
        isMenuItem: true,
        icon: 'contact_phone',
        layout: 'dashboard',
        authorize: ['superadmin', 'callcenter', 'nppd'],
      },
      props: {},
    },
    {
      name: 'patients',
      path: '/patients',
      component: () => import('@/components/Patients'),
      meta: {
        requireLogin: true,
        title: 'Patients',
        isMenuItem: true,
        icon: 'people',
        layout: 'dashboard',
        authorize: ['superadmin', 'callcenter', 'nppd', 'ma'],
      },
      props: {},
    },
    {
      name: 'patient_tracking',
      path: '/patient-tracking',
      component: () => import('@/components/PatientTracking'),
      meta: {
        requireLogin: true,
        title: 'Patient COVID-19 Tracking',
        isMenuItem: true,
        icon: 'mdi-radar',
        layout: 'dashboard',
        authorize: ['superadmin', 'callcenter'],
      },
      props: {},
    },
    {
      name: 'tests',
      path: '/tests',
      component: () => import('@/components/TestResults'),
      meta: {
        requireLogin: true,
        title: 'Test Results',
        isMenuItem: true,
        icon: 'library_add_check',
        layout: 'dashboard',
        authorize: ['superadmin', 'callcenter', 'nppd'],
      },
      props: {},
    },
    {
      name: 'validate',
      path: '/validate',
      component: () => import('@/components/TestsToValidate'),
      meta: {
        requireLogin: true,
        title: 'Unverified Tests',
        isMenuItem: true,
        icon: 'mdi-test-tube-empty',
        layout: 'dashboard',
        authorize: ['superadmin', 'callcenter', 'nppd'],
      },
      props: {},
    },
    {
      name: 'scheduled',
      path: '/scheduled-tests',
      component: () => import('@/components/ScheduledTests'),
      meta: {
        requireLogin: true,
        title: 'Scheduled Tests',
        isMenuItem: true,
        icon: 'mdi-clock',
        layout: 'dashboard',
        authorize: ['superadmin', 'ma'],
      },
      props: {},
    },
    {
      name: 'employers',
      path: '/employers',
      component: () => import('@/components/Employers'),
      meta: {
        requireLogin: true,
        title: 'Employers',
        isMenuItem: true,
        icon: 'work',
        layout: 'dashboard',
        authorize: ['superadmin', 'callcenter', 'nppd'],
      },
      props: {},
    },
    {
      name: 'clinics',
      path: '/clinics',
      component: () => import('@/components/Clinics'),
      meta: {
        requireLogin: true,
        title: 'Clinics',
        isMenuItem: true,
        icon: 'mdi-stethoscope',
        layout: 'dashboard',
        authorize: ['superadmin', 'callcenter', 'nppd'],
      },
      props: {},
    },
    {
      name: 'reports',
      path: '/reports',
      component: () => import('@/components/Reports'),
      meta: {
        requireLogin: true,
        title: 'Reports',
        isMenuItem: true,
        icon: 'mdi-file-chart',
        layout: 'dashboard',
        authorize: ['superadmin', 'callcenter'],
      },
      props: {},
    },
    {
      name: 'covid_form',
      path: '/covid19',
      component: () => import('@/components/CovidForm'),
      meta: {
        requireLogin: false,
        title: 'Covid-19 Form',
        isMenuItem: false,
        layout: 'simple',
        authorize: ['superadmin', 'callcenter', 'nppd'],
      },
      props: {},
    },
    {
      name: 'user_management',
      path: '/user-management',
      component: () => import('@/components/UserManagement'),
      meta: {
        requireLogin: true,
        title: 'User Management',
        isMenuItem: true,
        icon: 'settings',
        layout: 'dashboard',
        authorize: ['superadmin', 'callcenter'],
      },
      props: {},
    },
    {
      name: 'my_account',
      path: '/my-account',
      component: () => import('@/components/MyAccount'),
      meta: {
        requireLogin: true,
        title: 'My Account',
        isMenuItem: false,
        layout: 'dashboard',
        authorize: ['superadmin', 'callcenter', 'nppd', 'ma'],
      },
      props: {},
    },
    {
      path: '/login',
      name: 'Login',
      meta: {
        layout: 'simple',
        requireLogin: false,
      },
      component: () => import('@/components/Login'),
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      meta: {
        layout: 'simple',
        title: 'Forgot Password',
        requireLogin: false,
      },
      component: () => import('@/components/ForgotPassword'),
    },
    {
      name: 'ResetPassword',
      path: '/reset-password',
      component: () => import('@/components/ResetPassword'),
      meta: {
        requireLogin: false,
        title: 'Reset Password',
        isMenuItem: false,
        layout: 'simple',
      },
      props: {},
    },
    {
      path: '/404',
      name: 'NotFound',
      meta: {
        layout: 'simple',
        requireLogin: false,
      },
      component: () => import('@/components/NotFound'),
    },
    {
      name: 'patient_test_results',
      path: '/userportal',
      component: () => import('@/components/PatientTestResultsWrapper'),
      meta: {
        requireLogin: false,
        title: 'Patient Tests Results',
        isMenuItem: false,
        layout: 'simple',
        authorize: ['superadmin', 'callcenter', 'nppd'],
      },
      props: {},
    },
    {
      name: 'patient_significant_contacts',
      path: '/significant-contacts',
      component: () => import('@/components/PatientSignificantContacts'),
      meta: {
        requireLogin: false,
        title: 'Significant Contacts',
        isMenuItem: false,
        layout: 'simple',
        authorize: ['patient'],
      },
      props: {},
    },
    {
      name: 'signup',
      path: '/signup',
      component: () => import('@/components/SetPassword'),
      meta: {
        requireLogin: false,
        title: 'Signup',
        isMenuItem: false,
        layout: 'simple',
      },
      props: {},
    },
    {
      name: 'portal',
      path: '/portal',
      component: () => import('@/components/PatientPortal'),
      meta: {
        requireLogin: true,
        title: 'Patient Portal',
        isMenuItem: true,
        icon: 'home',
        layout: 'portal',
        authorize: ['superadmin', 'patient'],
      },

      props: {},
    },
    {
      name: 'telemedicine',
      path: '/telemedicine',
      component: () => import('@/components/PatientTelemedicine'),
      meta: {
        requireLogin: true,
        title: 'Telemedicine',
        isMenuItem: true,
        icon: 'mdi-calendar',
        layout: 'portal',
        authorize: ['patient'],
      },
      props: {},
    },
    {
      name: 'documents',
      path: '/portal-docs',
      component: () => import('@/components/PatientPortalDocuments'),
      meta: {
        requireLogin: true,
        title: 'Documents',
        isMenuItem: true,
        icon: 'mdi-file',
        layout: 'portal',
        authorize: ['superadmin', 'patient'],
      },

      props: {},
    },
    {
      name: 'Patient Portal',
      path: '/contactInformation',
      component: () => import('@/components/ContactInformation'),
      meta: {
        requireLogin: true,
        title: 'ContactInformation',
        isMenuItem: false,
        layout: 'simple',
      },
      props: {},
    },
    {
      name: 'patient_test_results_pdf',
      path: '/patient-test-results-pdf',
      component: () => import('@/components/PatientTestResultsPDF'),
      meta: {
        requireLogin: true,
        title: 'Patient Tests Results PDF',
        isMenuItem: false,
        layout: 'simple',
        authorize: ['superadmin', 'callcenter', 'nppd', 'patient'],
      },
      props: {},
    },
    {
      path: '*',
      redirect: '/login',
    },
    {
      name: 'logout',
      path: '/logout',
      component: () => import('@/components/Login'),
      meta: {
        title: 'Logout',
        isMenuItem: true,
        icon: 'exit_to_app',
        layout: 'simple',
        requireLogin: true,
      },
      props: {},
    },
  ],
})

router.beforeEach((to, from, next) => {
  const loggedIn = AuthHelper.loggedIn()
  const { meta, path } = to
  const authorize = meta && meta.authorize ? meta.authorize : null
  const roles = loggedIn && loggedIn.roles ? loggedIn.roles : []
  const isPatient =
    loggedIn && loggedIn.roles && loggedIn.roles.indexOf('patient') >= 0

  if (meta.requireLogin && !loggedIn) {
    next('/login')
    return
  } else if (path == '/logout') {
    AuthHelper.logout()
    next('/login')
    return
  } else if (
    meta.requireLogin &&
    authorize &&
    !roles.some((item) => authorize.includes(item))
  ) {
    if (isPatient) {
      next('/portal')
    } else {
      next('/patients')
    }
    return
  }
  next()
})

export default router
