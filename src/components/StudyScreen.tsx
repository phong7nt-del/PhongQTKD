import { useState, useEffect } from 'react';
import { getQuestions, type Question } from '../lib/dataService';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CheckCircle2, XCircle } from 'lucide-react';

interface StudyScreenProps {
  allSubjects: string[];
  shuffleAnswers?: boolean;
}

export function StudyScreen({ allSubjects, shuffleAnswers }: StudyScreenProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerIndices, setSelectedAnswerIndices] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!selectedSubject) {
      setQuestions([]);
      setCurrentIndex(0);
      setSelectedAnswerIndices({});
      return;
    }

    setLoading(true);
    getQuestions(selectedSubject)
      .then((qs) => {
        if (shuffleAnswers) {
          qs.forEach(q => {
            q.options = [...q.options].sort(() => Math.random() - 0.5);
          });
        }
        setQuestions(qs);
        setCurrentIndex(0);
        setSelectedAnswerIndices({});
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedSubject]);

  const handleSelectAnswer = (ansIndex: number) => {
    setSelectedAnswerIndices(prev => ({
      ...prev,
      [currentIndex]: ansIndex
    }));
  };

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* Header with Navigation */}
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0 z-10">
         <div className="flex items-center gap-3 w-full md:w-auto">
           <h2 className="text-lg font-bold text-gray-800 hidden lg:block shrink-0">Góc Học Tập</h2>
           <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto min-w-[200px]"
           >
              <option value="">-- Chọn môn học --</option>
              {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
           </select>
         </div>

         {selectedSubject && !loading && questions.length > 0 && (
           <div className="flex items-center justify-between sm:justify-end w-full md:w-auto gap-1 sm:gap-2">
             <button
               onClick={() => setCurrentIndex(0)}
               disabled={currentIndex === 0}
               className="p-1.5 sm:px-3 sm:py-1.5 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:hover:bg-transparent flex items-center transition"
               title="Về đầu"
             >
               <ChevronsLeft className="w-5 h-5" />
             </button>
             
             <button
               onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
               disabled={currentIndex === 0}
               className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded shadow-sm disabled:opacity-50 flex items-center font-medium transition text-sm sm:text-base"
             >
               <ChevronLeft className="w-4 h-4 mr-1" /> Trước
             </button>

             <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
               {currentIndex + 1} / {questions.length}
             </span>

             <button
               onClick={() => setCurrentIndex(c => Math.min(questions.length - 1, c + 1))}
               disabled={currentIndex === questions.length - 1}
               className="px-3 py-1.5 bg-[#00529C] text-white hover:bg-blue-700 rounded shadow-sm disabled:opacity-50 flex items-center font-medium transition text-sm sm:text-base"
             >
               Sau <ChevronRight className="w-4 h-4 ml-1" />
             </button>

             <button
               onClick={() => setCurrentIndex(questions.length - 1)}
               disabled={currentIndex === questions.length - 1}
               className="p-1.5 sm:px-3 sm:py-1.5 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:hover:bg-transparent flex items-center transition"
               title="Về cuối"
             >
               <ChevronsRight className="w-5 h-5" />
             </button>
           </div>
         )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col p-3 sm:p-4 overflow-y-auto">
         {!selectedSubject ? (
            <div className="m-auto text-gray-400 text-center flex flex-col items-center">
               <BookOpenIcon className="w-12 h-12 mb-3 text-gray-300" />
               <p className="text-base">Vui lòng chọn môn học để bắt đầu</p>
            </div>
         ) : loading ? (
            <div className="m-auto flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
         ) : questions.length === 0 ? (
            <div className="m-auto text-gray-500">Chưa có câu hỏi cho môn học này.</div>
         ) : (
            <div className="w-full max-w-3xl mx-auto flex flex-col pb-8">
               
               <div className="bg-blue-50/50 p-4 sm:p-5 rounded-xl border border-blue-100 mb-5 shadow-sm">
                 <h3 className="text-base sm:text-lg font-medium text-gray-900 leading-relaxed">
                   <span className="font-bold text-blue-700 mr-2">Câu {currentIndex + 1}.</span>
                   {questions[currentIndex].text}
                 </h3>
               </div>

               <div className="space-y-2.5">
                 {questions[currentIndex].options.map((opt, idx) => {
                    const isSelected = selectedAnswerIndices[currentIndex] === idx;
                    const hasAnswered = selectedAnswerIndices[currentIndex] !== undefined;
                    
                    let btnClass = "w-full text-left p-3 sm:p-4 rounded-lg border transition-all duration-200 shadow-sm flex items-start gap-3 outline-none focus:ring-2 focus:ring-blue-300 ";
                    
                    if (!hasAnswered) {
                      btnClass += "bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50";
                    } else {
                      if (opt.isCorrect) {
                         btnClass += "bg-green-50 border-green-500";
                      } else if (isSelected && !opt.isCorrect) {
                         btnClass += "bg-red-50 border-red-500";
                      } else {
                         btnClass += "bg-white border-gray-200 opacity-60";
                      }
                    }

                    return (
                      <button 
                         key={idx}
                         onClick={() => !hasAnswered && handleSelectAnswer(idx)}
                         className={btnClass}
                         disabled={hasAnswered}
                      >
                         <div className="mt-0.5 shrink-0">
                            {hasAnswered && opt.isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : hasAnswered && isSelected && !opt.isCorrect ? (
                              <XCircle className="w-5 h-5 text-red-600" />
                            ) : (
                              <div className={`w-5 h-5 rounded-full border-2 transition-colors ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`} />
                            )}
                         </div>
                         <span className={`text-sm sm:text-base leading-relaxed text-left ${hasAnswered && opt.isCorrect ? 'text-green-800 font-medium' : hasAnswered && isSelected && !opt.isCorrect ? 'text-red-800 font-medium' : 'text-gray-700'}`}>
                           {opt.text}
                         </span>
                      </button>
                    )
                 })}
               </div>
            </div>
         )}
      </div>
    </div>
  )
}

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}
