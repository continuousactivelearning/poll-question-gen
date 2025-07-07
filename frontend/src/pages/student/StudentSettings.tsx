import { useState } from "react";
import {
    User,
    Bell,
    Shield,
    Palette,
    Camera,
    Lock,
    Calendar,
    BookOpen,
    Target,
    Trash2,
    Download,
    Upload,
    RefreshCw,
    Save,
    ChevronRight,
    Settings as SettingsIcon,
    X,
    Zap,
    Moon,
    Sun,
    Laptop
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/store/auth-store";
import { toast } from "sonner";
import { useTheme } from "next-themes";

export default function StudentSettings() {
    const { user, setUser } = useAuthStore();
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState("profile");
    const [hasChanges, setHasChanges] = useState(false);

    // Profile settings
    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        location: "",
        bio: "",
        dateOfBirth: "",
        university: "",
        major: "",
        year: "1st Year",
        avatar: user?.avatar || "",
    });

    // Notification settings
    const [notificationSettings, setNotificationSettings] = useState({
        pollNotifications: true,
        roomUpdates: true,
        emailDigest: false,
        soundEnabled: true,
        desktopNotifications: true,
        mobileNotifications: true,
        weeklyReport: false,
        achievementAlerts: true,
    });

    // Privacy settings
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: "public",
        showEmail: false,
        showPhone: false,
        showLocation: false,
        allowMessaging: true,
        dataCollection: true,
        analyticsTracking: false,
        thirdPartySharing: false,
    });

    // Audio/Video settings
    const [avSettings, setAvSettings] = useState({
        cameraEnabled: true,
        micEnabled: true,
        speakerVolume: [75],
        micVolume: [80],
        videoQuality: "medium",
        audioQuality: "high",
        noiseReduction: true,
        echoCancellation: true,
    });

    // Appearance settings
    const [appearanceSettings, setAppearanceSettings] = useState({
        theme: theme || "light",
        language: "en",
        fontSize: "medium",
        animations: true,
        compactMode: false,
        colorScheme: "default",
        accessibility: {
            highContrast: false,
            reducedMotion: false,
            screenReader: false,
        },
    });

    // Performance settings
    const [performanceSettings, setPerformanceSettings] = useState({
        autoSave: true,
        syncFrequency: "real-time",
        cacheSize: "medium",
        offlineMode: false,
        dataUsage: "standard",
        backgroundSync: true,
    });

    // Learning preferences
    const [learningSettings, setLearningSettings] = useState({
        registerNumber: "",
        studyReminders: true,
        reminderTimes: ["09:00", "15:00", "20:00"],
        learningGoal: "30",
        subjects: ["Math", "Science", "Literature"],
        preferredSessionLength: "30",
        breakReminders: true,
    });

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "privacy", label: "Privacy", icon: Shield },
        { id: "audio-video", label: "Audio/Video", icon: Camera },
        { id: "appearance", label: "Appearance", icon: Palette },
        { id: "learning", label: "Learning", icon: BookOpen },
        { id: "performance", label: "Performance", icon: Zap },
        { id: "account", label: "Account", icon: Lock },
    ];

    const handleSave = () => {
        // Simulate save operation
        toast.success("Settings saved successfully!");
        setHasChanges(false);

        // Update user store with new profile data
        setUser({
            ...user!,
            name: profileData.name,
            email: profileData.email,
            avatar: profileData.avatar,
        });
    };

    const handleReset = () => {
        toast.info("Settings reset to default");
        setHasChanges(false);
    };

    const handleExportData = () => {
        const data = {
            profile: profileData,
            notifications: notificationSettings,
            privacy: privacySettings,
            audioVideo: avSettings,
            appearance: appearanceSettings,
            performance: performanceSettings,
            learning: learningSettings,
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "student-settings.json";
        a.click();
        URL.revokeObjectURL(url);

        toast.success("Settings exported successfully!");
    };

    const renderProfileTab = () => (
        <div className="space-y-6">
            {/* Profile Header */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                    <div className="flex items-center space-x-6">
                        <div className="relative group">
                            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                                <AvatarImage src={profileData.avatar} alt={profileData.name} />
                                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                                    {profileData.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{profileData.name}</h2>
                            <p className="text-gray-600 dark:text-gray-400">{profileData.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    <Target className="h-3 w-3 mr-1" />
                                    {learningSettings.registerNumber || "No Register Number"}
                                </Badge>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {profileData.year}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Basic Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={profileData.name}
                                onChange={(e) => {
                                    setProfileData({ ...profileData, name: e.target.value });
                                    setHasChanges(true);
                                }}
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => {
                                    setProfileData({ ...profileData, email: e.target.value });
                                    setHasChanges(true);
                                }}
                                placeholder="Enter your email"
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => {
                                    setProfileData({ ...profileData, phone: e.target.value });
                                    setHasChanges(true);
                                }}
                                placeholder="Enter your phone number"
                            />
                        </div>
                        <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={profileData.location}
                                onChange={(e) => {
                                    setProfileData({ ...profileData, location: e.target.value });
                                    setHasChanges(true);
                                }}
                                placeholder="Enter your location"
                            />
                        </div>
                        <div>
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input
                                id="dob"
                                type="date"
                                value={profileData.dateOfBirth}
                                onChange={(e) => {
                                    setProfileData({ ...profileData, dateOfBirth: e.target.value });
                                    setHasChanges(true);
                                }}
                            />
                        </div>
                        <div>
                            <Label htmlFor="year">Academic Year</Label>
                            <Select
                                value={profileData.year}
                                onValueChange={(value: string) => {
                                    setProfileData({ ...profileData, year: value });
                                    setHasChanges(true);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1st Year">1st Year</SelectItem>
                                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                                    <SelectItem value="4th Year">4th Year</SelectItem>
                                    <SelectItem value="Graduate">Graduate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="university">University/Institution</Label>
                            <Input
                                id="university"
                                value={profileData.university}
                                onChange={(e) => {
                                    setProfileData({ ...profileData, university: e.target.value });
                                    setHasChanges(true);
                                }}
                                placeholder="Enter your university"
                            />
                        </div>
                        <div>
                            <Label htmlFor="major">Major/Field of Study</Label>
                            <Input
                                id="major"
                                value={profileData.major}
                                onChange={(e) => {
                                    setProfileData({ ...profileData, major: e.target.value });
                                    setHasChanges(true);
                                }}
                                placeholder="Enter your major"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => {
                                setProfileData({ ...profileData, bio: e.target.value });
                                setHasChanges(true);
                            }}
                            placeholder="Tell us about yourself..."
                            className="min-h-[100px]"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderNotificationsTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notification Preferences
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="poll-notifications">Poll Notifications</Label>
                                <p className="text-sm text-muted-foreground">Get notified when new polls are available</p>
                            </div>
                            <Toggle
                                pressed={notificationSettings.pollNotifications}
                                onPressedChange={(pressed: boolean) => {
                                    setNotificationSettings({ ...notificationSettings, pollNotifications: pressed });
                                    setHasChanges(true);
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="room-updates">Room Updates</Label>
                                <p className="text-sm text-muted-foreground">Get notified about room status changes</p>
                            </div>
                            <Toggle
                                pressed={notificationSettings.roomUpdates}
                                onPressedChange={(pressed: boolean) => {
                                    setNotificationSettings({ ...notificationSettings, roomUpdates: pressed });
                                    setHasChanges(true);
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="email-digest">Email Digest</Label>
                                <p className="text-sm text-muted-foreground">Receive weekly summary via email</p>
                            </div>
                            <Toggle

                                pressed={notificationSettings.emailDigest}
                                onPressedChange={(pressed: boolean) => {
                                    setNotificationSettings({ ...notificationSettings, emailDigest: pressed });
                                    setHasChanges(true);
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="sound-enabled">Sound Notifications</Label>
                                <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
                            </div>
                            <Toggle

                                pressed={notificationSettings.soundEnabled}
                                onPressedChange={(pressed: boolean) => {
                                    setNotificationSettings({ ...notificationSettings, soundEnabled: pressed });
                                    setHasChanges(true);
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
                                <p className="text-sm text-muted-foreground">Show notifications on desktop</p>
                            </div>
                            <Toggle

                                pressed={notificationSettings.desktopNotifications}
                                onPressedChange={(pressed: boolean) => {
                                    setNotificationSettings({ ...notificationSettings, desktopNotifications: pressed });
                                    setHasChanges(true);
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="achievement-alerts">Achievement Alerts</Label>
                                <p className="text-sm text-muted-foreground">Get notified about achievements and milestones</p>
                            </div>
                            <Toggle

                                pressed={notificationSettings.achievementAlerts}
                                onPressedChange={(pressed: boolean) => {
                                    setNotificationSettings({ ...notificationSettings, achievementAlerts: pressed });
                                    setHasChanges(true);
                                }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderPrivacyTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Privacy Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="profile-visibility">Profile Visibility</Label>
                            <Select
                                value={privacySettings.profileVisibility}
                                onValueChange={(value: string) => {
                                    setPrivacySettings({ ...privacySettings, profileVisibility: value });
                                    setHasChanges(true);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="friends">Friends Only</SelectItem>
                                    <SelectItem value="private">Private</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="show-email">Show Email</Label>
                                <p className="text-sm text-muted-foreground">Display email on your profile</p>
                            </div>
                            <Toggle

                                pressed={privacySettings.showEmail}
                                onPressedChange={(pressed: boolean) => {
                                    setPrivacySettings({ ...privacySettings, showEmail: pressed });
                                    setHasChanges(true);
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="allow-messaging">Allow Messaging</Label>
                                <p className="text-sm text-muted-foreground">Allow other users to message you</p>
                            </div>
                            <Toggle

                                pressed={privacySettings.allowMessaging}
                                onPressedChange={(pressed: boolean) => {
                                    setPrivacySettings({ ...privacySettings, allowMessaging: pressed });
                                    setHasChanges(true);
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="data-collection">Data Collection</Label>
                                <p className="text-sm text-muted-foreground">Allow collection of usage data for improvement</p>
                            </div>
                            <Toggle

                                pressed={privacySettings.dataCollection}
                                onPressedChange={(pressed: boolean) => {
                                    setPrivacySettings({ ...privacySettings, dataCollection: pressed });
                                    setHasChanges(true);
                                }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderAudioVideoTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Audio & Video Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="camera-enabled">Camera</Label>
                                <p className="text-sm text-muted-foreground">Enable camera for video calls</p>
                            </div>
                            <Toggle

                                pressed={avSettings.cameraEnabled}
                                onPressedChange={(pressed: boolean) => {
                                    setAvSettings({ ...avSettings, cameraEnabled: pressed });
                                    setHasChanges(true);
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="mic-enabled">Microphone</Label>
                                <p className="text-sm text-muted-foreground">Enable microphone for audio</p>
                            </div>
                            <Toggle

                                pressed={avSettings.micEnabled}
                                onPressedChange={(pressed: boolean) => {
                                    setAvSettings({ ...avSettings, micEnabled: pressed });
                                    setHasChanges(true);
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="speaker-volume">Speaker Volume</Label>
                            <Slider
                                id="speaker-volume"
                                value={avSettings.speakerVolume}
                                onValueChange={(value: number[]) => {
                                    setAvSettings({ ...avSettings, speakerVolume: value });
                                    setHasChanges(true);
                                }}
                                max={100}
                                step={1}
                                className="w-full"
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>0%</span>
                                <span>{avSettings.speakerVolume[0]}%</span>
                                <span>100%</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mic-volume">Microphone Volume</Label>
                            <Slider
                                id="mic-volume"
                                value={avSettings.micVolume}
                                onValueChange={(value: number[]) => {
                                    setAvSettings({ ...avSettings, micVolume: value });
                                    setHasChanges(true);
                                }}
                                max={100}
                                step={1}
                                className="w-full"
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>0%</span>
                                <span>{avSettings.micVolume[0]}%</span>
                                <span>100%</span>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="video-quality">Video Quality</Label>
                            <Select
                                value={avSettings.videoQuality}
                                onValueChange={(value: string) => {
                                    setAvSettings({ ...avSettings, videoQuality: value });
                                    setHasChanges(true);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select quality" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low (480p)</SelectItem>
                                    <SelectItem value="medium">Medium (720p)</SelectItem>
                                    <SelectItem value="high">High (1080p)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderAppearanceTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Appearance Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label>Theme</Label>
                        <RadioGroup
                            value={theme}
                            onValueChange={(value: string) => {
                                setTheme(value);
                                setHasChanges(true);
                            }}
                            className="grid grid-cols-3 gap-4 mt-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="light" id="light" />
                                <Label htmlFor="light" className="flex items-center gap-2">
                                    <Sun className="h-4 w-4" />
                                    Light
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="dark" id="dark" />
                                <Label htmlFor="dark" className="flex items-center gap-2">
                                    <Moon className="h-4 w-4" />
                                    Dark
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="system" id="system" />
                                <Label htmlFor="system" className="flex items-center gap-2">
                                    <Laptop className="h-4 w-4" />
                                    System
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div>
                        <Label htmlFor="language">Language</Label>
                        <Select
                            value={appearanceSettings.language}
                            onValueChange={(value: string) => {
                                setAppearanceSettings({ ...appearanceSettings, language: value });
                                setHasChanges(true);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="hi">Hindi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="font-size">Font Size</Label>
                        <Select
                            value={appearanceSettings.fontSize}
                            onValueChange={(value: string) => {
                                setAppearanceSettings({ ...appearanceSettings, fontSize: value });
                                setHasChanges(true);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select font size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="animations">Animations</Label>
                            <p className="text-sm text-muted-foreground">Enable interface animations</p>
                        </div>
                        <Toggle

                            pressed={appearanceSettings.animations}
                            onPressedChange={(pressed: boolean) => {
                                setAppearanceSettings({ ...appearanceSettings, animations: pressed });
                                setHasChanges(true);
                            }}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderLearningTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Learning Preferences
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="register-number">Register Number</Label>
                        <Input
                            id="register-number"
                            value={learningSettings.registerNumber}
                            onChange={(e) => {
                                setLearningSettings({ ...learningSettings, registerNumber: e.target.value });
                                setHasChanges(true);
                            }}
                            placeholder="Enter your institutional register number"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            Enter the register number provided by your institution
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="learning-goal">Daily Learning Goal (minutes)</Label>
                        <Slider
                            id="learning-goal"
                            value={[parseInt(learningSettings.learningGoal)]}
                            onValueChange={(value: number[]) => {
                                setLearningSettings({ ...learningSettings, learningGoal: value[0].toString() });
                                setHasChanges(true);
                            }}
                            max={180}
                            min={15}
                            step={15}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>15 min</span>
                            <span>{learningSettings.learningGoal} min</span>
                            <span>180 min</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="study-reminders">Study Reminders</Label>
                            <p className="text-sm text-muted-foreground">Get reminded to study</p>
                        </div>
                        <Toggle

                            pressed={learningSettings.studyReminders}
                            onPressedChange={(pressed: boolean) => {
                                setLearningSettings({ ...learningSettings, studyReminders: pressed });
                                setHasChanges(true);
                            }}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="break-reminders">Break Reminders</Label>
                            <p className="text-sm text-muted-foreground">Get reminded to take breaks</p>
                        </div>
                        <Toggle

                            pressed={learningSettings.breakReminders}
                            onPressedChange={(pressed: boolean) => {
                                setLearningSettings({ ...learningSettings, breakReminders: pressed });
                                setHasChanges(true);
                            }}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderPerformanceTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Performance Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="auto-save">Auto Save</Label>
                            <p className="text-sm text-muted-foreground">Automatically save your progress</p>
                        </div>
                        <Toggle

                            pressed={performanceSettings.autoSave}
                            onPressedChange={(pressed: boolean) => {
                                setPerformanceSettings({ ...performanceSettings, autoSave: pressed });
                                setHasChanges(true);
                            }}
                        />
                    </div>
                    <div>
                        <Label htmlFor="sync-frequency">Sync Frequency</Label>
                        <Select
                            value={performanceSettings.syncFrequency}
                            onValueChange={(value: string) => {
                                setPerformanceSettings({ ...performanceSettings, syncFrequency: value });
                                setHasChanges(true);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="real-time">Real-time</SelectItem>
                                <SelectItem value="5-minutes">Every 5 minutes</SelectItem>
                                <SelectItem value="15-minutes">Every 15 minutes</SelectItem>
                                <SelectItem value="manual">Manual only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="cache-size">Cache Size</Label>
                        <Select
                            value={performanceSettings.cacheSize}
                            onValueChange={(value: string) => {
                                setPerformanceSettings({ ...performanceSettings, cacheSize: value });
                                setHasChanges(true);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select cache size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">Small (50MB)</SelectItem>
                                <SelectItem value="medium">Medium (100MB)</SelectItem>
                                <SelectItem value="large">Large (200MB)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="offline-mode">Offline Mode</Label>
                            <p className="text-sm text-muted-foreground">Enable offline functionality</p>
                        </div>
                        <Toggle

                            pressed={performanceSettings.offlineMode}
                            onPressedChange={(pressed: boolean) => {
                                setPerformanceSettings({ ...performanceSettings, offlineMode: pressed });
                                setHasChanges(true);
                            }}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderAccountTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Account Management
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Change Password
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                            <Download className="h-4 w-4 mr-2" />
                            Download My Data
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                            <Upload className="h-4 w-4 mr-2" />
                            Export Settings
                        </Button>
                        <Separator />
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Danger Zone</h3>
                            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                                These actions are irreversible. Please proceed with caution.
                            </p>
                            <div className="space-y-2">
                                <Button variant="destructive" className="w-full justify-start">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Account
                                </Button>
                                <Button variant="outline" className="w-full justify-start" onClick={handleReset}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Reset All Settings
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
            {/* Enhanced floating background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/15 to-blue-400/15 rounded-full blur-3xl animate-pulse dark:from-purple-500/10 dark:to-blue-500/10"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000 dark:from-blue-500/10 dark:to-cyan-500/10"></div>
            </div>

            <div className="relative container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300 dark:from-purple-400 dark:to-indigo-500"></div>
                                <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center dark:from-purple-400 dark:to-indigo-500">
                                    <SettingsIcon className="text-white h-5 w-5" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Settings</h1>
                                <p className="text-gray-600 dark:text-gray-400">Customize your learning experience</p>
                            </div>
                        </div>

                        {/* Save/Reset buttons */}
                        {hasChanges && (
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleReset}>
                                    <X className="h-4 w-4 mr-2" />
                                    Reset
                                </Button>
                                <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
                    {/* Sidebar Navigation */}
                    <Card className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 h-fit dark:bg-gray-900/90 dark:border-gray-700/80">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <nav className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 font-semibold shadow-md dark:from-purple-900/40 dark:to-indigo-900/40 dark:text-purple-300'
                                                : 'text-gray-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-gray-800 dark:hover:to-gray-700 dark:hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <tab.icon className="h-4 w-4" />
                                            <span>{tab.label}</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                ))}
                            </nav>
                        </CardContent>
                    </Card>

                    {/* Main Content */}
                    <div className="space-y-6">
                        {activeTab === "profile" && renderProfileTab()}
                        {activeTab === "notifications" && renderNotificationsTab()}
                        {activeTab === "privacy" && renderPrivacyTab()}
                        {activeTab === "audio-video" && renderAudioVideoTab()}
                        {activeTab === "appearance" && renderAppearanceTab()}
                        {activeTab === "learning" && renderLearningTab()}
                        {activeTab === "performance" && renderPerformanceTab()}
                        {activeTab === "account" && renderAccountTab()}
                    </div>
                </div>
            </div>
        </div>
    );
} 
