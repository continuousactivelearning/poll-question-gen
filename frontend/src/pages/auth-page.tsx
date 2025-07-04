import { loginWithGoogle, loginWithEmail, createUserWithEmail } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store/auth-store";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useState, createContext, useContext, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { ShineBorder } from "@/components/magicui/shine-border";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import { AuroraText } from "@/components/magicui/aurora-text";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Create a context for tab state management
const TabsContext = createContext<{
  value: string;
  onValueChange?: (value: string) => void;
}>({ value: "" });

// Enhanced Tabs component
const Tabs = ({ defaultValue, className, children, value, onValueChange }: { 
  defaultValue: string; 
  className: string; 
  children: React.ReactNode; 
  value?: string;
  onValueChange?: (value: string) => void;
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };
  
  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: handleValueChange }}>
      <div className={cn("flex flex-col", className)} data-value={activeValue}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ className, children }: { className: string; children: React.ReactNode }) => {
  return (
    <div className={cn(
      "inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    )}>
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, children, onClick }: { 
  value: string; 
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const { value: activeValue, onValueChange } = useContext(TabsContext);
  
  const handleClick = () => {
    if (onClick) onClick();
    if (onValueChange) onValueChange(value);
  };
  
  const isActive = activeValue === value;
  
  return (
    <button 
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-background text-foreground shadow-sm" : "hover:text-foreground/80"
      )}
      data-value={value}
      data-state={isActive ? "active" : "inactive"}
    >
      {children}
    </button>
  );
};

export default function AuthPage() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeRole, setActiveRole] = useState<"teacher" | "student">("student");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    fullName?: string;
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
  };

  const validateForm = () => {
    const errors: typeof formErrors = {};
    
    if (!email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email format";
    
    if (!password) errors.password = "Password is required";
    else if (isSignUp && password.length < 8) errors.password = "Password must be at least 8 characters";
    
    if (isSignUp && !fullName) errors.fullName = "Full name is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setFormErrors({});
      const result = await loginWithGoogle();
      
      setUser({
        uid: result.user.uid,
        email: result.user.email || "",
        name: result.user.displayName || "",
        role: activeRole,
        avatar: result.user.photoURL || "",
      });
      
      navigate({ to: `/${activeRole}` });
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
      
      const result = await loginWithEmail(email, password);
      
      setUser({
        uid: result.user.uid,
        email: result.user.email || "",
        name: result.user.displayName || "",
        role: activeRole,
        avatar: result.user.photoURL || "",
      });
      
      navigate({ to: `/${activeRole}` });
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
      
      const result = await createUserWithEmail(email, password, fullName);
      
      setUser({
        uid: result.user.uid,
        email: result.user.email || "",
        name: fullName,
        role: "student",
        avatar: result.user.photoURL || ""
      });
      
      navigate({ to: "/student/pollroom" });
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
        navigate({ to: '/teacher/pollroom' });
      } else if (user.role === 'student') {
        navigate({ to: '/student/pollroom' });
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated Grid Background */}
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.05}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "absolute inset-0 h-full w-full",
        )}
      />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/10"
            initial={{
              x: Math.random() * 100,
              y: Math.random() * 100,
              width: Math.random() * 10 + 2,
              height: Math.random() * 10 + 2,
              opacity: Math.random() * 0.5 + 0.1,
            }}
            animate={{
              x: Math.random() * 100,
              y: Math.random() * 100,
              transition: {
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse",
              },
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Hero Section */}
        <div className="flex flex-col justify-center items-center p-6 lg:p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative lg:flex-1 min-h-[40vh] lg:min-h-screen">
          {/* Brand Logo */}
          <div className="absolute top-8 left-8 flex items-center space-x-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-12 w-12 rounded-lg overflow-hidden"
            >
              {/* <img 
                src="https://cdn-icons-png.flaticon.com/512/2933/2933245.png" 
                alt="Poll System Logo" 
                className="h-12 w-12 object-contain"
              /> */}
            </motion.div>
            <motion.span 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-bold"
            >
              <AuroraText colors={["#3B82F6", "#10B981", "#6366F1"]}></AuroraText>
            </motion.span>
          </div>

          {/* Hero Content */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center space-y-10 max-w-2xl mx-auto py-12"
          >
            <div className="text-center space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                <AuroraText colors={["#3B82F6", "#10B981", "#6366F1"]}>Poll Automation System</AuroraText>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Transform classroom engagement with real-time polling and instant feedback
              </p>
            </div>
            
            {/* Features Grid */}
            <div className="w-full max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    ),
                    title: "Engage Students",
                    description: "Increase participation with live polls and interactive questions during lectures.",
                    color: "text-blue-500"
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                      </svg>
                    ),
                    title: "Instant Feedback",
                    description: "Get real-time insights into student understanding to adjust your teaching.",
                    color: "text-green-500"
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <path d="M3 3v18h18"></path>
                        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
                      </svg>
                    ),
                    title: "Track Progress",
                    description: "Monitor class performance over time with detailed analytics.",
                    color: "text-purple-500"
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                      </svg>
                    ),
                    title: "Easy Setup",
                    description: "Create and launch polls in seconds with our intuitive interface.",
                    color: "text-indigo-500"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  >
                    <Card className="relative overflow-hidden bg-white/5 backdrop-blur-sm border border-primary/20 hover:shadow-lg transition-all duration-300 group h-full">
                      <div className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className={`p-3 rounded-lg ${feature.color}/10 ${feature.color}`}>
                            {feature.icon}
                          </div>
                          <h3 className="text-lg font-semibold">{feature.title}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mx-auto w-full max-w-md space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-muted-foreground">
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
                    <CardHeader className="pb-4">
                      <Tabs 
                        defaultValue="student" 
                        className="w-full" 
                        onValueChange={(v: string) => setActiveRole(v as "student" | "teacher")}
                        value={activeRole}
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="student">Student</TabsTrigger>
                          <TabsTrigger value="teacher">Teacher</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </CardHeader>

                    <CardContent className="space-y-4">
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
                            "transition-all duration-200",
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
                            "transition-all duration-200",
                            formErrors.password && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                        {formErrors.password && (
                          <p className="text-xs text-destructive">{formErrors.password}</p>
                        )}
                      </div>

                      {/* Login Button */}
                      <Button 
                        className="w-full h-11 font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-200 group"
                        onClick={handleEmailLogin}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Sign in as {activeRole}
                            <ChevronRight className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                          </>
                        )}
                      </Button>
                      
                      {/* Divider */}
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            or continue with
                          </span>
                        </div>
                      </div>

                      {/* Google Login */}
                      <Button 
                        variant="outline" 
                        className="w-full h-11 font-medium border-2 hover:bg-muted/50 transition-all duration-200 group" 
                        onClick={handleGoogleLogin} 
                        disabled={loading}
                      >
                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                        <ChevronRight className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                      </Button>
                    </CardContent>

                    <CardFooter className="pt-4">
                      <Button 
                        variant="link" 
                        className="w-full text-sm text-muted-foreground hover:text-foreground group" 
                        onClick={toggleSignUpMode}
                      >
                        Don't have an account? <span className="ml-1 font-medium group-hover:underline">Sign up</span>
                      </Button>
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
                    <CardHeader>
                      <CardTitle className="text-xl">Create Student Account</CardTitle>
                      <CardDescription>
                        Join our platform to participate in classroom polls and activities
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
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
                            "transition-all duration-200",
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
                            "transition-all duration-200",
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
                            "transition-all duration-200",
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
                            "transition-all duration-200",
                            !passwordsMatch && confirmPassword && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                        {!passwordsMatch && confirmPassword && (
                          <p className="text-xs text-destructive">Passwords do not match</p>
                        )}
                      </div>

                      {/* Sign Up Button */}
                      <Button 
                        className="w-full h-11 font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-200 group"
                        onClick={handleEmailSignup}
                        disabled={!passwordsMatch || passwordStrength.value < 50 || loading}
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

                    <CardFooter>
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}