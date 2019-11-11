import store from 'store';

const About = () => import(/* webpackChunkName: "about" */ 'components/About.vue');
const Main = () => import(/* webpackChunkName: "main" */ 'components/Main.vue');
const NotFound = () => import(/* webpackChunkName: "404" */'components/NotFound.vue');
const Privacy = () => import(/* webpackChunkName: "privacy" */  'components/Privacy.vue');

const BadgeList = () => import(/* webpackChunkName: "badges" */ 'components/badges/List.vue');
const EventList = () => import(/* webpackChunkName: "events" */'components/events/List.vue');

const Profile = () => import(/* webpackChunkName: "profile" */ 'components/users/profile/Profile.vue');
const ProfileOverview = () => import(/* webpackChunkName: "profile" */ 'components/users/profile/General.vue');
const ProfileEdit = () => import(/* webpackChunkName: "profile" */ 'components/users/profile/Edit.vue');
const ProfileDelete = () => import(/* webpackChunkName: "profile" */ 'components/users/profile/Delete.vue');
const ProfilePassword = () => import(/* webpackChunkName: "profile" */ 'components/users/profile/EditPassword.vue');

const EmailForm = () => import(/* webpackChunkName: "reset-flow" */ 'components/authentication/EmailForm.vue');
const Reset = () => import(/* webpackChunkName: "reset-flow" */ 'components/authentication/Reset.vue');
const ResetForm = () => import(/* webpackChunkName: "reset-flow" */ 'components/authentication/ResetForm.vue');
const Login = () => import(/* webpackChunkName: "login" */ 'components/authentication/Login.vue');
const Signup = () => import(/* webpackChunkName: "signup" */ 'components/authentication/Signup.vue');

const ClassList = () => import(/* webpackChunkName: "classes" */ 'components/shared/classes/ClassList.vue');
const ClassDetail = () => import(/* webpackChunkName: "classes" */ 'components/shared/classes/ClassDetail.vue');
const ClassContainer = () => import(/* webpackChunkName: "classes" */ 'components/shared/classes/ClassContainer.vue');
const AttendanceList = () => import(/* webpackChunkName: "attendance" */ 'components/shared/attendance/AttendanceList.vue');

const Administration = () => import(/* webpackChunkName: "admin" */ 'components/administration/Administration.vue');
const AdministrationHome = () => import(/* webpackChunkName: "admin" */ 'components/administration/AdministrationHome.vue');
const OfferingList = () => import(/* webpackChunkName: "offerings" */ 'components/administration/offerings/OfferingList.vue');
const AdminUsers = () => import(/* webpackChunkName: "admin-user" */ 'components/administration/users/List.vue');
const AdminApproval = () => import(/* webpackChunkName: "admin-approval" */ 'components/administration/users/AwaitingApproval.vue');
const AdminPurchasables = () => import(/* webpackChunkName: "admin-event" */ 'components/administration/purchasables/List.vue');
const AdminScouts = () => import(/* webpackChunkName: "admin-scout" */ 'components/administration/scouts/List.vue');
const AdminEvents = () => import(/* webpackChunkName: "admin-event" */ 'components/administration/events/EventsContainer.vue');
const AttendanceView = () => import(/* webpackChunkName: "scouts" */'components/administration/attendance/AttendanceView.vue');
const ScoutContainer = () => import(/* webpackChunkName: "scouts" */ 'components/administration/scouts/ScoutContainer.vue');
const ListAdmins = () => import(/* webpackChunkName: "admin-admins" */ 'components/administration/users/admins/AdminUsersContainer.vue');
const CoordinatorDetail = () => import(/* webpackChunkName: "admin-user-detail" */ 'components/administration/users/CoordinatorDetail.vue');
const UserContainer = () => import(/* webpackChunkName: "admin-user" */ 'components/administration/users/UserContainer.vue');

const ScoutDetails = () => import(/* webpackChunkName: "scouts" */'components/scouts/ScoutDetail.vue');
const AttendanceDetails = () => import(/* webpackChunkName: "scouts" */ 'components/stats/DetailView.vue');

