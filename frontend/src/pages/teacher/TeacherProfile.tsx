import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { User, AtSign, BadgeCheck, Edit2, Save, Calendar, UserCheck, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import type { IUser } from "@/lib/store/auth-store";

const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_URL });

export const apiService = {
  async getUserProfile(firebaseUID: string): Promise<IUser> {
    const res = await api.get(`/users/firebase/${firebaseUID}/profile`);
    const data = res.data;
    return {
      uid: firebaseUID,
      userId: data.id ?? "",
      email: data.email ?? "",
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      role: data.role ?? null,
      avatar: data.avatar ?? null,
      phone: data.phone ?? "",
      dateOfBirth: data.dateOfBirth ?? "",
      address: data.address ?? "",
      emergencyContact: data.emergencyContact ?? "",
      subjects: data.subjects ?? [],
    };
  },  
  
  async updateUserProfile(userId: string, profileData: any) {
    const res = await api.put(`/users/${userId}/profile`, profileData);
    return res.data;
  },
};

export default function TeacherProfile() {
  const { user: authUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<IUser | null>(null);
  
  // Editing states
  const [editName, setEditName] = useState(false);
  const [editPersonalInfo, setEditPersonalInfo] = useState(false);
  const [firstNameValue, setFirstNameValue] = useState("");
  const [lastNameValue, setLastNameValue] = useState("");
  const [personalInfo, setPersonalInfo] = useState({
    phone: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
    subjects: [] as string[],
  });
  const [saving, setSaving] = useState({
    name: false,
    personalInfo: false,
  });

  // Load user profile data
  useEffect(() => {
    const loadData = async () => {
      if (!authUser?.uid) {
        setError("No authentication info");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const profile = await apiService.getUserProfile(authUser.uid);
        setUser(profile);
        setFirstNameValue(profile.firstName || "");
        setLastNameValue(profile.lastName || "");
        setPersonalInfo({
          phone: profile.phone || "",
          dateOfBirth: profile.dateOfBirth || "",
          address: profile.address || "",
          emergencyContact: profile.emergencyContact || "",
          subjects: profile.subjects || [],
        });
      } catch (e: any) {
        setError(e?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [authUser?.uid]);

  const handleSaveName = async () => {
    if (!user?.userId) return;
    setSaving({ ...saving, name: true });
    try {
      const updated = await apiService.updateUserProfile(user.userId, {
        firstName: firstNameValue.trim(),
        lastName: lastNameValue.trim(),
      });
      setUser(updated);
      setEditName(false);
    } catch {
      setError("Failed to save name");
    } finally {
      setSaving({ ...saving, name: false });
    }
  };

  const handleSavePersonalInfo = async () => {
    if (!user?.userId) return;
    setSaving({ ...saving, personalInfo: true });
    try {
      const updated = await apiService.updateUserProfile(user.userId, {
        phone: personalInfo.phone,
        dateOfBirth: personalInfo.dateOfBirth,
        address: personalInfo.address,
        emergencyContact: personalInfo.emergencyContact,
        subjects: personalInfo.subjects,
      });
      setUser(updated);
      setEditPersonalInfo(false);
    } catch {
      setError("Failed to save personal information");
    } finally {
      setSaving({ ...saving, personalInfo: false });
    }
  };

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateAge = (dob: string) => {
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <span className="text-lg text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-red-600">
          <span className="text-lg">{error}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-gray-500">No user data found</span>
      </div>
    );
  }

  const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || "Unnamed Teacher";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full">
        <Card className="w-full max-w-4xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl border border-slate-200/80 dark:border-gray-700/80 mb-8 animate-fade-in">
          <CardHeader className="flex flex-col items-center gap-2 pb-2 w-full p-8">
            <Avatar className="h-28 w-28 mb-2 ring-4 ring-primary/30">
              <AvatarImage src={user.avatar} alt={displayName} />
              <AvatarFallback className="rounded-full bg-purple-100 dark:bg-purple-900">
                <User className="h-14 w-14 text-purple-500 dark:text-purple-300" />
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              {editName ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-2">
                    <input
                      className="text-lg font-bold bg-transparent border-b border-primary focus:outline-none px-2 py-1 w-32 text-center"
                      value={firstNameValue}
                      onChange={e => setFirstNameValue(e.target.value)}
                      disabled={saving.name}
                      placeholder="First name"
                      title="First name"
                    />
                    <input
                      className="text-lg font-bold bg-transparent border-b border-primary focus:outline-none px-2 py-1 w-32 text-center"
                      value={lastNameValue}
                      onChange={e => setLastNameValue(e.target.value)}
                      disabled={saving.name}
                      placeholder="Last name"
                      title="Last name"
                    />
                  </div>
                  <Button size="sm" onClick={handleSaveName} disabled={saving.name}>
                    {saving.name ? (
                      <span className="animate-spin">Saving...</span>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  <span>{displayName}</span>
                  <Button size="icon" variant="ghost" onClick={() => setEditName(true)}>
                    <Edit2 className="h-5 w-5" />
                  </Button>
                </>
              )}
            </CardTitle>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mt-1">
              <AtSign className="h-5 w-5 text-purple-400" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <BadgeCheck className="h-5 w-5 text-green-400" />
              <span className="capitalize">{user.role}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <BookOpen className="h-5 w-5 text-blue-400" />
              <span>Subjects: {personalInfo.subjects.join(", ") || "Not specified"}</span>
            </div>
          </CardHeader>

          {/* Personal Information Section */}
          <CardContent className="px-8 pb-8">
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-purple-500" />
                  Personal Information
                </h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditPersonalInfo(!editPersonalInfo)}
                  disabled={saving.personalInfo}
                >
                  {editPersonalInfo ? "Cancel" : "Edit"}
                </Button>
              </div>

              {editPersonalInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                      value={personalInfo.phone}
                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                      value={personalInfo.dateOfBirth}
                      onChange={(e) => handlePersonalInfoChange('dateOfBirth', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                      value={personalInfo.emergencyContact}
                      onChange={(e) => handlePersonalInfoChange('emergencyContact', e.target.value)}
                      placeholder="Enter emergency contact"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subjects (comma separated)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                      value={personalInfo.subjects.join(", ")}
                      onChange={(e) => handlePersonalInfoChange('subjects', e.target.value.split(",").map(s => s.trim()))}
                      placeholder="Math, Science, History"
                    />
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <Button 
                      onClick={handleSavePersonalInfo} 
                      disabled={saving.personalInfo}
                      className="w-full"
                    >
                      {saving.personalInfo ? (
                        <>
                          <span className="animate-spin">Saving...</span>
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
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone:</span>
                      <span className="text-gray-800 dark:text-gray-200">{personalInfo.phone || "Not specified"}</span>
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
    </div>
  );
}