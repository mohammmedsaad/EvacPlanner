function Sidebar({ activePage, setActivePage, isMobileOpen, setIsMobileOpen, currentUser, onLogout }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      )
    },
    {
      id: 'map',
      label: 'Building Map',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
          <line x1="8" y1="2" x2="8" y2="18"></line>
          <line x1="16" y1="6" x2="16" y2="22"></line>
        </svg>
      )
    },
    {
      id: 'simulation',
      label: 'Evacuation Simulation',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      )
    },
    {
      id: 'history',
      label: 'Simulation History',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      )
    },
    {
      id: 'about',
      label: 'About Project',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      )
    }
  ]

  const handleNavClick = (id) => {
    setActivePage(id)
    if (isMobileOpen) {
      setIsMobileOpen(false)
    }
  }

  return (
    <>
      {isMobileOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
      <aside className={`app-sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">EvacPlanner</span>
            <span className="brand-tagline">AI Evacuation System</span>
          </div>
          {isMobileOpen && (
            <button 
              className="sidebar-close-btn"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close navigation sidebar"
            >
              ✕
            </button>
          )}
        </div>

        <div className="sidebar-section-label">Navigation</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {activePage === item.id && <span className="active-pip" />}
            </button>
          ))}
        </nav>

        {currentUser && (
          <div className="sidebar-footer sidebar-user-footer">
            <div className="sidebar-user-avatar" aria-hidden="true">
              {currentUser.name ? currentUser.name[0].toUpperCase() : 'O'}
            </div>
            <div className="sidebar-user-meta">
              <span className="sidebar-user-name" title={currentUser.name}>{currentUser.name}</span>
              <span className="sidebar-user-role" title={currentUser.role}>{currentUser.role}</span>
            </div>
            {onLogout && (
              <button
                type="button"
                className="sidebar-logout-btn"
                onClick={onLogout}
                title="Sign out of operator session"
                aria-label="Sign out"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  )
}

export default Sidebar
