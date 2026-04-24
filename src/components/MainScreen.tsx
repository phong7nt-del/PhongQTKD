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
    <div className="flex-1 min-h-0 flex flex-col w-full bg-slate-50 overflow-hidden">
      
      {/* MAIN NAVIGATION TABS */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 shrink-0 flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
         <button
           className={`py-4 text-sm uppercase tracking-wide border-b-2 whitespace-nowrap transition-colors ${activeTab === 'exam' ? 'font-bold text-blue-600 border-blue-600' : 'font-semibold text-slate-400 border-transparent hover:text-slate-600'}`}
           onClick={() => setActiveTab('exam')}
         >
           THI THỬ
         </button>
         <button
           className={`py-4 text-sm uppercase tracking-wide border-b-2 whitespace-nowrap transition-colors ${activeTab === 'study' ? 'font-bold text-blue-600 border-blue-600' : 'font-semibold text-slate-400 border-transparent hover:text-slate-600'}`}
           onClick={() => setActiveTab('study')}
         >
           HỌC BÀI
         </button>
      </nav>

      {/* User Status Bar */}
      <div className="w-full flex justify-between items-center py-2 px-4 sm:px-6 bg-slate-50 border-b border-slate-200 shrink-0">
         <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">NV</div>
          <div className="text-xs font-medium">
            <p className="text-slate-800 uppercase">{user.empId}</p>
            <p className="text-slate-500">Tổ: {user.team}</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded transition text-xs sm:text-sm font-medium">
          <LogOut className="w-4 h-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Đăng Xuất</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="w-full flex-1 min-h-0 flex flex-col p-2 sm:p-4 lg:p-6 overflow-hidden">
        {activeTab === 'study' && <StudyScreen allSubjects={subjectsInfo.allSubjects} shuffleAnswers={user.shuffleAnswers} />}
        {activeTab === 'exam' && <ExamScreen teamSubjects={subjectsInfo.mySubjects} shuffleAnswers={user.shuffleAnswers} />}
      </div>
    </div>
  );
}
