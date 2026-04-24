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
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-[#00529C] px-6 py-4 flex items-center justify-center">
          <LogIn className="w-6 h-6 text-white mr-2" />
          <h2 className="text-xl font-bold text-white tracking-wide">ĐĂNG NHẬP HỆ THỐNG</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mã Nhân Viên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircle className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nhập mã nhân viên..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chọn Tổ
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all"
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

          <div className="flex items-center mt-4">
            <input
              id="shuffle-answers"
              type="checkbox"
              checked={shuffleAnswers}
              onChange={(e) => setShuffleAnswers(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="shuffle-answers" className="ml-2 block text-sm text-gray-700">
              Đảo tùy chọn câu trả lời (Áp dụng cho học bài & thi thử)
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#00529C] hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-200 transform hover:-translate-y-0.5"
          >
            Đăng Nhập
          </button>
        </form>
      </div>
    </div>
  );
}
