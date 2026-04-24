import { useState, useEffect } from 'react';
import { getQuestions, type Question } from '../lib/dataService';
import { Play, CheckCircle2, XCircle, FileText, AlertCircle, Clock } from 'lucide-react';

interface ExamScreenProps {
  teamSubjects: string[];
  shuffleAnswers?: boolean;
}

type ExamState = 'idle' | 'loading' | 'testing' | 'result';

export function ExamScreen({ teamSubjects, shuffleAnswers }: ExamScreenProps) {
  const [examState, setExamState] = useState<ExamState>('idle');
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [examSize, setExamSize] = useState<number>(20);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examState === 'testing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (examState === 'testing' && timeLeft === 0) {
      alert('Hết giờ! Bài thi của bạn sẽ được nộp tự động.');
      setExamState('result');
    }
    return () => clearInterval(timer);
  }, [examState, timeLeft]);

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
         if (shuffleAnswers) {
           qs.forEach(q => {
             q.options = [...q.options].sort(() => Math.random() - 0.5);
           });
         }
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
      setTimeLeft(examSize * 60); // 1 minute per question
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white rounded-xl shadow-sm border border-slate-200">
        <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Tổ của bạn chưa được phân công môn thi nào</h3>
        <p className="text-slate-500">Vui lòng liên hệ quản trị viên để kiểm tra lại sheet "cơ cấu".</p>
      </div>
    );
  }

  if (examState === 'idle') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <FileText className="w-16 h-16 text-blue-100 mb-6" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Tạo Bài Thi Thử</h2>
        <p className="text-slate-500 mb-8 max-w-md text-center text-sm leading-relaxed">
          Hệ thống sẽ lấy ngẫu nhiên các câu hỏi từ {teamSubjects.length} phần thi tương ứng với tổ của bạn theo đúng tỷ lệ cơ cấu.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 w-full max-w-sm mb-6">
           <label className="block text-sm font-semibold text-slate-700 mb-3">
             Chọn số lượng câu hỏi:
           </label>
           <select 
             value={examSize} 
             onChange={e => setExamSize(Number(e.target.value))}
             className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-700 bg-white shadow-sm"
           >
             <option value={10}>10 câu</option>
             <option value={20}>20 câu</option>
             <option value={50}>50 câu</option>
             <option value={100}>100 câu</option>
           </select>
        </div>

        <button
          onClick={startExam}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded shadow-md shadow-blue-200 transition-colors uppercase tracking-wider text-sm flex items-center"
        >
          <Play className="w-4 h-4 mr-2" /> Bắt Đầu Thi
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
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
       {/* Fixed Header */}
       <div className="bg-slate-50 border-b border-slate-200 z-20 flex flex-col sm:flex-row px-4 py-3 gap-3 justify-between items-center shrink-0">
          
          {/* Left: Progress */}
          <div className="flex-1 flex justify-start w-full sm:w-auto order-2 sm:order-1">
             <div className="text-sm font-bold text-slate-400 uppercase tracking-tighter bg-white px-4 py-2 rounded border border-slate-200 w-full sm:w-auto text-center">
                Đã làm: <span className="text-blue-600 ml-1">{Object.keys(userAnswers).length}</span> / {examQuestions.length}
             </div>
          </div>

          {/* Center: Animated Clock */}
          <div className="flex-1 flex justify-center w-full sm:w-auto order-1 sm:order-2">
             <div className={`px-5 py-2 rounded flex items-center justify-center gap-2 border-2 transition-all duration-300 w-full sm:w-auto ${
                timeLeft < 60 
                  ? 'bg-red-50 border-red-500 text-red-600 animate-pulse' 
                  : 'bg-white border-blue-200 text-slate-800'
             }`}>
                <Clock className={`w-4 h-4 ${timeLeft < 60 ? 'animate-bounce text-red-600' : 'animate-[spin_4s_linear_infinite] text-blue-400'}`} />
                <span className="text-lg font-mono font-bold tracking-wider">
                  {formatTime(timeLeft)}
               </span>
             </div>
          </div>

          {/* Right: Submit Button */}
          <div className="flex-1 flex justify-end w-full sm:w-auto order-3">
             <button 
                onClick={handleFinish}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded uppercase tracking-wider transition shadow-sm w-full sm:w-auto text-sm"
             >
                Nộp Bài
             </button>
          </div>
       </div>

       {/* Scrollable Questions Area */}
       <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-white">
          <div className="max-w-3xl mx-auto space-y-8 pb-10">
             {examQuestions.map((q, qIdx) => (
               <div key={qIdx} id={`q-${qIdx}`}>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug mb-5">
                     <span className="font-bold text-blue-600 mr-2">Câu {qIdx + 1}.</span> 
                     {q.text}
                  </h3>
                  <div className="space-y-3">
                     {q.options.map((opt, oIdx) => {
                        const isSelected = userAnswers[qIdx] === oIdx;
                        return (
                          <label key={oIdx} className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all group ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-400'}`}>
                             <div className={`w-8 h-8 rounded-full border flex shrink-0 items-center justify-center transition-colors font-medium text-sm mr-3 ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 group-hover:border-blue-100'}`}>
                               {String.fromCharCode(65 + oIdx)}
                             </div>
                             <div className={`font-medium leading-tight ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                               {opt.text}
                             </div>
                             {/* Hide actual radio input for minimalism */}
                             <input 
                               type="radio" 
                               name={`q-${qIdx}`}
                               className="sr-only"
                               checked={isSelected}
                               onChange={() => setUserAnswers(prev => ({...prev, [qIdx]: oIdx}))}
                             />
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
