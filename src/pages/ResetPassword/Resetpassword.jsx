import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import styles from "./Resetpassword.module.css"
import devlogo from "../../assets/devicon.jpg"

function ResetPassword() {
  const { token } = useParams() // Get token from URL
  const navigate = useNavigate() // ✅ For navigation after success
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false) // ✅ Loading state added

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert("❌ Passwords do not match!") // ✅ Use alert instead of toast
      return
    }

    setLoading(true) // ✅ Start loading when request begins

    try {
      const response = await fetch(
        `https://devlokcrmbackend.up.railway.app/auth/logic/reset-password/${token}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            new_password: password,
          }),
        }
      )

      if (response.ok) {
        // ✅ Success message with alert
        alert("✅ Password successfully reset! Redirecting to login...")
        // Redirect to login after success
        navigate("/login")
      } else {
        // ❌ Show error if response is not successful
        alert("❌ Error resetting password. Please try again.")
      }
    } catch (error) {
      alert("❌ Something went wrong. Try again later.")
    } finally {
      setLoading(false) // ✅ Stop loading when request ends
    }
  }

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <a
          href="/login"
          className={styles.backlink}
          style={{
            marginBottom: "10px",
            textDecoration: "none",
            color: "rgb(105, 3, 105)",
          }}
        >
          🔹 Reset Password
        </a>

        <div className={styles.card}>
          <div className={styles.image}>
            <img src={devlogo} alt="DEVLOK Logo" className={styles.logo} />
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="password">Type Your New Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              name="confirm-password"
              id="confirm-password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className={styles.resetbtn}
              disabled={loading} // ✅ Disable button when loading
            >
              {loading ? "Resetting..." : "Reset"} {/* ✅ Show loading text */}
            </button>
          </form>

          <p className={styles.infotext}>
            To Make Sure Your Account Is Secure, You'll Be Logged Out From Other
            Devices Once You Set The New Password.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
