import React, { useState } from 'react';
import { 
  FileCode, 
  Folder, 
  FolderOpen, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Layers, 
  Play, 
  Sparkles, 
  Database, 
  Lock, 
  FileText,
  Code2,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CSHARP_FILES } from '../data/csharpCode';
import { CSharpSourceFile } from '../types';

export const CSharpSolutionView: React.FC = () => {
  const { language, apiLogs, clearApiLogs, currency, summary, showNotification } = useApp();

  const [selectedFile, setSelectedFile] = useState<CSharpSourceFile>(CSHARP_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'api_debugger' | 'architecture'>('code');

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    showNotification(language === 'az' ? 'Kod buferə kopyalandı!' : 'Code copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (file: CSharpSourceFile) => {
    const element = document.createElement('a');
    const blob = new Blob([file.code], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(blob);
    element.download = file.fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showNotification(
      language === 'az' ? `"${file.fileName}" uğurla endirildi` : `Downloaded "${file.fileName}"`,
      'success'
    );
  };

  const handleDownloadAll = () => {
    CSHARP_FILES.forEach((file, index) => {
      setTimeout(() => {
        handleDownloadFile(file);
      }, index * 200);
    });
    showNotification(
      language === 'az' ? 'Bütün C# faylları endirilir...' : 'Downloading all C# files...',
      'info'
    );
  };

  // Group files by folder
  const groupedFiles = CSHARP_FILES.reduce((acc, file) => {
    if (!acc[file.folder]) acc[file.folder] = [];
    acc[file.folder].push(file);
    return acc;
  }, {} as Record<string, CSharpSourceFile[]>);

  return (
    <div className="space-y-6">
      
      {/* Solution Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-900/60 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/30 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/40 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                C# ASP.NET Core 8.0 Solution
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                Entity Framework Core 8
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {language === 'az' ? 'C# Web API Arxitekturası və Mənbə Kodu' : 'C# Web API Architecture & Solution'}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-2xl leading-relaxed">
              {language === 'az'
                ? 'İstifadəçi tələbinə əsasən ("c# ilə olsun"): Bütün tapşırığı (Task 3) təmin edən tam C# ASP.NET Core Web API layihəsi, Controller-lər, Entity Framework bazası və Swagger UI.'
                : 'Full production C# ASP.NET Core Web API backend implementing Task 3: RESTful Controllers, EF Core DbContext, JWT Auth, and LINQ queries.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'az' ? 'Bütün C# Layihəsini Endir' : 'Download Complete Solution'}</span>
            </button>
          </div>
        </div>

        {/* Inner Sub-navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 border-t border-indigo-900/60 pt-4">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'code' ? 'bg-white text-slate-900 shadow-sm' : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{language === 'az' ? 'Mənbə Kodları (Solution Explorer)' : 'Source Files'}</span>
          </button>

          <button
            onClick={() => setActiveTab('api_debugger')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'api_debugger' ? 'bg-white text-slate-900 shadow-sm' : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{language === 'az' ? 'Canlı C# API Test Qeydləri' : 'Live API Logs'}</span>
            {apiLogs.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'architecture' ? 'bg-white text-slate-900 shadow-sm' : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'az' ? 'Task 3 Addımları və C#' : 'Task 3 Mapping'}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Solution Explorer & Code View */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Solution File Tree (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Solution 'ExpenseTrackerApi' (8 files)
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(groupedFiles).map(([folderName, files]) => (
                <div key={folderName} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 px-2 py-1 bg-slate-50 rounded-lg">
                    <Folder className="w-3.5 h-3.5 text-slate-400" />
                    <span>{folderName}</span>
                  </div>

                  <div className="space-y-0.5 pl-3">
                    {files.map(file => {
                      const isSelected = selectedFile.id === file.id;
                      return (
                        <button
                          key={file.id}
                          onClick={() => setSelectedFile(file)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className="truncate">{file.fileName}</span>
                          </div>
                          {file.fileName.endsWith('.cs') && (
                            <span className="text-[10px] text-slate-400 font-mono">C#</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Run Box */}
            <div className="bg-slate-900 text-slate-300 p-3.5 rounded-xl text-xs font-mono space-y-1">
              <div className="text-emerald-400 font-bold flex items-center gap-1">
                <Play className="w-3 h-3" />
                CLI Run Command:
              </div>
              <div className="bg-slate-950 p-2 rounded text-indigo-200">
                dotnet restore && dotnet run
              </div>
            </div>
          </div>

          {/* Code Viewer (8 cols) */}
          <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
            
            {/* Viewer Top Bar */}
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="ml-2 font-mono text-xs text-indigo-200 font-bold">
                  {selectedFile.folder}/{selectedFile.fileName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  title="Copy code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (language === 'az' ? 'Kopyalandı' : 'Copied') : (language === 'az' ? 'Kopyala' : 'Copy')}</span>
                </button>

                <button
                  onClick={() => handleDownloadFile(selectedFile)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                  title="Download this file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'az' ? 'Faylı Endir' : 'Download'}</span>
                </button>
              </div>
            </div>

            {/* Description Subheader */}
            <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
              <span className="text-indigo-400 font-semibold">Təsvir:</span>
              <span>{language === 'az' ? selectedFile.descriptionAz : selectedFile.description}</span>
            </div>

            {/* Code Body */}
            <div className="p-4 overflow-x-auto max-h-[620px] font-mono text-xs leading-relaxed text-slate-200">
              <pre className="whitespace-pre">
                <code>{selectedFile.code}</code>
              </pre>
            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Live API Debugger & Logger */}
      {activeTab === 'api_debugger' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {language === 'az' ? 'C# ASP.NET Core Canlı API Sorğu və Cavab İzləyicisi' : 'Live C# ASP.NET Core API Call Stream'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'az' 
                  ? 'Veb interfeysdə etdiyiniz hər bir əməliyyat üçün C# Controller-in icra etdiyi kod və SQL sorğusu burada qeyd edilir.' 
                  : 'Real-time trace of API invocations, executing C# controller actions, and generated SQL.'}
              </p>
            </div>

            <button
              onClick={clearApiLogs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'az' ? 'Təmizlə' : 'Clear Logs'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {apiLogs.map(log => {
              const isPost = log.method === 'POST';
              const isPut = log.method === 'PUT';
              const isDelete = log.method === 'DELETE';
              const isGet = log.method === 'GET';

              const badgeColor = isPost 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                : isPut 
                ? 'bg-amber-100 text-amber-800 border-amber-300' 
                : isDelete 
                ? 'bg-rose-100 text-rose-800 border-rose-300' 
                : 'bg-blue-100 text-blue-800 border-blue-300';

              return (
                <div key={log.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[11px] border ${badgeColor}`}>
                        {log.method}
                      </span>
                      <span className="font-mono font-bold text-slate-800">{log.endpoint}</span>
                      <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">
                        Status: {log.responseStatus}
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{log.timestamp}</span>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="bg-slate-900 text-indigo-200 p-3 rounded-xl border border-slate-800">
                      <div className="text-emerald-400 font-bold mb-1">// Invoked C# Controller Action:</div>
                      <div className="text-slate-400">{log.csharpController}</div>
                      <div className="text-yellow-300 mt-1">{log.csharpMethod}</div>
                    </div>

                    <div className="bg-slate-900 text-slate-300 p-3 rounded-xl border border-slate-800">
                      <div className="text-cyan-400 font-bold mb-1">-- Entity Framework Generated SQL:</div>
                      <div className="text-slate-300 break-all">{log.sqlEquivalent}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Task 3 Requirements Mapping */}
      {activeTab === 'architecture' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-lg text-slate-900">
              Task 3: Workflow Mapping to C# ASP.NET Core
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Tapşırıq şəkildəki 5 addımın hər birinin C# backend və frontend-də necə icra edildiyi:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
                <span>Step 1: Design dashboard screens</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Balans, Gəlir, Xərc və Yığım faizi kartları, büdcə icrası və interaktiv Recharts qrafikləri. C#-da <code>ExpensesController.GetSummary()</code> ilə təchiz olunur.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                <span>Step 2: Create expense management APIs</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                <code>GET, POST, PUT, DELETE /api/expenses</code> CRUD əməliyyatları, parametrli axtarış, kateqoriya və tarix filtrasiyası.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">3</span>
                <span>Step 3: Store financial records in database</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Entity Framework Core 8 ilə <code>AppDbContext</code>, SQLite və SQL Server dəstəyi, indekslər, JSON idxal/ixrac və dayanıqlı yaddaş.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">4</span>
                <span>Step 4: Display reports and summaries</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                C# LINQ GroupBy ilə kateqoriya bölgüsü, maliyyə sağlamlıq balı, dinamik CSV ixrac və çap/PDF imkanı.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">5</span>
                <span>Step 5: Implement authentication</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                <code>AuthController</code>, SHA256 şifrələmə, JWT Bearer Token generasiyası və çoxistifadəçili izolyasiya.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
