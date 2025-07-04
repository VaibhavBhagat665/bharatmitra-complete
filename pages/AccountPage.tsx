import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

const AccountPage: React.FC = () => {
    const { userData, updateUserProfile, language } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        birthday: '',
        occupation: '',
        phoneNumber: '',
        address: '',
        state: '',
        district: '',
        pincode: '',
        category: '',
        annualIncome: '',
        educationLevel: '',
        familySize: '',
        aadhaarNumber: '',
        panNumber: '',
        hasRationCard: false,
        gender: ''
    });
    const [notification, setNotification] = useState('');
    const [loading, setLoading] = useState(false);

    const translations = {
        en: {
            title: 'My Account',
            subtitle: 'View and manage your profile information.',
            completeProfile: 'Complete Your Profile',
            completeProfileMsg: 'Welcome! Please complete your profile to get the best scheme recommendations.',
            profileInfo: 'Profile Information',
            editProfile: 'Edit Profile',
            saveChanges: 'Save Changes',
            cancel: 'Cancel',
            saving: 'Saving...',
            loading: 'Loading user data...',
            updateSuccess: 'Profile updated successfully!',
            updateError: 'Failed to update profile. Please try again.',
            schemeHistory: 'My Scheme History',
            noSchemes: 'You have not applied to any schemes yet.',
            exploreSchemes: 'Start exploring schemes to see your application history here.',
            
            // Form fields
            fullName: 'Full Name',
            occupation: 'Occupation',
            birthday: 'Date of Birth',
            email: 'Email',
            phoneNumber: 'Phone Number',
            address: 'Address',
            state: 'State',
            district: 'District',
            pincode: 'PIN Code',
            category: 'Category',
            annualIncome: 'Annual Income (₹)',
            educationLevel: 'Education Level',
            familySize: 'Family Size',
            aadhaarNumber: 'Aadhaar Number',
            panNumber: 'PAN Number',
            hasRationCard: 'Has Ration Card',
            gender: 'Gender',
            bharatTokens: 'Bharat Tokens',
            memberSince: 'Member Since',
            emailNote: 'Email cannot be changed',
            
            // Placeholders
            occupationPlaceholder: 'e.g., Student, Farmer, Engineer',
            phonePlaceholder: 'e.g., 9876543210',
            addressPlaceholder: 'Full address including city',
            statePlaceholder: 'Select your state',
            districtPlaceholder: 'Select your district',
            pincodePlaceholder: 'e.g., 380001',
            incomePlaceholder: 'Annual income in rupees',
            educationPlaceholder: 'e.g., 10th, 12th, Graduate',
            familySizePlaceholder: 'Number of family members',
            aadhaarPlaceholder: 'XXXX XXXX XXXX',
            panPlaceholder: 'ABCDE1234F',
            
            // Options
            categories: {
                general: 'General',
                obc: 'OBC',
                sc: 'SC',
                st: 'ST',
                ews: 'EWS'
            },
            genders: {
                male: 'Male',
                female: 'Female',
                other: 'Other'
            },
            yes: 'Yes',
            no: 'No',
            
            // Table headers
            schemeName: 'Scheme Name',
            dateApplied: 'Date Applied',
            hash: 'Hash'
        },
        hi: {
            title: 'मेरा खाता',
            subtitle: 'अपनी प्रोफ़ाइल की जानकारी देखें और प्रबंधित करें।',
            completeProfile: 'अपनी प्रोफ़ाइल पूरी करें',
            completeProfileMsg: 'स्वागत है! सर्वोत्तम योजना सुझाव प्राप्त करने के लिए कृपया अपनी प्रोफ़ाइल पूरी करें।',
            profileInfo: 'प्रोफ़ाइल जानकारी',
            editProfile: 'प्रोफ़ाइल संपादित करें',
            saveChanges: 'परिवर्तन सहेजें',
            cancel: 'रद्द करें',
            saving: 'सहेजा जा रहा है...',
            loading: 'उपयोगकर्ता डेटा लोड हो रहा है...',
            updateSuccess: 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!',
            updateError: 'प्रोफ़ाइल अपडेट करने में विफल। कृपया पुनः प्रयास करें।',
            schemeHistory: 'मेरी योजना का इतिहास',
            noSchemes: 'आपने अभी तक किसी योजना के लिए आवेदन नहीं किया है।',
            exploreSchemes: 'अपना आवेदन इतिहास यहाँ देखने के लिए योजनाओं की खोज शुरू करें।',
            
            // Form fields
            fullName: 'पूरा नाम',
            occupation: 'व्यवसाय',
            birthday: 'जन्मतिथि',
            email: 'ईमेल',
            phoneNumber: 'फ़ोन नंबर',
            address: 'पता',
            state: 'राज्य',
            district: 'जिला',
            pincode: 'पिन कोड',
            category: 'श्रेणी',
            annualIncome: 'वार्षिक आय (₹)',
            educationLevel: 'शिक्षा स्तर',
            familySize: 'परिवार का आकार',
            aadhaarNumber: 'आधार नंबर',
            panNumber: 'पैन नंबर',
            hasRationCard: 'राशन कार्ड है',
            gender: 'लिंग',
            bharatTokens: 'भारत टोकन',
            memberSince: 'सदस्य बनने की तारीख',
            emailNote: 'ईमेल बदला नहीं जा सकता',
            
            // Placeholders
            occupationPlaceholder: 'जैसे छात्र, किसान, इंजीनियर',
            phonePlaceholder: 'जैसे 9876543210',
            addressPlaceholder: 'शहर सहित पूरा पता',
            statePlaceholder: 'अपना राज्य चुनें',
            districtPlaceholder: 'अपना जिला चुनें',
            pincodePlaceholder: 'जैसे 380001',
            incomePlaceholder: 'रुपए में वार्षिक आय',
            educationPlaceholder: 'जैसे 10वीं, 12वीं, स्नातक',
            familySizePlaceholder: 'परिवार के सदस्यों की संख्या',
            aadhaarPlaceholder: 'XXXX XXXX XXXX',
            panPlaceholder: 'ABCDE1234F',
            
            // Options
            categories: {
                general: 'सामान्य',
                obc: 'ओबीसी',
                sc: 'अनुसूचित जाति',
                st: 'अनुसूचित जनजाति',
                ews: 'आर्थिक रूप से कमजोर वर्ग'
            },
            genders: {
                male: 'पुरुष',
                female: 'महिला',
                other: 'अन्य'
            },
            yes: 'हाँ',
            no: 'नहीं',
            
            // Table headers
            schemeName: 'योजना का नाम',
            dateApplied: 'आवेदन की तारीख',
            hash: 'हैश'
        }
    };

    const t = translations[language];

    useEffect(() => {
        if (userData) {
            setFormData({
                username: userData.username || '',
                birthday: userData.birthday || '',
                occupation: userData.occupation || '',
                phoneNumber: userData.phoneNumber || '',
                address: userData.address || '',
                state: userData.state || '',
                district: userData.district || '',
                pincode: userData.pincode || '',
                category: userData.category || '',
                annualIncome: userData.annualIncome || '',
                educationLevel: userData.educationLevel || '',
                familySize: userData.familySize || '',
                aadhaarNumber: userData.aadhaarNumber || '',
                panNumber: userData.panNumber || '',
                hasRationCard: userData.hasRationCard || false,
                gender: userData.gender || ''
            });
        }
    }, [userData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserProfile(formData);
            setNotification(t.updateSuccess);
            setIsEditing(false);
            setTimeout(() => setNotification(''), 3000);
        } catch (error) {
            console.error('Update profile error:', error);
            setNotification(t.updateError);
            setTimeout(() => setNotification(''), 3000);
        } finally {
            setLoading(false);
        }
    };
    
    if (!userData) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bharat-blue-900 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">{t.loading}</p>
                </div>
            </div>
        );
    }

    const needsProfileCompletion = userData.auth_provider === 'google' && 
        (!userData.occupation || !userData.phoneNumber || !userData.address || !userData.state);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-bharat-blue-900">{t.title}</h1>
                <p className="text-lg text-gray-600">{t.subtitle}</p>
            </div>

            {needsProfileCompletion && !isEditing && (
                 <div className="bg-bharat-saffron-500/10 border-l-4 border-bharat-saffron-500 text-bharat-saffron-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">{t.completeProfile}</p>
                    <p>{t.completeProfileMsg}</p>
                </div>
            )}
            
            {notification && (
                <div className={`p-3 rounded-md text-center font-semibold ${
                    notification.includes('success') || notification.includes('सफलतापूर्वक')
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }`}>
                    {notification}
                </div>
            )}

            {/* Profile Info Card */}
            <div className="bg-white rounded-xl shadow-lg border p-8">
                 <form onSubmit={handleSave}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-bharat-blue-900">{t.profileInfo}</h2>
                        {!isEditing && (
                             <button 
                               type="button" 
                               onClick={() => setIsEditing(true)} 
                               className="bg-bharat-blue-100 text-bharat-blue-800 font-semibold py-2 px-4 rounded-md hover:bg-bharat-blue-200 transition-colors"
                             >
                                {t.editProfile}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t.fullName}</label>
                            <input 
                              type="text" 
                              name="username" 
                              value={formData.username} 
                              onChange={handleInputChange} 
                              disabled={!isEditing} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t.email}</label>
                            <input 
                              type="email" 
                              value={userData.email || ''} 
                              disabled 
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">{t.emailNote}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t.phoneNumber}</label>
                            <input 
                              type="tel" 
                              name="phoneNumber" 
                              value={formData.phoneNumber} 
                              onChange={handleInputChange} 
                              disabled={!isEditing} 
                              placeholder={t.phonePlaceholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t.birthday}</label>
                            <input 
                              type="date" 
                              name="birthday" 
                              value={formData.birthday} 
                              onChange={handleInputChange} 
                              disabled={!isEditing} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t.gender}</label>
                            <select 
                              name="gender" 
                              value={formData.gender} 
                              onChange={handleInputChange} 
                              disabled={!isEditing} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                            >
                                <option value="">{language === 'hi' ? 'चुनें' : 'Select'}</option>
                                <option value="male">{t.genders.male}</option>
                                <option value="female">{t.genders.female}</option>
                                <option value="other">{t.genders.other}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t.occupation}</label>
                            <input 
                              type="text" 
                              name="occupation" 
                              value={formData.occupation} 
                              onChange={handleInputChange} 
                              disabled={!isEditing} 
                              placeholder={t.occupationPlaceholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                            />
                        </div>

                        {/* Address Information */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t.address}</label>
                            <input 
                              type="text" 
                              name="address" 
                              value={formData.address} 
                              onChange={handleInputChange} 
                              disabled={!isEditing} 
                              placeholder={t.addressPlaceholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t.state}</label>
                            <input 
                              type="text" 
                              name="state" 
                              value={formData.state} 
                              onChange={handleInputChange} 
                              disabled={!isEditing} 
                              placeholder={t.statePlaceholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t.district}</label>
                            <input 
                              type="text" 
                              name="district" 
                              value={formData.district} 
                              onChange={handleInputChange} 
                              disabled={!isEditing} 
                              placeholder={t.districtPlaceholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t.pincode}</label>
                            <input 
                              type="text" 
                              name="pincode" 
                              value={formData.pincode} 
                              onChange={handleInputChange} 
                              disabled={!isEditing} 
                              placeholder={t.pincodePlaceholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                            />
                        </div>

                        {/* Government Scheme Specific Information */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t.category}</label>
                            <select 
                              name="category" 
                              value={formData.category} 
                              onChange={handleInputChange} 
                              disabled={!isEditing} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                            >
                                <option value="">{language === 'hi' ? 'चुनें' : 'Select'}</option>
                                <option value="general">{t.categories.general}</option>
                                <option value="obc">{t.categories.obc}</option>
                                <option value="sc">{t.categories.sc}</option>
                                <option value="st">{t.categories.st}</option>
                                <option value="ews">{t.categories.ews}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t.annualIncome}</label>
                            <input 
                              type="number" 
                              name="annualIncome" 
                              value={formData.annualIncome} 
                              onChange={handleInputChange} 
                              disabled={!isEditing} 
                              placeholder={t.incomePlaceholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t.educationLevel}</label>
                            <input 
                              type="text" 
                              name="educationLevel" 
                              value={formData.educationLevel} 
                              onChange={handleInputChange} 
                              disabled={!isEditing} 
                              placeholder={t.educationPlaceholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t.familySize}</label>
                            <input 
                              type="number" 
                              name="familySize" 
                              value={formData.familySize} 
                              onChange={handleInputChange} 
                              disabled={!isEditing} 
                              placeholder={t.familySizePlaceholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t.aadhaarNumber}</label>
                            <input 
                              type="text" 
                              name="aadhaarNumber" 
                              value={formData.aadhaarNumber} 
                              onChange={handleInputChange} 
                              disabled={!isEditing} 
                              placeholder={t.aadhaarPlaceholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t.panNumber}</label>
                            <input 
                              type="text" 
                              name="panNumber" 
                              value={formData.panNumber} 
                              onChange={handleInputChange} 
                              disabled={!isEditing} 
                              placeholder={t.panPlaceholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              name="hasRationCard" 
                              checked={formData.hasRationCard} 
                              onChange={handleInputChange} 
                              disabled={!isEditing} 
                              className="h-4 w-4 text-bharat-blue-600 border-gray-300 rounded focus:ring-bharat-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700">{t.hasRationCard}</label>
                        </div>

                        {/* System Information */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t.bharatTokens}</label>
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-bharat-blue-700 font-semibold">
                                {userData.bharat_tokens} {language === 'hi' ? 'टोकन' : 'tokens'}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t.memberSince}</label>
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                                {userData.joined_at?.toDate ? 
                                  userData.joined_at.toDate().toLocaleDateString() : 
                                  (language === 'hi' ? 'हाल ही में शामिल हुए' : 'Recently joined')
                                }
                            </div>
                        </div>
                    </div>
                     {isEditing && (
                        <div className="flex justify-end gap-4 mt-6">
                            <button 
                              type="button" 
                              onClick={() => {
                                setIsEditing(false);
                                // Reset form data
                                setFormData({
                                  username: userData.username || '',
                                  birthday: userData.birthday || '',
                                  occupation: userData.occupation || '',
                                  phoneNumber: userData.phoneNumber || '',
                                  address: userData.address || '',
                                  state: userData.state || '',
                                  district: userData.district || '',
                                  pincode: userData.pincode || '',
                                  category: userData.category || '',
                                  annualIncome: userData.annualIncome || '',
                                  educationLevel: userData.educationLevel || '',
                                  familySize: userData.familySize || '',
                                  aadhaarNumber: userData.aadhaarNumber || '',
                                  panNumber: userData.panNumber || '',
                                  hasRationCard: userData.hasRationCard || false,
                                  gender: userData.gender || ''
                                });
                              }}
                              disabled={loading}
                              className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                            >
                              {t.cancel}
                            </button>
                            <button 
                              type="submit" 
                              disabled={loading}
                              className="bg-bharat-blue-700 text-white font-bold py-2 px-4 rounded-md hover:bg-bharat-blue-800 disabled:opacity-50 transition-colors"
                            >
                              {loading ? t.saving : t.saveChanges}
                            </button>
                        </div>
                    )}
                </form>
            </div>

             {/* Scheme History */}
            <div className="bg-white rounded-xl shadow-lg border p-8">
                <h2 className="text-2xl font-bold text-bharat-blue-900 mb-6">{t.schemeHistory}</h2>
                {userData.scheme_history && userData.scheme_history.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-sm uppercase text-gray-500">
                                <tr>
                                    <th className="px-4 py-2">{t.schemeName}</th>
                                    <th className="px-4 py-2">{t.dateApplied}</th>
                                    <th className="px-4 py-2">{t.hash}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {userData.scheme_history.map((entry, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-800">{entry.scheme_name}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {new Date(entry.applied_on).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 font-mono text-xs" title={entry.hash}>
                                           {entry.hash.substring(0, 12)}...
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">
                            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-gray-500">{t.noSchemes}</p>
                        <p className="text-gray-400 text-sm mt-1">{t.exploreSchemes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AccountPage;
