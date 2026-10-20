import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Swords, Clock, CheckCircle2, XCircle, ArrowRight,
  RotateCcw, Map, Award, Plus, Trash2, Edit3, Upload, Download,
  Check, Eye, Terminal, HelpCircle, AlertTriangle, FileCode2
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { questService } from '../../services/questService';
import { progressionService } from '../../services/progressionService';
import { useAuth } from '../../hooks/useAuth';
import { introAudio } from '../../utils/introAudio';
import type { QuizQuestion, QuestSector, QuestionCategory, QuestionDifficulty } from '../../types/quest';
import toast from 'react-hot-toast';

interface StudentQuizViewProps {
  sector: QuestSector;
  isFacultyRole: boolean;
  onNavigateMap: () => void;
  onNavigateDossier: () => void;
  onReplay: () => void;
}

const StudentQuizView: React.FC<StudentQuizViewProps> = ({
  sector,
  isFacultyRole,
  onNavigateMap,
  onNavigateDossier,
  onReplay,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [qIndex: number]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(sector.timeLimitSeconds || 240);
  const [isCompleted, setIsCompleted] = useState(false);

  // Countdown timer for student solving
  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  const activeQuestion: QuizQuestion | undefined = sector.questions[currentQuestionIndex];

  const handleSelectOption = useCallback((idx: number) => {
    if (isAnswerSubmitted) return;
    introAudio.playWeaponWheelTick();
    setSelectedOption(idx);
  }, [isAnswerSubmitted]);

  const handleSubmitAnswer = useCallback(() => {
    if (selectedOption === null || isAnswerSubmitted || !activeQuestion) return;
    setIsAnswerSubmitted(true);
    setUserAnswers((prev) => ({ ...prev, [currentQuestionIndex]: selectedOption }));

    if (selectedOption === activeQuestion.correctAnswerIndex) {
      introAudio.playWeaponWheelTick();
    } else {
      introAudio.playWantedPing();
    }
  }, [selectedOption, isAnswerSubmitted, activeQuestion, currentQuestionIndex]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < sector.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      introAudio.playWeaponWheelTick();
    } else {
      setIsCompleted(true);
      introAudio.playMissionPassed();
    }
  }, [currentQuestionIndex, sector.questions.length]);

  // Key navigation for options (1-4, A-D, Enter)
  useEffect(() => {
    if (isCompleted || !activeQuestion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!isAnswerSubmitted) {
        if (e.key === '1' || e.key === 'a' || e.key === 'A') {
          handleSelectOption(0);
        } else if (e.key === '2' || e.key === 'b' || e.key === 'B') {
          handleSelectOption(1);
        } else if (e.key === '3' || e.key === 'c' || e.key === 'C') {
          handleSelectOption(2);
        } else if (e.key === '4' || e.key === 'd' || e.key === 'D') {
          handleSelectOption(3);
        } else if (e.key === 'Enter' && selectedOption !== null) {
          e.preventDefault();
          handleSubmitAnswer();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleNextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompleted, activeQuestion, isAnswerSubmitted, selectedOption, handleSelectOption, handleSubmitAnswer, handleNextQuestion]);

  // Calculate results
  const scoreResults = useMemo(() => {
    let correct = 0;
    sector.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        correct += 1;
      }
    });
    const total = sector.questions.length || 1;
    const accuracy = Math.round((correct / total) * 100);
    const xp = Math.round((accuracy / 100) * sector.xpReward);
    return { correct, total, accuracy, xp };
  }, [sector, userAnswers]);

  // Format time MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const hasAwardedRef = useRef(false);

  // Auto-award XP and complete sector in local progression service when finished
  useEffect(() => {
    if (isCompleted && !isFacultyRole && !hasAwardedRef.current) {
      hasAwardedRef.current = true;
      const earnedXp = Math.max(10, scoreResults.xp);
      progressionService.awardXp(earnedXp, 'DAILY_QUIZ', `${sector.id.toUpperCase()}-CLEARED`);
      progressionService.completeSector(sector.id);
      toast.success(`MISSION PASSED: +$${earnedXp} XP ADDED TO RESPECT REGISTER`);
    }
  }, [isCompleted, isFacultyRole, scoreResults.xp, sector.id]);

  if (isCompleted) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-2xl mx-auto p-8 rounded-2xl bg-[#0E1012] border-2 border-amber-500/60 shadow-[0_0_60px_rgba(245,158,11,0.3)] text-center font-mono space-y-6"
      >
        <div>
          <h1 className="font-pricedown text-6xl text-amber-500 gta-text-shadow tracking-tight">
            MISSION PASSED!
          </h1>
          <p className="text-sm font-bold text-zinc-300 uppercase tracking-widest font-chalet mt-1">
            {sector.title} // DEBRIEFING
          </p>
        </div>

        {/* Score Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2 font-mono">
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase block">ACCURACY</span>
            <span className="text-2xl font-black text-emerald-400 font-pricedown">
              {scoreResults.accuracy}%
            </span>
          </div>

          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase block">TARGETS HIT</span>
            <span className="text-2xl font-black text-amber-400 font-pricedown">
              {scoreResults.correct} / {scoreResults.total}
            </span>
          </div>

          {!isFacultyRole ? (
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-[10px] text-zinc-500 uppercase block">RESPECT EARNED</span>
              <span className="text-2xl font-black text-[#22C55E] font-pricedown" style={{ textShadow: '0 0 8px rgba(34,197,94,0.5)' }}>
                +${scoreResults.xp} XP
              </span>
            </div>
          ) : (
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-[10px] text-zinc-500 uppercase block">MODE</span>
              <span className="text-sm font-black text-zinc-300">FACULTY PREVIEW</span>
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-400 leading-relaxed font-sans">
          {scoreResults.accuracy >= 75 ? (
            <span className="text-emerald-400 font-bold">
              Outstanding performance, Operative. All core concepts verified with minimal diagnostic friction.
            </span>
          ) : (
            <span className="text-amber-400 font-bold">
              Mission completed with anomalies. Revisit this armory before the mid-term boss trial at Mount Chiliad Fortress.
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={onNavigateMap}
            icon={<Map className="w-4 h-4" />}
            className="w-full sm:w-auto font-mono text-xs uppercase"
          >
            Return to GPS Map [M]
          </Button>

          <Button
            variant="secondary"
            onClick={onReplay}
            icon={<RotateCcw className="w-4 h-4" />}
            className="w-full sm:w-auto font-mono text-xs uppercase"
          >
            Replay Sector
          </Button>

          {!isFacultyRole && (
            <Button
              variant="ghost"
              onClick={onNavigateDossier}
              icon={<Award className="w-4 h-4 text-amber-400" />}
              className="w-full sm:w-auto font-mono text-xs uppercase text-zinc-300"
            >
              View Dossier
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-[#121418] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden font-mono">
      {/* Tactical Mission Header */}
      <div className="bg-black/90 border-b border-zinc-800 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                {sector.type.toUpperCase()} GAUNTLET
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                Q {currentQuestionIndex + 1} OF {sector.questions.length}
              </span>
            </div>
            <h2 className="font-chalet text-xl font-black text-white uppercase tracking-tight mt-0.5">
              {sector.title}
            </h2>
          </div>
        </div>

        {/* Countdown Timer & XP Stake */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="px-3.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-zinc-400 font-bold uppercase">TIME:</span>
            <span className={`text-sm font-black ${timeRemaining < 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>

          {!isFacultyRole && (
            <div className="px-3.5 py-1.5 rounded-lg bg-black border border-emerald-500/40 text-emerald-400 font-black text-sm shadow-[0_0_12px_rgba(34,197,94,0.3)]">
              +${sector.xpReward} XP
            </div>
          )}
        </div>
      </div>

      {/* Question Progress Dots */}
      <div className="px-6 pt-4 flex gap-1.5">
        {sector.questions.map((_, idx) => {
          const isAnswered = userAnswers[idx] !== undefined;
          const isCurrent = idx === currentQuestionIndex;
          return (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                isCurrent
                  ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                  : isAnswered
                  ? 'bg-emerald-500'
                  : 'bg-zinc-800'
              }`}
            />
          );
        })}
      </div>

      {/* Main Question Body */}
      {activeQuestion ? (
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {activeQuestion.category}
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                {activeQuestion.difficulty}
              </span>
            </div>

            <h3 className="font-sans text-lg sm:text-xl font-bold text-zinc-100 leading-relaxed">
              {activeQuestion.prompt}
            </h3>
          </div>

          {/* Optional Code Snippet Card */}
          {activeQuestion.codeSnippet && (
            <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-[#0A0D14]">
              <div className="bg-black/80 px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-zinc-500 text-xs">
                <span className="flex items-center gap-1.5 font-mono">
                  <FileCode2 className="w-3.5 h-3.5 text-amber-400" /> CODE EXCERPT
                </span>
                <span className="text-[10px] uppercase">C++ / JAVA / PYTHON</span>
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                {activeQuestion.codeSnippet}
              </pre>
            </div>
          )}

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {activeQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isSubmitted = isAnswerSubmitted;
              const isCorrect = idx === activeQuestion.correctAnswerIndex;
              const isWrongSelection = isSubmitted && isSelected && !isCorrect;

              return (
                <motion.button
                  key={idx}
                  whileHover={!isSubmitted ? { scale: 1.01 } : {}}
                  whileTap={!isSubmitted ? { scale: 0.99 } : {}}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isSubmitted}
                  className={`p-4 rounded-xl border text-left font-sans text-sm transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSubmitted
                      ? isCorrect
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                        : isWrongSelection
                        ? 'bg-red-950/40 border-red-500 text-red-300'
                        : 'bg-zinc-950/50 border-zinc-800 text-zinc-500 opacity-60'
                      : isSelected
                      ? 'bg-amber-500/15 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-600 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center border ${
                        isSubmitted && isCorrect
                          ? 'bg-emerald-500 text-black border-emerald-400'
                          : isWrongSelection
                          ? 'bg-red-600 text-white border-red-500'
                          : isSelected
                          ? 'bg-amber-500 text-black border-amber-400'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-medium">{opt}</span>
                  </div>

                  {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                  {isSubmitted && isWrongSelection && <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation Box when submitted */}
          <AnimatePresence>
            {isAnswerSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border font-sans text-xs space-y-1 ${
                  selectedOption === activeQuestion.correctAnswerIndex
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/30 border-red-500/40 text-red-200'
                }`}
              >
                <div className="font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  {selectedOption === activeQuestion.correctAnswerIndex ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> TARGET VERIFIED & ACCURATE
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-400" /> AMMO SPENT // SOLUTION REVEALED
                    </>
                  )}
                </div>
                <p className="text-zinc-300 leading-relaxed font-sans mt-1">
                  {activeQuestion.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
              HOTKEYS: [A/B/C/D] OR [1-4] TO SELECT • [ENTER] TO CONFIRM
            </span>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className={`ml-auto px-6 py-2.5 rounded-xl font-chalet text-sm font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
                  selectedOption === null
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-amber-300'
                }`}
              >
                LOCK IN TARGET [ENTER] <Check className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="ml-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-chalet text-sm font-black uppercase tracking-wider shadow-[0_0_20px_rgba(34,197,94,0.5)] border border-emerald-300 transition cursor-pointer flex items-center gap-2"
              >
                {currentQuestionIndex < sector.questions.length - 1
                  ? 'NEXT QUESTION [ENTER]'
                  : 'COMPLETE MISSION'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="py-16 text-center text-zinc-500 text-sm">
          NO QUESTIONS FOUND FOR THIS SECTOR.
        </div>
      )}
    </div>
  );
};

