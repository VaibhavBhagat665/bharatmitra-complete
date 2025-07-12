import React, { useState, useContext, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, PlayIcon, ClockIcon, DocumentTextIcon, AcademicCapIcon, BellIcon, UserIcon, CalendarDaysIcon, BookOpenIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { UserContext } from './UserContext';

type Perk = {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ElementType;
  category: 'Premium' | 'Mentorship' | 'Exam' | 'Daily' | 'Mystery';
  isWorking?: boolean;
};

const ALL_PERKS: Perk[] = [
  // Premium
  { id: 'premium-1', name: 'Premium Scheme Access', description: 'Unlock detailed guides & calculators.', price: 60, icon: () => <>🏆</>, category: 'Premium' },
  { id: 'premium-2', name: 'Exclusive Webinar', description: 'Attend govt strategy sessions.', price: 50, icon: () => <>🎤</>, category: 'Premium' },
  { id: 'premium-3', name: 'Monthly Masterclass', description: 'Webinar with expert panel.', price: 70, icon: () => <>🎓</>, category: 'Premium' },

  // Mentorship
  { id: 'mentorship-1', name: '1-on-1 Mentor Call', description: 'Talk to a verified expert.', price: 40, icon: () => <>📞</>, category: 'Mentorship' },
  { id: 'mentorship-2', name: 'Resume Review', description: 'Get professional resume feedback.', price: 30, icon: DocumentTextIcon, category: 'Mentorship', isWorking: true },
  { id: 'mentorship-3', name: 'Mock Interview', description: 'Practice for govt job interview.', price: 35, icon: () => <>🎯</>, category: 'Mentorship' },

  // Exam
  { id: 'exam-1', name: 'Exam Prep Kit', description: 'Interactive study materials & practice tests.', price: 25, icon: AcademicCapIcon, category: 'Exam', isWorking: true },
  { id: 'exam-2', name: 'Current Affairs Digest', description: 'Monthly e-mag for competitive exams.', price: 15, icon: () => <>📰</>, category: 'Exam' },
  { id: 'exam-3', name: 'Solved PYQs', description: 'Past paper solutions.', price: 20, icon: () => <>📄</>, category: 'Exam' },

  // Daily
  { id: 'daily-1', name: 'Daily Scheme Tips', description: 'Personalized daily government scheme updates.', price: 5, icon: BellIcon, category: 'Daily', isWorking: true },
  { id: 'daily-2', name: 'Token Booster (Video)', description: 'Watch a 30s video for 10 tokens.', price: 0, icon: () => <>🎥</>, category: 'Daily' },
  { id: 'daily-3', name: 'Badge of Supporter', description: 'Special badge for engagement.', price: 5, icon: () => <>🏅</>, category: 'Daily' },

  // Mystery
  { id: 'mystery-1', name: '🎁 Mystery Box', description: 'Unlock a surprise reward!', price: 10, icon: () => <>🎁</>, category: 'Mystery' },
  { id: 'mystery-2', name: 'Secret Scheme Reveal', description: 'Unlock hidden high-benefit scheme.', price: 15, icon: () => <>🔍</>, category: 'Mystery' },
  { id: 'mystery-3', name: 'Lucky Spin', description: 'Try your luck for tokens or perks.', price: 20, icon: () => <>🎡</>, category: 'Mystery' },
];

const CATEGORIES: (Perk['category'] | 'All')[] = ['All', 'Premium', 'Mentorship', 'Exam', 'Daily', 'Mystery'];

// Resume Review Modal Component
const ResumeReviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    experience: '',
    targetPosition: '',
    resumeFile: null as File | null,
    additionalInfo: ''
  });
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setFormData({ ...formData, resumeFile: files[0] });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, resumeFile: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Resume Review Service</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
              <select
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select experience level</option>
                <option value="fresher">Fresher (0-1 years)</option>
                <option value="junior">Junior (1-3 years)</option>
                <option value="mid">Mid-level (3-5 years)</option>
                <option value="senior">Senior (5+ years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Position</label>
              <input
                type="text"
                value={formData.targetPosition}
                onChange={(e) => setFormData({ ...formData, targetPosition: e.target.value })}
                placeholder="e.g., Civil Services, Banking, SSC, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Resume (PDF)</label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  dragActive ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {formData.resumeFile ? (
                  <div className="text-green-600">
                    <CheckIcon className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium">{formData.resumeFile.name}</p>
                    <p className="text-sm text-gray-500">File uploaded successfully</p>
                  </div>
                ) : (
                  <div>
                    <DocumentTextIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Drag and drop your resume here, or</p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileInput}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="inline-block mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer"
                    >
                      Choose File
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Information (Optional)</label>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                rows={3}
                placeholder="Any specific areas you'd like us to focus on..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Submit for Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Exam Prep Kit Modal Component
const ExamPrepModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [selectedExam, setSelectedExam] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const examTypes = [
    { id: 'upsc', name: 'UPSC Civil Services', subjects: ['General Studies', 'Current Affairs', 'Essay Writing'] },
    { id: 'ssc', name: 'SSC Combined Graduate Level', subjects: ['Quantitative Aptitude', 'English', 'General Awareness'] },
    { id: 'banking', name: 'Banking Exams', subjects: ['Banking Awareness', 'Computer Knowledge', 'Reasoning'] },
    { id: 'railway', name: 'Railway Recruitment', subjects: ['General Science', 'Mathematics', 'Current Affairs'] }
  ];

  const sampleQuestions = [
    {
      question: "Which of the following is the largest component of India's GDP?",
      options: ["Agriculture", "Manufacturing", "Services", "Mining"],
      correct: 2
    },
    {
      question: "The 'Digital India' initiative was launched in which year?",
      options: ["2013", "2014", "2015", "2016"],
      correct: 1
    },
    {
      question: "Which article of the Indian Constitution deals with the Right to Education?",
      options: ["Article 19", "Article 21A", "Article 25", "Article 32"],
      correct: 1
    }
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex.toString());
  };

  const handleNext = () => {
    if (selectedAnswer === sampleQuestions[currentQuestion].correct.toString()) {
      setScore(score + 1);
    }
    
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setShowResult(false);
    setScore(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Exam Prep Kit</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {!selectedExam ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Your Exam Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {examTypes.map((exam) => (
                  <div
                    key={exam.id}
                    onClick={() => setSelectedExam(exam.id)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-red-500 cursor-pointer transition-colors"
                  >
                    <h4 className="font-semibold text-gray-800">{exam.name}</h4>
                    <p className="text-sm text-gray-600 mt-2">
                      Subjects: {exam.subjects.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : !showResult ? (
            <div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Practice Test</h3>
                  <span className="text-sm text-gray-600">
                    Question {currentQuestion + 1} of {sampleQuestions.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / sampleQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-medium mb-4">
                  {sampleQuestions[currentQuestion].question}
                </h4>
                <div className="space-y-3">
                  {sampleQuestions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedAnswer === index.toString()
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setSelectedExam('')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Back to Exams
                </button>
                <button
                  onClick={handleNext}
                  disabled={!selectedAnswer}
                  className={`px-6 py-2 rounded-md ${
                    selectedAnswer
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {currentQuestion < sampleQuestions.length - 1 ? 'Next' : 'Finish'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Test Completed!</h3>
                <p className="text-lg text-gray-600">
                  Your Score: {score}/{sampleQuestions.length} ({Math.round((score / sampleQuestions.length) * 100)}%)
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-2">Performance Analysis</h4>
                <div className="text-sm text-gray-600">
                  {score === sampleQuestions.length ? (
                    <p className="text-green-600">🎉 Perfect score! You're well-prepared for this topic.</p>
                  ) : score >= Math.ceil(sampleQuestions.length * 0.7) ? (
                    <p className="text-blue-600">👍 Good job! Review the topics you missed and keep practicing.</p>
                  ) : (
                    <p className="text-orange-600">📚 Keep studying! Focus on the fundamentals and practice more questions.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetQuiz}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Retake Test
                </button>
                <button
                  onClick={() => setSelectedExam('')}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Try Another Exam
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Daily Tips Modal Component
const DailyTipsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSetPreferences: (prefs: any) => void;
}> = ({ isOpen, onClose, onSetPreferences }) => {
  const [preferences, setPreferences] = useState({
    categories: [] as string[],
    timePreference: '09:00',
    notificationMethod: 'email',
    frequency: 'daily'
  });

  const categories = [
    'Agricultural Schemes',
    'Education & Skill Development',
    'Healthcare Schemes',
    'Financial Inclusion',
    'Women Empowerment',
    'Social Security',
    'Rural Development',
    'Digital India Initiatives',
    'Employment Generation',
    'Housing & Urban Development'
  ];

  const handleCategoryToggle = (category: string) => {
    setPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSetPreferences(preferences);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Daily Scheme Tips Setup</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Categories of Interest (Choose at least 3)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((category) => (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.categories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <input
                  type="time"
                  value={preferences.timePreference}
                  onChange={(e) => setPreferences(prev => ({ ...prev, timePreference: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Method
                </label>
                <select
                  value={preferences.notificationMethod}
                  onChange={(e) => setPreferences(prev => ({ ...prev, notificationMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push Notification</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <select
                value={preferences.frequency}
                onChange={(e) => setPreferences(prev => ({ ...prev, frequency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly Digest</option>
                <option value="bi-weekly">Bi-weekly</option>
              </select>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">What you'll receive:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Personalized scheme recommendations based on your interests</li>
                <li>• Latest updates on application deadlines and procedures</li>
                <li>• Success stories and tips from beneficiaries</li>
                <li>• Quick eligibility checks and application links</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={preferences.categories.length < 3}
                className={`px-6 py-2 rounded-md ${
                  preferences.categories.length >= 3
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Start Daily Tips
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// PerkCard component
const PerkCard: React.FC<{
  perk: Perk;
  userTokens: number;
  onRedeem: (id: string, price: number) => void;
  isRedeeming: boolean;
  isRedeemed: boolean;
}> = ({ perk, userTokens, onRedeem, isRedeeming, isRedeemed }) => {
  const canAfford = userTokens >= perk.price;
  const IconComponent = perk.icon;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all duration-300 ${
      perk.isWorking ? 'border-green-400 hover:shadow-lg' : 'border-gray-200'
    } ${isRedeemed ? 'bg-green-50' : ''}`}>
      {perk.isWorking && (
        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-3 inline-block">
          ✅ Working Function
        </div>
      )}
      {isRedeemed && (
        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-3 inline-block">
          🎉 Redeemed & Active
        </div>
      )}
      <div className="flex items-start mb-4">
        <div className="text-2xl mr-3 mt-1">
          {typeof IconComponent === 'function' ? (
            <IconComponent className="w-8 h-8 text-red-600" />
          ) : (
            <IconComponent />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-1">{perk.name}</h3>
          <p className="text-sm text-gray-600">{perk.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-red-600">{perk.price} tokens</span>
        {isRedeemed ? (
          <div className="flex items-center text-green-600">
            <CheckIcon className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">Active</span>
          </div>
        ) : (
          <button
            onClick={() => onRedeem(perk.id, perk.price)}
            disabled={!canAfford || isRedeeming}
            className={`px-4 py-2 rounded font-semibold transition ${
              canAfford && !isRedeeming
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isRedeeming ? 'Redeeming...' : canAfford ? 'Redeem' : 'Not enough tokens'}
          </button>
        )}
      </div>
    </div>
  );
};

// Ad Modal Component
const AdModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onComplete: (tokens: number) => void;
}> = ({ isOpen, onClose, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [adCompleted, setAdCompleted] = useState(false);

  useEffect(() => {
    if (isPlaying && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !adCompleted) {
      setAdCompleted(true);
    }
  }, [isPlaying, countdown, adCompleted]);

  const handleStartAd = () => {
    setIsPlaying(true);
    setCountdown(30);
  };

  const handleComplete = () => {
    const tokens = Math.floor(Math.random() * 6) + 5; // 5-10 tokens
    onComplete(tokens);
    onClose();
  };

  const handleClose = () => {
    setIsPlaying(false);
    setCountdown(30);
    setAdCompleted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Watch Ad for Free Tokens</h2>
          
          {!isPlaying && !adCompleted && (
            <div>
              <div className="bg-gray-200 rounded-lg p-8 mb-4">
                <PlayIcon className="w-12 h-12 mx-auto text-gray-500" />
                <p className="text-gray-600 mt-2">Click to start 30-second ad</p>
              </div>
              <button
                onClick={handleStartAd}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              >
                Start Ad
              </button>
            </div>
          )}

          {isPlaying && !adCompleted && (
            <div>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 mb-4 text-white">
                <div className="animate-pulse">
                  <h3 className="text-lg font-bold">🎯 Government Scheme Pro</h3>
                  <p className="text-sm mt-2">Unlock premium features & get personalized scheme recommendations!</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-2">{countdown}s</div>
              <p className="text-gray-600">Please wait while the ad plays...</p>
            </div>
          )}

          {adCompleted && (
            <div>
              <div className="bg-green-100 rounded-lg p-6 mb-4">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-lg font-bold text-green-800">Ad Complete!</h3>
                <p className="text-green-700">You've earned 5-10 tokens!</p>
              </div>
              <button
                onClick={handleComplete}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition mr-2"
              >
                Claim Tokens
              </button>
            </div>
          )}

          <button
            onClick={handleClose}
            className="mt-4 text-gray-500 hover:text-gray-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const RedeemPage: React.FC = () => {
  const { tokenBalance, redeemPerk, user, userData, rewardTokens, refreshUserData } = useContext(UserContext);
  const [selectedCategory, setSelectedCategory] = useState<'All' | Perk['category']>('All');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error'; } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [lastAdWatch, setLastAdWatch] = useState<number | null>(null);
  const [redeemedPerks, setRedeemedPerks] = useState<string[]>([]);
  
  // Working perk modals
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showDailyTipsModal, setShowDailyTipsModal] = useState(false);
  
  // Perk data storage
  const [resumeSubmissions, setResumeSubmissions] = useState<any[]>([]);
  const [dailyTipsPreferences, setDailyTipsPreferences] = useState<any>(null);

  // Load saved data on mount
  useEffect(() => {
    const savedLastAdWatch = localStorage.getItem('lastAdWatch');
    const savedRedeemedPerks = localStorage.getItem('redeemedPerks');
    const savedResumeSubmissions = localStorage.getItem('resumeSubmissions');
    const savedDailyTipsPrefs = localStorage.getItem('dailyTipsPreferences');

    if (savedLastAdWatch) {
      setLastAdWatch(parseInt(savedLastAdWatch));
    }
    if (savedRedeemedPerks) {
      setRedeemedPerks(JSON.parse(savedRedeemedPerks));
    }
    if (savedResumeSubmissions) {
      setResumeSubmissions(JSON.parse(savedResumeSubmissions));
    }
    if (savedDailyTipsPrefs) {
      setDailyTipsPreferences(JSON.parse(savedDailyTipsPrefs));
    }
  }, []);

  // Save data to localStorage
  const saveToLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const saveLastAdWatch = (timestamp: number) => {
    setLastAdWatch(timestamp);
    localStorage.setItem('lastAdWatch', timestamp.toString());
  };

  const filtered = selectedCategory === 'All'
    ? ALL_PERKS
    : ALL_PERKS.filter((perk) => perk.category === selectedCategory);

  const canWatchAd = () => {
    if (!lastAdWatch) return true;
    const now = Date.now();
    const hoursPassed = (now - lastAdWatch) / (1000 * 60 * 60);
    return hoursPassed >= 8;
  };

  const getNextAdTime = () => {
    if (!lastAdWatch) return null;
    const nextTime = new Date(lastAdWatch + 8 * 60 * 60 * 1000);
    return nextTime;
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleRedeem = async (id: string, price: number) => {
    console.log('=== REDEEM ATTEMPT ===');
    console.log('Perk ID:', id);
    console.log('Price:', price);
    console.log('Current token balance:', tokenBalance);

    if (!user || !userData) {
      showNotification('❌ Please log in to redeem perks.', 'error');
      return;
    }

    if (tokenBalance < price) {
      showNotification(`❌ Not enough tokens. You need ${price} but have ${tokenBalance}.`, 'error');
      return;
    }

    try {
      setRedeeming(id);
      
      // Simulate token deduction (in real app, this would be handled by redeemPerk)
      const success = await redeemPerk(id, price);
      
      if (success) {
        const redeemedPerk = ALL_PERKS.find((p) => p.id === id);
        const newRedeemedPerks = [...redeemedPerks, id];
        setRedeemedPerks(newRedeemedPerks);
        saveToLocalStorage('redeemedPerks', newRedeemedPerks);
        
        // Handle working perks
        if (redeemedPerk?.isWorking) {
          let successMessage = '';
          switch (id) {
            case 'mentorship-2':
              successMessage = '📝 Resume Review activated! Complete your profile to get started.';
              setShowResumeModal(true);
              break;
            case 'exam-1':
              successMessage = '📚 Exam Prep Kit unlocked! Access your interactive study materials.';
              setShowExamModal(true);
              break;
            case 'daily-1':
              successMessage = '📅 Daily Scheme Tips activated! Set your preferences to get started.';
              setShowDailyTipsModal(true);
              break;
            default:
              successMessage = `🎉 Successfully redeemed "${redeemedPerk?.name}"!`;
          }
          
          showNotification(successMessage, 'success');
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        } else {
          showNotification(`🔧 "${redeemedPerk?.name}" is in demo mode. Feature coming soon!`, 'error');
        }
      } else {
        showNotification(`❌ Redemption failed. Please try again.`, 'error');
      }
    } catch (error) {
      console.error('Redemption error:', error);
      showNotification(`❌ An error occurred during redemption. Please try again.`, 'error');
    } finally {
      setRedeeming(null);
    }
  };

  const handleAdComplete = async (tokens: number) => {
    try {
      await rewardTokens(tokens, `Watched advertisement - earned ${tokens} tokens`);
      saveLastAdWatch(Date.now());
      
      showNotification(`🎉 You earned ${tokens} tokens from watching the ad!`, 'success');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      console.error('Error rewarding ad tokens:', error);
      showNotification(`❌ Failed to reward tokens. Please try again.`, 'error');
    }
  };

  const handleResumeSubmit = (formData: any) => {
    const submission = {
      ...formData,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      status: 'pending',
      reviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days from now
    };
    
    const newSubmissions = [...resumeSubmissions, submission];
    setResumeSubmissions(newSubmissions);
    saveToLocalStorage('resumeSubmissions', newSubmissions);
    
    showNotification('📝 Resume submitted successfully! You\'ll receive feedback within 48 hours.', 'success');
  };

  const handleDailyTipsSetup = (preferences: any) => {
    const prefs = {
      ...preferences,
      setupDate: new Date().toISOString(),
      isActive: true
    };
    
    setDailyTipsPreferences(prefs);
    saveToLocalStorage('dailyTipsPreferences', prefs);
    
    showNotification('📅 Daily tips configured! You\'ll start receiving personalized scheme updates.', 'success');
  };

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen px-6 py-12 flex items-center justify-center" style={{ backgroundColor: '#fff6f7' }}>
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-red-700 mb-4">Login Required</h1>
          <p className="text-gray-700 mb-6">
            Please log in to view your token balance and redeem perks.
          </p>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <p className="text-sm text-gray-600">
              Your tokens are securely stored in your account and will be available once you log in.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12" style={{ backgroundColor: '#fff6f7' }}>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="confetti-animation">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-red-700">Redeem Your Tokens</h1>
        <p className="text-gray-700 mt-2">
          Balance: <strong className="text-2xl text-red-600">{tokenBalance}</strong> tokens
        </p>
        {userData && (
          <p className="text-sm text-gray-500">
            Welcome back, {userData.username || userData.email}!
          </p>
        )}
      </div>

      {/* Ad Section */}
      <div className="max-w-lg mx-auto mb-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 flex items-center">
              <PlayIcon className="w-5 h-5 mr-2 text-blue-600" />
              Watch Ad for Free Tokens
            </h3>
            <p className="text-sm text-gray-600">Earn 5-10 tokens every 8 hours</p>
            {lastAdWatch && (
              <p className="text-xs text-gray-500 mt-1">
                Last watched: {new Date(lastAdWatch).toLocaleString()}
              </p>
            )}
          </div>
          <div>
            {canWatchAd() ? (
              <button
                onClick={() => setShowAdModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center"
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                Watch Ad
              </button>
            ) : (
              <div className="text-center">
                <ClockIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">
                  Next ad available at:<br />
                  {getNextAdTime()?.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {notification && (
        <div className={`max-w-lg mx-auto mb-6 p-4 rounded-lg shadow-md flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.type === 'success'
            ? <CheckCircleIcon className="w-6 h-6 text-green-500" />
            : <XCircleIcon className="w-6 h-6 text-red-500" />
          }
          <span className="flex-1">{notification.message}</span>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full border font-semibold transition ${
              selectedCategory === cat
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-red-600 border-red-600 hover:bg-red-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">No perks in this category.</p>
        ) : (
          filtered.map((perk) => (
            <PerkCard
              key={perk.id}
              perk={perk}
              userTokens={tokenBalance}
              onRedeem={handleRedeem}
              isRedeeming={redeeming === perk.id}
              isRedeemed={redeemedPerks.includes(perk.id)}
            />
          ))
        )}
      </div>

      {/* Active Perks Dashboard */}
      {redeemedPerks.length > 0 && (
        <div className="max-w-6xl mx-auto mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Active Perks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {redeemedPerks.map((perkId) => {
              const perk = ALL_PERKS.find(p => p.id === perkId);
              if (!perk) return null;
              
              return (
                <div key={perkId} className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">
                        {typeof perk.icon === 'function' ? (
                          <perk.icon className="w-8 h-8 text-green-600" />
                        ) : (
                          <perk.icon />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{perk.name}</h3>
                        <p className="text-sm text-green-600 flex items-center">
                          <CheckIcon className="w-4 h-4 mr-1" />
                          Active
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Perk-specific status */}
                  {perkId === 'mentorship-2' && resumeSubmissions.length > 0 && (
                    <div className="bg-white rounded p-3 text-sm">
                      <p className="font-medium text-gray-700">Resume Submissions: {resumeSubmissions.length}</p>
                      <p className="text-gray-600">Last submission: {new Date(resumeSubmissions[resumeSubmissions.length - 1].submittedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {perkId === 'daily-1' && dailyTipsPreferences && (
                    <div className="bg-white rounded p-3 text-sm">
                      <p className="font-medium text-gray-700">Categories: {dailyTipsPreferences.categories.length}</p>
                      <p className="text-gray-600">Delivery: {dailyTipsPreferences.timePreference} daily</p>
                    </div>
                  )}
                  
                  {perkId === 'exam-1' && (
                    <div className="bg-white rounded p-3 text-sm">
                      <p className="font-medium text-gray-700">Study Materials Available</p>
                      <p className="text-gray-600">Practice tests, guides, and more</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <AdModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onComplete={handleAdComplete}
      />
      
      <ResumeReviewModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        onSubmit={handleResumeSubmit}
      />
      
      <ExamPrepModal
        isOpen={showExamModal}
        onClose={() => setShowExamModal(false)}
      />
      
      <DailyTipsModal
        isOpen={showDailyTipsModal}
        onClose={() => setShowDailyTipsModal(false)}
        onSetPreferences={handleDailyTipsSetup}
      />

      <style jsx>{`
        .confetti-animation {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 40;
        }
        
        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti-fall 3s linear infinite;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default RedeemPage;
