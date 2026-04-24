import { useState, useEffect } from 'react';
import type { User } from '../App';
import { getStructure } from '../lib/dataService';
import { BookOpen, LogOut, CheckSquare } from 'lucide-react';
import { StudyScreen } from './StudyScreen';
import { ExamScreen } from './ExamScreen';

interface MainScreenProps {
  user: User;
  onLogout: () => void;
}

export function MainScreen({ user, onLogout }: MainScreenProps) {
  const [activeTab, setActiveTab] = useState<'exam' | 'study'>('exam');
  
  // We fetch subject map to know what subjects belong to the user's team
  const [subjectsInfo, setSubjectsInfo] = useState<{
    mySubjects: string[];
    allSubjects: string[];
  } | null>(null);

  useEffect(() => {
    getStructure().then((res) => {
      setSubjectsInfo({
        mySubjects: res.teamSubjectMap[user.team] || [],
        allSubjects: res.subjects,
      });
    });
  }, [user.team]);

  if (!subjectsInfo) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full max-w-6xl mx-auto py-2 px-4 overflow-hidden h-full">
      <div className="w-full flex justify-between items-center mb-2 shrink-0">
         <div className="text-gray-700 bg-white px-3 py-1.5 rounded-md shadow-sm border border-gray-100 font-medium text-sm">
           Chào <span className="text-blue-700 font-bold">{user.empId}</span> | Tổ: <span className="text-blue-700 font-bold">{user.team}</span>
         </div>
         <button 
           onClick={onLogout}
           className="flex items-center text-red-600 hover:bg-red-50 px-2 py-1 rounded transition text-sm"
         >
           <LogOut className="w-4 h-4 mr-1" />
           Đăng Xuất
         </button>
      </div>

      {/* Tabs */}
      <div className="w-full flex justify-center mb-2 shrink-0">
        <div className="bg-white p-0.5 rounded-lg shadow-sm border border-gray-200 inline-flex">
           <button
             className={`flex items-center px-4 py-1.5 rounded-md font-semibold text-sm transition-colors ${activeTab === 'exam' ? 'bg-[#00529C] text-white shadow' : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'}`}
             onClick={() => setActiveTab('exam')}
           >
             <CheckSquare className="w-4 h-4 mr-2" /> 
             Thi Thử
           </button>
           <button
             className={`flex items-center px-4 py-1.5 rounded-md font-semibold text-sm transition-colors ${activeTab === 'study' ? 'bg-[#00529C] text-white shadow' : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'}`}
             onClick={() => setActiveTab('study')}
           >
             <BookOpen className="w-4 h-4 mr-2" /> 
             Học Bài
           </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full flex-1 min-h-0 flex flex-col bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {activeTab === 'study' && <StudyScreen allSubjects={subjectsInfo.allSubjects} shuffleAnswers={user.shuffleAnswers} />}
        {activeTab === 'exam' && <ExamScreen teamSubjects={subjectsInfo.mySubjects} shuffleAnswers={user.shuffleAnswers} />}
      </div>
    </div>
  );
}
