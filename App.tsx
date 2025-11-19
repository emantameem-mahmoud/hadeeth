import React, { useState, useMemo, useEffect, useRef } from 'react';
import { narrators, hadiths } from './data';
import { BookOpen, User, Info, X, Search, Quote, Sparkles, Users, ChevronLeft, ChevronDown, Share2, Check, ArrowUp } from 'lucide-react';
import { Narrator, Hadith } from './types';

const App: React.FC = () => {
  const [selectedNarratorId, setSelectedNarratorId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<Narrator | null>(null);
  const [isAllNarratorsModalOpen, setIsAllNarratorsModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle scroll to top visibility
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
      // Small timeout to allow DOM update
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedNarratorId]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter hadiths based on selection AND search query
  const filteredHadiths = useMemo(() => {
    return hadiths.filter((hadith) => {
      const matchesNarrator = selectedNarratorId ? hadith.narratorId === selectedNarratorId : true;
      const matchesSearch = searchQuery === '' || 
        hadith.text.includes(searchQuery) || 
        hadith.id.toString().includes(searchQuery);
      
      return matchesNarrator && matchesSearch;
    });
  }, [selectedNarratorId, searchQuery]);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-800 to-emerald-600 text-white p-6 shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                 <BookOpen className="w-8 h-8 text-emerald-50" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-cairo">حفظ 250 حديث</h1>
                <p className="text-emerald-100 text-xs opacity-90 flex items-center gap-2">
                   <span>المستوى الثاني - تاج السنة</span>
                   <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                   <span>{hadiths.length} حديث متاح</span>
                </p>
              </div>
            </div>
            
            {/* Mobile "About Narrators" Button - Updated to show text as requested */}
             <button 
                onClick={() => setIsAllNarratorsModalOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5" />
                <span className="font-bold text-sm">عن الرواة</span>
              </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto items-center">
             {/* Desktop "About Narrators" Button */}
            <button 
              onClick={() => setIsAllNarratorsModalOpen(true)}
              className="hidden lg:flex items-center gap-2 bg-emerald-700/50 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl transition-colors border border-emerald-500/30 whitespace-nowrap"
            >
              <Users className="w-4 h-4" />
              <span>عن الرواة</span>
            </button>

            {/* Search Bar */}
            <div className="relative w-full md:w-80 lg:w-96">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="w-5 h-5 text-emerald-100" />
              </div>
              <input 
                type="text" 
                placeholder="ابحث عن حديث أو رقم..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2.5 pr-10 pl-10 bg-white/10 border border-emerald-400/30 rounded-xl text-white placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:bg-white/20 transition-all backdrop-blur-sm"
              />
              
              {/* Clear Button */}
              <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 flex-grow w-full">
        
        {/* Filter Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-700">
              <User className="w-5 h-5 text-emerald-600" />
              فرز حسب الراوي
            </h2>
            {selectedNarratorId && (
              <button 
                onClick={() => setSelectedNarratorId(null)}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                إلغاء التصفية
              </button>
            )}
          </div>
          
          <div className="relative w-full md:w-1/2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ChevronDown className="h-5 w-5 text-emerald-600" />
            </div>
            <select
              value={selectedNarratorId || ""}
              onChange={(e) => setSelectedNarratorId(e.target.value || null)}
              className="block w-full pl-10 pr-4 py-3 text-base border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl bg-white text-slate-700 shadow-sm appearance-none cursor-pointer hover:border-emerald-400 transition-colors font-medium"
            >
              <option value="">عرض جميع الرواة ({narrators.length})</option>
              {narrators.map((narrator) => (
                <option key={narrator.id} value={narrator.id}>
                  {narrator.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Narrator Info Banner - Added ref and scroll-margin for smooth scrolling */}
          {selectedNarratorId && currentNarrator && (
            <div 
              ref={contentRef}
              className="mt-4 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fade-in scroll-mt-32"
            >
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 p-3 rounded-full hidden sm:block">
                  <User className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <p className="text-emerald-900 font-bold text-lg">{currentNarrator.name}</p>
                  <p className="text-emerald-600 text-sm mt-1">
                    تم العثور على <span className="font-bold">{filteredHadiths.length}</span> حديث لهذا الراوي
                  </p>
                </div>
              </div>
              <button
                onClick={() => openBioModal(currentNarrator)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-emerald-200 shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
              >
                <Info className="w-4 h-4" />
                <span>تعريف بالراوي</span>
              </button>
            </div>
          )}
        </section>

        {/* Stats Bar */}
        <div className="mb-6 flex items-center gap-3 px-1 animate-fade-in">
           <span className="text-slate-500 text-sm font-bold whitespace-nowrap">
             عرض {filteredHadiths.length} من إجمالي {hadiths.length} حديث
           </span>
           <div className="h-1.5 flex-grow bg-slate-200 rounded-full overflow-hidden">
             <div 
               className="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-full" 
               style={{ width: `${Math.max(5, (filteredHadiths.length / hadiths.length) * 100)}%` }}
             />
           </div>
        </div>

        {/* Hadith Grid */}
        <section className="grid grid-cols-1 gap-6">
          {filteredHadiths.length > 0 ? (
            filteredHadiths.map((hadith) => (
              <HadithCard key={hadith.id} hadith={hadith} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="bg-slate-50 p-4 rounded-full mb-4">
                <Search className="w-10 h-10 opacity-40" />
              </div>
              <p className="text-lg font-medium">لا توجد نتائج تطابق بحثك</p>
              {selectedNarratorId && <p className="text-sm mt-2">حاول البحث في جميع الرواة</p>}
            </div>
          )}
        </section>
      </main>

      {/* Scroll To Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 p-3 bg-emerald-600 text-white rounded-full shadow-lg transition-all duration-300 z-40 hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-1 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="العودة للأعلى"
      >
        <ArrowUp className="w-6 h-6" />
      </button>

      <footer className="w-full py-8 mt-auto border-t border-emerald-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto text-center px-4">
           <p className="text-emerald-800 font-cairo font-bold text-lg">إعداد/ إيمان محمود</p>
        </div>
      </footer>

      {/* Single Narrator Bio Modal */}
      {isModalOpen && modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in zoom-in-95">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-emerald-700 p-6 flex justify-between items-start text-white relative overflow-hidden shrink-0">
              <div className="relative z-10">
                <span className="bg-emerald-600/50 text-emerald-50 text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block border border-emerald-500">
                  راوي الحديث
                </span>
                <h3 className="text-2xl font-bold flex items-center gap-2 mt-1">
                  {modalContent.name}
                </h3>
              </div>
              <Sparkles className="absolute top-[-20px] left-[-20px] w-32 h-32 text-emerald-600/20" />
              <button 
                onClick={closeModal}
                className="bg-emerald-800/50 hover:bg-emerald-600 p-2 rounded-full transition-colors backdrop-blur-md z-20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                 <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-lg">
                    <span className="text-amber-800 text-xs font-bold block">ترتيبه في الكتاب</span>
                    <span className="text-2xl font-bold text-amber-600">#{modalContent.order}</span>
                 </div>
              </div>
              
              <h4 className="text-slate-800 font-bold mb-3 text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-600" />
                نبذة تعريفية:
              </h4>
              <p className="text-slate-600 leading-loose text-lg text-justify font-serif bg-slate-50 p-5 rounded-2xl border border-slate-100">
                {modalContent.bio}
              </p>
            </div>
            <div className="bg-slate-50 p-4 flex justify-end border-t border-slate-100 shrink-0">
              <button
                onClick={closeModal}
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Narrators Modal */}
      {isAllNarratorsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in">
          <div className="bg-slate-50 rounded-3xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden">
            <div className="bg-white border-b border-slate-200 p-6 flex justify-between items-center sticky top-0 z-10 shadow-sm shrink-0">
               <div className="flex items-center gap-3">
                 <div className="bg-emerald-100 p-2 rounded-lg">
                   <Users className="w-6 h-6 text-emerald-700" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-slate-800">التعريف برواة الأحاديث</h3>
                    <p className="text-sm text-slate-500">تعرف على سير الصحابة الكرام رواة الأحاديث في هذا الكتاب ({narrators.length} راوٍ)</p>
                 </div>
               </div>
               <button 
                  onClick={() => setIsAllNarratorsModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-6">
              {narrators.map((narrator) => (
                <div key={narrator.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-50 text-emerald-700 text-sm font-bold px-3 py-1 rounded-lg border border-emerald-100">
                        {narrator.order}
                      </span>
                      <h4 className="font-bold text-lg text-slate-800">{narrator.name}</h4>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed text-justify font-serif flex-grow">
                    {narrator.bio}
                  </p>
                  <button 
                    onClick={() => {
                      setIsAllNarratorsModalOpen(false);
                      setSelectedNarratorId(narrator.id);
                    }}
                    className="mt-4 text-emerald-600 hover:text-emerald-700 text-sm font-semibold flex items-center gap-1 self-end"
                  >
                    عرض أحاديثه
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Extracted Card Component for cleaner code
const HadithCard: React.FC<{ hadith: Hadith }> = ({ hadith }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  // Helper to find the name safely
  const narrator = narrators.find(n => n.id === hadith.narratorId);
  const narratorName = narrator ? narrator.name : "راوي الحديث";

  const handleShare = () => {
    const textToShare = `${hadith.text}\n\n${hadith.source}\nراوي الحديث: ${narratorName}`;
    navigator.clipboard.writeText(textToShare).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-emerald-200 overflow-hidden hover:-translate-y-1">
      {/* Decorative Top Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
      
      <div className="p-6 pattern-bg">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
             <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 shadow-sm">
               حديث رقم {hadith.id}
             </span>
          </div>
          <div className="flex items-center gap-2">
             <button 
               onClick={handleShare}
               className={`p-2 rounded-full transition-all duration-300 ${isCopied ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
               title="نسخ الحديث"
               aria-label="نسخ الحديث"
             >
               {isCopied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
             </button>
             <div className="text-slate-400 group-hover:text-emerald-500 transition-colors">
               <Quote className="w-8 h-8 opacity-20" />
             </div>
          </div>
        </div>

        <div className="relative mb-6">
          <p className="hadith-text text-2xl text-slate-800 text-justify leading-relaxed relative z-10">
            {hadith.text}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
             <User className="w-4 h-4" />
             <span className="font-semibold">{narratorName}</span>
          </div>
          <span className="text-emerald-700 text-xs md:text-sm font-bold bg-emerald-50 px-3 md:px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
            {hadith.source}
          </span>
        </div>
      </div>
    </div>
  );
};

export default App;