const CoordinatorPage = () => import(/* webpackChunkName: "coordinator" */ 'components/coordinators/CoordinatorPage.vue');
const CoordinatorHome = () => import(/* webpackChunkName: "coordinator" */ 'components/coordinators/CoordinatorHome.vue');
const CoordinatorScouts = () => import(/* webpackChunkName: "coordinator" */ 'components/coordinators/scouts/List.vue');
const CoordinatorRegistration = () => import(/* webpackChunkName: "coordinator" */ 'components/coordinators/registrations/List.vue');
const CoordinatorAttendance = () => import(/* webpackChunkName: "coordinator" */ 'components/coordinators/attendance/List.vue');

const TeacherPage = () => import(/* webpackChunkName: "teacher" */ 'components/teachers/TeacherPage.vue');
const TeacherHome = () => import(/* webpackChunkName: "teacher" */ 'components/teachers/TeacherHome.vue');

const RegistrationTable = () => import(/* webpackChunkName: "assignments" */ 'components/stats/RegistrationTable.vue');

export default [
  {
    path: '/',
    name: 'home',
    component: Main,
    meta: { title: 'Home' }
  }, {
    path: '/about',
    component: About,
    meta: { title: 'About' }
  }, {
    path: '/privacy',
    component: Privacy,
    meta: { title: 'Privacy Policy' }
  }, {
    path: '/administration',
    component: Administration,
    beforeEnter: requireRole('admin'),
    redirect: 'administration/home',
    children: [
      {
        path: 'home',
        component: AdministrationHome,
        meta: { title: 'Administration' }
      }, {
        path: 'users',
        component: {
          render(component) { return component('router-view') }
        },
        children: [
          {
            path: 'current',
            component: UserContainer,
            redirect: 'current/all',
            children: [
              {
                path: 'all',
                component: AdminUsers,
                meta: { title: 'Current Users' }
              }, {
                path: ':id',
                component: CoordinatorDetail,
                meta: { title: 'User Detail' },
                props: true
              }
            ]
          }, {
            path: 'approval',
            component: AdminApproval,
            meta: { title: 'Users Needing Approval' }
          }, {
            path: 'admins',
            component: ListAdmins,
            meta: { title: 'Administrative Users' }
          }
        ]
      }, {
        path: 'scouts',
        component: {
          render(component) { return component('router-view') }
        },
        children: [
          {
            path: 'list',
            component: ScoutContainer,
            redirect: 'list/all',
            children: [
              {
                path: 'all',
                component: AdminScouts,
                meta: { title: 'All Scouts' }
              }, {
                path: ':id',
                component: ScoutDetails,
                meta: { title: 'Scout Detail' },
                props: true
              }
            ]
          }, {
            path: 'assignments',
            component: AttendanceView,
            meta: { title: 'Assignments' },
            redirect: 'assignments/list',
            children: [
              {
                path: 'list',
                component: RegistrationTable,
              }, {
                path: 'detail',
                component: AttendanceList
              }
            ]
          }
        ]
      }, {
        path: 'events',
        component: {
          render(component) { return component('router-view') }
        },
        children: [
          {
            path: 'all',
            component: AdminEvents,
            meta: { title: 'All Events' }
          }, {
            path: 'purchasables',
            component: AdminPurchasables,
            meta: { title: 'Items for Purchase' }
          }, {
            path: 'offerings',
            component: OfferingList,
            meta: { title: 'Class Offerings' }
          }, {
            path: 'badges',
            component: BadgeList,
            meta: { title: 'Available Badges' }
          }
        ]
      }, {
        path: 'classes',
        component: ClassContainer,
        redirect: 'classes/all',
        children: [
          {
            path: 'all',
            name: 'adminClassList',
            component: ClassList,
            meta: { title: 'All Classes' }
          }, {
            path: ':eventId/:id',
            name: 'adminClassDetail',
            component: ClassDetail,
            meta: { title: 'Class Detail' },
            props(route) {
              return {
                offeringId: Number(route.params.id),
                eventId: Number(route.params.eventId)
              }
            }
          }
        ]
      }
    ]
  }, {
    path: '/coordinator',
    component: CoordinatorPage,
    beforeEnter: requireRole('coordinator'),
    redirect: 'coordinator/home',
    children: [
      {
        path: 'home',
        component: CoordinatorHome,
        meta: { title: 'Coordinator Home' }
      }, {
        path: 'scouts',
        component: CoordinatorScouts,
        meta: { title: 'Your Scouts' }
      }, {
        path: 'registrations',
        component: CoordinatorRegistration,
        meta: { title: 'Registrations' }
      }, {
        path: 'attendance',
        component: CoordinatorAttendance,
        redirect: 'attendance/list',
        children: [
          {
            path: 'detail',
            component: AttendanceDetails,
            meta: { title: 'Attendance Details' }
          }, {
            path: 'list',
            component: RegistrationTable,
            meta: { title: 'Attendance' }
          }
        ]
      }
    ]
  }, {
    path: '/teacher',
    component: TeacherPage,
    beforeEnter: requireRole('teacher'),
    redirect: '/teacher/home',
    children: [
      {
        path: 'home',
        component: TeacherHome,
        meta: { title: 'Instructor Home' }
      }, {
        path: 'assignments',
        component: AttendanceView,
        meta: { title: 'Statistics' },
        redirect: 'assignments/list',
        children: [
          {
            path: 'detail',
            component: AttendanceList,
          }, {
            path: 'list',
            component: RegistrationTable
          }
        ]
      }, {
        path: 'classes',
        component: ClassContainer,
        redirect: 'classes/all',
        children: [
          {
            path: 'all',
            component: ClassList,
            meta: { title: 'All Classes' }
          }, {
            path: ':eventId/:id',
            component: ClassDetail,
            meta: { title: 'Class Detail' },
            props(route) {
              return {
                offeringId: Number(route.params.id),
                eventId: Number(route.params.eventId)
              }
            }
          }
        ]
      }, {
        path: 'assignments',
        component: AttendanceList,
        meta: { title: 'Assignments' }
      }
    ]
  }, {
    path: '/events',
    component: EventList,
    meta: { title: 'Events' }
  }, {
    path: '/badges',
    component: BadgeList,
    meta: { title: 'Badges' }
  }, {
    path: '/signup',
    component: Signup,
    meta: { title: 'Sign Up' }
  }, {
    path: '/login',
    component: Login,
    meta: { title: 'Log In' }
  }, {
    path: '/reset',
    component: Reset,
    meta: { title: 'Reset Your Password' },
    children: [
      {
        path: '',
        component: EmailForm
      }, {
        path: ':resetToken',
        component: ResetForm
      }
    ]
  }, {
    path: '/profile',
    component: Profile,
    redirect: 'profile/general',
    children: [
      {
        path: 'general',
        meta: { title: 'Your Profile' },
        component: ProfileOverview,
      }, {
        path: 'edit',
        component: ProfileEdit,
        meta: { title: 'Edit Profile' }
      }, {
        path: 'password',
        component: ProfilePassword,
        meta: { title: 'Change Password' }
      }, {
        path: 'delete',
        component: ProfileDelete,
        meta: { title: 'Delete My Account' }
      }
    ]
  }, {
    path: '*',
    component: NotFound
  }
];

 // eslint-disable-next-line no-unused-vars
function requireApproval(to, from, next) {
  if (store.getters.isApproved === undefined) {
    store.dispatch('getProfile')
      .then(() => {
        if (!store.getters.isApproved) {
          next('/');
        } else {
          next();
        }
      })
      .catch(() => {
        next('/');
      });
  } else {
    if (!store.getters.isApproved) {
      next('/');
    } else {
      next();
    }
  }
}

function requireRole(role) {
  return function (to, from, next) {
    if (store.getters.role === undefined) {
      store.dispatch('getProfile')
        .then(() => {
          if ((store.getters.role === role || store.getters.isAdmin) && store.getters.isApproved) {
            next();
          } else {
            next('/');
          }
        })
        .catch(() => {
          next('/');
        });
    } else {
      if ((store.getters.role === role || store.getters.isAdmin) && store.getters.isApproved) {
        next();
      } else {
        next('/');
      }
    }
  }
}
