"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "../ui/resizable-navbar";

interface User {
  _id: string;
  username: string;
  email: string;
  role?: string;
}

export function NavBar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Features", link: "#features" },
    { name: "Pricing", link: "#pricing" },
    { name: "Contact", link: "#contact" },
  ];

  // Check authentication status on component mount and when localStorage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          // If user data is corrupted, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkAuthStatus();

    // Listen for storage changes (when user logs in/out from other components)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLoginClick = () => {
    navigate("/auth/login");
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <NavbarButton onClick={() => navigate("/admin")} variant="secondary">
                    Admin Panel
                  </NavbarButton>
                ) : (
                  <NavbarButton onClick={handleDashboardClick} variant="secondary">
                    Dashboard
                  </NavbarButton>
                )}
                <NavbarButton onClick={handleLogout} variant="primary">
                  Logout
                </NavbarButton>
              </>
            ) : (
              <>
                <NavbarButton onClick={handleLoginClick} variant="secondary">Login</NavbarButton>
                <NavbarButton variant="primary">Book a call</NavbarButton>
              </>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-2 py-2 rounded-md text-neutral-700 hover:text-black hover:bg-gray-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800"
              >
                {item.name}
              </a>
            ))}
            <div className="flex w-full flex-col gap-3 mt-4">
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <NavbarButton
                      onClick={() => navigate("/admin")}
                      variant="secondary"
                      className="w-full"
                    >
                      Admin Panel
                    </NavbarButton>
                  ) : (
                    <NavbarButton
                      onClick={handleDashboardClick}
                      variant="secondary"
                      className="w-full"
                    >
                      Dashboard
                    </NavbarButton>
                  )}
                  <NavbarButton
                    onClick={handleLogout}
                    variant="primary"
                    className="w-full"
                  >
                    Logout
                  </NavbarButton>
                </>
              ) : (
                <>
                  <NavbarButton
                    onClick={handleLoginClick}
                    variant="secondary"
                    className="w-full"
                  >
                    Login
                  </NavbarButton>
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full"
                  >
                    Book a call
                  </NavbarButton>
                </>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}

export default NavBar;
