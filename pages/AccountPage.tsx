import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

// Language translations
const translations = {
  en: {
    title: 'My Account',
    subtitle: 'View and manage your profile information.',
    completeProfile: 'Complete Your Profile',
    completeProfileMsg: 'Welcome! Please complete your profile to get the best scheme recommendations.',
    profileInfo: 'Profile Information',
    editProfile: 'Edit Profile',
    personalInfo: 'Personal Information',
    addressInfo: 'Address Information',
    identityInfo: 'Identity & KYC Information',
    fullName: 'Full Name',
    fatherName: 'Father\'s Name',
    motherName: 'Mother\'s Name',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    category: 'Category',
    general: 'General',
    obc: 'OBC',
    sc: 'SC',
    st: 'ST',
    minority: 'Minority',
    maritalStatus: 'Marital Status',
    single: 'Single',
    married: 'Married',
    divorced: 'Divorced',
    widowed: 'Widowed',
    occupation: 'Occupation',
    birthday: 'Date of Birth',
    email: 'Email',
    phone: 'Phone Number',
    address: 'Residential Address',
    city: 'City',
    district: 'District',
    state: 'State',
    pincode: 'PIN Code',
    aadharNumber: 'Aadhaar Number',
    panNumber: 'PAN Number',
    bankAccount: 'Bank Account Number',
    ifscCode: 'IFSC Code',
    bharatTokens: 'Bharat Tokens',
    memberSince: 'Member Since',
    kycStatus: 'KYC Status',
    kycPending: 'Pending',
    kycVerified: 'Verified',
    kycFailed: 'Failed',
    verifyKyc: 'Verify KYC',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    schemeHistory: 'My Scheme History',
    schemeName: 'Scheme Name',
    dateApplied: 'Date Applied',
    hash: 'Hash',
    noSchemes: 'You have not applied to any schemes yet.',
    noSchemesMsg: 'Start exploring schemes to see your application history here.',
    profileUpdated: 'Profile updated successfully!',
    profileUpdateFailed: 'Failed to update profile. Please try again.',
    loadingUserData: 'Loading user data...',
    emailCannotChange: 'Email cannot be changed',
    recentlyJoined: 'Recently joined',
    occupationPlaceholder: 'e.g., Student, Farmer, Engineer',
    requiredField: 'Required for scheme eligibility',
    kycRequired: 'KYC verification required for scheme applications',
    aadharFormat: 'Enter 12-digit Aadhaar number',
    panFormat: 'Enter 10-character PAN number',
    kycNote: 'Note: KYC verification is mandatory for applying to government schemes. Your documents are encrypted and secure.',
    monthlyIncome: 'Monthly Income (₹)',
    annualIncome: 'Annual Income (₹)',
    bpl: 'Below Poverty Line',
    yes: 'Yes',
    no: 'No'
  },
  hi: {
    title: 'मेरा खाता',
    subtitle: 'अपनी प्रोफाइल जानकारी देखें और प्रबंधित करें।',
    completeProfile: 'अपनी प्रोफाइल पूरी करें',
    completeProfileMsg: 'स्वागत है! बेहतर योजना सिफारिशों के लिए अपनी प्रोफाइल पूरी करें।',
    profileInfo: 'प्रोफाइल जानकारी',
    editProfile: 'प्रोफाइल संपादित करें',
    personalInfo: 'व्यक्तिगत जानकारी',
    addressInfo: 'पता जानकारी',
    identityInfo: 'पहचान और केवाईसी जानकारी',
    fullName: 'पूरा नाम',
    fatherName: 'पिता का नाम',
    motherName: 'माता का नाम',
    gender: 'लिंग',
    male: 'पुरुष',
    female: 'महिला',
    other: 'अन्य',
    category: 'श्रेणी',
    general: 'सामान्य',
    obc: 'ओबीसी',
    sc: 'एससी',
    st: 'एसटी',
    minority: 'अल्पसंख्यक',
    maritalStatus: 'वैवाहिक स्थिति',
    single: 'अविवाहित',
    married: 'विवाहित',
    divorced: 'तलाकशुदा',
    widowed: 'विधवा',
    occupation: 'व्यवसाय',
    birthday: 'जन्म तिथि',
    email: 'ईमेल',
    phone: 'फोन नंबर',
    address: 'निवास पता',
    city: 'शहर',
    district: 'जिला',
    state: 'राज्य',
    pincode: 'पिन कोड',
    aadharNumber: 'आधार नंबर',
    panNumber: 'पैन नंबर',
    bankAccount: 'बैंक खाता नंबर',
    ifscCode: 'आईएफएससी कोड',
    bharatTokens: 'भारत टोकन',
    memberSince: 'सदस्य बने',
    kycStatus: 'केवाईसी स्थिति',
    kycPending: 'लंबित',
    kycVerified: 'सत्यापित',
    kycFailed: 'असफल',
    verifyKyc: 'केवाईसी सत्यापित करें',
    cancel: 'रद्द करें',
    saveChanges: 'परिवर्तन सहेजें',
    saving: 'सहेजा जा रहा है...',
    schemeHistory: 'मेरी योजना इतिहास',
    schemeName: 'योजना नाम',
    dateApplied: 'आवेदन तिथि',
    hash: 'हैश',
    noSchemes: 'आपने अभी तक किसी योजना के लिए आवेदन नहीं किया है।',
    noSchemesMsg: 'योजनाओं की खोज शुरू करें और अपना आवेदन इतिहास यहाँ देखें।',
    profileUpdated: 'प्रोफाइल सफलतापूर्वक अपडेट हो गया!',
    profileUpdateFailed: 'प्रोफाइल अपडेट करने में विफल। कृपया पुनः प्रयास करें।',
    loadingUserData: 'उपयोगकर्ता डेटा लोड हो रहा है...',
    emailCannotChange: 'ईमेल नहीं बदला जा सकता',
    recentlyJoined: 'हाल ही में जुड़े',
    occupationPlaceholder: 'जैसे, छात्र, किसान, इंजीनियर',
    requiredField: 'योजना पात्रता के लिए आवश्यक',
    kycRequired: 'योजना आवेदन के लिए केवाईसी सत्यापन आवश्यक',
    aadharFormat: '12 अंकों का आधार नंबर दर्ज करें',
    panFormat: '10 अक्षरों का पैन नंबर दर्ज करें',
    kycNote: 'नोट: सरकारी योजनाओं के लिए आवेदन करने हेतु केवाईसी सत्यापन अनिवार्य है। आपके दस्तावेज़ एन्क्रिप्टेड और सुरक्षित हैं।',
    monthlyIncome: 'मासिक आय (₹)',
    annualIncome: 'वार्षिक आय (₹)',
    bpl: 'गरीबी रेखा से नीचे',
    yes: 'हाँ',
    no: 'नहीं'
  }
};

