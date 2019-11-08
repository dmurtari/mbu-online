const env = process.env.NODE_ENV || 'development';
const API_URL = env === 'development' ? 'http://localhost:3000/api/' : '/api/'

export default {
  API_URL: API_URL,
  BADGES_URL: API_URL + 'badges/',
  CURRENT_EVENT_URL: API_URL + 'events/current',
  EVENTS_URL: API_URL + 'events/',
  FORGOT_URL: API_URL + 'forgot/',
  LOGIN_URL: API_URL + 'authenticate/',
  PROFILE_URL: API_URL + 'profile/',
  RESET_API_URL: API_URL + 'reset/',
  RESET_URL: env === 'development' ? 'http://localhost:8080/reset/' : 'http://mbu.online/reset/',
  SCOUTS_URL: API_URL + 'scouts/',
  SIGNUP_URL: API_URL + 'signup/',
  USERS_URL: API_URL + 'users/'
};
