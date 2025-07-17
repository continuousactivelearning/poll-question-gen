import { useState } from "react";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Camera, 
  Lock, 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw, 
  Save, 
  ChevronRight, 
  Settings as SettingsIcon,
  X,
  Edit3,
  Zap,
  Moon,
  Sun,
  Laptop,
  GraduationCap,
  Users
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

export default function TeacherSettings() {
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [hasChanges, setHasChanges] = useState(false);

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    officeLocation: "",
    bio: "",
    dateOfBirth: "",
    department: "",
    specialization: "",
    experience: "5+ years",
    avatar: user?.avatar || "",
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    classNotifications: true,
    studentSubmissions: true,
    emailDigest: true,
    soundEnabled: true,
    desktopNotifications: true,
    mobileNotifications: true,
    weeklyReport: true,
    gradeReminders: true,
    courseUpdates: true,
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "department",
    showEmail: true,
    showPhone: false,
    showOfficeHours: true,
    allowStudentMessaging: true,
    dataCollection: true,
    analyticsTracking: true,
    researchParticipation: false,
  });

  // Audio/Video settings
  const [avSettings, setAvSettings] = useState({
    cameraEnabled: true,
    micEnabled: true,
    speakerVolume: [75],
    micVolume: [80],
    videoQuality: "high",
    audioQuality: "high",
    noiseReduction: true,
    echoCancellation: true,
    screenShareQuality: "high",
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
    cacheSize: "large",
    offlineMode: true,
    dataUsage: "unlimited",
    backgroundSync: true,
  });

  // Teaching preferences
  const [teachingSettings, setTeachingSettings] = useState({
    designation: "",
    classReminders: true,
    reminderTimes: ["08:00", "14:00", "18:00"],
    gradeDeadlineReminders: true,
    subjects: ["Mathematics", "Computer Science", "Physics"],
    defaultSessionLength: "90",
    attendanceReminders: true,
    officeHours: "Mon-Fri 2:00-4:00 PM",
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "audio-video", label: "Audio/Video", icon: Camera },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "teaching", label: "Teaching", icon: GraduationCap },
    { id: "performance", label: "Performance", icon: Zap },
    { id: "account", label: "Account", icon: Lock },
  ];

  const handleSave = () => {
    toast.success("Settings saved successfully!");
    setHasChanges(false);
    
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
      teaching: teachingSettings,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "teacher-settings.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Settings exported successfully!");
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Faculty Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileData.avatar} alt={profileData.name} />
                <AvatarFallback className="text-lg">
                  {profileData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>
            <div>
              <h3 className="text-xl font-semibold">{profileData.name || "Faculty Name"}</h3>
              <p className="text-gray-600 dark:text-gray-400">{profileData.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  {teachingSettings.designation || "No Designation"}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <Users className="h-3 w-3 mr-1" />
                  {profileData.department || "Department"}
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
                  setProfileData({...profileData, name: e.target.value});
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
                  setProfileData({...profileData, email: e.target.value});
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
                  setProfileData({...profileData, phone: e.target.value});
                  setHasChanges(true);
                }}
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label htmlFor="office-location">Office Location</Label>
              <Input
                id="office-location"
                value={profileData.officeLocation}
                onChange={(e) => {
                  setProfileData({...profileData, officeLocation: e.target.value});
                  setHasChanges(true);
                }}
                placeholder="Enter your office location"
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={profileData.department}
                onChange={(e) => {
                  setProfileData({...profileData, department: e.target.value});
                  setHasChanges(true);
                }}
                placeholder="Enter your department"
              />
            </div>
            <div>
              <Label htmlFor="experience">Experience</Label>
              <Select
                value={profileData.experience}
                onValueChange={(value: string) => {
                  setProfileData({...profileData, experience: value});
                  setHasChanges(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-3 years">1-3 years</SelectItem>
                  <SelectItem value="3-5 years">3-5 years</SelectItem>
                  <SelectItem value="5+ years">5+ years</SelectItem>
                  <SelectItem value="10+ years">10+ years</SelectItem>
                  <SelectItem value="20+ years">20+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={profileData.specialization}
              onChange={(e) => {
                setProfileData({...profileData, specialization: e.target.value});
                setHasChanges(true);
              }}
              placeholder="Enter your area of specialization"
            />
          </div>
          <div>
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => {
                setProfileData({...profileData, bio: e.target.value});
                setHasChanges(true);
              }}
              placeholder="Tell us about your professional background and expertise..."
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
                <Label htmlFor="class-notifications">Class Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified about class schedules and changes</p>
              </div>
              <Toggle
                pressed={notificationSettings.classNotifications}
                onPressedChange={(pressed: boolean) => {
                  setNotificationSettings({...notificationSettings, classNotifications: pressed});
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="student-submissions">Student Submissions</Label>
                <p className="text-sm text-muted-foreground">Get notified when students submit assignments</p>
              </div>
              <Toggle
                pressed={notificationSettings.studentSubmissions}
                onPressedChange={(pressed: boolean) => {
                  setNotificationSettings({...notificationSettings, studentSubmissions: pressed});
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-digest">Email Digest</Label>
                <p className="text-sm text-muted-foreground">Receive daily summary via email</p>
              </div>
              <Toggle
                pressed={notificationSettings.emailDigest}
                onPressedChange={(pressed: boolean) => {
                  setNotificationSettings({...notificationSettings, emailDigest: pressed});
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="grade-reminders">Grade Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminded about pending grades</p>
              </div>
              <Toggle
                pressed={notificationSettings.gradeReminders}
                onPressedChange={(pressed: boolean) => {
                  setNotificationSettings({...notificationSettings, gradeReminders: pressed});
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="course-updates">Course Updates</Label>
                <p className="text-sm text-muted-foreground">Get notified about course announcements</p>
              </div>
              <Toggle
                pressed={notificationSettings.courseUpdates}
                onPressedChange={(pressed: boolean) => {
                  setNotificationSettings({...notificationSettings, courseUpdates: pressed});
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
                  setPrivacySettings({...privacySettings, profileVisibility: value});
                  setHasChanges(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="department">Department Only</SelectItem>
                  <SelectItem value="students">Students Only</SelectItem>
                  <SelectItem value="faculty">Faculty Only</SelectItem>
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
                  setPrivacySettings({...privacySettings, showEmail: pressed});
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-office-hours">Show Office Hours</Label>
                <p className="text-sm text-muted-foreground">Display office hours on your profile</p>
              </div>
              <Toggle
                pressed={privacySettings.showOfficeHours}
                onPressedChange={(pressed: boolean) => {
                  setPrivacySettings({...privacySettings, showOfficeHours: pressed});
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow-student-messaging">Allow Student Messaging</Label>
                <p className="text-sm text-muted-foreground">Allow students to message you directly</p>
              </div>
              <Toggle
                pressed={privacySettings.allowStudentMessaging}
                onPressedChange={(pressed: boolean) => {
                  setPrivacySettings({...privacySettings, allowStudentMessaging: pressed});
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="research-participation">Research Participation</Label>
                <p className="text-sm text-muted-foreground">Allow usage data for educational research</p>
              </div>
              <Toggle
                pressed={privacySettings.researchParticipation}
                onPressedChange={(pressed: boolean) => {
                  setPrivacySettings({...privacySettings, researchParticipation: pressed});
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
                <p className="text-sm text-muted-foreground">Enable camera for video lectures</p>
              </div>
              <Toggle
                pressed={avSettings.cameraEnabled}
                onPressedChange={(pressed: boolean) => {
                  setAvSettings({...avSettings, cameraEnabled: pressed});
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
                  setAvSettings({...avSettings, micEnabled: pressed});
                  setHasChanges(true);
                }}
              />
            </div>
            <div>
              <Label htmlFor="video-quality">Video Quality</Label>
              <Select
                value={avSettings.videoQuality}
                onValueChange={(value: string) => {
                  setAvSettings({...avSettings, videoQuality: value});
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
            <div>
              <Label htmlFor="screen-share-quality">Screen Share Quality</Label>
              <Select
                value={avSettings.screenShareQuality}
                onValueChange={(value: string) => {
                  setAvSettings({...avSettings, screenShareQuality: value});
                  setHasChanges(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
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
            <Label htmlFor="font-size">Font Size</Label>
            <Select
              value={appearanceSettings.fontSize}
              onValueChange={(value: string) => {
                setAppearanceSettings({...appearanceSettings, fontSize: value});
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
                setAppearanceSettings({...appearanceSettings, animations: pressed});
                setHasChanges(true);
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTeachingTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Teaching Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              value={teachingSettings.designation}
              onChange={(e) => {
                setTeachingSettings({...teachingSettings, designation: e.target.value});
                setHasChanges(true);
              }}
              placeholder="Enter your institutional designation (e.g., Professor, Associate Professor)"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter the designation provided by your institution
            </p>
          </div>
          <div>
            <Label htmlFor="office-hours">Office Hours</Label>
            <Input
              id="office-hours"
              value={teachingSettings.officeHours}
              onChange={(e) => {
                setTeachingSettings({...teachingSettings, officeHours: e.target.value});
                setHasChanges(true);
              }}
              placeholder="Enter your office hours"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session-length">Default Session Length (minutes)</Label>
            <Slider
              id="session-length"
              value={[parseInt(teachingSettings.defaultSessionLength)]}
              onValueChange={(value: number[]) => {
                setTeachingSettings({...teachingSettings, defaultSessionLength: value[0].toString()});
                setHasChanges(true);
              }}
              max={180}
              min={30}
              step={15}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>30 min</span>
              <span>{teachingSettings.defaultSessionLength} min</span>
              <span>180 min</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="class-reminders">Class Reminders</Label>
              <p className="text-sm text-muted-foreground">Get reminded about upcoming classes</p>
            </div>
            <Toggle
              pressed={teachingSettings.classReminders}
              onPressedChange={(pressed: boolean) => {
                setTeachingSettings({...teachingSettings, classReminders: pressed});
                setHasChanges(true);
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="grade-deadline-reminders">Grade Deadline Reminders</Label>
              <p className="text-sm text-muted-foreground">Get reminded about grading deadlines</p>
            </div>
            <Toggle
              pressed={teachingSettings.gradeDeadlineReminders}
              onPressedChange={(pressed: boolean) => {
                setTeachingSettings({...teachingSettings, gradeDeadlineReminders: pressed});
                setHasChanges(true);
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="attendance-reminders">Attendance Reminders</Label>
              <p className="text-sm text-muted-foreground">Get reminded to take attendance</p>
            </div>
            <Toggle
              pressed={teachingSettings.attendanceReminders}
              onPressedChange={(pressed: boolean) => {
                setTeachingSettings({...teachingSettings, attendanceReminders: pressed});
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
              <p className="text-sm text-muted-foreground">Automatically save your work</p>
            </div>
            <Toggle
              pressed={performanceSettings.autoSave}
              onPressedChange={(pressed: boolean) => {
                setPerformanceSettings({...performanceSettings, autoSave: pressed});
                setHasChanges(true);
              }}
            />
          </div>
          <div>
            <Label htmlFor="cache-size">Cache Size</Label>
            <Select
              value={performanceSettings.cacheSize}
              onValueChange={(value: string) => {
                setPerformanceSettings({...performanceSettings, cacheSize: value});
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
                setPerformanceSettings({...performanceSettings, offlineMode: pressed});
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
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Faculty Settings</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your teaching preferences and account settings</p>
              </div>
            </div>
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

        {/* Settings Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar Navigation */}
          <Card className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 h-fit dark:bg-gray-900/90 dark:border-gray-700/80">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Faculty Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
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
            {activeTab === "teaching" && renderTeachingTab()}
            {activeTab === "performance" && renderPerformanceTab()}
            {activeTab === "account" && renderAccountTab()}
          </div>
        </div>
      </div>
    </div>
  );
} 