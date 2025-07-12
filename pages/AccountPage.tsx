import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { ChevronDownIcon, UserIcon, CalendarIcon, BriefcaseIcon, EnvelopeIcon, CurrencyRupeeIcon, ClockIcon, DocumentTextIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const AccountPage: React.FC = () => {
    const { userData, updateUserProfile, language, logout } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        birthday: '',
        occupation: ''
    });
    const [notification, setNotification] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOccupationDropdown, setShowOccupationDropdown] = useState(false);

    // Translation object
    const translations = {
        en: {
            title: "My Account",
            subtitle: "View and manage your profile information.",
            completeProfile: "Complete Your Profile",
            completeProfileDesc: "Welcome! Please add your occupation and birthday to get the best recommendations.",
            profileInfo: "Profile Information",
            editProfile: "Edit Profile",
            fullName: "Full Name",
            occupation: "Occupation",
            birthday: "Birthday",
            email: "Email",
            bharatTokens: "Bharat Tokens",
            memberSince: "Member Since",
            emailCannotChange: "Email cannot be changed",
            tokens: "tokens",
            recentlyJoined: "Recently joined",
            cancel: "Cancel",
            saveChanges: "Save Changes",
            saving: "Saving...",
            schemeHistory: "My Scheme History",
            schemeName: "Scheme Name",
            dateApplied: "Date Applied",
            hash: "Hash",
            noSchemes: "You have not applied to any schemes yet.",
            startExploring: "Start exploring schemes to see your application history here.",
            profileUpdated: "Profile updated successfully!",
            profileUpdateFailed: "Failed to update profile. Please try again.",
            selectOccupation: "Select your occupation",
            customOccupation: "Other (Please specify)",
            enterCustomOccupation: "Enter your occupation",
            logout: "Logout",
            logoutConfirm: "Are you sure you want to logout?",
            loggingOut: "Logging out...",
            logoutSuccess: "Logged out successfully!",
            logoutError: "Error logging out. Please try again.",
            yes: "Yes",
            no: "No"
        },
        hi: {
            title: "मेरा खाता",
            subtitle: "अपनी प्रोफ़ाइल की जानकारी देखें और प्रबंधित करें।",
            completeProfile: "अपनी प्रोफ़ाइल पूरी करें",
            completeProfileDesc: "स्वागत है! बेहतर सिफारिशें पाने के लिए कृपया अपना व्यवसाय और जन्मदिन जोड़ें।",
            profileInfo: "प्रोफ़ाइल जानकारी",
            editProfile: "प्रोफ़ाइल संपादित करें",
            fullName: "पूरा नाम",
            occupation: "व्यवसाय",
            birthday: "जन्मदिन",
            email: "ईमेल",
            bharatTokens: "भारत टोकन",
            memberSince: "सदस्य बने",
            emailCannotChange: "ईमेल बदला नहीं जा सकता",
            tokens: "टोकन",
            recentlyJoined: "हाल ही में शामिल हुए",
            cancel: "रद्द करें",
            saveChanges: "बदलाव सहेजें",
            saving: "सहेजा जा रहा है...",
            schemeHistory: "मेरी योजना इतिहास",
            schemeName: "योजना का नाम",
            dateApplied: "आवेदन दिनांक",
            hash: "हैश",
            noSchemes: "आपने अभी तक किसी योजना के लिए आवेदन नहीं किया है।",
            startExploring: "अपना आवेदन इतिहास यहाँ देखने के लिए योजनाओं की खोज शुरू करें।",
            profileUpdated: "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!",
            profileUpdateFailed: "प्रोफ़ाइल अपडेट करने में विफल। कृपया फिर से प्रयास करें।",
            selectOccupation: "अपना व्यवसाय चुनें",
            customOccupation: "अन्य (कृपया बताएं)",
            enterCustomOccupation: "अपना व्यवसाय दर्ज करें",
            logout: "लॉगआउट",
            logoutConfirm: "क्या आप वाकई लॉगआउट करना चाहते हैं?",
            loggingOut: "लॉगआउट हो रहा है...",
            logoutSuccess: "सफलतापूर्वक लॉगआउट हो गया!",
            logoutError: "लॉगआउट करने में त्रुटि। कृपया फिर से प्रयास करें।",
            yes: "हाँ",
            no: "नहीं"
        }
    };

    const t = translations[language];

    const occupationOptions = language === 'hi' ? [
        { value: 'student', label: 'छात्र/छात्रा' },
        { value: 'farmer', label: 'किसान' },
        { value: 'engineer', label: 'इंजीनियर' },
        { value: 'teacher', label: 'शिक्षक' },
        { value: 'doctor', label: 'डॉक्टर' },
        { value: 'businessman', label: 'व्यापारी' },
        { value: 'government_employee', label: 'सरकारी कर्मचारी' },
        { value: 'private_employee', label: 'निजी कर्मचारी' },
        { value: 'self_employed', label: 'स्वरोजगार' },
        { value: 'retired', label: 'सेवानिवृत्त' },
        { value: 'homemaker', label: 'गृहिणी' },
        { value: 'unemployed', label: 'बेरोजगार' },
        { value: 'other', label: 'अन्य' }
    ] : [
        { value: 'student', label: 'Student' },
        { value: 'farmer', label: 'Farmer' },
        { value: 'engineer', label: 'Engineer' },
        { value: 'teacher', label: 'Teacher' },
        { value: 'doctor', label: 'Doctor' },
        { value: 'businessman', label: 'Businessman' },
        { value: 'government_employee', label: 'Government Employee' },
        { value: 'private_employee', label: 'Private Employee' },
        { value: 'self_employed', label: 'Self Employed' },
        { value: 'retired', label: 'Retired' },
        { value: 'homemaker', label: 'Homemaker' },
        { value: 'unemployed', label: 'Unemployed' },
        { value: 'other', label: 'Other' }
    ];

    const [customOccupation, setCustomOccupation] = useState('');
    const [showCustomOccupation, setShowCustomOccupation] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        if (userData) {
            setFormData({
                username: userData.username || '',
                birthday: userData.birthday || '',
                occupation: userData.occupation || ''
            });
            
            // Check if occupation is custom (not in predefined options)
            const isCustom = userData.occupation && !occupationOptions.some(opt => opt.value === userData.occupation);
            if (isCustom) {
                setShowCustomOccupation(true);
                setCustomOccupation(userData.occupation);
            }
        }
    }, [userData, language]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOccupationSelect = (value: string, label: string) => {
        if (value === 'other') {
            setShowCustomOccupation(true);
            setFormData({ ...formData, occupation: '' });
        } else {
            setShowCustomOccupation(false);
            setFormData({ ...formData, occupation: value });
        }
        setShowOccupationDropdown(false);
    };

    const handleCustomOccupationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomOccupation(value);
        setFormData({ ...formData, occupation: value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const finalOccupation = showCustomOccupation ? customOccupation : formData.occupation;
            await updateUserProfile({
                ...formData,
                occupation: finalOccupation
            });
            setNotification(t.profileUpdated);
            setIsEditing(false);
            setTimeout(() => setNotification(''), 4000);
        } catch (error) {
            console.error('Update profile error:', error);
            setNotification(t.profileUpdateFailed);
            setTimeout(() => setNotification(''), 4000);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentOccupationLabel = () => {
        if (showCustomOccupation) return customOccupation;
        const option = occupationOptions.find(opt => opt.value === formData.occupation);
        return option ? option.label : formData.occupation;
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            setNotification(t.logoutSuccess);
            setTimeout(() => setNotification(''), 2000);
        } catch (error) {
            console.error('Logout error:', error);
            setNotification(t.logoutError);
            setTimeout(() => setNotification(''), 4000);
        } finally {
            setIsLoggingOut(false);
            setShowLogoutConfirm(false);
        }
    };
    
    if (!userData) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">
                        {language === 'hi' ? 'उपयोगकर्ता डेटा लोड हो रहा है...' : 'Loading user data...'}
                    </p>
                </div>
            </div>
        );
    }

    const needsProfileCompletion = userData.auth_provider === 'google' && !userData.occupation;

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-6">
            {/* Header */}
            <div className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-2xl shadow-lg">
                <UserIcon className="w-16 h-16 mx-auto mb-4 opacity-90" />
                <h1 className="text-4xl font-bold mb-2">{t.title}</h1>
                <p className="text-lg opacity-90">{t.subtitle}</p>
            </div>

            {/* Profile Completion Alert */}
            {needsProfileCompletion && !isEditing && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <PencilIcon className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-lg font-semibold text-amber-800">{t.completeProfile}</p>
                            <p className="text-amber-700 mt-1">{t.completeProfileDesc}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Notification */}
            {notification && (
                <div className={`p-4 rounded-lg text-center font-medium shadow-md transition-all duration-300 ${
                    notification.includes('success') || notification.includes('सफलतापूर्वक')
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    <div className="flex items-center justify-center">
                        {notification.includes('success') || notification.includes('सफलतापूर्वक') ? (
                            <CheckIcon className="w-5 h-5 mr-2" />
                        ) : (
                            <XMarkIcon className="w-5 h-5 mr-2" />
                        )}
                        {notification}
                    </div>
                </div>
            )}

            {/* Profile Info Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <UserIcon className="w-8 h-8 text-indigo-600 mr-3" />
                            <h2 className="text-2xl font-bold text-gray-800">{t.profileInfo}</h2>
                        </div>
                        {!isEditing && (
                            <button 
                                type="button" 
                                onClick={() => setIsEditing(true)} 
                                className="bg-indigo-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center shadow-md"
                            >
                                <PencilIcon className="w-4 h-4 mr-2" />
                                {t.editProfile}
                            </button>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSave} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                                {t.fullName}
                            </label>
                            <input 
                                type="text" 
                                name="username" 
                                value={formData.username} 
                                onChange={handleInputChange} 
                                disabled={!isEditing} 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white disabled:bg-gray-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                            />
                        </div>

                        {/* Occupation */}
                        <div className="space-y-2 relative">
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <BriefcaseIcon className="w-4 h-4 mr-2 text-gray-500" />
                                {t.occupation}
                            </label>
                            {isEditing ? (
                                <div className="space-y-3">
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowOccupationDropdown(!showOccupationDropdown)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 flex items-center justify-between"
                                        >
                                            <span className={getCurrentOccupationLabel() ? 'text-gray-900' : 'text-gray-500'}>
                                                {getCurrentOccupationLabel() || t.selectOccupation}
                                            </span>
                                            <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showOccupationDropdown ? 'rotate-180' : ''}`} />
                                        </button>
                                        
                                        {showOccupationDropdown && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {occupationOptions.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => handleOccupationSelect(option.value, option.label)}
                                                        className="w-full px-4 py-3 text-left hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none transition-colors duration-150"
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {showCustomOccupation && (
                                        <input
                                            type="text"
                                            value={customOccupation}
                                            onChange={handleCustomOccupationChange}
                                            placeholder={t.enterCustomOccupation}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                        />
                                    )}
                                </div>
                            ) : (
                                <input 
                                    type="text" 
                                    value={getCurrentOccupationLabel()} 
                                    disabled 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                                />
                            )}
                        </div>

                        {/* Birthday */}
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                                {t.birthday}
                            </label>
                            <input 
                                type="date" 
                                name="birthday" 
                                value={formData.birthday} 
                                onChange={handleInputChange} 
                                disabled={!isEditing} 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white disabled:bg-gray-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-500" />
                                {t.email}
                            </label>
                            <input 
                                type="email" 
                                value={userData.email || ''} 
                                disabled 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">{t.emailCannotChange}</p>
                        </div>

                        {/* Bharat Tokens */}
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <CurrencyRupeeIcon className="w-4 h-4 mr-2 text-gray-500" />
                                {t.bharatTokens}
                            </label>
                            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 font-bold text-lg">
                                {userData.bharat_tokens} {t.tokens}
                            </div>
                        </div>

                        {/* Member Since */}
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <ClockIcon className="w-4 h-4 mr-2 text-gray-500" />
                                {t.memberSince}
                            </label>
                            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                                {userData.joined_at?.toDate ? 
                                    userData.joined_at.toDate().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US') : 
                                    t.recentlyJoined
                                }
                            </div>
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                            <button 
                                type="button" 
                                onClick={() => {
                                    setIsEditing(false);
                                    setShowOccupationDropdown(false);
                                    setShowCustomOccupation(false);
                                    setCustomOccupation('');
                                    // Reset form data
                                    setFormData({
                                        username: userData.username || '',
                                        birthday: userData.birthday || '',
                                        occupation: userData.occupation || ''
                                    });
                                }}
                                disabled={loading}
                                className="bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors duration-200 flex items-center"
                            >
                                <XMarkIcon className="w-4 h-4 mr-2" />
                                {t.cancel}
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-200 flex items-center shadow-md"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                ) : (
                                    <CheckIcon className="w-4 h-4 mr-2" />
                                )}
                                {loading ? t.saving : t.saveChanges}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Scheme History */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 border-b border-gray-100">
                    <div className="flex items-center">
                        <DocumentTextIcon className="w-8 h-8 text-green-600 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-800">{t.schemeHistory}</h2>
                    </div>
                </div>
                
                <div className="p-8">
                    {userData.scheme_history && userData.scheme_history.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-sm uppercase text-gray-600">
                                        <th className="px-6 py-4 text-left font-medium">{t.schemeName}</th>
                                        <th className="px-6 py-4 text-left font-medium">{t.dateApplied}</th>
                                        <th className="px-6 py-4 text-left font-medium">{t.hash}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {userData.scheme_history.map((entry, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 font-medium text-gray-900">{entry.scheme_name}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(entry.applied_on).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US')}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-mono text-sm bg-gray-50 rounded" title={entry.hash}>
                                                {entry.hash.substring(0, 12)}...
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-300 mb-4">
                                <DocumentTextIcon className="w-16 h-16 mx-auto" />
                            </div>
                            <p className="text-gray-500 text-lg font-medium mb-2">{t.noSchemes}</p>
                            <p className="text-gray-400">{t.startExploring}</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Logout Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 text-center">
                    <div className="mb-6">
                        <ArrowRightOnRectangleIcon className="w-12 h-12 mx-auto text-red-500 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {t.logout}
                        </h3>
                        <p className="text-gray-600">
                            {language === 'hi' 
                                ? 'अपने खाते से सुरक्षित रूप से लॉगआउट करें।' 
                                : 'Securely logout from your account.'}
                        </p>
                    </div>
                    
                    {!showLogoutConfirm ? (
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="bg-red-600 text-white font-medium py-3 px-8 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center mx-auto shadow-md"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                            {t.logout}
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-gray-700 font-medium">
                                {t.logoutConfirm}
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    disabled={isLoggingOut}
                                    className="bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors duration-200"
                                >
                                    {t.no}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="bg-red-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200 flex items-center"
                                >
                                    {isLoggingOut ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            {t.loggingOut}
                                        </>
                                    ) : (
                                        <>
                                            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                                            {t.yes}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AccountPage;
