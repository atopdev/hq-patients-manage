import { API, API_AUTH } from '@/api'

function getAuthHeaders(token) {
  if (token) {
    return {
      'Authentication-Token': token,
    }
  }
  var user = loggedIn()
  if (user) {
    return {
      'Authentication-Token': user.token,
    }
  } else {
    return {}
  }
}

// Aj in now

async function login(email, password) {
  var loggedIn = false
  await API_AUTH.post(
    'login/?include_auth_token=true',
    {
      email: email,
      password: password,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  ).then(async (res) => {
    if (res.data.meta.code == 200) {
      const token = res.data.response.user.authentication_token
      var user = {
        token: res.data.response.user.authentication_token,
        username: email,
      }
      await API.get('get-user', {
        headers: getAuthHeaders(token),
      }).then((response) => {
        user.roles = response.data.roles
        localStorage.setItem('user', JSON.stringify(user))
        loggedIn = true
      })
    }
  })
  return loggedIn
}

function logout() {
  localStorage.removeItem('user')
}

function loggedIn() {
  return JSON.parse(localStorage.getItem('user'))
}

function updateToken(token) {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      user.token = token
      localStorage.setItem('user', JSON.stringify(user))
    }
  } catch {
    console.error('Cannot update token')
  }
}

export default {
  getAuthHeaders,
  login,
  logout,
  loggedIn,
  updateToken,
}
