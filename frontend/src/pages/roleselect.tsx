import { useState, useEffect } from "react";
import {/* GraduationCap, Users, Loader2,*/ ChevronRight, Check } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/store/auth-store";
import { updateUserRole } from "@/lib/firebase";

export default function RoleSelectionPage() {
    const [selectedRole, setSelectedRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [cardsVisible, setCardsVisible] = useState(false);

    const { user, setUser } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setCardsVisible(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!user) {
            navigate({ to: '/auth' });
        }
    }, [user, navigate]);

    const handleRoleSelection = (role: string) => {
        setSelectedRole(role);
        const timer = setTimeout(() => setShowConfirm(true), 20);
        return () => clearTimeout(timer);
    };

    const handleConfirm = async () => {
        if (!selectedRole || !user) return;

        try {
            setLoading(true);
            setError("");
            await updateUserRole(user.uid, selectedRole);
            setUser({
                ...user,
                role: selectedRole
            });
            // alert(`Redirecting to ${selectedRole === 'teacher' ? 'Teacher' : 'Student'} Dashboard...`);

            navigate({ to: `/${selectedRole}/home` });
        } catch (error) {
            console.error("Failed to update user role:", error);
            setError("Failed to set your role. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <div
                className="absolute inset-0 w-full h-full"
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
                }}
            />

            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="floating-shape floating-shape-1" />
                <div className="floating-shape floating-shape-2" />
                <div className="floating-shape floating-shape-3" />
            </div>

            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 z-10 relative animate-fade-in-up">
                {/* Welcome Section */}
                <div className="text-center mb-12 animate-slide-in-top">
                    <h1 className="welcome-title text-4xl sm:text-5xl font-bold mb-4 text-white">
                        Welcome to EduPlatform!
                    </h1>
                    <p className="text-white/90 text-xl mb-8">
                    {user?.role ? (
                        <>Hi {user?.name}! Select your role to begin your learning journey</>
                    ) : (
                        <>Hi! Select your role to begin your learning journey</>
                    )}
                    </p>

                    <div className="w-full max-w-md mx-auto h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="progress-fill h-full rounded-full" />
                    </div>
                </div>

                {error && (
                    <div className="text-center mb-6 p-4 rounded-2xl bg-red-500/20 backdrop-blur-md border border-red-500/30 animate-fade-in">
                        <p className="text-white">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto mb-12">
                    <div
                        onClick={() => handleRoleSelection("teacher")}
                        className={`role-card group relative cursor-pointer transition-all duration-500 ${cardsVisible ? 'card-visible' : 'card-hidden'
                            } ${selectedRole === "teacher" ? 'selected' : ''}`}
                        style={{ animationDelay: '0.2s' }}
                    >
                        <div className="shimmer-overlay" />

                        <div className="relative text-center">
                            <div className="role-icon text-5xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                                👩‍🏫
                            </div>

                            <div className="flex items-center justify-center gap-2 mb-4">
                                <h3 className="text-2xl font-bold text-white">Teacher</h3>
                                {selectedRole === "teacher" && (
                                    <Check className="h-6 w-6 text-[#4ecdc4] animate-bounce" />
                                )}
                            </div>

                            <p className="text-white/80 mb-6 leading-relaxed">
                                Create Polls, Generate questions, and track student responses
                            </p>

                            <ul className="text-white/70 text-sm mb-8 space-y-2">
                                <li className="feature-item">Create and manage polls</li>
                                <li className="feature-item">Add multiple choice or open-ended questions</li>
                                <li className="feature-item">Track student participation</li>
                                <li className="feature-item">Analyze poll results in real-time</li>
                                <li className="feature-item">Generate reports for each poll</li>
                                <li className="feature-item">Manage multiple classrooms or groups</li>
                            </ul>

                            <button className="select-btn relative px-8 py-3 rounded-full font-semibold text-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                <div className="btn-ripple" />
                                <span className="relative">I'm a Teacher</span>
                            </button>
                        </div>
                    </div>

                    <div
                        onClick={() => handleRoleSelection("student")}
                        className={`role-card group relative cursor-pointer transition-all duration-500 ${cardsVisible ? 'card-visible' : 'card-hidden'
                            } ${selectedRole === "student" ? 'selected' : ''}`}
                        style={{ animationDelay: '0.4s' }}
                    >
                        <div className="shimmer-overlay" />

                        <div className="relative text-center">
                            <div className="role-icon text-5xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                                👨‍🎓
                            </div>

                            <div className="flex items-center justify-center gap-2 mb-4">
                                <h3 className="text-2xl font-bold text-white">Student</h3>
                                {selectedRole === "student" && (
                                    <Check className="h-6 w-6 text-[#4ecdc4] animate-bounce" />
                                )}
                            </div>

                            <p className="text-white/80 mb-6 leading-relaxed">
                                Answer polls created by teachers during their classes and track your engagement
                            </p>

                            <ul className="text-white/70 text-sm mb-8 space-y-2">
                                <li className="feature-item">Join polls shared in your classes</li>
                                <li className="feature-item">Submit answers to teacher-created questions</li>
                                <li className="feature-item">View instant poll results and class statistics</li>
                                <li className="feature-item">Participate in interactive quizzes and polls</li>
                            </ul>

                            <button className="select-btn relative px-8 py-3 rounded-full font-semibold text-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                <div className="btn-ripple" />
                                <span className="relative">I'm a Student</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Confirm Section */}
                <div className={`text-center transition-all duration-500 ${showConfirm ? 'confirm-show' : 'confirm-hidden'}`}>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="confirm-btn relative px-12 py-4 text-xl font-semibold text-white rounded-full overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl disabled:opacity-70"
                    >
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <div className="loading-spinner">⟳</div>
                                Redirecting...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                Start Your Journey
                                <ChevronRight className="h-5 w-5" />
                            </div>
                        )}
                    </button>
                </div>

                <p className="text-center text-white/70 text-sm mt-8 animate-fade-in-delayed">
                    You can change your role later in account settings
                </p>
            </div>

            <style>{`
                /* Keyframe Animations */
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(50px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideInFromTop {
                    from { opacity: 0; transform: translateY(-50px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes cardSlideIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes glow {
                    from { text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); }
                    to { text-shadow: 0 4px 20px rgba(255, 255, 255, 0.3); }
                }
                
                @keyframes shimmer {
                    0% { opacity: 0; transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                    50% { opacity: 1; }
                    100% { opacity: 0; transform: translateX(100%) translateY(100%) rotate(45deg); }
                }
                
                @keyframes progressFill {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* Base Classes */
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out;
                }
                
                .animate-slide-in-top {
                    animation: slideInFromTop 1s ease-out;
                }
                
                .animate-fade-in {
                    animation: fadeInUp 0.5s ease-out;
                }
                
                .animate-fade-in-delayed {
                    animation: fadeInUp 0.8s ease-out 0.5s both;
                }

                /* Welcome Title */
                .welcome-title {
                    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    animation: glow 2s ease-in-out infinite alternate;
                }

                /* Progress Bar */
                .progress-fill {
                    background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
                    width: 0%;
                    animation: progressFill 1.5s ease-out forwards;
                }

                /* Floating Shapes */
                .floating-shape {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1);
                    animation: float 6s ease-in-out infinite;
                }
                
                .floating-shape-1 {
                    width: 80px; height: 80px;
                    top: 10%; left: 10%;
                    animation-delay: 0s;
                }
                
                .floating-shape-2 {
                    width: 120px; height: 120px;
                    top: 20%; right: 10%;
                    animation-delay: 2s;
                }
                
                .floating-shape-3 {
                    width: 60px; height: 60px;
                    bottom: 20%; left: 20%;
                    animation-delay: 4s;
                }

                /* Role Cards */
                .role-card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 20px;
                    padding: 2rem;
                    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    position: relative;
                    overflow: hidden;
                }
                
                .card-hidden {
                    opacity: 0;
                    transform: translateY(20px);
                }
                
                .card-visible {
                    animation: cardSlideIn 0.6s ease-out forwards;
                }
                
                .role-card:hover {
                    transform: translateY(-10px) scale(1.02);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                    background: rgba(255, 255, 255, 0.15);
                    border-color: rgba(255, 255, 255, 0.3);
                }
                
                .role-card.selected {
                    background: rgba(255, 255, 255, 0.2) !important;
                    border-color: #4ecdc4 !important;
                    transform: translateY(-10px) scale(1.02) !important;
                    box-shadow: 0 20px 40px rgba(76, 205, 196, 0.3) !important;
                }

                /* Shimmer Effect */
                .shimmer-overlay {
                    content: '';
                    position: absolute;
                    top: -50%; left: -50%;
                    width: 200%; height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                    transform: rotate(45deg);
                    opacity: 0;
                    transition: all 0.5s;
                }
                
                .role-card:hover .shimmer-overlay {
                    animation: shimmer 1s ease-out;
                }

                /* Feature Items */
                .feature-item {
                    position: relative;
                    padding-left: 1.2rem;
                }
                
                .feature-item::before {
                    content: '✓';
                    position: absolute;
                    left: 0;
                    color: #4ecdc4;
                    font-weight: bold;
                }

                /* Select Button */
                .select-btn {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                }
                
                .btn-ripple {
                    position: absolute;
                    top: 50%; left: 50%;
                    width: 0; height: 0;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    transition: width 0.4s, height 0.4s;
                }
                
                .select-btn:hover .btn-ripple {
                    width: 300px;
                    height: 300px;
                }
                
                .select-btn:hover {
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                }

                /* Confirm Section */
                .confirm-hidden {
                    opacity: 0;
                    transform: translateY(20px);
                }
                
                .confirm-show {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* Confirm Button */
                .confirm-btn {
                    background: linear-gradient(135deg, #4ecdc4, #44a08d);
                }
                
                .confirm-btn:hover {
                    box-shadow: 0 15px 30px rgba(76, 205, 196, 0.4);
                }

                /* Loading Spinner */
                .loading-spinner {
                    display: inline-block;
                    animation: spin 1s linear infinite;
                }

                /* Mobile Responsiveness */
                @media (max-width: 768px) {
                    .welcome-title {
                        font-size: 2rem !important;
                    }
                }
            `}</style>
        </div>
    );
}