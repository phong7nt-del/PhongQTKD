import { useState, useEffect } from 'react';
import { getQuestions, type Question } from '../lib/dataService';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CheckCircle2, XCircle } from 'lucide-react';

interface StudyScreenProps {
  allSubjects: string[];
}

export function StudyScreen({ allSubjects }: StudyScreenProps) {
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
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
         <h2 className="text-xl font-bold text-gray-800">Góc Học Tập</h2>
         <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto min-w-[250px]"
         >
            <option value="">-- Chọn môn học --</option>
            {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
         </select>
      </div>

      <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
         {!selectedSubject ? (
            <div className="m-auto text-gray-400 text-center flex flex-col items-center">
               <BookOpenIcon className="w-16 h-16 mb-4 text-gray-300" />
               <p className="text-lg">Vui lòng chọn môn học để bắt đầu</p>
            </div>
         ) : loading ? (
            <div className="m-auto flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
         ) : questions.length === 0 ? (
            <div className="m-auto text-gray-500">Chưa có câu hỏi cho môn học này.</div>
         ) : (
            <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
               <div className="flex justify-between items-center mb-6">
                 <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                   Câu {currentIndex + 1} / {questions.length}
                 </span>
               </div>
               
               <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 mb-6 shadow-sm">
                 <h3 className="text-lg sm:text-xl font-medium text-gray-800 leading-relaxed">
                   {questions[currentIndex].text}
                 </h3>
               </div>

               <div className="space-y-3 mb-8 flex-1">
                 {questions[currentIndex].options.map((opt, idx) => {
                    const isSelected = selectedAnswerIndices[currentIndex] === idx;
                    const hasAnswered = selectedAnswerIndices[currentIndex] !== undefined;
                    
                    let btnClass = "w-full text-left p-4 rounded-lg border transition-all duration-200 shadow-sm flex items-start gap-3 ";
                    
                    if (!hasAnswered) {
                      btnClass += "bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow";
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
                              <div className={`w-5 h-5 rounded-full border-2 ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`} />
                            )}
                         </div>
                         <span className={`text-base leading-relaxed ${hasAnswered && opt.isCorrect ? 'text-green-800 font-medium' : hasAnswered && isSelected && !opt.isCorrect ? 'text-red-800 font-medium' : 'text-gray-700'}`}>
                           {opt.text}
                         </span>
                      </button>
                    )
                 })}
               </div>

               {/* Navigation */}
               <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                 <button
                   onClick={() => setCurrentIndex(0)}
                   disabled={currentIndex === 0}
                   className="p-2 sm:px-4 sm:py-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 flex items-center"
                 >
                   <ChevronsLeft className="w-5 h-5 sm:mr-1" /> <span className="hidden sm:inline">Về đầu</span>
                 </button>
                 
                 <div className="flex items-center space-x-2 sm:space-x-4">
                   <button
                     onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
                     disabled={currentIndex === 0}
                     className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded shadow-sm disabled:opacity-50 disabled:shadow-none flex items-center font-medium"
                   >
                     <ChevronLeft className="w-5 h-5 mr-1" /> Trước
                   </button>
                   <button
                     onClick={() => setCurrentIndex(c => Math.min(questions.length - 1, c + 1))}
                     disabled={currentIndex === questions.length - 1}
                     className="px-4 py-2 bg-[#00529C] text-white hover:bg-blue-700 rounded shadow-sm disabled:opacity-50 disabled:shadow-none flex items-center font-medium"
                   >
                     Sau <ChevronRight className="w-5 h-5 ml-1" />
                   </button>
                 </div>

                 <button
                   onClick={() => setCurrentIndex(questions.length - 1)}
                   disabled={currentIndex === questions.length - 1}
                   className="p-2 sm:px-4 sm:py-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 flex items-center"
                 >
                   <span className="hidden sm:inline">Về cuối</span> <ChevronsRight className="w-5 h-5 sm:ml-1" />
                 </button>
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
