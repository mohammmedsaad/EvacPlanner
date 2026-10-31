import { useState } from 'react'

function LoginView({ onLogin, onGuestContinue }) {
  const [emailOrUsername, setEmailOrUsername] = useState('admin@evacplanner.ai')
  const [password, setPassword] = useState('emergency2026')
  const [role, setRole] = useState('Safety Commander')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!emailOrUsername.trim()) {
      setError('Please provide an email or username.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    setIsLoading(true)

    // Smooth client-side authentication simulation
    setTimeout(() => {
      setIsLoading(false)
      const user = {
        name: emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername,
        email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@evacplanner.ai`,
        role: role,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      onLogin(user, rememberMe)
    }, 450)
  }

  const handleQuickDemo = (demoRole, demoUser, demoPass) => {
    setEmailOrUsername(demoUser)
    setPassword(demoPass)
    setRole(demoRole)
    setError('')
  }

  return (
    <div className="login-page-container">
      <div className="login-background-overlay" aria-hidden="true" />

      <div className="login-card-wrapper">
        {/* Brand Banner */}
        <div className="login-brand-header">
          <div className="login-brand-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div>
            <h1 className="login-brand-title">EvacPlanner</h1>
            <p className="login-brand-subtitle">Emergency Building Evacuation AI Operations</p>
          </div>
        </div>

        {/* Security Alert Badge */}
        <div className="login-badge-pill">
          <span className="login-badge-dot"></span>
          <span>Restricted Facility Operations System • Operator Authentication</span>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="login-error-alert" role="alert">
              <span className="error-icon" aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="login-input-group">
            <label htmlFor="login-username" className="login-label">
              Operator Identifier / Email
            </label>
            <div className="input-with-icon">
              <span className="input-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                className="login-input"
                placeholder="e.g. commander@evac.local"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-input-group">
            <label htmlFor="login-password" className="login-label">
              Security Access Code / Password
            </label>
            <div className="input-with-icon">
              <span className="input-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                className="login-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-input-group">
            <label htmlFor="login-role" className="login-label">
              Operational Role & Permission Tier
            </label>
            <div className="input-with-icon">
              <span className="input-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </span>
              <select
                id="login-role"
                className="login-input login-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Safety Commander">Safety Commander (Full Tactical Clearance)</option>
                <option value="Building Marshal">Building Fire Marshal (Egress Routing)</option>
                <option value="AI Research Analyst">AI Systems Analyst (Benchmarking)</option>
                <option value="Academic Reviewer">Academic Project Evaluator (Demonstration)</option>
              </select>
            </div>
          </div>

          <div className="login-options-row">
            <label className="login-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="login-checkbox"
              />
              <span>Remember session credentials</span>
            </label>
            <button
              type="button"
              className="login-text-btn"
              onClick={() => handleQuickDemo('Academic Reviewer', 'evaluator@college.edu', 'capstone2026')}
            >
              Autofill Evaluator
            </button>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="btn-loading-flex">
                <span className="login-spinner" aria-hidden="true"></span>
                <span>Authenticating Clearance...</span>
              </span>
            ) : (
              <span>Authorize & Access Command Dashboard →</span>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Preset */}
        <div className="login-quick-roles">
          <span className="quick-roles-title">Pre-configured Role Logins (Demo Quick Select):</span>
          <div className="quick-roles-pills">
            <button
              type="button"
              className="role-pill-btn"
              onClick={() => handleQuickDemo('Safety Commander', 'admin@evacplanner.ai', 'emergency2026')}
            >
              🛡️ Commander
            </button>
            <button
              type="button"
              className="role-pill-btn"
              onClick={() => handleQuickDemo('Building Marshal', 'marshal@evacplanner.ai', 'firemarshal2026')}
            >
              🚒 Marshal
            </button>
            <button
              type="button"
              className="role-pill-btn"
              onClick={() => handleQuickDemo('Academic Reviewer', 'evaluator@college.edu', 'capstone2026')}
            >
              🎓 Evaluator
            </button>
          </div>
        </div>

        {/* Bypass / Guest Option */}
        <div className="login-footer-section">
          <button
            type="button"
            className="guest-bypass-btn"
            onClick={onGuestContinue}
          >
            Continue as Guest Operator (Direct Preview)
          </button>

        </div>
      </div>
    </div>
  )
}

export default LoginView

