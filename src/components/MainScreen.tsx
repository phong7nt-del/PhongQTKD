import { useState, useEffect } from 'react';
import type { User } from '../App';
import { getStructure, getSafetySubjects } from '../lib/dataService';
import { BookOpen, LogOut, CheckSquare, Menu, Briefcase, ShieldCheck, AlertTriangle, Edit3, GraduationCap } from 'lucide-react';
import { StudyScreen } from './StudyScreen';
import { ExamScreen } from './ExamScreen';

interface MainScreenProps {
  user: User;
  onLogout: () => void;
}

export function MainScreen({ user, onLogout }: MainScreenProps) {
  const [activeTab, setActiveTab] = useState<'exam' | 'study'>('exam');
  const [activeModule, setActiveModule] = useState<'QTKD' | 'QT_AN_TOAN' | 'VI_PHAM'>('QTKD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
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
    <div className="flex-1 min-h-0 flex w-full bg-slate-50 overflow-hidden relative">
      
      {/* Sidebar: Module Selection */}
      <aside className={`bg-white border-slate-200 flex flex-col shrink-0 transition-all duration-300 overflow-hidden z-20 ${isSidebarOpen ? 'w-64 border-r opacity-100' : 'w-0 border-r-0 opacity-0'}`}>
        <div className="p-4 w-64">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 italic">CHỌN BỘ CÂU HỎI</h2>
          <div className="space-y-1">
            <button 
              onClick={() => setActiveModule('QTKD')}
              className={`w-full text-left px-3 py-2.5 rounded-md font-medium text-sm transition-colors flex items-center gap-3 ${activeModule === 'QTKD' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
            >
              <Briefcase className="w-5 h-5 shrink-0" />
              QTKD
            </button>
            <button 
              onClick={() => setActiveModule('QT_AN_TOAN')}
              className={`w-full text-left px-3 py-2.5 rounded-md font-medium text-sm transition-colors flex items-center gap-3 ${activeModule === 'QT_AN_TOAN' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
            >
              <ShieldCheck className="w-5 h-5 shrink-0" />
              QT An toàn
            </button>
            <button 
              onClick={() => setActiveModule('VI_PHAM')}
              className={`w-full text-left px-3 py-2.5 rounded-md font-medium text-sm transition-colors flex items-center gap-3 ${activeModule === 'VI_PHAM' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
            >
              <AlertTriangle className="w-5 h-5 shrink-0" />
              Vi phạm trang bị điện
            </button>
          </div>
        </div>
        
        {/* User Status Bar */}
        <div className="mt-auto p-4 bg-slate-50 border-t border-slate-200 w-64">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">NV</div>
                <div className="text-xs font-medium">
                  <p className="text-slate-800 uppercase line-clamp-1">{user.empId}</p>
                  <div className="text-slate-500 text-[10px] sm:text-xs">
                    <div><span className="font-semibold text-slate-600">Khối:</span> {user.department}</div>
                    <div className="truncate w-32" title={user.team}><span className="font-semibold text-slate-600">Tổ:</span> {user.team}</div>
                  </div>
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
        <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 shrink-0 flex items-center justify-end gap-3 sm:gap-6 overflow-x-auto no-scrollbar shadow-sm relative">
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
             className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100"
             title={isSidebarOpen ? "Ẩn danh mục" : "Hiện danh mục"}
           >
             <Menu className="w-6 h-6" />
           </button>
           
           <button
             className={`flex items-center gap-2 px-5 sm:px-10 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base uppercase tracking-wider font-extrabold transition-all duration-200 transform hover:-translate-y-0.5 ${activeTab === 'exam' ? 'bg-blue-600 text-white shadow-[0_4px_0_rgb(29,78,216)] hover:shadow-[0_6px_0_rgb(29,78,216)] active:translate-y-1 active:shadow-none' : 'bg-slate-100 text-slate-500 border border-slate-200 shadow-[0_4px_0_rgb(203,213,225)] hover:bg-slate-200 hover:shadow-[0_6px_0_rgb(203,213,225)] active:translate-y-1 active:shadow-none'}`}
             onClick={() => setActiveTab('exam')}
           >
             <Edit3 className="w-5 h-5" />
             THI THỬ
           </button>
           <button
             className={`flex items-center gap-2 px-5 sm:px-10 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base uppercase tracking-wider font-extrabold transition-all duration-200 transform hover:-translate-y-0.5 ${activeTab === 'study' ? 'bg-blue-600 text-white shadow-[0_4px_0_rgb(29,78,216)] hover:shadow-[0_6px_0_rgb(29,78,216)] active:translate-y-1 active:shadow-none' : 'bg-slate-100 text-slate-500 border border-slate-200 shadow-[0_4px_0_rgb(203,213,225)] hover:bg-slate-200 hover:shadow-[0_6px_0_rgb(203,213,225)] active:translate-y-1 active:shadow-none'}`}
             onClick={() => setActiveTab('study')}
           >
             <GraduationCap className="w-5 h-5" />
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
          ) : activeModule === 'QT_AN_TOAN' ? (
            <>
              {activeTab === 'study' && <StudyScreen allSubjects={getSafetySubjects(user.department)} shuffleAnswers={user.shuffleAnswers} />}
              {activeTab === 'exam' && <ExamScreen teamSubjects={getSafetySubjects(user.department)} shuffleAnswers={user.shuffleAnswers} />}
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
