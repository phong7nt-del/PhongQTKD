/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { LoginScreen } from './components/LoginScreen';
import { MainScreen } from './components/MainScreen';

export type User = {
  empId: string;
  team: string; // for QTKD
  department: string; // for QT An Toan
  shuffleAnswers: boolean;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 sm:h-20 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3 w-1/4">
           <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shrink-0">
             <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
           </div>
           <div className="leading-tight hidden sm:block">
             <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">CÔNG TY ĐIỆN LỰC</div>
             <div className="text-xs sm:text-sm font-bold text-slate-800">Vũng Tàu</div>
           </div>
        </div>
        
        <div className="flex-1 text-center">
          <h1 className="text-lg sm:text-xl font-extrabold text-blue-900 tracking-tight">HỆ THỐNG KHẢO THÍ & ĐÀO TẠO</h1>
        </div>
        
        <div className="w-1/4 text-right leading-tight hidden sm:block">
          <div className="text-sm font-medium text-slate-700">Tác giả: <span className="font-bold text-blue-700">Nguyễn Thành Phong</span></div>
          <div className="text-xs text-slate-400">Version 2026.4.1</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
        {!user ? (
          <LoginScreen onLogin={setUser} />
        ) : (
          <MainScreen user={user} onLogout={() => setUser(null)} />
        )}
      </main>
    </div>
  );
}
