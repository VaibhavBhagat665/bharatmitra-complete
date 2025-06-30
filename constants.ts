import { Scheme, LeaderboardUser, Scholarship, RedeemPerk } from './types';
import { StoreIcon } from './components/icons/StoreIcon';
import { ScholarshipIcon } from './components/icons/ScholarshipIcon';


export const RECOMMENDED_SCHEMES: Scheme[] = [
  {
    id: 'pm-kisan',
    title: 'PM-KISAN Scheme',
    department: 'Ministry of Agriculture & Farmers Welfare',
    description: 'An income support scheme for all landholding farmer families. They receive ₹6,000 per year in three installments.',
    eligibility: 'All landholding farmer families.',
    link: 'https://pmkisan.gov.in/',
  },
  {
    id: 'ayushman-bharat',
    title: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    department: 'Ministry of Health and Family Welfare',
    description: 'The world\'s largest health insurance scheme, providing a cover of ₹5 lakhs per family per year for secondary and tertiary care hospitalization.',
    eligibility: 'Based on SECC 2011 data for rural and urban areas.',
    link: 'https://nha.gov.in/PM-JAY',
  },
  {
    id: 'nsp',
    title: 'National Scholarship Portal (NSP)',
    department: 'Ministry of Electronics and Information Technology',
    description: 'A one-stop platform for students to apply for various scholarship schemes offered by Union Government, State Governments, and UGC.',
    eligibility: 'Varies by scholarship. Open to students from primary to post-doctoral level.',
    link: 'https://scholarships.gov.in/',
  },
];

export const LEADERBOARD_DATA: LeaderboardUser[] = [
  { rank: 1, name: 'Ramesh Kumar', location: 'Punjab', tokens: 250, avatarUrl: 'https://i.pravatar.cc/150?img=1' },
  { rank: 2, name: 'Sunita Devi', location: 'Uttar Pradesh', tokens: 235, avatarUrl: 'https://i.pravatar.cc/150?img=5' },
  { rank: 3, name: 'Arjun Singh', location: 'Rajasthan', tokens: 210, avatarUrl: 'https://i.pravatar.cc/150?img=3' },
  { rank: 4, name: 'Priya Sharma', location: 'Maharashtra', tokens: 198, avatarUrl: 'https://i.pravatar.cc/150?img=8' },
  { rank: 5, name: 'Amit Patel', location: 'Gujarat', tokens: 180, avatarUrl: 'https://i.pravatar.cc/150?img=7' },
  { rank: 6, name: 'Kavita Reddy', location: 'Andhra Pradesh', tokens: 172, avatarUrl: 'https://i.pravatar.cc/150?img=11' },
  { rank: 7, name: 'Sandeep Tiwari', location: 'Madhya Pradesh', tokens: 165, avatarUrl: 'https://i.pravatar.cc/150?img=12' },
  { rank: 8, name: 'Anjali Das', location: 'West Bengal', tokens: 150, avatarUrl: 'https://i.pravatar.cc/150?img=14' },
];

export const SCHOLARSHIPS_DATA: Scholarship[] = [
  {
    id: 'nsp-central-merit',
    name: 'Central Sector Scheme of Scholarship for College and University Students',
    provider: 'Department of Higher Education',
    amount: '₹10,000 - ₹20,000 per annum',
    deadline: 'Oct 31, 2024',
    link: 'https://scholarships.gov.in/',
    eligibility: {
      maxIncome: 800000,
      minAge: 17,
      maxAge: 22,
      course: ['B.A.', 'B.Com', 'B.Sc.', 'B.Tech', 'MBBS'],
    },
  },
  {
    id: 'pragati',
    name: 'AICTE Pragati Scholarship for Girls',
    provider: 'AICTE',
    amount: '₹50,000 per annum',
    deadline: 'Nov 30, 2024',
    link: 'https://www.aicte-india.org/schemes/students-development-schemes/Pragati',
    eligibility: {
      course: ['B.Tech', 'B.E.'],
      maxIncome: 800000,
    },
  },
   {
    id: 'pm-yasasvi',
    name: 'PM YASASVI Scheme',
    provider: 'Ministry of Social Justice & Empowerment',
    amount: 'Up to ₹1,25,000',
    deadline: 'Sep 30, 2024',
    link: 'https://yet.nta.ac.in/',
    eligibility: {
      caste: ['OBC', 'EBC', 'DNT'],
      maxIncome: 250000,
    },
  },
  {
    id: 'up-scholarship',
    name: 'UP Post Matric Scholarship',
    provider: 'Government of Uttar Pradesh',
    amount: 'Varies',
    deadline: 'Dec 15, 2024',
    link: 'https://scholarship.up.gov.in/',
    eligibility: {
      state: ['Uttar Pradesh'],
      maxIncome: 200000,
    },
  }
];


export const REDEEM_PERKS: RedeemPerk[] = [
    {
        id: 'resume-review',
        name: 'AI Resume Review',
        description: 'Get an expert-level review of your resume, highlighting strengths and areas for improvement.',
        price: 50,
        icon: ScholarshipIcon
    },
    {
        id: 'study-pdf',
        name: 'Exclusive Study Materials PDF',
        description: 'Download a PDF with curated study notes for competitive exams.',
        price: 75,
        icon: StoreIcon
    },
    {
        id: 'mock-interview',
        name: 'Mock Interview Session',
        description: 'A 30-minute one-on-one mock interview session with an AI career coach.',
        price: 150,
        icon: ScholarshipIcon
    }
];