import React, { useState } from "react";
import { Calendar, Mail, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("")

  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3002/login_staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        setTimeout(() => {
            navigate('/dashboard');
        }, 2000);
        console.log("Login successful");
      } else {
        console.error("Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo">
          <Calendar className="calendar-icon" />
        </div>

        <h1>Welcome Back to EventEase!</h1>
        <p className="subtitle">Manage your events seamlessly</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail className="input-icon" size={20} />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {showPassword ? (
                <EyeOff
                  className="input-icon clickable"
                  size={20}
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <Eye
                  className="input-icon clickable"
                  size={20}
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>
          </div>

          

          <button type="submit" className="sign-in-button">
            Sign In
          </button>
        </form>

       

        

        
      </div>
      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #f8f7ff;
          padding: 1rem;
        }

        .login-card {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          text-align: center;
        }

        .logo {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .calendar-icon {
          color: #7c3aed;
          width: 40px;
          height: 40px;
        }

        h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .subtitle {
          color: #666;
          margin: 0.5rem 0 2rem;
        }

        .input-group {
          margin-bottom: 1.25rem;
          text-align: left;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #374151;
          font-size: 0.875rem;
        }

        .input-wrapper {
          position: relative;
        }

        input {
          width: 90%;
          padding: 0.75rem 1rem;
          padding-right: 2.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: border-color 0.15s ease;
        }

        input:focus {
          outline: none;
          border-color: #7c3aed;
        }

        .input-icon {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .clickable {
          cursor: pointer;
        }

        .remember-forgot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #374151;
          font-size: 0.875rem;
        }

        .forgot-link {
          color: #7c3aed;
          font-size: 0.875rem;
          text-decoration: none;
        }

        .sign-in-button {
          width: 100%;
          padding: 0.75rem;
          background-color: #7c3aed;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .sign-in-button:hover {
          background-color: #6d28d9;
        }

        .divider {
          margin: 1.5rem 0;
          display: flex;
          align-items: center;
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          border-bottom: 1px solid #e5e7eb;
        }

        .divider span {
          margin: 0 0.75rem;
        }

        .social-login {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .social-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .social-button:hover {
          background-color: #f9fafb;
        }

        .signup-prompt {
          color: #374151;
          font-size: 0.875rem;
        }

        .signup-prompt a {
          color: #7c3aed;
          text-decoration: none;
          font-weight: 500;
        }

        .footer {
          margin-top: 2rem;
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .footer p {
          margin: 0 0 0.5rem;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }

        .footer-links a {
          color: #6b7280;
          text-decoration: none;
        }

        .separator {
          color: #d1d5db;
        }

        @media (max-width: 640px) {
          .login-card {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
