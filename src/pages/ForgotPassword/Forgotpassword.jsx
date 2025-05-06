import { useState } from 'react'
import axios from 'axios'
import styles from './Forgotpassword.module.css'

function Forgotpassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false) // ✅ Loading state added

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true) // ✅ Start loading when request begins
    setError('') // Clear previous errors

    try {
      const response = await axios.post(
        'https://devlokcrmbackend.up.railway.app/auth/forgot-password/',
        { email }
      )

      console.log(response.data.message)
      alert('✅ Mail Sent Successfully! Please reset your password using the link.')
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'Request failed')
      } else {
        setError('An error occurred')
      }
    } finally {
      setLoading(false) // ✅ Stop loading when request ends
    }
  }

  return (
    <div>
      <div className={styles.body}>
        <div className={styles.container}>
          <div className={styles.left}>
            <h1>DEVLOK</h1>
            <p>DEVELOPERS</p>
          </div>

          <div className={styles.right}>
            <div className={styles.loginbox}>
              <form onSubmit={handleSubmit}>
                <div className={styles.inputgroup}>
                  <label>
                    <h3>Email</h3>
                  </label>
                  <input
                    type="email"
                    placeholder="username@gmail.com"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <p style={{ color: 'red', marginBottom: '10px',fontSize:'15px' }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className={styles.btn}
                  disabled={loading} // ✅ Disable button during loading
                >
                  {loading ? 'Sending...' : 'Send Mail'} {/* ✅ Show loading text */}
                </button>

                <p
                  className={styles.resend}
                  style={{
                    marginTop: '5px',
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer', // Disable click during loading
                    opacity: loading ? 0.6 : 1, // Add opacity when loading
                  }}
                  onClick={!loading ? handleSubmit : null} // Disable click when loading
                >
                  {loading ? 'Sending...' : 'Resend Mail'}
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Forgotpassword
