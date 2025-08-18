import { loginWithGoogle, loginWithEmail, createUserWithEmail } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store/auth-store";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useState, /*createContext, useContext,*/ useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { Check, AlertCircle, ChevronRight, Loader2, GraduationCap, Users } from "lucide-react";
import { ShineBorder } from "@/components/magicui/shine-border";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// // Create a context for tab state management
// const TabsContext = createContext<{
//   value: string;
//   onValueChange?: (value: string) => void;
// }>({ value: "" });

// // Enhanced Tabs component
// const Tabs = ({ defaultValue, className, children, value, onValueChange }: {
//   defaultValue: string;
//   className: string;
//   children: React.ReactNode;
//   value?: string;
//   onValueChange?: (value: string) => void;
// }) => {
//   const [internalValue, setInternalValue] = useState(defaultValue);
//   const activeValue = value !== undefined ? value : internalValue;

//   const handleValueChange = (newValue: string) => {
//     if (value === undefined) {
//       setInternalValue(newValue);
//     }
//     if (onValueChange) {
//       onValueChange(newValue);
//     }
//   };

//   return (
//     <TabsContext.Provider value={{ value: activeValue, onValueChange: handleValueChange }}>
//       <div className={cn("flex flex-col", className)} data-value={activeValue}>
//         {children}
//       </div>
//     </TabsContext.Provider>
//   );
// };

// const TabsList = ({ className, children }: { className: string; children: React.ReactNode }) => {
//   return (
//     <div className={cn(
//       "inline-flex h-9 sm:h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
//       className
//     )}>
//       {children}
//     </div>
//   );
// };

// const TabsTrigger = ({ value, children, onClick }: {
//   value: string;
//   children: React.ReactNode;
//   onClick?: () => void;
// }) => {
//   const { value: activeValue, onValueChange } = useContext(TabsContext);

//   const handleClick = () => {
//     if (onClick) onClick();
//     if (onValueChange) onValueChange(value);
//   };

//   const isActive = activeValue === value;

//   return (
//     <button
//       onClick={handleClick}
//       className={cn(
//         "inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
//         isActive ? "bg-background text-foreground shadow-sm" : "hover:text-foreground/80"
//       )}
//       data-value={value}
//       data-state={isActive ? "active" : "inactive"}
//     >
//       {children}
//     </button>
//   );
// };

