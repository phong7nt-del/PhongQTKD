import React, { useState, useEffect } from 'react';
import { getAllEmployees, Employee } from '../lib/dataService';
import { Mail, Phone, Calendar, User as UserIcon, Loader2, ChevronRight, ChevronDown, List, Network, ZoomIn, ZoomOut, Maximize, MoveRight } from 'lucide-react';
import { Tree, TreeNode } from 'react-organizational-chart';

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
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [movingEmp, setMovingEmp] = useState<Employee | null>(null);

  useEffect(() => {
    getAllEmployees().then(data => {
      setEmployees(data);
      setLoading(false);
    });
  }, []);

  const handleMoveEmployee = async (empId: string, destNodeId: string, newPosition?: string) => {
    const empIndex = employees.findIndex(e => e.empId === empId);
    if (empIndex === -1) return;
    
    let targetDeptShort = '';
    let targetTeam = '';
    
    if (destNodeId.startsWith('dept-')) {
      targetDeptShort = destNodeId.replace('dept-', '');
    } else if (destNodeId.startsWith('team-')) {
      const parts = destNodeId.split('-');
      targetDeptShort = parts[1];
      targetTeam = parts.slice(2).join('-');
    } else if (destNodeId.startsWith('bgd-')) {
      targetDeptShort = 'BGĐ';
    } else {
      return; // Cannot move here
    }

    const emp = employees[empIndex];
    // Find full dept name
    const targetDeptEmp = employees.find(e => e.deptShort === targetDeptShort);
    const targetDeptName = targetDeptEmp ? targetDeptEmp.dept : targetDeptShort;
    const finalPosition = newPosition || emp.position;

    const newEmployees = [...employees];
    newEmployees[empIndex] = {
      ...emp,
      deptShort: targetDeptShort,
      dept: targetDeptName,
      team: targetTeam,
      position: finalPosition
    };
    
    setEmployees(newEmployees);
    setMovingEmp(null);

    // Call Google Apps Script API
    const scriptUrl = "https://script.google.com/macros/s/AKfycbwh7OrIri-9WwudwGYPxUN1JL50QXSFPgnXGkQRXXBCQcq8ZSgrmRIayK6LI5c-_RLIBA/exec";
    
    if (scriptUrl) {
      try {
        await fetch(scriptUrl, {
          method: 'POST',
          // Không thêm headers Content-Type: application/json để tránh lỗi CORS Preflight
          // Trình duyệt sẽ tự động gửi dưới dạng text/plain
          body: JSON.stringify({
            empId: emp.empId,
            deptShort: targetDeptShort,
            dept: targetDeptName,
            team: targetTeam,
            position: finalPosition
          })
        });
        console.log("Đã gửi yêu cầu cập nhật Google Sheet");
      } catch (err) {
        console.error("Lỗi cập nhật Google Sheet:", err);
        alert("Có lỗi xảy ra khi cập nhật về Google Sheet.");
      }
    }
  };

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
  const gdDepts = ['TCKT', 'VP', 'KHVT', 'TCNS', 'QLĐK', 'CĐ']; 
  const pgdKdDepts = ['KD', 'QLTG', 'DVKH', 'QLHTĐĐ'];
  const pgdKtDepts = ['KTAT', 'VHLĐ', 'QLLĐ'];
  const pgdDtxdDepts = ['QLĐT'];

  const sortEmployees = (arr: Employee[]) => {
    return [...arr].sort((a, b) => {
      const posA = (a.position || '').toLowerCase();
      const posB = (b.position || '').toLowerCase();
      
      const getScore = (pos: string) => {
        if (!pos) return 99;
        const ls = pos.toLowerCase();
        if (ls.includes('gđ') || ls.includes('giám đốc')) return 1;
        if (ls.includes('phó') && !ls.includes('tổ phó') && !ls.includes('đội phó')) return 3; // phó phòng, phó chánh, ...
        if (ls.includes('đội phó')) return 3;
        if (ls.includes('tổ phó')) return 5;
        if (ls.includes('trưởng phòng') || ls.includes('chánh') || ls.includes('đội trưởng') || ls === 'trưởng' || ls.includes('kế toán trưởng')) return 2;
        if (ls.includes('tổ trưởng')) return 4;
        if (ls.includes('trưởng') || ls.includes('phụ trách')) return 6;
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
      const sortedDeptEmployees = sortEmployees(deptEmployees);
      
      const isTopLevelLeader = (p: string) => {
        const ls = p.toLowerCase();
        if (ls.includes('phó')) return false;
        return ls.includes('trưởng phòng') || ls.includes('chánh') || ls.includes('đội trưởng') || ls === 'trưởng' || ls.includes('kế toán trưởng') || ls.includes('phụ trách');
      }

      const manager = sortedDeptEmployees.find(e => isTopLevelLeader(e.position || '')) || sortedDeptEmployees[0];
      const others = deptEmployees.filter(e => e.empId !== manager?.empId);

      const directStaff = others.filter(e => {
        const pos = (e.position || '').toLowerCase();
        return e.team === e.dept || e.team === '' || pos.includes('phó phòng') || pos.includes('phó chánh') || pos.includes('đội phó');
      });
      
      const directStaffIds = new Set(directStaff.map(e => e.empId));
      const teamEmployees = others.filter(e => !directStaffIds.has(e.empId));
      const teams = Array.from(new Set(teamEmployees.map(e => e.team)));

      const teamNodes: OrgNode[] = teams.map(tName => ({
        id: `team-${code}-${tName}`,
        name: tName,
        employees: sortEmployees(teamEmployees.filter(e => e.team === tName)),
        children: []
      }));

      return {
        id: `dept-${code}`,
        name: deptName,
        manager: manager,
        employees: sortEmployees(directStaff),
        children: teamNodes
      } as OrgNode;
    }).filter(Boolean) as OrgNode[];
  };

  const pgdNodes: OrgNode[] = [
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
  ].filter(n => n.manager !== undefined) as OrgNode[];

  const otherBgdNode: OrgNode[] = otherBgd.length > 0 ? [{
    id: 'bgd-other',
    name: 'Ban Giám Đốc Khác',
    employees: sortEmployees(otherBgd),
    children: []
  }] : [];

  const tree: OrgNode[] = [
    {
      id: 'bgd-gd',
      name: 'Giám đốc',
      manager: giamDoc,
      employees: [],
      children: [
        {
          id: 'bgd-khoi-gd',
          name: 'Các Phòng Trực Thuộc Giám Đốc',
          employees: [],
          children: getDeptTree(gdDepts)
        },
        ...pgdNodes,
        ...otherBgdNode
      ]
    }
  ];

  // Any unmapped departments
  const mappedDepts = new Set([...gdDepts, ...pgdKdDepts, ...pgdKtDepts, ...pgdDtxdDepts, 'BGĐ']);
  const unmappedEmployees = employees.filter(e => !mappedDepts.has(e.deptShort));
  if (unmappedEmployees.length > 0) {
    const unmappedDepts = Array.from(new Set(unmappedEmployees.map(e => e.deptShort)));
    tree[0].children.push({
      id: 'unmapped',
      name: 'Các Phòng/Đội Khác',
      employees: [],
      children: getDeptTree(unmappedDepts)
    });
  }

  // Gather nodes for move modal
  const allDestinations: {id: string, name: string}[] = [];
  const traverse = (n: OrgNode) => {
    if (n.id.startsWith('dept-') || n.id.startsWith('team-') || n.id.startsWith('bgd-')) {
      if (n.id !== 'bgd-khoi-gd') {
        allDestinations.push({ id: n.id, name: n.name });
      }
    }
    n.children.forEach(traverse);
  };
  tree.forEach(traverse);

  return (
    <div className="flex-1 w-full bg-slate-50 overflow-y-auto no-scrollbar p-3 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-8 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-blue-900 tracking-tight">SƠ ĐỒ TỔ CHỨC PCVT</h2>
            <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">Danh bạ & cây công tác quản trị</p>
          </div>
          <div className="flex bg-slate-200 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              Danh sách
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'tree' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Network className="w-4 h-4" />
              Sơ đồ cây
            </button>
          </div>
        </div>
        
        {viewMode === 'list' ? (
          <div className="space-y-6">
            {tree.map(node => (
              <OrgTreeNode key={node.id} node={node} level={0} defaultExpanded={true} onSelectEmployee={setMovingEmp} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
             <OrgChart employees={employees} tree={tree} onMove={handleMoveEmployee} onSelectEmployee={setMovingEmp} />
          </div>
        )}
      </div>

      {movingEmp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
              {movingEmp.avatarUrl ? (
                <img src={movingEmp.avatarUrl} alt={movingEmp.fullName} className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 pointer-events-none" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-200">
                  <UserIcon className="w-8 h-8 text-slate-400" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg text-slate-800">{movingEmp.fullName}</h3>
                <p className="text-sm text-slate-500">{movingEmp.position || 'Nhân viên'} • {movingEmp.dept}</p>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto">
              <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <MoveRight className="w-5 h-5 text-blue-500" />
                Chọn nơi chuyển đến
              </h4>
              <div className="space-y-2">
                {allDestinations.map(dest => (
                  <button
                    key={dest.id}
                    onClick={() => {
                      const newPos = prompt(`Nhập chức danh mới cho ${movingEmp.fullName} (Tại ${dest.name}):`, movingEmp.position || 'Nhân viên');
                      if (newPos !== null) {
                        handleMoveEmployee(movingEmp.empId, dest.id, newPos);
                      }
                    }}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <p className="font-medium text-slate-800">{dest.name}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">{dest.id.replace('dept-', '').replace('team-', '').replace('bgd-', '')}</p>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto">
              <button
                onClick={() => setMovingEmp(null)}
                className="w-full py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const EmployeeCard = ({ emp, isManager = false, onSelect, draggable, onDragStart }: { emp: Employee, isManager?: boolean, onSelect?: (emp: Employee) => void, draggable?: boolean, onDragStart?: (e: React.DragEvent) => void }) => {
  return (
    <div 
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={() => onSelect?.(emp)}
      className={`relative group flex flex-col items-center p-3 rounded-xl border transition-all hover:shadow-md cursor-pointer bg-white ${isManager ? 'border-blue-300 shadow-sm' : 'border-slate-200'} ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      {emp.avatarUrl ? (
        <img src={emp.avatarUrl} alt={emp.fullName} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 pointer-events-none" referrerPolicy="no-referrer" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200 pointer-events-none">
          <UserIcon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <div className="mt-2 text-center pointer-events-none">
        <p className={`font-bold text-sm ${isManager ? 'text-blue-800' : 'text-slate-800'}`}>{emp.fullName}</p>
        <p className="text-xs text-slate-500">{emp.empId}</p>
      </div>

      {/* Tooltip Popup */}
      <div className="absolute top-full mt-2 w-[280px] sm:w-[420px] bg-slate-800 text-white rounded-xl p-3 sm:p-4 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60] left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-solid border-b-slate-800 border-b-[8px] border-x-transparent border-x-[8px] border-t-0"></div>
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="shrink-0">
            {emp.avatarUrl ? (
              <img src={emp.avatarUrl} alt={emp.fullName} className="w-20 h-24 sm:w-32 sm:h-40 rounded-lg object-cover border border-slate-600 shadow-sm" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-20 h-24 sm:w-32 sm:h-40 rounded-lg bg-slate-700 flex items-center justify-center border border-slate-600 shadow-sm">
                <UserIcon className="w-8 h-8 sm:w-12 sm:h-12 text-slate-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 text-left pt-0.5">
            <p className="font-bold text-base sm:text-lg border-b border-slate-700 pb-1.5 mb-1.5 sm:mb-2 truncate" title={emp.fullName}>{emp.fullName}</p>
            <div className="space-y-1 sm:space-y-1.5 text-xs sm:text-sm text-slate-300">
              <p className="text-blue-300 font-semibold mb-0.5 uppercase text-[10px] sm:text-[11px] tracking-wider truncate">{emp.position || 'Nhân viên'}</p>
              <p><span className="font-semibold text-slate-400">Mã NV:</span> {emp.empId}</p>
              <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400"/> <span className="truncate">{emp.dob || '---'}</span></div>
              <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 shrink-0 text-slate-400"/> <span className="truncate">{emp.phone || '---'}</span></div>
              <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 shrink-0 text-slate-400"/> <span className="truncate">{emp.email || '---'}</span></div>
              <p className="pt-2 mt-2 border-t border-slate-700 text-yellow-300 font-medium leading-tight sm:leading-snug">{emp.dept}</p>
              {emp.team && emp.team !== emp.dept && <p className="text-slate-400 italic text-[11px] sm:text-[13px] leading-tight sm:leading-snug">{emp.team}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrgTreeNode = ({ node, level, defaultExpanded = false, onSelectEmployee }: { node: OrgNode, level: number, defaultExpanded?: boolean, onSelectEmployee?: (emp: Employee) => void }) => {
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
                {node.manager && <EmployeeCard emp={node.manager} isManager={true} onSelect={onSelectEmployee} />}
                {node.employees.map(emp => (
                  <EmployeeCard key={emp.empId} emp={emp} isManager={level > 1 && node.employees.length <= 3} onSelect={onSelectEmployee} />
                ))}
              </div>
            </div>
          )}

          {/* Children nodes */}
          {node.children.length > 0 && (
            <div className={`space-y-4 ${level === 0 ? 'pl-4 sm:pl-8 border-l-2 border-slate-100 ml-4' : 'pl-2'}`}>
              {node.children.map(child => (
                <OrgTreeNode key={child.id} node={child} level={level + 1} onSelectEmployee={onSelectEmployee} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StyledNode = ({ title, employees, manager, nodeId, onMove, onSelectEmployee }: { title: string, employees: Employee[], manager?: Employee, nodeId: string, onMove?: (empId: string, destId: string, newPos?: string) => void, onSelectEmployee?: (emp: Employee) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const rep = manager || (employees.length > 0 ? employees[0] : undefined);
  const remainingStaff = manager ? employees : (employees.length > 0 ? employees.slice(1) : []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const empId = e.dataTransfer.getData('empId');
    if (empId && onMove) {
      // NOTE: Moving down a few levels, the prompt call is handled by the parent Tree so it knows the employee.
      // But we can trigger it here if we pass a callback, wait, parent passes `onMove` that takes 3 args.
      // But we don't have the employee object here exactly. Let's just pass null for newPos, and parent will handle it if needed?
      // Wait, we need to prompt for position. If we just call onMove, parent DirectoryScreen handles the rest? No, DirectoryScreen's handleMoveEmployee takes 3 args.
      // We can just call onMove(empId, nodeId) and let parent handle the prompt. 
      onMove(empId, nodeId);
    }
  };

  return (
    <div 
      className="inline-flex flex-col items-center mx-1 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`bg-slate-50 border-t-4 ${isDragOver ? 'border-t-green-500 bg-green-50 scale-105' : 'border-t-blue-500'} border border-slate-200 rounded-xl p-2 min-w-[160px] max-w-[240px] shadow-sm mb-1 hover:shadow-md transition-all duration-200 group/node`}>
        <h4 className="font-bold text-xs text-slate-800 border-b border-slate-200 pb-1.5 mb-2 whitespace-normal break-words">{title}</h4>
        {rep && (
          <div className="flex flex-col items-center mb-2">
             <EmployeeCard 
                emp={rep} 
                isManager={true} 
                draggable={true} 
                onDragStart={(e) => { e.dataTransfer.setData('empId', rep.empId); e.stopPropagation(); }} 
                onSelect={onSelectEmployee}
             />
          </div>
        )}
        {remainingStaff.length > 0 && (
          <div className="mt-1 w-full flex flex-col items-center">
            <button 
              onClick={() => setExpanded(!expanded)}
              className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 w-full"
            >
              {expanded ? 'Thu gọn' : `Xem thêm (${remainingStaff.length})`}
              {expanded ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
            </button>
            
            {expanded && (
              <div className="flex flex-wrap justify-center gap-1 mt-2 pt-2 border-t border-slate-200">
                {remainingStaff.map(e => (
                  <EmployeeCard 
                    key={e.empId} 
                    emp={e} 
                    draggable={true} 
                    onDragStart={(evt) => { evt.dataTransfer.setData('empId', e.empId); evt.stopPropagation(); }} 
                    onSelect={onSelectEmployee}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        {isDragOver && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-lg z-50 animate-bounce pointer-events-none whitespace-nowrap">
            Thả để chuyển
          </div>
        )}
      </div>
    </div>
  );
};

const OrgTreeNodeComponent = ({ node, level = 0, onMove, onSelectEmployee }: { node: OrgNode, level?: number, onMove?: (empId: string, destId: string) => void, onSelectEmployee?: (emp: Employee) => void }) => {
  // Hide teams (children of departments) by default
  const [showChildren, setShowChildren] = useState(level < 1 || !node.id.startsWith('dept-'));

  if (node.id === 'bgd-khoi-gd') {
    return (
      <TreeNode 
        key={node.id} 
        label={<div className="w-0 h-0" />}
      >
        {node.children.length > 0 && node.children.map(child => (
          <OrgTreeNodeComponent key={child.id} node={child} level={level + 1} onMove={onMove} onSelectEmployee={onSelectEmployee} />
        ))}
      </TreeNode>
    );
  }

  return (
    <TreeNode 
      key={node.id} 
      label={
        <div className="flex flex-col items-center">
          <StyledNode title={node.name} manager={node.manager} employees={node.employees} nodeId={node.id} onMove={onMove} onSelectEmployee={onSelectEmployee} />
          {node.children.length > 0 && (
            <button 
              onClick={() => setShowChildren(!showChildren)}
              className={`mt-1 mb-2 text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full shadow-sm transition-colors z-10 relative ${showChildren ? 'bg-slate-400 hover:bg-slate-500' : 'bg-blue-500 hover:bg-blue-600'} flex items-center gap-1`}
            >
              {showChildren ? 'Ẩn cấp dưới' : `Hiện cấp dưới (${node.children.length})`}
              {showChildren ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}
        </div>
      }
    >
      {showChildren && node.children.length > 0 && node.children.map(child => (
        <OrgTreeNodeComponent key={child.id} node={child} level={level + 1} onMove={onMove} onSelectEmployee={onSelectEmployee} />
      ))}
    </TreeNode>
  );
};

const OrgChart = ({ tree, employees, onMove, onSelectEmployee }: { tree: OrgNode[], employees: Employee[], onMove?: (empId: string, destId: string, pos?: string) => void, onSelectEmployee?: (emp: Employee) => void }) => {
  const [zoom, setZoom] = useState(1);

  // We wrap the onMove callback to prompt for the position if dragged and dropped successfully
  const handleDropWithPrompt = (empId: string, destId: string) => {
    const movingEmp = employees.find(e => e.empId === empId);
    if (!movingEmp) return;
    const newPos = prompt(`Nhập chức danh mới cho nhân sự ${movingEmp.fullName}:`, movingEmp.position || 'Nhân viên');
    if (newPos !== null) {
      onMove?.(empId, destId, newPos);
    }
  };

  return (
    <div className="relative w-full h-[70vh] sm:h-[600px] flex flex-col">
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-slate-200 flex items-center gap-1 z-50 p-1">
        <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Thu nhỏ"><ZoomOut className="w-4 h-4"/></button>
        <span className="text-xs font-medium text-slate-600 w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Phóng to"><ZoomIn className="w-4 h-4"/></button>
        <button onClick={() => setZoom(1)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Khôi phục"><Maximize className="w-4 h-4"/></button>
      </div>

      <div 
        className={`flex-1 overflow-auto no-scrollbar relative w-full h-full cursor-grab active:cursor-grabbing`}
      >
        <div 
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }} 
          className="min-w-max p-8 pb-[300px] transition-transform duration-200 ease-out origin-top flex justify-center"
        >
          <Tree
            lineWidth={'2px'}
            lineColor={'#cbd5e1'}
            lineBorderRadius={'10px'}
            label={
              <div 
                className="inline-flex flex-col items-center mb-4"
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const empId = e.dataTransfer.getData('empId');
                  if (empId) handleDropWithPrompt(empId, 'bgd-gd');
                }}
              >
                <div className="bg-blue-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md border-2 border-blue-700 uppercase tracking-widest text-center">
                  Công ty
                  <br/>
                  Điện lực Vũng Tàu
                </div>
              </div>
            }
          >
            {tree.map(node => <OrgTreeNodeComponent key={node.id} node={node} level={0} onMove={handleDropWithPrompt} onSelectEmployee={onSelectEmployee} />)}
          </Tree>
        </div>
      </div>
    </div>
  );
};
