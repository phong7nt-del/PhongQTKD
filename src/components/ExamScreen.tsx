import { useState } from 'react';
import { getQuestions, type Question } from '../lib/dataService';
import { Play, CheckCircle2, XCircle, FileText, AlertCircle } from 'lucide-react';

interface ExamScreenProps {
  teamSubjects: string[];
}

type ExamState = 'idle' | 'loading' | 'testing' | 'result';

export function ExamScreen({ teamSubjects }: ExamScreenProps) {
  const [examState, setExamState] = useState<ExamState>('idle');
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [examSize, setExamSize] = useState<number>(20);

  const startExam = async () => {
    if (teamSubjects.length === 0) return;
    setExamState('loading');
    
    try {
      // Fetch all questions for the team's subjects
      const allSubjectQs = await Promise.all(
        teamSubjects.map(subj => getQuestions(subj))
      );
      
      const qPerSubject = Math.floor(examSize / teamSubjects.length);
      let selected: Question[] = [];
      
      const remaining: Question[] = [];
      
      allSubjectQs.forEach((qs) => {
         // shuffle qs
         const shuffled = [...qs].sort(() => 0.5 - Math.random());
         selected.push(...shuffled.slice(0, qPerSubject));
         remaining.push(...shuffled.slice(qPerSubject));
      });
      
      // Fill the rest if size is not perfectly divisible
      if (selected.length < examSize) {
        const restShuffled = remaining.sort(() => 0.5 - Math.random());
        selected.push(...restShuffled.slice(0, examSize - selected.length));
      }
      
      // Final shuffle
      selected = selected.sort(() => 0.5 - Math.random());
      
      setExamQuestions(selected);
      setUserAnswers({});
      setExamState('testing');
      
    } catch (err) {
      console.error(err);
      setExamState('idle');
      alert('Có lỗi xảy ra khi tạo đề thi.');
    }
  };

  const handleFinish = () => {
    if (Object.keys(userAnswers).length < examQuestions.length) {
       if (!confirm('Bạn chưa hoàn thành tất cả câu hỏi. Vẫn muốn nộp bài?')) return;
    }
    setExamState('result');
  };

  if (teamSubjects.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Tổ của bạn chưa được phân công môn thi nào</h3>
        <p className="text-gray-600">Vui lòng liên hệ quản trị viên để kiểm tra lại sheet "cơ cấu".</p>
      </div>
    );
  }

  if (examState === 'idle') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <FileText className="w-16 h-16 text-blue-500 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tạo Bài Thi Thử</h2>
        <p className="text-gray-600 mb-8 max-w-md text-center">
          Hệ thống sẽ lấy ngẫu nhiên các câu hỏi từ {teamSubjects.length} phần thi tương ứng với tổ của bạn theo đúng tỷ lệ cơ cấu.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 w-full max-w-sm mb-6">
           <label className="block text-sm font-semibold text-gray-700 mb-3">
             Chọn số lượng câu hỏi:
           </label>
           <select 
             value={examSize} 
             onChange={e => setExamSize(Number(e.target.value))}
             className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
           >
             <option value={10}>10 câu</option>
             <option value={20}>20 câu</option>
             <option value={50}>50 câu</option>
             <option value={100}>100 câu</option>
           </select>
        </div>

        <button
          onClick={startExam}
          className="bg-[#00529C] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:-translate-y-1 flex items-center"
        >
          <Play className="w-5 h-5 mr-2" /> Bắt Đầu Thi
        </button>
      </div>
    );
  }

  if (examState === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Đang khởi tạo đề thi...</p>
      </div>
    );
  }

  if (examState === 'result') {
    const correctCount = examQuestions.reduce((acc, q, idx) => {
       const userAnsIdx = userAnswers[idx];
       if (userAnsIdx !== undefined && q.options[userAnsIdx]?.isCorrect) return acc + 1;
       return acc;
    }, 0);
    const score = (correctCount / examQuestions.length) * 10;

    return (
      <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full">
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Kết Quả Thi Thử</h2>
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-blue-100 bg-blue-50 mb-4">
                <span className="text-4xl font-black text-blue-600">{score.toFixed(1)}</span>
              </div>
              <p className="text-lg text-gray-600">
                Bạn đã trả lời đúng <strong className="text-green-600">{correctCount}</strong> / {examQuestions.length} câu.
              </p>
              
              <button
                onClick={() => setExamState('idle')}
                className="mt-6 bg-gray-800 hover:bg-gray-900 text-white py-2 px-6 rounded-md font-medium transition"
              >
                Làm bài khác
              </button>
           </div>

           <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Chi Tiết Bài Làm</h3>
           <div className="space-y-6">
             {examQuestions.map((q, qIdx) => {
                const userAnsIdx = userAnswers[qIdx];
                const isCorrect = userAnsIdx !== undefined && q.options[userAnsIdx]?.isCorrect;
                return (
                  <div key={qIdx} className={`p-5 rounded-xl border ${isCorrect ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                    <div className="flex items-start gap-3 mb-3">
                       <div className="mt-1">
                         {isCorrect ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                       </div>
                       <h4 className="text-base sm:text-lg font-medium text-gray-800"><span className="font-bold mr-1">Câu {qIdx + 1}:</span> {q.text}</h4>
                    </div>
                    
                    <div className="pl-9 space-y-2">
                       {q.options.map((opt, oIdx) => {
                          const isSelected = userAnsIdx === oIdx;
                          let optClass = "text-sm p-3 rounded border ";
                          if (opt.isCorrect) optClass += "bg-green-100 border-green-300 text-green-900 font-medium";
                          else if (isSelected && !opt.isCorrect) optClass += "bg-red-100 border-red-300 text-red-900 line-through";
                          else optClass += "bg-white border-gray-200 text-gray-600 opacity-60";
                          
                          return (
                            <div key={oIdx} className={optClass}>
                               {opt.text} {opt.isCorrect && isSelected && '(Bạn chọn đúng)'}
                               {isSelected && !opt.isCorrect && '(Bạn chọn sai)'}
                               {opt.isCorrect && !isSelected && '(Đáp án đúng)'}
                            </div>
                          );
                       })}
                    </div>
                  </div>
                )
             })}
           </div>
        </div>
      </div>
    );
  }

  // testing state
  return (
    <div className="flex-1 flex flex-col bg-gray-50/50">
       <div className="p-4 bg-white border-b sticky top-0 z-10 flex justify-between items-center shadow-sm">
          <div className="font-semibold text-gray-700">
             Đã làm: <span className="text-blue-600 text-lg">{Object.keys(userAnswers).length}</span> / {examQuestions.length}
          </div>
          <button 
             onClick={handleFinish}
             className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded shadow transition"
          >
             Nộp Bài
          </button>
       </div>

       <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-8">
             {examQuestions.map((q, qIdx) => (
               <div key={qIdx} id={`q-${qIdx}`} className="bg-white p-5 sm:p-8 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-5 leading-relaxed">
                     <span className="font-bold text-blue-700 mr-2">Câu {qIdx + 1}.</span> 
                     {q.text}
                  </h3>
                  <div className="space-y-3">
                     {q.options.map((opt, oIdx) => {
                        const isSelected = userAnswers[qIdx] === oIdx;
                        return (
                          <label key={oIdx} className={`flex items-start p-4 rounded-lg border cursor-pointer transition ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                             <div className="flex items-center h-5">
                               <input 
                                 type="radio" 
                                 name={`q-${qIdx}`}
                                 className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                 checked={isSelected}
                                 onChange={() => setUserAnswers(prev => ({...prev, [qIdx]: oIdx}))}
                               />
                             </div>
                             <div className="ml-3 text-gray-700 leading-tight">
                               {opt.text}
                             </div>
                          </label>
                        )
                     })}
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
}
