import React, { useState, useMemo, useEffect, useRef } from 'react';
import { narrators, hadiths } from './data';
import { BookOpen, User, Info, X, Search, Quote, Sparkles, Users, ChevronDown, Share2, Check, ArrowUp, BookMarked, Star, ExternalLink, SearchCheck, Copy, Moon, Sun, Heart, Github, Mail, RefreshCw } from 'lucide-react';
import { Narrator, Hadith } from './types';

// APP VERSION CONTROL
// تم رفع رقم الإصدار لإجبار المتصفح على جلب النسخة الجديدة
const APP_VERSION = '1.0.5'; 

const App: React.FC = () => {
  const [selectedNarratorId, setSelectedNarratorId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<Narrator | null>(null);
  const [isAllNarratorsModalOpen, setIsAllNarratorsModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  // Initialize System (Dark Mode, Bookmarks, Version Check)
  useEffect(() => {
    // 1. Check Version for Auto-Update
    const storedVersion = localStorage.getItem('app_version');
    if (storedVersion !== APP_VERSION) {
      // If versions don't match, it means we have a new deployment
      console.log(`New version detected: ${APP_VERSION} (Old: ${storedVersion})`);
      
      // If it's the very first visit, just set the version
      if (!storedVersion) {
        localStorage.setItem('app_version', APP_VERSION);
      } else {
        // If it's an update, show the update notification or auto-reload
        setUpdateAvailable(true);
      }
    }

    // 2. Dark Mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // 3. Bookmarks
    const savedBookmarks = localStorage.getItem('bookmarkedHadiths');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error('Failed to parse bookmarks', e);
      }
    }
  }, []);

  // Apply Update Function
  const applyUpdate = () => {
    localStorage.setItem('app_version', APP_VERSION);
    
    // Clear all caches to ensure fresh files are loaded
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    
    // Unregister service workers just in case (Safely)
    if ('serviceWorker' in navigator) {
      try {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister().catch(() => {});
          }
        }).catch(() => {});
      } catch (e) {
        console.warn("SW unregister failed during update", e);
      }
    }

    // Force reload from server, ignoring cache
    window.location.reload();
  };

  // Handle Scroll Top Visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to content when narrator is selected
  useEffect(() => {
    if (selectedNarratorId && contentRef.current) {
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedNarratorId]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleBookmark = (id: number) => {
    const newBookmarks = bookmarks.includes(id)
      ? bookmarks.filter(bId => bId !== id)
      : [...bookmarks, id];
    
    setBookmarks(newBookmarks);
    localStorage.setItem('bookmarkedHadiths', JSON.stringify(newBookmarks));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter hadiths
  const filteredHadiths = useMemo(() => {
    return hadiths.filter((hadith) => {
      const matchesNarrator = selectedNarratorId ? hadith.narratorId === selectedNarratorId : true;
      const matchesSearch = searchQuery === '' || 
        hadith.text.includes(searchQuery) || 
        hadith.id.toString().includes(searchQuery);
      const matchesBookmark = showBookmarksOnly ? bookmarks.includes(hadith.id) : true;
      
      return matchesNarrator && matchesSearch && matchesBookmark;
    });
  }, [selectedNarratorId, searchQuery, bookmarks, showBookmarksOnly]);

  // Get current narrator details if selected
  const currentNarrator = useMemo(() => {
    return narrators.find((n) => n.id === selectedNarratorId);
  }, [selectedNarratorId]);

  const openBioModal = (narrator: Narrator) => {
    setModalContent(narrator);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  return (
    <div className="min-h-screen font-sans flex flex-col bg-[#faf9f6] dark:bg-slate-950 transition-colors duration-300">
      
      {/* Update Notification Banner */}
      {updateAvailable && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white p-3 shadow-lg animate-in slide-in-from-top-full duration-500">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
            <div className="flex items-center gap-2">
               <div className="bg-white/20 p-1 rounded-full">
                 <Sparkles className="w-4 h-4" />
               </div>
               <span className="text-sm font-bold">
                 إصدار جديد متاح ({APP_VERSION})
               </span>
            </div>
            <button 
              onClick={applyUpdate}
              className="bg-white text-amber-600 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-amber-50 transition-all shadow-sm flex items-center gap-2 active:scale-95"
            >
              <RefreshCw className="w-3 h-3" />
              تحديث الآن
            </button>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <header className={`relative bg-[#064e3b] dark:bg-emerald-950 text-white overflow-hidden transition-all duration-500 shadow-xl ${updateAvailable ? 'mt-12' : ''}`}>
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-900/50 to-emerald-950/90 z-0"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-6 pb-16 md:pt-10 md:pb-20">
          
          {/* Top Bar Icons */}
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowVerification(!showVerification)}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 border ${showVerification ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/30' : 'bg-white/10 border-white/10 text-emerald-50 hover:bg-white/20'}`}
                >
                  <SearchCheck className={`w-5 h-5 ${showVerification ? 'animate-pulse' : ''}`} />
                  <span className="text-sm font-bold hidden md:block">التحقق من الحديث</span>
                </button>

                <button 
                  onClick={() => setIsAboutModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-800/50 hover:bg-emerald-800/70 text-emerald-50 border border-emerald-700/50 transition-all"
                >
                  <Info className="w-5 h-5" />
                  <span className="text-sm font-bold hidden md:block">عن الموقع</span>
                </button>
             </div>
             
             <div className="flex items-center gap-3">
               <button 
                 onClick={toggleTheme}
                 className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-emerald-100 transition-all backdrop-blur-sm border border-white/10"
                 title={darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
               >
                 {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
               </button>
               <div className="text-emerald-200/50 hidden md:block">
                  <Sparkles className="w-6 h-6" />
               </div>
             </div>
          </div>

          <div className="flex flex-col items-center text-center space-y-6">
            <div className="inline-flex items-center justify-center p-4 bg-emerald-800/40 dark:bg-emerald-900/40 rounded-full border border-emerald-700/50 backdrop-blur-sm shadow-xl mb-2 animate-in fade-in zoom-in duration-700">
               <BookMarked className="w-10 h-10 text-amber-400" />
            </div>
            
            <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-700 delay-100">
              <h1 className="text-3xl md:text-5xl font-extrabold font-cairo tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-50 via-white to-emerald-100 drop-shadow-sm">
                موسوعة الحديث النبوي
              </h1>
              <p className="text-emerald-200/90 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                 حفظ ٢٥٠ حديثاً من أحاديث المصطفى ﷺ
                 <span className="block text-sm mt-2 text-emerald-400/80 font-normal">تاج السنة</span>
              </p>
            </div>

            {/* Search Bar - Floating */}
            <div className="w-full max-w-2xl mt-8 relative group animate-in slide-in-from-bottom-8 duration-700 delay-200">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-200"></div>
              <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-2xl">
                <div className="pl-4 pr-6 py-4 pointer-events-none">
                   <Search className="w-6 h-6 text-emerald-200/70" />
                </div>
                <input 
                  type="text" 
                  placeholder="ابحث في الأحاديث، الرواة، أو الأرقام..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-4 bg-transparent text-white placeholder-emerald-200/50 focus:outline-none text-lg font-medium"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute left-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Bottom Curve */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#faf9f6] dark:bg-slate-950 rounded-t-[50%] transform scale-x-150 translate-y-8 z-10 transition-colors duration-300"></div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 -mt-6 relative z-20 pb-20">
        
        {/* Verification Tool Section - Conditional Render */}
        <div className={`transition-all duration-700 ease-in-out overflow-hidden ${showVerification ? 'max-h-[1000px] opacity-100 mb-10' : 'max-h-0 opacity-0 mb-0'}`}>
          <div className={`bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 shadow-lg relative overflow-hidden group transform transition-transform duration-700 ${showVerification ? 'translate-y-0' : '-translate-y-12'}`}>
             <div className="absolute -right-10 -top-10 text-amber-100 dark:text-amber-900/20 opacity-50 group-hover:rotate-12 transition-transform duration-700">
                <Sparkles className="w-48 h-48" />
             </div>
             
             <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 justify-between">
                <div className="flex-1 space-y-4 w-full text-center lg:text-right">
                   <div className="flex items-center justify-center lg:justify-start gap-2 text-amber-800 dark:text-amber-400">
                      <SearchCheck className="w-6 h-6" />
                      <h3 className="text-xl font-bold">التحقق من صحة الحديث</h3>
                   </div>
                   <p className="text-amber-700/70 dark:text-amber-400/70 text-sm">تأكد من صحة الأحاديث قبل نشرها عبر محرك البحث المتخصص</p>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-amber-100 dark:border-amber-900/50 shadow-sm flex items-center justify-center gap-2">
                         <span className="text-green-600 text-lg">✅</span>
                         <span>أخضر: <span className="text-green-700 dark:text-green-400 font-bold">صحيح</span></span>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-amber-100 dark:border-amber-900/50 shadow-sm flex items-center justify-center gap-2">
                         <span className="text-slate-400 text-lg">🔲</span>
                         <span>رمادي: <span className="text-slate-600 dark:text-slate-400 font-bold">ضعيف</span></span>
                      </div>
                       <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-amber-100 dark:border-amber-900/50 shadow-sm flex items-center justify-center gap-2">
                         <span className="text-red-500 text-lg">🅾️</span>
                         <span>أحمر: <span className="text-red-700 dark:text-red-400 font-bold">لا يصح</span></span>
                      </div>
                   </div>
                </div>
                
                <a 
                  href="http://www.hdith.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full lg:w-auto flex-shrink-0 flex flex-col items-center gap-1 bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all transform hover:-translate-y-1"
                >
                   <div className="flex items-center gap-2 font-bold text-lg">
                      <span>أضغط هنا للتحقق</span>
                      <ExternalLink className="w-5 h-5" />
                   </div>
                   <span className="text-amber-100 text-xs">بكتابة الحديث أو جزء منه</span>
                </a>
             </div>
          </div>
        </div>

        {/* Controls & Stats Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 p-4 md:p-6 mb-10 flex flex-col lg:flex-row items-center justify-between gap-6 transition-colors duration-300">
           
           {/* Filter Dropdown */}
           <div className="w-full lg:w-1/3 relative">
             <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 block mr-1">تصفية حسب الراوي</label>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  value={selectedNarratorId || ""}
                  onChange={(e) => setSelectedNarratorId(e.target.value || null)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer hover:bg-white dark:hover:bg-slate-700 hover:shadow-md border"
                >
                  <option value="">جميع الرواة ({narrators.length})</option>
                  {narrators.map((narrator) => (
                    <option key={narrator.id} value={narrator.id}>
                      {narrator.name}
                    </option>
                  ))}
                </select>
             </div>
           </div>

           <div className="flex gap-3 w-full lg:w-auto">
             {/* Favorites Toggle */}
             <button 
                onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all border ${showBookmarksOnly ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                <Heart className={`w-5 h-5 ${showBookmarksOnly ? 'fill-current' : ''}`} />
                <span>المفضلة {bookmarks.length > 0 && `(${bookmarks.length})`}</span>
              </button>

             {/* Quick Action: View All Narrators */}
             <button 
                onClick={() => setIsAllNarratorsModalOpen(true)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 px-6 py-3.5 rounded-xl font-bold transition-all border border-emerald-100 dark:border-emerald-900 hover:border-emerald-200 group"
              >
                <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>فهرس الرواة</span>
              </button>
           </div>

            {/* Stats Display */}
           <div className="w-full lg:w-auto bg-slate-50 dark:bg-slate-800 rounded-xl p-3 md:px-6 border border-slate-100 dark:border-slate-700 flex items-center justify-center gap-3 transition-colors">
              <div className="text-center">
                <span className="block text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">{filteredHadiths.length}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">حديث</span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-600 mx-2"></div>
              <div className="text-right">
                 <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">من أصل</span>
                 <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{hadiths.length} حديث</span>
              </div>
           </div>
        </div>

        {/* Current Narrator Header (Conditional) */}
        {selectedNarratorId && currentNarrator && (
            <div 
              ref={contentRef}
              className="mb-8 bg-gradient-to-br from-emerald-900 to-emerald-800 dark:from-emerald-950 dark:to-emerald-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden scroll-mt-32 group animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:opacity-10 transition-opacity"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                   <div className="bg-emerald-700/50 p-4 rounded-2xl border border-emerald-600/30 backdrop-blur-sm">
                     <User className="w-8 h-8 text-emerald-100" />
                   </div>
                   <div>
                      <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium mb-1">
                        <span>راوي الحديث</span>
                        <div className="h-px w-8 bg-emerald-500/50"></div>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white">{currentNarrator.name}</h2>
                   </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={() => openBioModal(currentNarrator)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold backdrop-blur-sm border border-white/10 transition-all"
                  >
                    <Info className="w-5 h-5" />
                    <span>سيرته الذاتية</span>
                  </button>
                  <button
                    onClick={() => setSelectedNarratorId(null)}
                    className="flex items-center justify-center p-3 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-xl border border-red-500/30 transition-colors"
                    title="إلغاء التصفية"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Hadith Grid */}
        <section className="grid grid-cols-1 gap-8">
          {filteredHadiths.length > 0 ? (
            filteredHadiths.map((hadith) => (
              <HadithCard 
                key={hadith.id} 
                hadith={hadith} 
                isBookmarked={bookmarks.includes(hadith.id)}
                onBookmark={() => toggleBookmark(hadith.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 transition-colors">
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-full mb-4">
                <Search className="w-12 h-12 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-xl font-bold text-slate-600 dark:text-slate-400">لا توجد نتائج تطابق بحثك</p>
              <button 
                onClick={() => {
                  setSearchQuery(''); 
                  setSelectedNarratorId(null);
                  setShowBookmarksOnly(false);
                }} 
                className="mt-4 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                إعادة تعيين البحث
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Scroll To Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 p-4 bg-emerald-800 dark:bg-emerald-700 text-white rounded-full shadow-2xl transition-all duration-500 z-50 hover:bg-emerald-700 dark:hover:bg-emerald-600 hover:-translate-y-1 group ${
          showScrollTop ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-75 pointer-events-none'
        }`}
        aria-label="العودة للأعلى"
      >
        <ArrowUp className="w-6 h-6 group-hover:animate-bounce" />
      </button>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10 mt-auto transition-colors">
        <div className="max-w-6xl mx-auto text-center px-4 space-y-2">
           <div className="flex items-center justify-center gap-2 text-emerald-800/80 dark:text-emerald-400/80 mb-4">
             <Sparkles className="w-5 h-5" />
             <span className="font-cairo font-bold text-lg">تاج السنة</span>
             <Sparkles className="w-5 h-5" />
           </div>
           <p className="text-slate-500 dark:text-slate-400 text-sm">إعداد وتطوير / إيمان محمود</p>
           <p className="text-slate-400 dark:text-slate-600 text-xs">جميع الحقوق محفوظة &copy; {new Date().getFullYear()} | الإصدار {APP_VERSION}</p>
        </div>
      </footer>

      {/* Modals */}
      {isModalOpen && modalContent && (
        <Modal onClose={closeModal}>
           <div className="relative overflow-hidden bg-white dark:bg-slate-900 transition-colors">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-emerald-800 to-emerald-900 dark:from-emerald-900 dark:to-emerald-950"></div>
              <div className="relative px-8 pt-12 pb-6 flex flex-col items-center text-center">
                 <div className="bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-xl mb-4 relative z-10 transition-colors">
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-full">
                       <User className="w-12 h-12 text-emerald-700 dark:text-emerald-400" />
                    </div>
                 </div>
                 <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">{modalContent.name}</h3>
                 <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold rounded-full">
                    الترتيب في الكتاب: {modalContent.order}
                 </span>
              </div>
              
              <div className="px-8 pb-10">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 leading-loose text-lg text-slate-700 dark:text-slate-300 font-amiri text-justify transition-colors">
                   {modalContent.bio}
                </div>
              </div>
           </div>
        </Modal>
      )}

      {isAllNarratorsModalOpen && (
        <Modal onClose={() => setIsAllNarratorsModalOpen(false)} maxWidth="max-w-5xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10 transition-colors">
               <div className="flex items-center gap-3">
                 <div className="bg-emerald-100/50 dark:bg-emerald-900/30 p-2 rounded-lg">
                   <Users className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">فهرس الرواة</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{narrators.length} صحابي جليل</p>
                 </div>
               </div>
               <button 
                  onClick={() => setIsAllNarratorsModalOpen(false)}
                  className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 overflow-y-auto custom-scrollbar h-[70vh] transition-colors">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {narrators.map((narrator) => (
                  <div key={narrator.id} className="group bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                    
                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1" title={narrator.name}>{narrator.name}</h4>
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded-md min-w-[2rem] text-center">
                        {narrator.order}
                      </span>
                    </div>
                    
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 font-serif mb-4 flex-grow">
                      {narrator.bio}
                    </p>
                    
                    <button 
                      onClick={() => {
                        setIsAllNarratorsModalOpen(false);
                        setSelectedNarratorId(narrator.id);
                      }}
                      className="w-full mt-auto py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold rounded-lg hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
                    >
                      عرض الأحاديث
                    </button>
                  </div>
                ))}
              </div>
            </div>
        </Modal>
      )}

      {isAboutModalOpen && (
        <Modal onClose={() => setIsAboutModalOpen(false)}>
          <div className="relative overflow-hidden bg-white dark:bg-slate-900">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
            <div className="relative pt-12 px-6 pb-6 text-center">
              <div className="inline-flex items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-full shadow-xl mb-4 relative z-10">
                  <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">عن موسوعة تاج السنة</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">الإصدار {APP_VERSION}</p>
              
              <div className="space-y-4 text-right bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  تطبيق ويب إسلامي تفاعلي يهدف إلى نشر سنة النبي ﷺ من خلال عرض 250 حديثاً من الأحاديث الجامعة، مع ميزات تقنية متقدمة لتسهيل القراءة والحفظ والنشر.
                </p>
                
                <div>
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    مميزات التطبيق
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400 marker:text-emerald-500">
                    <li>تصفح الأحاديث حسب الراوي</li>
                    <li>بحث فوري في النصوص والأسانيد</li>
                    <li>التحقق من صحة الأحاديث (ربط خارجي)</li>
                    <li>نظام المفضلة وحفظ العلامات</li>
                    <li>مشاركة النصوص ونسخها بسهولة</li>
                    <li>دعم كامل للوضع الليلي</li>
                    <li>يدعم التثبيت كتطبيق (PWA)</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                 <p className="text-xs text-slate-400 mb-2">تم التطوير بواسطة</p>
                 <div className="font-bold text-slate-700 dark:text-slate-300">إيمان محمود</div>
                 <div className="flex justify-center gap-4 mt-4">
                    <a href="#" className="text-slate-400 hover:text-emerald-600 transition-colors"><Share2 className="w-5 h-5" /></a>
                    <a href="mailto:contact@example.com" className="text-slate-400 hover:text-emerald-600 transition-colors"><Mail className="w-5 h-5" /></a>
                 </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Reusable Modal Component
const Modal: React.FC<{ children: React.ReactNode, onClose: () => void, maxWidth?: string }> = ({ children, onClose, maxWidth = "max-w-xl" }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div 
        className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full ${maxWidth} overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};

// Improved Hadith Card Component
interface HadithCardProps {
  hadith: Hadith;
  isBookmarked: boolean;
  onBookmark: () => void;
}

const HadithCard: React.FC<HadithCardProps> = ({ hadith, isBookmarked, onBookmark }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const narrator = narrators.find(n => n.id === hadith.narratorId);
  const narratorName = narrator ? narrator.name : "راوي الحديث";

  const handleShare = async () => {
    const textToShare = `${hadith.text}\n\n${hadith.source}\nراوي الحديث: ${narratorName}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'حديث نبوي',
          text: textToShare,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    const textToShare = `${hadith.text}\n\n${hadith.source}\nراوي الحديث: ${narratorName}`;
    let success = false;

    const copyFallback = () => {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = textToShare;
        
        // Ensure textarea is part of the DOM but not visible to the user
        // Fixed position avoids scrolling issues on mobile
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.width = "2em";
        textArea.style.height = "2em";
        textArea.style.padding = "0";
        textArea.style.border = "none";
        textArea.style.outline = "none";
        textArea.style.boxShadow = "none";
        textArea.style.background = "transparent";
        textArea.setAttribute("readonly", ""); // Prevent keyboard from showing on mobile
        
        document.body.appendChild(textArea);
        textArea.select();
        textArea.setSelectionRange(0, 99999); // For mobile devices
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        console.error("Fallback copy failed:", err);
        return false;
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(textToShare);
        success = true;
      } catch (err) {
        console.warn("Clipboard API failed, trying fallback:", err);
        success = copyFallback();
      }
    } else {
      success = copyFallback();
    }

    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-emerald-400 dark:hover:border-emerald-600/50 transition-all duration-500 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-emerald-600 to-emerald-800 opacity-80"></div>
      <div className="absolute top-4 left-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Quote className="w-24 h-24 text-emerald-800 dark:text-emerald-400 transform -scale-x-100" />
      </div>

      <div className="p-6 md:p-8 card-pattern">
        {/* Card Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold text-lg shadow-sm">
               {hadith.id}
             </div>
             <div className="flex flex-col">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">عن الصحابي الجليل</span>
                <span className="text-slate-800 dark:text-slate-100 font-bold text-lg">{narratorName}</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             {/* Bookmark Button */}
             <button
                onClick={onBookmark}
                className={`p-2 rounded-xl transition-all duration-300 border ${
                  isBookmarked 
                    ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 border-rose-200 dark:border-rose-800' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:text-rose-500 hover:border-rose-300'
                }`}
                title={isBookmarked ? "إزالة من المفضلة" : "إضافة للمفضلة"}
             >
                <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
             </button>

             {/* Share Button */}
             <button 
               onClick={handleShare}
               className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300"
               title="مشاركة الحديث"
             >
               <Share2 className="w-4 h-4" />
               <span className="text-xs font-bold hidden sm:inline">مشاركة</span>
             </button>

             {/* Copy Button */}
             <div className="relative">
                <button 
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 border active:scale-95 ${
                    isCopied 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-300 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-700'
                  }`}
                  title="نسخ النص"
                >
                  {isCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="text-xs font-bold">تم النسخ</span>
                      </>
                  ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-xs font-bold hidden sm:inline">نسخ</span>
                      </>
                  )}
                </button>

                {/* Floating Tooltip */}
                <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-3 transition-all duration-500 ease-out z-20 pointer-events-none ${isCopied ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                  <div className="bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-1.5 relative after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-b-slate-800">
                      <span>تم النسخ بنجاح</span>
                      <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Hadith Text */}
        <div className="relative mb-8 px-2">
           {/* Right decorative bar */}
           <div className="absolute right-0 top-2 bottom-2 w-1 bg-emerald-500/20 dark:bg-emerald-500/40 rounded-full"></div>
           
           <p className="hadith-text text-2xl md:text-3xl text-slate-800 dark:text-slate-100 text-justify leading-loose pr-6 font-medium drop-shadow-sm transition-colors">
            {hadith.text}
          </p>
        </div>

        {/* Card Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 mt-4">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold transition-colors">
             <BookOpen className="w-4 h-4 text-amber-500" />
             <span>{hadith.source}</span>
          </div>
          
          <div className="flex items-center gap-1 text-emerald-600/80 dark:text-emerald-400/80 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
             <Star className="w-3 h-3 fill-current" />
             <span>صحيح</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;