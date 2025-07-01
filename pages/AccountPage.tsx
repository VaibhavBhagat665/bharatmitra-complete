import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

const AccountPage: React.FC = () => {
    const { userData, updateUserProfile } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        birthday: '',
        occupation: ''
    });
    const [notification, setNotification] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            setFormData({
                username: userData.username || '',
                birthday: userData.birthday || '',
                occupation: userData.occupation || ''
            });
        }
    }, [userData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserProfile(formData);
            setNotification('Profile updated successfully!');
            setIsEditing(false);
            setTimeout(() => setNotification(''), 3000);
        } catch (error) {
            console.error('Update profile error:', error);
            setNotification('Failed to update profile. Please try again.');
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
                    <p className="text-lg text-gray-600">Loading user data...</p>
                </div>
            </div>
        );
    }

    const needsProfileCompletion = userData.auth_provider === 'google' && !userData.occupation;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-bharat-blue-900">My Account</h1>
                <p className="text-lg text-gray-600">View and manage your profile information.</p>
            </div>

            {needsProfileCompletion && !isEditing && (
                 <div className="bg-bharat-saffron-500/10 border-l-4 border-bharat-saffron-500 text-bharat-saffron-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Complete Your Profile</p>
                    <p>Welcome! Please add your occupation and birthday to get the best recommendations.</p>
                </div>
            )}
            
            {notification && (
                <div className={`p-3 rounded-md text-center font-semibold ${
                    notification.includes('success') 
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
                        <h2 className="text-2xl font-bold text-bharat-blue-900">Profile Information</h2>
                        {!isEditing && (
                             <button 
                               type="button" 
                               onClick={() => setIsEditing(true)} 
                               className="bg-bharat-blue-100 text-bharat-blue-800 font-semibold py-2 px-4 rounded-md hover:bg-bharat-blue-200 transition-colors"
                             >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
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
                            <label className="block text-sm font-medium text-gray-500 mb-1">Occupation</label>
                            <input 
                              type="text" 
                              name="occupation" 
                              value={formData.occupation} 
                              onChange={handleInputChange} 
                              disabled={!isEditing} 
                              placeholder="e.g., Student, Farmer, Engineer"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-bharat-blue-500"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Birthday</label>
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
                            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                            <input 
                              type="email" 
                              value={userData.email || ''} 
                              disabled 
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Bharat Tokens</label>
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-bharat-blue-700 font-semibold">
                                {userData.bharat_tokens} tokens
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                                {userData.joined_at?.toDate ? 
                                  userData.joined_at.toDate().toLocaleDateString() : 
                                  'Recently joined'
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
                                  occupation: userData.occupation || ''
                                });
                              }}
                              disabled={loading}
                              className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit" 
                              disabled={loading}
                              className="bg-bharat-blue-700 text-white font-bold py-2 px-4 rounded-md hover:bg-bharat-blue-800 disabled:opacity-50 transition-colors"
                            >
                              {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </form>
            </div>

             {/* Scheme History */}
            <div className="bg-white rounded-xl shadow-lg border p-8">
                <h2 className="text-2xl font-bold text-bharat-blue-900 mb-6">My Scheme History</h2>
                {userData.scheme_history && userData.scheme_history.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-sm uppercase text-gray-500">
                                <tr>
                                    <th className="px-4 py-2">Scheme Name</th>
                                    <th className="px-4 py-2">Date Applied</th>
                                    <th className="px-4 py-2">Hash</th>
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
                        <p className="text-gray-500">You have not applied to any schemes yet.</p>
                        <p className="text-gray-400 text-sm mt-1">Start exploring schemes to see your application history here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AccountPage;
