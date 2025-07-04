import { Timestamp } from 'firebase/firestore';

export interface SchemeHistoryEntry {
  scheme_id: string;
  scheme_name: string;
  applied_on: string; // ISO date string
  status: 'applied';
  hash: string; // For blockchain-style integrity
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  birthday: string;
  occupation: string;
  
  // Contact Information
  phoneNumber: string;
  
  // Address Information
  address: string;
  state: string;
  district: string;
  pincode: string;
  
  // Government Scheme Specific Fields
  category: 'general' | 'obc' | 'sc' | 'st' | 'ews' | '';
  annualIncome: string;
  educationLevel: string;
  familySize: string;
  aadhaarNumber: string;
  panNumber: string;
  hasRationCard: boolean;
  gender: 'male' | 'female' | 'other' | '';
  
  // System fields
  joined_at: any; // Firebase Timestamp
  auth_provider: string;
  bharat_tokens: number;
  scheme_history: SchemeHistoryEntry[];
  lastUpdated?: any; // Firebase Timestamp
}

export interface SchemeHistoryEntry {
  scheme_id: string;
  scheme_name: string;
  applied_on: string; // ISO date string
  status: 'applied' | 'approved' | 'rejected' | 'pending';
  hash: string;
  documents?: string[]; // Array of document URLs
  remarks?: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  nameHi: string; // Hindi name
  description: string;
  descriptionHi: string; // Hindi description
  category: string;
  categoryHi: string;
  
  // Eligibility criteria
  eligibility: {
    minAge?: number;
    maxAge?: number;
    gender?: 'male' | 'female' | 'any';
    categories: ('general' | 'obc' | 'sc' | 'st' | 'ews')[];
    maxIncome?: number;
    minIncome?: number;
    educationLevel?: string[];
    occupation?: string[];
    states?: string[];
    districts?: string[];
    familySize?: {
      min?: number;
      max?: number;
    };
    hasRationCard?: boolean;
    requiredDocuments: string[];
  };
  
  // Benefits
  benefits: {
    type: 'financial' | 'subsidy' | 'loan' | 'training' | 'healthcare' | 'education' | 'other';
    amount?: number;
    description: string;
    descriptionHi: string;
    duration?: string;
    durationHi?: string;
  };
  
  // Application process
  applicationProcess: {
    steps: string[];
    stepsHi: string[];
    requiredDocuments: string[];
    requiredDocumentsHi: string[];
    applicationUrl?: string;
    helplineNumber?: string;
    deadline?: string;
  };
  
  // Metadata
  ministry: string;
  ministryHi: string;
  launchedDate: string;
  lastUpdated: string;
  isActive: boolean;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  tagsHi: string[];
}

export interface ProfileFormData {
  username: string;
  birthday: string;
  occupation: string;
  phoneNumber: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
  category: string;
  annualIncome: string;
  educationLevel: string;
  familySize: string;
  aadhaarNumber: string;
  panNumber: string;
  hasRationCard: boolean;
  gender: string;
}

export interface SchemeRecommendation {
  scheme: GovernmentScheme;
  matchPercentage: number;
  matchReasons: string[];
  matchReasonsHi: string[];
  missingCriteria: string[];
  missingCriteriaHi: string[];
  priority: 'high' | 'medium' | 'low';
}

// Filter interface for scheme search
export interface SchemeFilter {
  category?: string;
  state?: string;
  district?: string;
  benefitType?: string;
  minAmount?: number;
  maxAmount?: number;
  eligibleAge?: number;
  gender?: string;
  incomeRange?: {
    min?: number;
    max?: number;
  };
  searchQuery?: string;
}

// Language support
export type Language = 'en' | 'hi';

// Notification interface
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  messageHi: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// States and Districts data structure
export interface StateDistrictData {
  [state: string]: {
    nameHi: string;
    districts: {
      [district: string]: {
        nameHi: string;
        pincodes: string[];
      };
    };
  };
}

// Education levels
export const EDUCATION_LEVELS = {
  en: [
    'Below 5th',
    '5th Pass',
    '8th Pass',
    '10th Pass',
    '12th Pass',
    'Graduate',
    'Post Graduate',
    'Professional Degree',
    'Diploma',
    'ITI',
    'Others'
  ],
  hi: [
    '5वीं से नीचे',
    '5वीं पास',
    '8वीं पास',
    '10वीं पास',
    '12वीं पास',
    'स्नातक',
    'स्नातकोत्तर',
    'व्यावसायिक डिग्री',
    'डिप्लोमा',
    'आईटीआई',
    'अन्य'
  ]
};

// Common occupations
export const COMMON_OCCUPATIONS = {
  en: [
    'Student',
    'Farmer',
    'Daily Wage Worker',
    'Self Employed',
    'Government Employee',
    'Private Employee',
    'Business Owner',
    'Unemployed',
    'Retired',
    'Housewife',
    'Teacher',
    'Doctor',
    'Engineer',
    'Lawyer',
    'Others'
  ],
  hi: [
    'छात्र',
    'किसान',
    'दैनिक मजदूर',
    'स्व-नियोजित',
    'सरकारी कर्मचारी',
    'निजी कर्मचारी',
    'व्यवसायी',
    'बेरोजगार',
    'सेवानिवृत्त',
    'गृहिणी',
    'शिक्षक',
    'डॉक्टर',
    'इंजीनियर',
    'वकील',
    'अन्य'
  ]
};

// Indian states
export const INDIAN_STATES = {
  en: [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Lakshadweep',
    'Puducherry'
  ],
  hi: [
    'आंध्र प्रदेश',
    'अरुणाचल प्रदेश',
    'असम',
    'बिहार',
    'छत्तीसगढ़',
    'गोवा',
    'गुजरात',
    'हरियाणा',
    'हिमाचल प्रदेश',
    'झारखंड',
    'कर्नाटक',
    'केरल',
    'मध्य प्रदेश',
    'महाराष्ट्र',
    'मणिपुर',
    'मेघालय',
    'मिजोरम',
    'नागालैंड',
    'ओडिशा',
    'पंजाब',
    'राजस्थान',
    'सिक्किम',
    'तमिलनाडु',
    'तेलंगाना',
    'त्रिपुरा',
    'उत्तर प्रदेश',
    'उत्तराखंड',
    'पश्चिम बंगाल',
    'अंडमान और निकोबार द्वीप समूह',
    'चंडीगढ़',
    'दादरा और नगर हवेली और दमन और दीव',
    'दिल्ली',
    'जम्मू और कश्मीर',
    'लद्दाख',
    'लक्षद्वीप',
    'पुडुचेरी'
  ]
}

export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
}

export interface Scheme {
  id: string;
  title: string;
  department: string;
  description: string;
  eligibility: string;
  link: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  location: string;
  tokens: number;
  avatarUrl: string;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: string;
  deadline: string;
  link: string;
  eligibility: {
    minAge?: number;
    maxAge?: number;
    course?: string[];
    caste?: string[];
    maxIncome?: number;
    state?: string[];
  };
}

export interface ScholarshipCriteria {
  age: number | null;
  course: string;
  caste: string;
  income: number | null;
  state: string;
}

export interface RedeemPerk {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export default {
  UserProfile,
  SchemeHistoryEntry,
  GovernmentScheme,
  ProfileFormData,
  SchemeRecommendation,
  SchemeFilter,
  Language,
  Notification,
  StateDistrictData,
  EDUCATION_LEVELS,
  COMMON_OCCUPATIONS,
  INDIAN_STATES
};
