import * as auth from 'auth-provider'

const apiURL = process.env.REACT_APP_API_URL

function client(endpoint, customConfig = {}) {
  const {data, token} = customConfig
  const config = {
    method: data ? 'POST' : 'GET',
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      'Content-Type': data ? 'application/data' : undefined,
    },
    ...customConfig,
  }

  return window.fetch(`${apiURL}/${endpoint}`, config).then(async response => {
    if (response.status === 401) {
      await auth.logout()
      return Promise.reject(
        new Error('You have been logged out, please login again'),
      )
    }
    const data = await response.json()
    if (response.ok) {
      return data
    } else {
      return Promise.reject(data)
    }
  })
}

export {client}
