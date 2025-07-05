import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { logout } from "@/lib/api/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Home, Users, User, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import React from "react";

const AuroraText = ({
  children,
  colors = ["#A07CFE", "#FE8FB5", "#FFBE7B"],
}: {
  children: React.ReactNode;
  colors?: string[];
}) => (
  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent animate-pulse dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400">
    {children}
  </span>
);

export default function StudentLayout() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    console.log("Logging out...");
    navigate({ to: "/auth" });
  };

  const handleProfileClick = () => {
    navigate({ to: "/student/profile" });
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Enhanced floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse dark:from-purple-500/15 dark:to-blue-500/15"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000 dark:from-blue-500/15 dark:to-cyan-500/15"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl animate-pulse delay-2000 dark:from-emerald-500/10 dark:to-blue-500/10"></div>
      </div>

      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-lg shadow-slate-500/5 dark:bg-gray-900/95 dark:border-gray-700/80 dark:shadow-gray-900/20">
        <div className="flex h-20 items-center justify-between px-6 lg:px-8">
          {/* Enhanced Logo */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300 dark:from-purple-400 dark:to-blue-400 dark:opacity-25 dark:group-hover:opacity-40"></div>
              <div className="relative h-14 w-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center overflow-hidden shadow-lg dark:from-purple-400 dark:to-blue-400">
                <img
                  src="https://continuousactivelearning.github.io/vibe/img/logo.png"
                  alt="Vibe Logo"
                  className="h-10 w-10 object-contain"
                />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-3xl font-bold">
                <AuroraText colors={["#A07CFE", "#FE8FB5", "#FFBE7B"]}>EduPoll</AuroraText>
              </h1>
              <p className="text-sm text-slate-600 -mt-1 dark:text-gray-400">
                Live Poll Room Sessions
              </p>
            </div>
          </div>

          {/* Enhanced Navigation Menu */}
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`relative h-10 px-4 text-sm font-medium transition-all duration-300 group ${isActiveRoute('/student/home')
                  ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-md shadow-purple-200/50 dark:from-purple-900/40 dark:to-blue-900/40 dark:text-purple-300 dark:shadow-purple-900/20'
                  : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:text-slate-900 hover:shadow-md hover:shadow-slate-200/50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-gray-800 dark:hover:to-gray-700 dark:hover:text-white dark:hover:shadow-gray-900/20'
                }`}
              asChild
            >
              <Link to="/student/home">
                <Home className="h-4 w-4 mr-2" />
                <span className="relative z-10">Home</span>
                {isActiveRoute('/student/home') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-md dark:from-purple-400/20 dark:to-blue-400/20" />
                )}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`relative h-10 px-4 text-sm font-medium transition-all duration-300 group ${isActiveRoute('/student/pollroom')
                  ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-md shadow-purple-200/50 dark:from-purple-900/40 dark:to-blue-900/40 dark:text-purple-300 dark:shadow-purple-900/20'
                  : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:text-slate-900 hover:shadow-md hover:shadow-slate-200/50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-gray-800 dark:hover:to-gray-700 dark:hover:text-white dark:hover:shadow-gray-900/20'
                }`}
              asChild
            >
              <Link to="/student/pollroom">
                <Users className="h-4 w-4 mr-2" />
                <span className="relative z-10">Room</span>
                {isActiveRoute('/student/pollroom') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-md dark:from-purple-400/20 dark:to-blue-400/20" />
                )}
              </Link>
            </Button>
          </nav>

          {/* Enhanced Right side */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            {/* Enhanced User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-auto p-2 rounded-full hover:bg-transparent focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300"
                >
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity duration-300 dark:from-purple-400 dark:to-blue-400 dark:opacity-25 dark:group-hover:opacity-40"></div>
                    <div className="relative flex items-center gap-2">
                      <Avatar className="h-12 w-12 border-2 border-white/90 transition-all duration-300 group-hover:scale-110 shadow-lg dark:border-gray-700/90">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold text-lg shadow-inner dark:from-purple-400 dark:to-blue-400">
                          {user?.name?.charAt(0).toUpperCase() || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:block text-left">
                        <div className="text-sm font-medium text-slate-900 dark:text-gray-100">
                          {user?.name || 'Student'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-gray-400">
                          {user?.email || 'student@example.com'}
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-slate-500 transition-transform duration-200 group-hover:text-slate-700 dark:text-gray-400 dark:group-hover:text-gray-200" />
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 p-2 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-xl shadow-slate-500/10 dark:bg-gray-900/95 dark:border-gray-700/80 dark:shadow-gray-900/20"
              >
                {/* User Info Header */}
                <div className="flex items-center gap-3 p-3 mb-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg dark:from-purple-900/30 dark:to-blue-900/30">
                  <Avatar className="h-10 w-10 border-2 border-white/90 shadow-md dark:border-gray-700/90">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold dark:from-purple-400 dark:to-blue-400">
                      {user?.name?.charAt(0).toUpperCase() || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 dark:text-gray-100 truncate">
                      {user?.name || 'Student'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-gray-400 truncate">
                      {user?.email || 'student@example.com'}
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator className="bg-slate-200/80 dark:bg-gray-700/80" />

                {/* Profile Link */}
                <DropdownMenuItem
                  onClick={handleProfileClick}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center dark:from-purple-900/50 dark:to-blue-900/50">
                    <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900 dark:text-gray-100">
                      View Profile
                    </div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">
                      Manage your account
                    </div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-200/80 dark:bg-gray-700/80" />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-200 dark:hover:from-red-900/30 dark:hover:to-orange-900/30"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-red-100 to-orange-100 flex items-center justify-center dark:from-red-900/50 dark:to-orange-900/50">
                    <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900 dark:text-gray-100">
                      Log Out
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Enhanced Main Content */}
      <main className="relative flex-1 p-6 lg:p-8">
        {/* Enhanced content background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white/90 pointer-events-none dark:via-gray-900/70 dark:to-gray-900/90" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}