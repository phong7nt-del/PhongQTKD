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
  const [activeModule, setActiveModule] = useState<'QTKD' | 'QT_AN_TOAN' | 'VI_PHAM'>('QTKD');
  
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
    <div className="flex-1 min-h-0 flex w-full bg-slate-50 overflow-hidden">
      
      {/* Sidebar: Module Selection */}
      <aside className="w-56 sm:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 italic">CHỌN BỘ CÂU HỎI</h2>
          <div className="space-y-1">
            <button 
              onClick={() => setActiveModule('QTKD')}
              className={`w-full text-left px-3 py-2 rounded-md font-medium text-sm transition-colors ${activeModule === 'QTKD' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
            >
              QTKD
            </button>
            <button 
              onClick={() => setActiveModule('QT_AN_TOAN')}
              className={`w-full text-left px-3 py-2 rounded-md font-medium text-sm transition-colors ${activeModule === 'QT_AN_TOAN' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
            >
              QT An toàn
            </button>
            <button 
              onClick={() => setActiveModule('VI_PHAM')}
              className={`w-full text-left px-3 py-2 rounded-md font-medium text-sm transition-colors ${activeModule === 'VI_PHAM' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
            >
              Vi phạm trang bị điện
            </button>
          </div>
        </div>
        
        {/* User Status Bar */}
        <div className="mt-auto p-4 bg-slate-50 border-t border-slate-200">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">NV</div>
                <div className="text-xs font-medium">
                  <p className="text-slate-800 uppercase line-clamp-1">{user.empId}</p>
                  <p className="text-slate-500 line-clamp-1">Tổ: {user.team}</p>
                </div>
              </div>
              <button onClick={onLogout} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition" title="Đăng xuất">
                <LogOut className="w-4 h-4" />
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
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

        {/* Tab Content */}
        <div className="w-full flex-1 min-h-0 flex flex-col p-2 sm:p-4 lg:p-6 overflow-hidden">
          {activeModule === 'QTKD' ? (
            <>
              {activeTab === 'study' && <StudyScreen allSubjects={subjectsInfo.allSubjects} shuffleAnswers={user.shuffleAnswers} />}
              {activeTab === 'exam' && <ExamScreen teamSubjects={subjectsInfo.mySubjects} shuffleAnswers={user.shuffleAnswers} />}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Bộ câu hỏi đang được cập nhật</h3>
              <p className="text-slate-500 max-w-sm text-sm">Tính năng này sẽ được bổ sung trong những phiên bản cập nhật tiếp theo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
