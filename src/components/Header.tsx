import { ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export function Header({ onLoginClick, onSignupClick }: HeaderProps) {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <ShoppingCart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">GroupBuy</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/campaigns">
              <Button
                variant={isActive('/campaigns') ? 'secondary' : 'ghost'}
                size="sm"
              >
                Campaigns
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button
                variant={isActive('/how-it-works') ? 'secondary' : 'ghost'}
                size="sm"
              >
                How it Works
              </Button>
            </Link>
            <Link to="/about">
              <Button
                variant={isActive('/about') ? 'secondary' : 'ghost'}
                size="sm"
              >
                About
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {user.fullName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onLoginClick}>
                Login
              </Button>
              <Button size="sm" onClick={onSignupClick}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