export const QuestSolvingPage: React.FC = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const isFacultyRole = profile?.role === 'faculty' || profile?.role === 'admin';

  // Current sector state
  const currentSectorId = nodeId || 'node-2';
  const [sectors, setSectors] = useState<QuestSector[]>(() => questService.getAllSectors());
  const currentSector = useMemo(() => {
    return sectors.find((s) => s.id === currentSectorId) || sectors[0];
  }, [sectors, currentSectorId]);

  // Faculty toggle to preview as student
  const [facultyPreviewMode, setFacultyPreviewMode] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  // Determine effective mode:
  // If user is faculty AND not in preview mode -> Faculty Editor Mode
  // If user is student OR faculty is in preview mode -> Student Solving Mode
  const isFacultyEditor = isFacultyRole && !facultyPreviewMode;

  // =========================================================================
  // FACULTY QUESTION MANAGEMENT STATE & ACTIONS
  // =========================================================================
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  // Form fields
  const [formPrompt, setFormPrompt] = useState('');
  const [formCategory, setFormCategory] = useState<QuestionCategory>('MCQ');
  const [formDifficulty, setFormDifficulty] = useState<QuestionDifficulty>('MEDIUM');
  const [formCodeSnippet, setFormCodeSnippet] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectIndex, setFormCorrectIndex] = useState(0);
  const [formExplanation, setFormExplanation] = useState('');
  const [rawJsonUpload, setRawJsonUpload] = useState('');

  const reloadSectors = useCallback(() => {
    setSectors(questService.getAllSectors());
  }, []);

  const handleOpenCreateModal = () => {
    setEditingQuestion(null);
    setFormPrompt('');
    setFormCategory('MCQ');
    setFormDifficulty('MEDIUM');
    setFormCodeSnippet('');
    setFormOptions(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormExplanation('');
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditModal = (q: QuizQuestion) => {
    setEditingQuestion(q);
    setFormPrompt(q.prompt);
    setFormCategory(q.category);
    setFormDifficulty(q.difficulty);
    setFormCodeSnippet(q.codeSnippet || '');
    setFormOptions(q.options.length === 4 ? [...q.options] : [...q.options, '', '', ''].slice(0, 4));
    setFormCorrectIndex(q.correctAnswerIndex);
    setFormExplanation(q.explanation);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPrompt.trim()) {
      toast.error('Question prompt is required.');
      return;
    }
    const cleanOptions = formOptions.map((opt) => opt.trim());
    if (cleanOptions.some((opt) => !opt)) {
      toast.error('All 4 options must be filled.');
      return;
    }

    if (editingQuestion) {
      questService.updateQuestion(currentSector.id, {
        id: editingQuestion.id,
        prompt: formPrompt.trim(),
        category: formCategory,
        difficulty: formDifficulty,
        codeSnippet: formCodeSnippet.trim() || undefined,
        options: cleanOptions,
        correctAnswerIndex: formCorrectIndex,
        explanation: formExplanation.trim() || 'Verified answer key.',
      });
      toast.success('Question updated successfully.');
    } else {
      questService.addQuestion(currentSector.id, {
        prompt: formPrompt.trim(),
        category: formCategory,
        difficulty: formDifficulty,
        codeSnippet: formCodeSnippet.trim() || undefined,
        options: cleanOptions,
        correctAnswerIndex: formCorrectIndex,
        explanation: formExplanation.trim() || 'Verified answer key.',
      });
      toast.success('New question created and deployed to sector.');
    }

    reloadSectors();
    setIsQuestionModalOpen(false);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (confirm('Delete this question from the sector question bank?')) {
      questService.deleteQuestion(currentSector.id, qId);
      reloadSectors();
      toast.success('Question removed.');
    }
  };

  const handleUploadPack = () => {
    if (!rawJsonUpload.trim()) {
      toast.error('Please paste valid JSON questions or choose a file.');
      return;
    }
    const result = questService.importQuestionsFromJson(currentSector.id, rawJsonUpload);
    if (result.success) {
      toast.success(`Imported ${result.count} questions into ${currentSector.title}!`);
      reloadSectors();
      setIsUploadModalOpen(false);
      setRawJsonUpload('');
    } else {
      toast.error(result.error || 'Failed to import JSON.');
    }
  };

  const handleExportPack = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentSector.questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentSector.id}-question-pack.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Question pack exported.');
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all sector questions to factory default curriculum?')) {
      questService.resetToDefaultBank();
      reloadSectors();
      toast.success('Curriculum reset to default bank.');
    }
  };

  // Format time MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout
      title={isFacultyEditor ? 'CURRICULUM COMMAND' : 'MISSION BRIEFING'}
      subtitle={
        isFacultyEditor
          ? `Faculty Handler Terminal • ${currentSector.title} Question Bank`
          : `${currentSector.title} • Los Santos Tactical Gauntlet`
      }
    >
      <div className="space-y-6">
        {/* SECTOR NAVIGATION & MODE HEADER BAR */}
        <div className="bg-[#121418] border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl font-mono">
          {/* Sector Selector Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs uppercase text-zinc-400 font-bold flex items-center gap-1.5">
              <Map className="w-4 h-4 text-amber-500" /> SECTOR:
            </span>
            <select
              value={currentSector.id}
              onChange={(e) => {
                introAudio.playWeaponWheelTick();
                navigate(`/quest/${e.target.value}`);
              }}
              className="px-3 py-1.5 bg-black border border-zinc-700 text-xs text-amber-400 font-bold uppercase rounded-lg focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.questions.length} Qs)
                </option>
              ))}
            </select>

            <span className="text-[11px] text-zinc-500 uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
              TOPIC: {currentSector.topic}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {isFacultyRole && (
              <Button
                variant={facultyPreviewMode ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  introAudio.playWeaponWheelTick();
                  setFacultyPreviewMode((prev) => !prev);
                }}
                icon={<Eye className="w-3.5 h-3.5" />}
                className="text-xs font-mono uppercase"
              >
                {facultyPreviewMode ? 'Exit Student Preview' : 'Preview As Student'}
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                introAudio.playWeaponWheelTick();
                navigate('/syllabus');
              }}
              icon={<Map className="w-3.5 h-3.5 text-cyan-400" />}
              className="text-xs font-mono uppercase"
            >
              GPS Map [M]
            </Button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* VIEW 1: FACULTY QUESTION MANAGEMENT & UPLOAD INTERFACE (NO XP)     */}
        {/* =================================================================== */}
        {isFacultyEditor ? (
          <div className="space-y-6">
            {/* Faculty Control Bar (NO XP displayed anywhere) */}
            <div className="bg-[#121418] border border-amber-500/30 p-5 rounded-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
              <div>
                <h3 className="text-sm font-black uppercase text-amber-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  HANDLER REPOSITORY // {currentSector.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Total Questions Loaded: <strong className="text-white">{currentSector.questions.length}</strong> • Time Limit: {formatTime(currentSector.timeLimitSeconds || 240)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenCreateModal}
                  icon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs font-mono uppercase"
                >
                  Add Question
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsUploadModalOpen(true)}
                  icon={<Upload className="w-3.5 h-3.5 text-emerald-400" />}
                  className="text-xs font-mono uppercase"
                >
                  Upload Pack
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportPack}
                  icon={<Download className="w-3.5 h-3.5 text-blue-400" />}
                  className="text-xs font-mono uppercase"
                >
                  Export JSON
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetDefaults}
                  icon={<RotateCcw className="w-3.5 h-3.5 text-zinc-400" />}
                  className="text-xs font-mono uppercase text-zinc-400 hover:text-red-400"
                  title="Reset questions to factory defaults"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {currentSector.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-[#121418] border border-zinc-800 hover:border-zinc-700 p-5 rounded-xl shadow-lg font-mono transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-xs font-bold text-amber-400">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {q.category}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        q.difficulty === 'HARD'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : q.difficulty === 'MEDIUM'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(q)}
                        className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs flex items-center gap-1 cursor-pointer transition"
                      >
                        <Edit3 className="w-3 h-3 text-amber-400" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/50 text-xs flex items-center gap-1 cursor-pointer transition"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Prompt */}
                  <h4 className="text-sm font-bold text-zinc-100 font-sans leading-relaxed mb-3">
                    {q.prompt}
                  </h4>

                  {/* Code snippet if present */}
                  {q.codeSnippet && (
                    <div className="mb-3 p-3 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto">
                      <pre>{q.codeSnippet}</pre>
                    </div>
                  )}

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctAnswerIndex;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                            isCorrect
                              ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300 font-bold'
                              : 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] font-mono">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1 truncate">{opt}</span>
                          {isCorrect && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="mt-3 pt-2 text-[11px] text-zinc-500 font-sans border-t border-zinc-800/60">
                      <strong className="text-zinc-400 font-mono uppercase">Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* =================================================================== */
          /* VIEW 2: STUDENT QUESTION SOLVING INTERFACE (WITH GAMIFIED XP)      */
          /* =================================================================== */
          <StudentQuizView
            key={`${currentSector.id}-${facultyPreviewMode}-${replayKey}`}
            sector={currentSector}
            isFacultyRole={isFacultyRole}
            onNavigateMap={() => {
              introAudio.playWeaponWheelTick();
              navigate('/syllabus');
            }}
            onNavigateDossier={() => {
              introAudio.playWeaponWheelTick();
              navigate('/student');
            }}
            onReplay={() => {
              introAudio.playWeaponWheelTick();
              setReplayKey((k) => k + 1);
            }}
          />
        )}
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: CREATE / EDIT QUESTION (FACULTY ONLY)                       */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {isQuestionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none"
            onClick={() => setIsQuestionModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#0E1012] border-2 border-amber-500/50 rounded-2xl shadow-2xl p-6 font-mono text-xs space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-chalet font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  {editingQuestion ? 'Edit Question' : 'Create New Sector Question'}
                </h3>
                <button
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="space-y-4">
                {/* Prompt */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                    Question Prompt:
                  </label>
                  <textarea
                    value={formPrompt}
                    onChange={(e) => setFormPrompt(e.target.value)}
                    rows={2}
                    placeholder="Enter the challenge question..."
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-sans text-xs focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>

                {/* Category & Difficulty */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                      Category:
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as QuestionCategory)}
                      className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 text-xs uppercase focus:border-amber-400 focus:outline-none"
                    >
                      <option value="MCQ">Multiple Choice (MCQ)</option>
                      <option value="CODE_ANALYSIS">Code Analysis</option>
                      <option value="BUG_HUNT">Bug Hunt</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                      Difficulty:
                    </label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value as QuestionDifficulty)}
                      className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 text-xs uppercase focus:border-amber-400 focus:outline-none"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Code Snippet (Optional) */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                    Code Snippet (Optional):
                  </label>
                  <textarea
                    value={formCodeSnippet}
                    onChange={(e) => setFormCodeSnippet(e.target.value)}
                    rows={3}
                    placeholder="int solve(int n) { ... }"
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-emerald-400 font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* 4 Options & Correct Selector */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-bold text-zinc-400">
                    4 Options (Select radio for correct answer key):
                  </label>
                  {formOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formCorrectIndex === idx}
                        onChange={() => setFormCorrectIndex(idx)}
                        className="cursor-pointer text-amber-500 accent-amber-500"
                        title="Mark as correct answer"
                      />
                      <span className="w-5 text-center font-bold text-zinc-500">
                        {String.fromCharCode(65 + idx)}:
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...formOptions];
                          updated[idx] = e.target.value;
                          setFormOptions(updated);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        className="flex-1 p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 text-xs font-sans focus:border-amber-400 focus:outline-none"
                        required
                      />
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                    Explanation / Solution Notes:
                  </label>
                  <textarea
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    rows={2}
                    placeholder="Why this answer is correct..."
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 font-sans text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Modal Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsQuestionModalOpen(false)}
                    className="font-mono text-xs uppercase"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    className="font-mono text-xs uppercase"
                  >
                    {editingQuestion ? 'Update Question' : 'Save & Publish Question'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* MODAL 2: UPLOAD QUESTION PACK (FACULTY ONLY)                         */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none"
            onClick={() => setIsUploadModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-[#0E1012] border-2 border-emerald-500/50 rounded-2xl shadow-2xl p-6 font-mono text-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-chalet font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  Upload Question Pack to {currentSector.title}
                </h3>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-zinc-400 text-xs">
                  Upload a JSON file or paste an array of question objects matching the schema:
                </p>

                {/* File picker */}
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setRawJsonUpload(event.target?.result as string);
                        };
                        reader.readAsText(file);
                      }
                    }}
                    className="text-xs text-zinc-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-zinc-700 file:text-xs file:font-mono file:bg-zinc-900 file:text-zinc-200 hover:file:bg-zinc-800 cursor-pointer"
                  />
                </div>

                {/* Paste Area */}
                <div>
                  <textarea
                    value={rawJsonUpload}
                    onChange={(e) => setRawJsonUpload(e.target.value)}
                    rows={8}
                    placeholder={`[\n  {\n    "prompt": "What is ...?",\n    "options": ["A", "B", "C", "D"],\n    "correctAnswerIndex": 0,\n    "explanation": "Because...",\n    "category": "MCQ",\n    "difficulty": "EASY"\n  }\n]`}
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-emerald-400 font-mono text-[11px] focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => {
                      const sample = [
                        {
                          prompt: 'Sample Question: What is the time complexity of binary search?',
                          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
                          correctAnswerIndex: 1,
                          explanation: 'Binary search halves the search space each step.',
                          category: 'MCQ',
                          difficulty: 'EASY',
                        },
                      ];
                      setRawJsonUpload(JSON.stringify(sample, null, 2));
                    }}
                    className="text-[10px] text-amber-400 hover:underline uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" /> Load Sample Schema
                  </button>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsUploadModalOpen(false)}
                      className="font-mono text-xs uppercase"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleUploadPack}
                      className="font-mono text-xs uppercase"
                    >
                      Confirm Import
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};
