import Papa from 'papaparse';

const SHEET_ID = '1rBDulqRygG5ss_4OgASCZ82W88CrF3GsI1Ysj6EUA2w';

export interface SubjectMap {
  [teamName: string]: string[];
}

export interface Question {
  id: string;
  text: string;
  options: Answer[];
}

export interface Answer {
  text: string;
  isCorrect: boolean;
}

export async function fetchCsv(sheetName: string): Promise<string> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=0&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sheet ${sheetName}`);
  return await res.text();
}

export async function getStructure() {
  const csv = await fetchCsv('cơ cấu');
  const parsed = Papa.parse<string[]>(csv);
  const data = parsed.data;
  
  const headers = data[1];
  
  const subjectsList: string[] = [];
  const subjectColIndices: number[] = [];
  
  for (let i = 1; i < headers.length; i++) {
    const h = headers[i]?.replace(/\n/g, ' ').trim();
    if (h) {
      subjectsList.push(h);
      subjectColIndices.push(i);
    }
  }

  const teams: string[] = [];
  const teamSubjectMap: SubjectMap = {};
  
  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;
    const teamName = row[0].trim();
    
    let hasSubject = false;
    const assignedSubjects: string[] = [];
    
    subjectsList.forEach((subj, idx) => {
      const colIndex = subjectColIndices[idx];
      const val = row[colIndex]?.replace(/\s/g, '').toUpperCase(); 
      if (val === 'X') {
         hasSubject = true;
         assignedSubjects.push(subj);
      }
    });

    if (hasSubject) {
      teams.push(teamName);
      teamSubjectMap[teamName] = assignedSubjects;
    }
  }
  
  const allSheets = [
    "Các dịch vụ điện",
    "Chăm sóc KH",
    "Lập hóa đơn",
    "Thu ngân",
    "Ghi điện - Đo xa",
    "HT đo đếm",
    "Kiểm tra",
    "Tổn thất &HSKV",
    "Tiết kiệm điện &NLTT",
    "Giá điện",
    "Thị trường điện &DPPA",
    "VHDN",
    "ATTT"
  ];
  
  const fuzzyMatchSheetName = (text: string) => {
    return allSheets.find(s => s.toLowerCase().replace(/\s/g, '') === text.toLowerCase().replace(/\s/g, '')) || text;
  }
  
  const finalSubjects = subjectsList.map(fuzzyMatchSheetName);
  
  const mapping: SubjectMap = {};
  for(const team of teams) {
    mapping[team] = teamSubjectMap[team].map(fuzzyMatchSheetName);
  }

  return { subjects: finalSubjects, teams, teamSubjectMap: mapping };
}

export async function getQuestions(sheetName: string): Promise<Question[]> {
  const csv = await fetchCsv(sheetName);
  const parsed = Papa.parse<string[]>(csv);
  const data = parsed.data;
  
  if (!data || data.length === 0) return [];

  const headerRow = data[0].map(h => h?.trim().toUpperCase() || '');
    
  let typeCol = headerRow.findIndex(h => h.includes('PHÂN LOẠI'));
  let textCol = headerRow.findIndex(h => h.includes('CÂU HỎI'));
  let ansCol = headerRow.findIndex(h => h.includes('ĐÁP ÁN'));

  // Fallbacks if header is unexpectedly empty or not found
  if (typeCol === -1) typeCol = 1;
  if (textCol === -1) textCol = 2;
  if (ansCol === -1) ansCol = 3;
  
  const questions: Question[] = [];
  let currentQuestion: Question | null = null;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length <= typeCol) continue;
    
    const type = row[typeCol]?.trim().toUpperCase();
    const text = row[textCol]?.trim();
    // In google sheets some marks may be "x" or with spaces
    const isCorrect = row[ansCol]?.trim().toUpperCase() === 'X';
    
    if (type === 'Q') {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        id: row[0]?.trim() || `q-${i}`,
        text: text,
        options: []
      };
    } else if (type === 'A') {
      if (currentQuestion && text) {
        currentQuestion.options.push({
          text: text,
          isCorrect: isCorrect
        });
      }
    }
  }
  
  if (currentQuestion) {
    questions.push(currentQuestion);
  }
  
  return questions;
}
