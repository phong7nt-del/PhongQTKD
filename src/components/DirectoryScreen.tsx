import React, { useState, useEffect } from 'react';
import { getAllEmployees, Employee } from '../lib/dataService';
import { Mail, Phone, Calendar, User as UserIcon, Loader2, ChevronRight, ChevronDown } from 'lucide-react';

interface OrgNode {
  id: string;
  name: string;
  manager?: Employee;
  employees: Employee[];
  children: OrgNode[];
}

export function DirectoryScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllEmployees().then(data => {
      setEmployees(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Đang tải danh bạ...</p>
      </div>
    );
  }

  // --- BUILD THE TREE ---
  const bgd = employees.filter(e => e.deptShort === 'BGĐ');

  const giamDoc = bgd.find(e => e.empId === '002113');
  const pgdKd = bgd.find(e => e.empId === '012219');
  const pgdKt = bgd.find(e => e.empId === '011903');
  const pgdDtxd = bgd.find(e => e.empId === '004123');
  
  // Also collect any other BGD members if there are any
  const otherBgd = bgd.filter(e => !['002113', '011903', '004123', '012219'].includes(e.empId));

  // Map of which deptShort goes to which director
  const gdDepts = ['TCKT', 'VP', 'KHVT', 'TCNS']; 
  const pgdKdDepts = ['KD', 'QLTG', 'DVKH', 'QLHTĐĐ', 'QLĐK'];
  const pgdKtDepts = ['KTAT', 'VHLĐ', 'QLLĐ'];
  const pgdDtxdDepts = ['QLĐT'];

  const sortEmployees = (arr: Employee[]) => {
    return [...arr].sort((a, b) => {
      const posA = (a.position || '').toLowerCase();
      const posB = (b.position || '').toLowerCase();
      
      const getScore = (pos: string) => {
        if (!pos) return 99;
        if (pos.includes('gđ') || pos.includes('giám đốc')) return 1;
        if (pos.includes('trưởng phòng') || pos.includes('chánh') || pos.includes('đội trưởng') || pos === 'trưởng') return 2;
        if (pos.includes('phó phòng') || pos.includes('phó chánh') || pos.includes('đội phó') || pos === 'phó') return 3;
        if (pos.includes('tổ trưởng')) return 4;
        if (pos.includes('tổ phó')) return 5;
        if (pos.includes('trưởng') || pos.includes('phụ trách')) return 6;
        if (pos.includes('phó')) return 7;
        return 10;
      };
      
      return getScore(posA) - getScore(posB);
    });
  };

  const getDeptTree = (deptShorts: string[]) => {
    return deptShorts.map(code => {
      const deptEmployees = employees.filter(e => e.deptShort === code);
      if (deptEmployees.length === 0) return null;
      
      const deptName = deptEmployees[0].dept;
      // Trưởng/Phó and direct dept employees
      const leaders = sortEmployees(deptEmployees.filter(e => e.team === e.dept || e.team === ''));
      const teams = Array.from(new Set(deptEmployees.filter(e => e.team !== e.dept && e.team !== '').map(e => e.team)));
      
      const teamNodes: OrgNode[] = teams.map(tName => ({
        id: `team-${code}-${tName}`,
        name: tName,
        employees: sortEmployees(deptEmployees.filter(e => e.team === tName)),
        children: []
      }));

      return {
        id: `dept-${code}`,
        name: deptName,
        employees: leaders,
        children: teamNodes
      } as OrgNode;
    }).filter(Boolean) as OrgNode[];
  };

  const tree: OrgNode[] = [
    {
      id: 'bgd-gd',
      name: 'Giám đốc',
      manager: giamDoc,
      employees: [],
      children: getDeptTree(gdDepts)
    },
    {
      id: 'bgd-pgdkd',
      name: 'Phó Giám đốc Kinh doanh',
      manager: pgdKd,
      employees: [],
      children: getDeptTree(pgdKdDepts)
    },
    {
      id: 'bgd-pgdkt',
      name: 'Phó Giám đốc Kỹ thuật',
      manager: pgdKt,
      employees: [],
      children: getDeptTree(pgdKtDepts)
    },
    {
      id: 'bgd-pgddtxd',
      name: 'Phó Giám đốc ĐTXD',
      manager: pgdDtxd,
      employees: [],
      children: getDeptTree(pgdDtxdDepts)
    }
  ];

  if (otherBgd.length > 0) {
    tree.unshift({
      id: 'bgd-other',
      name: 'Ban Giám Đốc Khác',
      employees: sortEmployees(otherBgd),
      children: []
    });
  }

  // Any unmapped departments
  const mappedDepts = new Set([...gdDepts, ...pgdKdDepts, ...pgdKtDepts, ...pgdDtxdDepts, 'BGĐ']);
  const unmappedEmployees = employees.filter(e => !mappedDepts.has(e.deptShort));
  if (unmappedEmployees.length > 0) {
    const unmappedDepts = Array.from(new Set(unmappedEmployees.map(e => e.deptShort)));
    tree.push({
      id: 'unmapped',
      name: 'Các Phòng/Đội Khác',
      employees: [],
      children: getDeptTree(unmappedDepts)
    });
  }

  return (
    <div className="flex-1 w-full bg-slate-50 overflow-y-auto no-scrollbar p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-blue-900 tracking-tight">SƠ ĐỒ TỔ CHỨC PCVT</h2>
          <p className="text-slate-500 mt-2">Danh bạ & cây công tác quản trị</p>
        </div>
        
        <div className="space-y-6">
          {tree.map(node => (
            <OrgTreeNode key={node.id} node={node} level={0} defaultExpanded={true} />
          ))}
        </div>
      </div>
    </div>
  );
}

