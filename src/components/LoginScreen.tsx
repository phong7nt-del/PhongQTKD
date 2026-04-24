import { useState, useEffect } from 'react';
import { getStructure } from '../lib/dataService';
import type { User } from '../App';
import { LogIn, UserCircle, Users } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [empId, setEmpId] = useState('');
  const [team, setTeam] = useState('');
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [teams, setTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getStructure()
      .then((data) => {
        setTeams(data.teams);
        if (data.teams.length > 0) setTeam(data.teams[0]);
      })
      .catch((err) => {
        console.error(err);
        setError('Không thể tải dữ liệu tổ từ hệ thống');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empId.trim()) {
      setError('Vui lòng nhập Mã nhân viên');
      return;
    }
    setError('');
    onLogin({ empId: empId.trim(), team, shuffleAnswers });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-sm">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-6 shadow-sm">
            <LogIn className="h-8 w-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-blue-900 tracking-tight">HỆ THỐNG THI THỬ</h2>
          <p className="text-slate-500 text-sm mt-2">Vui lòng đăng nhập để tiếp tục</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Mã Nhân Viên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserCircle className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className="pl-11 w-full border-2 border-slate-200 rounded-xl py-3 px-4 text-slate-800 font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-slate-50 hover:bg-slate-100 focus:bg-white"
                placeholder="Ví dụ: PA120..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Tổ Công Tác
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-slate-400" />
              </div>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="pl-11 w-full border-2 border-slate-200 rounded-xl py-3 px-4 text-slate-800 font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 appearance-none transition-all bg-slate-50 hover:bg-slate-100 focus:bg-white"
              >
                {teams.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="flex items-start mt-4">
            <div className="flex items-center h-5">
              <input
                id="shuffle-answers"
                type="checkbox"
                checked={shuffleAnswers}
                onChange={(e) => setShuffleAnswers(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
            </div>
            <label htmlFor="shuffle-answers" className="ml-2 block text-sm text-slate-700 leading-tight">
              Đảo tùy chọn câu trả lời<br/><span className="text-xs text-slate-500">(Áp dụng cho học bài & thi thử)</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md shadow-blue-200 transition duration-200 uppercase tracking-wider text-sm mt-4"
          >
            Đăng Nhập
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
