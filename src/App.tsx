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
  team: string;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#00529C] text-white py-3 px-4 shadow-md flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3 w-1/4">
           <Zap className="w-8 h-8 text-yellow-400" />
           <div className="font-semibold text-sm sm:text-base leading-tight">
             Công ty Điện lực<br/>Vũng Tàu
           </div>
        </div>
        
        <div className="flex-1 text-center font-bold text-lg sm:text-xl md:text-2xl tracking-wider">
          HỆ THỐNG THI THỬ QTKD
        </div>
        
        <div className="w-1/4 text-right text-xs sm:text-sm text-blue-100 flex flex-col items-end">
          <div className="font-medium text-white">Tác giả: Nguyễn Thành Phong</div>
          <div>Version 2026.4.1</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {!user ? (
          <LoginScreen onLogin={setUser} />
        ) : (
          <MainScreen user={user} onLogout={() => setUser(null)} />
        )}
      </main>
    </div>
  );
}