const EmployeeCard = ({ emp, isManager = false }: { emp: Employee, isManager?: boolean }) => {
  return (
    <div className={`relative group flex flex-col items-center p-3 rounded-xl border transition-all hover:shadow-md cursor-pointer bg-white ${isManager ? 'border-blue-300 shadow-sm' : 'border-slate-200'}`}>
      {emp.avatarUrl ? (
        <img src={emp.avatarUrl} alt={emp.fullName} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100" referrerPolicy="no-referrer" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
          <UserIcon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <div className="mt-2 text-center">
        <p className={`font-bold text-sm ${isManager ? 'text-blue-800' : 'text-slate-800'}`}>{emp.fullName}</p>
        <p className="text-xs text-slate-500">{emp.empId}</p>
      </div>

      {/* Tooltip Popup */}
      <div className="absolute top-full mt-2 w-[420px] bg-slate-800 text-white rounded-xl p-4 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-solid border-b-slate-800 border-b-[8px] border-x-transparent border-x-[8px] border-t-0"></div>
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            {emp.avatarUrl ? (
              <img src={emp.avatarUrl} alt={emp.fullName} className="w-32 h-40 rounded-lg object-cover border border-slate-600 shadow-sm" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-32 h-40 rounded-lg bg-slate-700 flex items-center justify-center border border-slate-600 shadow-sm">
                <UserIcon className="w-12 h-12 text-slate-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 text-left pt-0.5">
            <p className="font-bold text-lg border-b border-slate-700 pb-1.5 mb-2 truncate" title={emp.fullName}>{emp.fullName}</p>
            <div className="space-y-1.5 text-sm text-slate-300">
              <p className="text-blue-300 font-semibold mb-0.5 uppercase text-[11px] tracking-wider truncate">{emp.position || 'Nhân viên'}</p>
              <p><span className="font-semibold text-slate-400">Mã NV:</span> {emp.empId}</p>
              <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400"/> <span className="truncate">{emp.dob || '---'}</span></div>
              <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 shrink-0 text-slate-400"/> <span className="truncate">{emp.phone || '---'}</span></div>
              <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 shrink-0 text-slate-400"/> <span className="truncate">{emp.email || '---'}</span></div>
              <p className="pt-2 mt-2 border-t border-slate-700 text-yellow-300 font-medium leading-snug">{emp.dept}</p>
              {emp.team && emp.team !== emp.dept && <p className="text-slate-400 italic text-[13px] leading-snug">{emp.team}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrgTreeNode = ({ node, level, defaultExpanded = false }: { node: OrgNode, level: number, defaultExpanded?: boolean }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasContent = node.employees.length > 0 || (node.manager !== undefined) || node.children.length > 0;
  
  if (!hasContent) return null;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${level === 0 ? 'border-blue-100' : 'border-slate-100 mt-4'}`}>
      {/* Header */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between p-4 focus:outline-none transition-colors ${level === 0 ? 'bg-blue-50/50 hover:bg-blue-50' : 'bg-slate-50/50 hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
          <h3 className={`font-bold ${level === 0 ? 'text-lg text-blue-900' : 'text-base text-slate-800'}`}>
            {node.name}
          </h3>
        </div>
        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-600">
          {(node.manager ? 1 : 0) + node.employees.length + node.children.reduce((acc, c) => acc + c.employees.length + (c.manager ? 1 : 0) + c.children.reduce((a, cc) => a + cc.employees.length, 0), 0)} người
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <div className="p-4 border-t border-slate-100">
          {/* Managers / Direct Employees */}
          {(node.manager || node.employees.length > 0) && (
            <div className="mb-6">
              <h4 className="text-xs uppercase font-bold text-slate-400 mb-3 tracking-widest pl-2">Nhân sự trực thuộc</h4>
              <div className="flex flex-wrap gap-4 pl-2">
                {node.manager && <EmployeeCard emp={node.manager} isManager={true} />}
                {node.employees.map(emp => (
                  <EmployeeCard key={emp.empId} emp={emp} isManager={level > 1 && node.employees.length <= 3} />
                ))}
              </div>
            </div>
          )}

          {/* Children nodes */}
          {node.children.length > 0 && (
            <div className={`space-y-4 ${level === 0 ? 'pl-4 sm:pl-8 border-l-2 border-slate-100 ml-4' : 'pl-2'}`}>
              {node.children.map(child => (
                <OrgTreeNode key={child.id} node={child} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
