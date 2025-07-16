import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart";
import { useAuth } from "@/lib/hooks/use-auth";
import { User, AtSign, BadgeCheck, Edit2, Save, History, Activity, BarChart2, Calendar, UserCheck } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

// The StudentProfile component displays the current user's main info in a minimal, clean card.
export default function StudentProfile() {
  // 1. Get the current user from the auth store using the custom useAuth hook
  const { user } = useAuth();
  
  // State for editing personal information
  const [editName, setEditName] = useState(false);
  const [editPersonalInfo, setEditPersonalInfo] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [savingPersonalInfo, setSavingPersonalInfo] = useState(false);
  
  // Personal information states
  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    dateOfBirth: user?.dateOfBirth || "",
    phone: user?.phone || "",
    address: user?.address || "",
    emergencyContact: user?.emergencyContact || ""
  });

  // Debug message to confirm rendering
  // Remove or comment out after confirming
  const debug = true;

  // 2. If user is not logged in, show a fallback (shouldn't happen if route is protected)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-gray-500">No user info found. Please log in.</span>
      </div>
    );
  }

  // Simulate save name (replace with real API call)
  const handleSaveName = async () => {
    setSavingName(true);
    setTimeout(() => {
      setEditName(false);
      setSavingName(false);
      // TODO: Call API to update name
    }, 800);
  };

  // Simulate save personal info (replace with real API call)
  const handleSavePersonalInfo = async () => {
    setSavingPersonalInfo(true);
    setTimeout(() => {
      setEditPersonalInfo(false);
      setSavingPersonalInfo(false);
      // TODO: Call API to update personal information
    }, 800);
  };

  // Handle personal info input changes
  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // 3. Render the profile card with avatar, name, email, and role
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex flex-col">
      {/* Main Content Grid - Centered and Enlarged Profile Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full">
        <Card className="w-full max-w-4xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl border border-slate-200/80 dark:border-gray-700/80 mb-8 student-card-hover animate-fade-in">
          <CardHeader className="flex flex-col items-center gap-2 pb-2 w-full p-8">
            <Avatar className="h-28 w-28 mb-2 ring-4 ring-primary/30">
              <AvatarImage src={user.avatar} alt={user.name || user.email} />
              <AvatarFallback className="rounded-full bg-blue-100 dark:bg-blue-900">
                <User className="h-14 w-14 text-blue-500 dark:text-blue-300" />
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              {editName ? (
                <>
                  <input
                    className="text-2xl font-bold bg-transparent border-b border-primary focus:outline-none px-2 py-1 w-48 text-center"
                    value={nameValue}
                    onChange={e => setNameValue(e.target.value)}
                    disabled={savingName}
                    placeholder="Enter your name"
                    title="Edit your name"
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveName} disabled={savingName}>
                    {savingName ? <Save className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                  </Button>
                </>
              ) : (
                <>
                  <span>{nameValue || "Unnamed User"}</span>
                  <Button size="icon" variant="ghost" onClick={() => setEditName(true)}>
                    <Edit2 className="h-5 w-5" />
                  </Button>
                </>
              )}
            </CardTitle>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mt-1">
              <AtSign className="h-5 w-5 text-blue-400" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <BadgeCheck className="h-5 w-5 text-green-400" />
              <span className="capitalize">{user.role}</span>
            </div>
            {user.uid && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>UID:</span>
                <span className="font-mono">{user.uid}</span>
              </div>
            )}
          </CardHeader>

          {/* Personal Information Section */}
          <CardContent className="px-8 pb-8">
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-blue-500" />
                  Personal Information
                </h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditPersonalInfo(!editPersonalInfo)}
                  disabled={savingPersonalInfo}
                >
                  {editPersonalInfo ? "Cancel" : "Edit"}
                </Button>
              </div>

              {editPersonalInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      value={personalInfo.firstName}
                      onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      value={personalInfo.lastName}
                      onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      value={personalInfo.dateOfBirth}
                      onChange={(e) => handlePersonalInfoChange('dateOfBirth', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      value={personalInfo.phone}
                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      value={personalInfo.address}
                      onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                      placeholder="Enter address"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      value={personalInfo.emergencyContact}
                      onChange={(e) => handlePersonalInfoChange('emergencyContact', e.target.value)}
                      placeholder="Enter emergency contact"
                    />
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <Button 
                      onClick={handleSavePersonalInfo} 
                      disabled={savingPersonalInfo}
                      className="w-full"
                    >
                      {savingPersonalInfo ? (
                        <>
                          <Save className="animate-spin h-4 w-4 mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Personal Information
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">First Name:</span>
                      <span className="text-gray-800 dark:text-gray-200">{personalInfo.firstName || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Name:</span>
                      <span className="text-gray-800 dark:text-gray-200">{personalInfo.lastName || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth:</span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {personalInfo.dateOfBirth ? (
                          <>
                            {new Date(personalInfo.dateOfBirth).toLocaleDateString()}
                            {calculateAge(personalInfo.dateOfBirth) && (
                              <span className="text-sm text-gray-500 ml-2">
                                (Age: {calculateAge(personalInfo.dateOfBirth)})
                              </span>
                            )}
                          </>
                        ) : (
                          "Not specified"
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone:</span>
                      <span className="text-gray-800 dark:text-gray-200">{personalInfo.phone || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Address:</span>
                      <span className="text-gray-800 dark:text-gray-200">{personalInfo.address || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Emergency Contact:</span>
                      <span className="text-gray-800 dark:text-gray-200">{personalInfo.emergencyContact || "Not specified"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Debug message */}
      {debug && (
        <div className="fixed top-2 left-2 z-50 bg-yellow-200 text-yellow-900 px-3 py-1 rounded shadow">StudentProfile rendered</div>
      )}
    </div>
  );
}