export default function AuthPage() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    fullName?: string;
    role?: string;
    auth?: string;
  }>({});

  const setUser = useAuthStore((state) => state.setUser);

  // Password validation
  const passwordsMatch = !confirmPassword || password === confirmPassword;
  const calculatePasswordStrength = (password: string) => {
    if (!password) return { value: 0, label: "Weak", color: "bg-red-500" };

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25;

    if (strength <= 25) return { value: strength, label: "Weak", color: "bg-red-500" };
    if (strength <= 50) return { value: strength, label: "Fair", color: "bg-yellow-500" };
    if (strength <= 75) return { value: strength, label: "Good", color: "bg-blue-500" };
    return { value: strength, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = calculatePasswordStrength(password);

  const toggleSignUpMode = () => {
    setIsSignUp(!isSignUp);
    setFormErrors({});
    // Reset role selection when switching modes
    setSelectedRole("");
  };

  const validateForm = () => {
    const errors: typeof formErrors = {};

    if (!email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email format";

    if (!password) errors.password = "Password is required";
    else if (isSignUp && password.length < 8) errors.password = "Password must be at least 8 characters";

    if (isSignUp && !fullName) errors.fullName = "Full name is required";
    if (isSignUp && !selectedRole) errors.role = "Please select your role";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setFormErrors({});
      const { result, role } = await loginWithGoogle();
      setUser({
        uid: result.user.uid,
        email: result.user.email || "",
        name: result.user.displayName || "",
        role,
        avatar: result.user.photoURL || "",
      });

      navigate({ to: `/${role}/home` });
    } catch (error) {
      console.error("Google Login Failed", error);
      setFormErrors({
        ...formErrors,
        auth: "Failed to sign in with Google. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setFormErrors({});
      const { result, role } = await loginWithEmail(email, password);
      setUser({
        uid: result.user.uid,
        email: result.user.email || "",
        name: result.user.displayName || "",
        role,
        avatar: result.user.photoURL || "",
      });

      navigate({ to: `/${role}/home` });
    } catch (error) {
      console.error("Email Login Failed", error);
      setFormErrors({
        ...formErrors,
        auth: "Invalid email or password. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    if (!validateForm()) return;

    if (!passwordsMatch) {
      setFormErrors({
        ...formErrors,
        password: "Passwords do not match"
      });
      return;
    }

    if (passwordStrength.value < 50) {
      setFormErrors({
        ...formErrors,
        password: "Please create a stronger password"
      });
      return;
    }

    try {
      setLoading(true);
      setFormErrors({});
      console.log("Creating user with role:", selectedRole);
      const { result, role } = await createUserWithEmail(email, password, fullName, selectedRole);

      setUser({
        uid: result.user.uid,
        email: result.user.email || "",
        name: fullName,
        //role: selectedRole,
        role,
        avatar: result.user.photoURL || ""
      });

      navigate({ to: `/${role}/home` });
    } catch (error: unknown) {
      console.error("Email Signup Failed", error);
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'auth/email-already-in-use') {
        setFormErrors({
          ...formErrors,
          auth: "This email is already in use. Please try logging in instead."
        });
      } else {
        setFormErrors({
          ...formErrors,
          auth: "Failed to create account. Please try again."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'teacher') {
        navigate({ to: '/teacher/home' });
      } else if (user.role === 'student') {
        navigate({ to: '/student/home' });
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex flex-col relative bg-[linear-gradient(135deg,_#f8f9fb_90%,_#e0e7ff_100%)] overflow-hidden">
      {/* Subtle diagonal lines pattern overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, #e0e7ff 0px, #e0e7ff 1px, transparent 1px, transparent 40px)',
          opacity: 0.25,
        }}
      />
      {/* Decorative SVG lines background, from bottom to top */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 900 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polyline points="0,400 200,0 400,400 600,0 800,400 900,200" stroke="#6c3eb6" strokeWidth="2" fill="none" />
        <polyline points="100,400 300,0 500,400 700,0 900,400" stroke="#a084e8" strokeWidth="1.5" fill="none" />
      </svg>
      {/* Hero Section */}
      <section className="w-full flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 lg:px-16 pt-6 sm:pt-12 pb-6 sm:pb-8 bg-white/80 rounded-b-2xl sm:rounded-b-3xl shadow-md relative overflow-hidden z-10">
        {/* Left: Heading, subheading, features */}
        <div className="flex-1 flex flex-col items-start gap-4 sm:gap-6 z-10 w-full lg:w-auto">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                VidyaMitra
              </span>
            </h1>
            <p className="text-sm font-medium text-blue-500/90">Empowering Education</p>
          </div>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-md">
            Transform classroom engagement with real-time polling and instant feedback
          </p>
          {/* Features Grid */}
          <div className="w-full max-w-2xl mt-4 sm:mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              <div className="bg-white/70 rounded-lg sm:rounded-xl p-3 sm:p-5 shadow flex flex-col gap-2">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                  <span className="p-1.5 sm:p-2 rounded-lg bg-blue-50 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-6 sm:w-6">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </span>
                  <span className="font-semibold text-sm sm:text-lg text-blue-600">Engage Students</span>
                </div>
                <span className="text-gray-600 text-xs sm:text-sm">Increase participation with live polls and interactive questions during lectures.</span>
              </div>
              <div className="bg-white/70 rounded-lg sm:rounded-xl p-3 sm:p-5 shadow flex flex-col gap-2">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                  <span className="p-1.5 sm:p-2 rounded-lg bg-green-50 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-6 sm:w-6">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                  </span>
                  <span className="font-semibold text-sm sm:text-lg text-green-600">Instant Feedback</span>
                </div>
                <span className="text-gray-600 text-xs sm:text-sm">Get real-time insights into student understanding to adjust your teaching.</span>
              </div>
              <div className="bg-white/70 rounded-lg sm:rounded-xl p-3 sm:p-5 shadow flex flex-col gap-2">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                  <span className="p-1.5 sm:p-2 rounded-lg bg-purple-50 text-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-6 sm:w-6">
                      <path d="M3 3v18h18"></path>
                      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
                    </svg>
                  </span>
                  <span className="font-semibold text-sm sm:text-lg text-purple-600">Track Progress</span>
                </div>
                <span className="text-gray-600 text-xs sm:text-sm">Monitor class performance over time with detailed analytics.</span>
              </div>
              <div className="bg-white/70 rounded-lg sm:rounded-xl p-3 sm:p-5 shadow flex flex-col gap-2">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                  <span className="p-1.5 sm:p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-6 sm:w-6">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                  </span>
                  <span className="font-semibold text-sm sm:text-lg text-indigo-600">Easy Setup</span>
                </div>
                <span className="text-gray-600 text-xs sm:text-sm">Create and launch polls in seconds with our intuitive interface.</span>
              </div>
            </div>
          </div>
        </div>
        {/* Right: Sign-in form (auth card) */}
        <div className="flex-1 flex justify-center items-center w-full lg:w-auto mt-6 sm:mt-8 lg:mt-0 z-10">
          <div className="mx-auto w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {isSignUp
                  ? "Join educators worldwide transforming their classrooms"
                  : "Sign in to access your poll dashboard"
                }
              </p>
            </div>
            {/* Auth Card with Shine Border */}
            <Card className="relative overflow-hidden">
              <ShineBorder
                shineColor={["#3B82F6", "#10B981", "#6366F1"]}
                duration={8}
                borderWidth={2}
              />
              <AnimatePresence mode="wait">
                {!isSignUp ? (
                  // Login Section
                  <motion.div
                    key="login"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Role Selection Tabs */}
                    <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                      {/* Auth Error Alert */}
                      {formErrors.auth && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="rounded-lg border border-destructive/50 bg-destructive/10 p-3"
                        >
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <p className="text-sm text-destructive">{formErrors.auth}</p>
                          </div>
                        </motion.div>
                      )}
                      {/* Email Field */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={cn(
                            "transition-all duration-200 text-sm sm:text-base",
                            formErrors.email && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                        {formErrors.email && (
                          <p className="text-xs text-destructive">{formErrors.email}</p>
                        )}
                      </div>
                      {/* Password Field */}
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={cn(
                            "transition-all duration-200 text-sm sm:text-base",
                            formErrors.password && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                        {formErrors.password && (
                          <p className="text-xs text-destructive">{formErrors.password}</p>
                        )}
                      </div>
                      {/* Sign In Button */}
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-2 rounded-lg text-sm sm:text-base"
                        onClick={handleEmailLogin}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 inline" /> : null}
                        Sign in
                      </Button>
                      <div className="flex items-center my-3 sm:my-4">
                        <Separator className="flex-1" />
                        <span className="mx-3 sm:mx-4 text-xs text-muted-foreground">OR CONTINUE WITH</span>
                        <Separator className="flex-1" />
                      </div>
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 border-gray-300 text-sm sm:text-base"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                      >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-4 w-4 sm:h-5 sm:w-5" />
                        Continue with Google
                      </Button>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 items-center p-4 sm:p-6">
                      <span className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <button
                          className="text-blue-600 hover:underline font-medium"
                          onClick={toggleSignUpMode}
                        >
                          Sign up
                        </button>
                      </span>
                    </CardFooter>
                  </motion.div>
                ) : (
                  // Sign Up Section
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-lg sm:text-xl">Create Your Account</CardTitle>
                      <CardDescription className="text-sm">
                        Join our platform and choose your role to get started
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                      {/* Auth Error Alert */}
                      {formErrors.auth && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="rounded-lg border border-destructive/50 bg-destructive/10 p-3"
                        >
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <p className="text-sm text-destructive">{formErrors.auth}</p>
                          </div>
                        </motion.div>
                      )}

                      {/* Role Selection */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Select Your Role
                        </Label>
                        <div className="grid grid-cols-1 gap-3">
                          {/* Teacher Option */}
                          <button
                            type="button"
                            onClick={() => setSelectedRole("teacher")}
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 text-left",
                              selectedRole === "teacher"
                                ? "border-blue-500 bg-blue-50 shadow-sm"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                              formErrors.role && "border-destructive"
                            )}
                          >
                            <div className={cn(
                              "p-2 rounded-lg",
                              selectedRole === "teacher"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-600"
                            )}>
                              <GraduationCap className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm sm:text-base">Teacher</span>
                                {selectedRole === "teacher" && (
                                  <Check className="h-4 w-4 text-blue-600" />
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                Create and manage polls for your students
                              </p>
                            </div>
                          </button>

                          {/* Student Option */}
                          <button
                            type="button"
                            onClick={() => setSelectedRole("student")}
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 text-left",
                              selectedRole === "student"
                                ? "border-green-500 bg-green-50 shadow-sm"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                              formErrors.role && "border-destructive"
                            )}
                          >
                            <div className={cn(
                              "p-2 rounded-lg",
                              selectedRole === "student"
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-600"
                            )}>
                              <Users className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm sm:text-base">Student</span>
                                {selectedRole === "student" && (
                                  <Check className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                Participate in classroom polls and activities
                              </p>
                            </div>
                          </button>
                        </div>
                        {formErrors.role && (
                          <p className="text-xs text-destructive">{formErrors.role}</p>
                        )}
                      </div>

                      {/* Full Name */}
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium">
                          Full Name
                        </Label>
                        <Input
                          id="fullName"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className={cn(
                            "transition-all duration-200 text-sm sm:text-base",
                            formErrors.fullName && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                        {formErrors.fullName && (
                          <p className="text-xs text-destructive">{formErrors.fullName}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm font-medium">
                          Email Address
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={cn(
                            "transition-all duration-200 text-sm sm:text-base",
                            formErrors.email && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                        {formErrors.email && (
                          <p className="text-xs text-destructive">{formErrors.email}</p>
                        )}
                      </div>

                      {/* Password with Strength Indicator */}
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm font-medium">
                          Password
                        </Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a strong password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={cn(
                            "transition-all duration-200 text-sm sm:text-base",
                            formErrors.password && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                        {password && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Password strength</span>
                              <span className={cn(
                                "text-xs font-medium",
                                passwordStrength.value <= 25 && "text-red-500",
                                passwordStrength.value > 25 && passwordStrength.value <= 50 && "text-yellow-500",
                                passwordStrength.value > 50 && passwordStrength.value <= 75 && "text-blue-500",
                                passwordStrength.value > 75 && "text-green-500"
                              )}>
                                {passwordStrength.label}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div
                                className={cn(
                                  "h-1.5 rounded-full transition-all duration-300",
                                  passwordStrength.color
                                )}
                                style={{ width: `${passwordStrength.value}%` }}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Check className={cn(
                                  "h-3 w-3",
                                  password.length >= 8 ? 'text-green-500' : 'text-muted-foreground'
                                )} />
                                8+ characters
                              </div>
                              <div className="flex items-center gap-1">
                                <Check className={cn(
                                  "h-3 w-3",
                                  /[A-Z]/.test(password) ? 'text-green-500' : 'text-muted-foreground'
                                )} />
                                Uppercase
                              </div>
                              <div className="flex items-center gap-1">
                                <Check className={cn(
                                  "h-3 w-3",
                                  /\d/.test(password) ? 'text-green-500' : 'text-muted-foreground'
                                )} />
                                Numbers
                              </div>
                              <div className="flex items-center gap-1">
                                <Check className={cn(
                                  "h-3 w-3",
                                  /[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-500' : 'text-muted-foreground'
                                )} />
                                Special chars
                              </div>
                            </div>
                          </div>
                        )}
                        {formErrors.password && (
                          <p className="text-xs text-destructive">{formErrors.password}</p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={cn(
                            "transition-all duration-200 text-sm sm:text-base",
                            !passwordsMatch && confirmPassword && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                        {!passwordsMatch && confirmPassword && (
                          <p className="text-xs text-destructive">Passwords do not match</p>
                        )}
                      </div>

                      {/* Sign Up Button */}
                      <Button
                        className="w-full h-10 sm:h-11 font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-200 group text-sm sm:text-base"
                        onClick={handleEmailSignup}
                        disabled={!passwordsMatch || passwordStrength.value < 50 || loading || !selectedRole}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Create Account
                            <ChevronRight className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                          </>
                        )}
                      </Button>
                    </CardContent>

                    <CardFooter className="p-4 sm:p-6">
                      <Button
                        variant="link"
                        className="w-full text-sm text-muted-foreground hover:text-foreground group"
                        onClick={toggleSignUpMode}
                      >
                        Already have an account? <span className="ml-1 font-medium group-hover:underline">Sign in</span>
                      </Button>
                    </CardFooter>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}