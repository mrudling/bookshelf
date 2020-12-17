import React, {useState} from 'react'
import ReactDOM from 'react-dom'
import {Logo} from './components/logo'
import {Dialog} from '@reach/dialog'
import '@reach/dialog/styles.css'

function LoginForm({onSubmit, buttonText}) {
  function handleSubmit(event) {
    event.preventDefault()
    const {username, password} = event.target.elements

    onSubmit({
      username: username.value,
      password: password.value,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="username">Username:</label>
      <input type="text" id="username" name="username" />
      <br />
      <label htmlFor="password">Password:</label>
      <input type="password" id="password" name="password" />
      <br />
      <input type="submit" value={buttonText} />
    </form>
  )
}

function App() {
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)

  function handleLogin(formData) {
    console.log('login:', formData)
  }

  function handleRegister(formData) {
    console.log('register:', formData)
  }

  return (
    <div>
      <Logo />
      <h1>Bookshelf</h1>
      <button onClick={() => setLoginModalOpen(true)}>
        <span aria-hidden>Login</span>
      </button>
      <button onClick={() => setRegisterModalOpen(true)}>
        <span aria-hidden>Register</span>
      </button>
      <Dialog
        aria-label="Login"
        isOpen={loginModalOpen}
        onDismiss={() => setLoginModalOpen(false)}
      >
        <LoginForm onSubmit={handleLogin} buttonText="Login" />
        <button
          className="close-button"
          onClick={() => setLoginModalOpen(false)}
        >
          <span aria-hidden>Close</span>
        </button>
        <p>Login dialog</p>
      </Dialog>
      <Dialog
        aria-label="Register"
        isOpen={registerModalOpen}
        onDismiss={() => setRegisterModalOpen(false)}
      >
        <LoginForm onSubmit={handleRegister} buttonText="Register" />
        <button
          className="close-button"
          onClick={() => setRegisterModalOpen(false)}
        >
          <span aria-hidden>Close</span>
        </button>
        <p>Register dialog</p>
      </Dialog>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
