import { useState } from "react"
import { Eye, EyeOff, Lock, Mail, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [formErrors, setFormErrors] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [passwordVisible, setPasswordVisible] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  })

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState({
    success: false,
    message: "",
    showMessage: false,
  })

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }

    // Check password strength when new password changes
    if (name === "newPassword") {
      checkPasswordStrength(value)
    }

    // Check if confirm password matches
    if (name === "confirmPassword" || (name === "newPassword" && formData.confirmPassword)) {
      if (name === "confirmPassword" && value !== formData.newPassword) {
        setFormErrors({
          ...formErrors,
          confirmPassword: "Passwords don't match",
        })
      } else if (name === "newPassword" && value !== formData.confirmPassword && formData.confirmPassword) {
        setFormErrors({
          ...formErrors,
          confirmPassword: "Passwords don't match",
        })
      } else {
        setFormErrors({
          ...formErrors,
          confirmPassword: "",
        })
      }
    }
  }

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setPasswordVisible({
      ...passwordVisible,
      [field]: !passwordVisible[field],
    })
  }

  // Check password strength
  const checkPasswordStrength = (password) => {
    // Initialize score
    let score = 0
    let message = ""

    // No password
    if (!password) {
      setPasswordStrength({ score: 0, message: "" })
      return
    }

    // Length check
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1

    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1 // Has uppercase
    if (/[a-z]/.test(password)) score += 1 // Has lowercase
    if (/[0-9]/.test(password)) score += 1 // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 1 // Has special char

    // Set message based on score
    if (score <= 2) {
      message = "Weak"
    } else if (score <= 4) {
      message = "Moderate"
    } else {
      message = "Strong"
    }

    setPasswordStrength({ score, message })
  }

  // Validate form before submission
  const validateForm = () => {
    const errors = {
      email: "",
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    }

    let isValid = true

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid"
      isValid = false
    }

    // Old password validation
    if (!formData.oldPassword) {
      errors.oldPassword = "Current password is required"
      isValid = false
    }

    // New password validation
    if (!formData.newPassword) {
      errors.newPassword = "New password is required"
      isValid = false
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters"
      isValid = false
    } else if (passwordStrength.score < 3) {
      errors.newPassword = "Password is too weak"
      isValid = false
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
      isValid = false
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords don't match"
      isValid = false
    }

    // Same password check
    if (formData.oldPassword && formData.newPassword && formData.oldPassword === formData.newPassword) {
      errors.newPassword = "New password must be different from current password"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Reset previous submission results
    setSubmitResult({
      success: false,
      message: "",
      showMessage: false,
    })

    // Validate form
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("http://localhost:3002/change_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
        credentials: "include",
      })

      if (response.ok) {
        // Success
        setSubmitResult({
          success: true,
          message: "Password changed successfully!",
          showMessage: true,
        })

        // Reset form
        setFormData({
          email: "",
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        setPasswordStrength({ score: 0, message: "" })
      } else {
        // API error
        const errorData = await response.json()
        setSubmitResult({
          success: false,
          message: errorData.message || "Failed to change password. Please try again.",
          showMessage: true,
        })
      }
    } catch (error) {
      // Network or other error
      setSubmitResult({
        success: false,
        message: "An error occurred. Please check your connection and try again.",
        showMessage: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Close alert message
  const closeAlert = () => {
    setSubmitResult({
      ...submitResult,
      showMessage: false,
    })
  }

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        <div className="card-header">
          <h1>Change Your Password</h1>
          <p>Update your password to keep your account secure</p>
        </div>

        {submitResult.showMessage && (
          <div className={`alert ${submitResult.success ? "alert-success" : "alert-error"}`}>
            <div className="alert-icon">
              {submitResult.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="alert-content">{submitResult.message}</div>
            <button className="alert-close" onClick={closeAlert}>
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={formErrors.email ? "error" : ""}
              />
            </div>
            {formErrors.email && <div className="error-message">{formErrors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="oldPassword">Current Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={passwordVisible.oldPassword ? "text" : "password"}
                id="oldPassword"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                className={formErrors.oldPassword ? "error" : ""}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility("oldPassword")}
                aria-label={passwordVisible.oldPassword ? "Hide password" : "Show password"}
              >
                {passwordVisible.oldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formErrors.oldPassword && <div className="error-message">{formErrors.oldPassword}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={passwordVisible.newPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter your new password"
                className={formErrors.newPassword ? "error" : ""}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility("newPassword")}
                aria-label={passwordVisible.newPassword ? "Hide password" : "Show password"}
              >
                {passwordVisible.newPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formErrors.newPassword && <div className="error-message">{formErrors.newPassword}</div>}

            {formData.newPassword && (
              <div className="password-strength">
                <div className="strength-meter">
                  <div
                    className={`strength-meter-fill strength-${passwordStrength.message.toLowerCase()}`}
                    style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                  ></div>
                </div>
                <div className="strength-text">{passwordStrength.message}</div>
              </div>
            )}

            <div className="password-requirements">
              <p>Password must:</p>
              <ul>
                <li className={formData.newPassword.length >= 8 ? "met" : ""}>Be at least 8 characters long</li>
                <li className={/[A-Z]/.test(formData.newPassword) ? "met" : ""}>
                  Include at least one uppercase letter
                </li>
                <li className={/[a-z]/.test(formData.newPassword) ? "met" : ""}>
                  Include at least one lowercase letter
                </li>
                <li className={/[0-9]/.test(formData.newPassword) ? "met" : ""}>Include at least one number</li>
                <li className={/[^A-Za-z0-9]/.test(formData.newPassword) ? "met" : ""}>
                  Include at least one special character
                </li>
              </ul>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={passwordVisible.confirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                className={formErrors.confirmPassword ? "error" : ""}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility("confirmPassword")}
                aria-label={passwordVisible.confirmPassword ? "Hide password" : "Show password"}
              >
                {passwordVisible.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formErrors.confirmPassword && <div className="error-message">{formErrors.confirmPassword}</div>}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  Change Password
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .change-password-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 2rem;
          background-color: #f8fafc;
        }
        
        .change-password-card {
          width: 100%;
          max-width: 500px;
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          padding: 2rem;
        }
        
        .card-header {
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .card-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }
        
        .card-header p {
          color: #64748b;
          font-size: 0.875rem;
        }
        
        .alert {
          display: flex;
          align-items: center;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          position: relative;
        }
        
        .alert-success {
          background-color: #dcfce7;
          color: #166534;
        }
        
        .alert-error {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        
        .alert-icon {
          margin-right: 0.75rem;
          display: flex;
          align-items: center;
        }
        
        .alert-content {
          flex: 1;
          font-size: 0.875rem;
        }
        
        .alert-close {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: currentColor;
          opacity: 0.7;
        }
        
        .alert-close:hover {
          opacity: 1;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
        }
        
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .input-icon {
          position: absolute;
          left: 1rem;
          color: #94a3b8;
        }
        
        input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        input.error {
          border-color: #ef4444;
        }
        
        .toggle-password {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        
        .toggle-password:hover {
          color: #64748b;
        }
        
        .error-message {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }
        
        .password-strength {
          margin-top: 0.75rem;
          display: flex;
          align-items: center;
        }
        
        .strength-meter {
          flex: 1;
          height: 4px;
          background-color: #e2e8f0;
          border-radius: 2px;
          overflow: hidden;
          margin-right: 0.75rem;
        }
        
        .strength-meter-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
        
        .strength-weak {
          background-color: #ef4444;
        }
        
        .strength-moderate {
          background-color: #f59e0b;
        }
        
        .strength-strong {
          background-color: #10b981;
        }
        
        .strength-text {
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .password-requirements {
          margin-top: 1rem;
          font-size: 0.75rem;
          color: #64748b;
        }
        
        .password-requirements p {
          margin-bottom: 0.5rem;
        }
        
        .password-requirements ul {
          list-style-type: none;
          padding-left: 0.5rem;
        }
        
        .password-requirements li {
          margin-bottom: 0.25rem;
          position: relative;
          padding-left: 1.25rem;
        }
        
        .password-requirements li:before {
          content: "○";
          position: absolute;
          left: 0;
          color: #94a3b8;
        }
        
        .password-requirements li.met:before {
          content: "●";
          color: #10b981;
        }
        
        .form-actions {
          margin-top: 2rem;
        }
        
        .submit-button {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .submit-button:hover {
          background-color: #2563eb;
        }
        
        .submit-button:disabled {
          background-color: #93c5fd;
          cursor: not-allowed;
        }
        
        .loading-spinner {
          display: inline-block;
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        @media (max-width: 640px) {
          .change-password-container {
            padding: 1rem;
          }
          
          .change-password-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}