// Indian states list
const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 
  'Puducherry', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu'
];

interface ExtendedFormData {
  username: string;
  fatherName: string;
  motherName: string;
  birthday: string;
  gender: string;
  category: string;
  maritalStatus: string;
  occupation: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  aadharNumber: string;
  panNumber: string;
  bankAccount: string;
  ifscCode: string;
  monthlyIncome: string;
  annualIncome: string;
  bpl: string;
  kycStatus: string;
}

const AccountPage: React.FC = () => {
  const { userData, updateUserProfile, language } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ExtendedFormData>({
    username: '',
    fatherName: '',
    motherName: '',
    birthday: '',
    gender: '',
    category: '',
    maritalStatus: '',
    occupation: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    aadharNumber: '',
    panNumber: '',
    bankAccount: '',
    ifscCode: '',
    monthlyIncome: '',
    annualIncome: '',
    bpl: '',
    kycStatus: 'pending'
  });
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);

  const t = translations[language];

  useEffect(() => {
    if (userData) {
      setFormData({
        username: userData.username || '',
        fatherName: userData.fatherName || '',
        motherName: userData.motherName || '',
        birthday: userData.birthday || '',
        gender: userData.gender || '',
        category: userData.category || '',
        maritalStatus: userData.maritalStatus || '',
        occupation: userData.occupation || '',
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
        district: userData.district || '',
        state: userData.state || '',
        pincode: userData.pincode || '',
        aadharNumber: userData.aadharNumber || '',
        panNumber: userData.panNumber || '',
        bankAccount: userData.bankAccount || '',
        ifscCode: userData.ifscCode || '',
        monthlyIncome: userData.monthlyIncome || '',
        annualIncome: userData.annualIncome || '',
        bpl: userData.bpl || '',
        kycStatus: userData.kycStatus || 'pending'
      });
    }
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Format Aadhaar number
    if (name === 'aadharNumber') {
      const formatted = value.replace(/\D/g, '').slice(0, 12);
      setFormData({ ...formData, [name]: formatted });
      return;
    }
    
    // Format PAN number
    if (name === 'panNumber') {
      const formatted = value.toUpperCase().slice(0, 10);
      setFormData({ ...formData, [name]: formatted });
      return;
    }
    
    // Format phone number
    if (name === 'phone') {
      const formatted = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: formatted });
      return;
    }
    
    // Format pincode
    if (name === 'pincode') {
      const formatted = value.replace(/\D/g, '').slice(0, 6);
      setFormData({ ...formData, [name]: formatted });
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.username.trim()) errors.push('Full name is required');
    if (!formData.birthday) errors.push('Date of birth is required');
    if (!formData.gender) errors.push('Gender is required');
    if (!formData.category) errors.push('Category is required');
    if (!formData.occupation.trim()) errors.push('Occupation is required');
    if (!formData.phone || formData.phone.length !== 10) errors.push('Valid 10-digit phone number is required');
    if (!formData.address.trim()) errors.push('Address is required');
    if (!formData.city.trim()) errors.push('City is required');
    if (!formData.district.trim()) errors.push('District is required');
    if (!formData.state) errors.push('State is required');
    if (!formData.pincode || formData.pincode.length !== 6) errors.push('Valid 6-digit PIN code is required');
    
    if (formData.aadharNumber && formData.aadharNumber.length !== 12) {
      errors.push('Aadhaar number must be 12 digits');
    }
    
    if (formData.panNumber && formData.panNumber.length !== 10) {
      errors.push('PAN number must be 10 characters');
    }
    
    return errors;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setNotification(errors[0]);
      setTimeout(() => setNotification(''), 3000);
      return;
    }
    
    setLoading(true);
    try {
      await updateUserProfile(formData);
      setNotification(t.profileUpdated);
      setIsEditing(false);
      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      console.error('Update profile error:', error);
      setNotification(t.profileUpdateFailed);
      setTimeout(() => setNotification(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleKycVerification = async () => {
    // Simulated KYC verification process
    setLoading(true);
    try {
      // In real implementation, this would call actual KYC API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedFormData = { ...formData, kycStatus: 'verified' };
      await updateUserProfile(updatedFormData);
      
      setNotification('KYC verification successful!');
      setShowKycModal(false);
      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      setNotification('KYC verification failed. Please try again.');
      setTimeout(() => setNotification(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getKycStatusText = (status: string) => {
    switch (status) {
      case 'verified': return t.kycVerified;
      case 'failed': return t.kycFailed;
      default: return t.kycPending;
    }
  };

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bharat-blue-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">{t.loadingUserData}</p>
        </div>
      </div>
    );
  }

  const needsProfileCompletion = !formData.occupation || !formData.phone || !formData.address;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
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
          notification.includes('success') || notification.includes('successful') 
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

          {/* Personal Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-bharat-blue-800 mb-4 border-b pb-2">{t.personalInfo}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.fullName} <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.fatherName}</label>
                <input 
                  type="text" 
                  name="fatherName" 
                  value={formData.fatherName} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.motherName}</label>
                <input 
                  type="text" 
                  name="motherName" 
                  value={formData.motherName} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.birthday} <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  name="birthday" 
                  value={formData.birthday} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.gender} <span className="text-red-500">*</span></label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                >
                  <option value="">{t.gender}</option>
                  <option value="male">{t.male}</option>
                  <option value="female">{t.female}</option>
                  <option value="other">{t.other}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.category} <span className="text-red-500">*</span></label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                >
                  <option value="">{t.category}</option>
                  <option value="general">{t.general}</option>
                  <option value="obc">{t.obc}</option>
                  <option value="sc">{t.sc}</option>
                  <option value="st">{t.st}</option>
                  <option value="minority">{t.minority}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.maritalStatus}</label>
                <select 
                  name="maritalStatus" 
                  value={formData.maritalStatus} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                >
                  <option value="">{t.maritalStatus}</option>
                  <option value="single">{t.single}</option>
                  <option value="married">{t.married}</option>
                  <option value="divorced">{t.divorced}</option>
                  <option value="widowed">{t.widowed}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.occupation} <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="occupation" 
                  value={formData.occupation} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  placeholder={t.occupationPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.phone} <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
                <input 
                  type="email" 
                  value={userData.email || ''} 
                  disabled 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">{t.emailCannotChange}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.monthlyIncome}</label>
                <input 
                  type="number" 
                  name="monthlyIncome" 
                  value={formData.monthlyIncome} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.annualIncome}</label>
                <input 
                  type="number" 
                  name="annualIncome" 
                  value={formData.annualIncome} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.bpl}</label>
                <select 
                  name="bpl" 
                  value={formData.bpl} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                >
                  <option value="">{t.bpl}</option>
                  <option value="yes">{t.yes}</option>
                  <option value="no">{t.no}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-bharat-blue-800 mb-4 border-b pb-2">{t.addressInfo}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.address} <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.city} <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.district} <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="district" 
                  value={formData.district} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.state} <span className="text-red-500">*</span></label>
                <select 
                  name="state" 
                  value={formData.state} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                >
                  <option value="">{t.state}</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.pincode} <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="pincode" 
                  value={formData.pincode} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  placeholder="6-digit PIN code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Identity & KYC Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-bharat-blue-800 mb-4 border-b pb-2">{t.identityInfo}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.aadharNumber}</label>
                <input 
                  type="text" 
                  name="aadharNumber" 
                  value={formData.aadharNumber} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  placeholder={t.aadharFormat}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.panNumber}</label>
                <input 
                  type="text" 
                  name="panNumber" 
                  value={formData.panNumber} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  placeholder={t.panFormat}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.bankAccount}</label>
                <input 
                  type="text" 
                  name="bankAccount" 
                  value={formData.bankAccount} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.ifscCode}</label>
                <input 
                  type="text" 
                  name="ifscCode" 
                  value={formData.ifscCode} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.kycStatus}</label>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getKycStatusColor(formData.kycStatus)}`}>
                    {getKycStatusText(formData.kycStatus)}
                  </span>
                  {formData.kycStatus === 'pending' && formData.aadharNumber && (
                    <button 
                      type="button" 
                      onClick={() => setShowKycModal(true)}
                      className="text-bharat-blue-600 hover:text-bharat-blue-800 text-sm underline"
                    >
                      {t.verifyKyc}
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.bharatTokens}</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-bharat-blue-700 font-semibold">
                  {userData.bharat_tokens} tokens
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.memberSince}</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  {userData.joined_at?.toDate ? 
                    userData.joined_at.toDate().toLocaleDateString() : 
                    t.recentlyJoined
                  }
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">{t.kycNote}</p>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-4 mt-6">
              <button 
                type="button" 
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data
                  if (userData) {
                    setFormData({
                      username: userData.username || '',
                      fatherName: userData.fatherName || '',
                      motherName: userData.motherName || '',
                      birthday: userData.birthday || '',
                      gender: userData.gender || '',
                      category: userData.category || '',
                      maritalStatus: userData.maritalStatus || '',
                      occupation: userData.occupation || '',
                      phone: userData.phone || '',
                      address: userData.address || '',
                      city: userData.city || '',
                      district: userData.district || '',
                      state: userData.state || '',
                      pincode: userData.pincode || '',
                      aadharNumber: userData.aadharNumber || '',
                      panNumber: userData.panNumber || '',
                      bankAccount: userData.bankAccount || '',
                      ifscCode: userData.ifscCode || '',
                      monthlyIncome: userData.monthlyIncome || '',
                      annualIncome: userData.annualIncome || '',
                      bpl: userData.bpl || '',
                      kycStatus: userData.kycStatus || 'pending'
                    });
                  }
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
            <p className="text-gray-400 text-sm mt-1">{t.noSchemesMsg}</p>
          </div>
        )}
      </div>

      {/* KYC Modal */}
      {showKycModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-bharat-blue-900 mb-4">KYC Verification</h3>
            <p className="text-gray-600 mb-4">
              {language === 'en' 
                ? 'We will verify your Aadhaar details for KYC compliance. This is a secure process and your data will be encrypted.'
                : 'हम केवाईसी अनुपालन के लिए आपके आधार विवरण की जांच करेंगे। यह एक सुरक्षित प्रक्रिया है और आपका डेटा एन्क्रिप्टेड होगा।'
              }
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowKycModal(false)}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                {t.cancel}
              </button>
              <button 
                onClick={handleKycVerification}
                disabled={loading}
                className="px-4 py-2 bg-bharat-blue-700 text-white rounded-md hover:bg-bharat-blue-800 disabled:opacity-50"
              >
                {loading ? (language === 'en' ? 'Verifying...' : 'सत्यापित हो रहा है...') : t.verifyKyc}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
