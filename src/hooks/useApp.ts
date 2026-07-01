import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import { audioService } from '../services/audio';
import { View, BookingRecordsTab, DataLossWarning, Toast } from '../types/app';

export function useApp() {
  // View state
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [bookingRecordsTab, setBookingRecordsTab] = useState<BookingRecordsTab>('confirmed');

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('shadyTheme');
    return saved ? saved === 'dark' : true;
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Backup & sync state
  const [showBackupPrompt, setShowBackupPrompt] = useState(false);
  const [lastBackupDirName, setLastBackupDirName] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Data loss warning
  const [dataLossWarning, setDataLossWarning] = useState<DataLossWarning | null>(null);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('shadyTheme', isDarkMode ? 'dark' : 'light');
    
    const savedAccent = localStorage.getItem('shadyAccent') || 'default';
    document.documentElement.setAttribute('data-accent', savedAccent);
  }, [isDarkMode]);

  // Initialize cross-tab sync and data loss check
  useEffect(() => {
    storage.initCrossTabSync();
    storage.checkDataLossAndPrompt();
    
    // Check if backup directory is set, if not, prompt user
    storage.getBackupDirectory().then(dir => {
      if (!dir) {
        // Prompt immediately if not set
        setShowBackupPrompt(true);
      }
    });

    const handleDataLoss = (e: Event) => {
      const customEvent = e as CustomEvent<DataLossWarning>;
      setDataLossWarning(customEvent.detail);
      audioService.playError();
    };
    
    window.addEventListener('shady-data-loss', handleDataLoss);
    return () => window.removeEventListener('shady-data-loss', handleDataLoss);
  }, []);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    audioService.playSwitch(!isDarkMode);
    setIsDarkMode(prev => !prev);
  }, [isDarkMode]);

  // Toast management
  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Navigation
  const navigateTo = useCallback((view: View) => {
    audioService.playClick();
    setCurrentView(view);
    setIsCommandPaletteOpen(false);
  }, []);

  // Sidebar
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Backup directory selection
  const selectBackupDir = useCallback(async () => {
    const success = await storage.setBackupDirectory();
    if (success) {
      setShowBackupPrompt(false);
      addToast('تم تفعيل مجلد النسخ الاحتياطي بنجاح', 'success');
    }
  }, [addToast]);

  return {
    // View state
    currentView,
    setCurrentView,
    bookingRecordsTab,
    setBookingRecordsTab,

    // UI state
    isSidebarOpen,
    setIsSidebarOpen,
    isDarkMode,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,

    // Backup state
    showBackupPrompt,
    setShowBackupPrompt,
    lastBackupDirName,
    setLastBackupDirName,
    backupStatus,
    setBackupStatus,
    selectBackupDir,

    // Toasts
    toasts,
    addToast,

    // Data loss
    dataLossWarning,
    setDataLossWarning,

    // Actions
    toggleTheme,
    navigateTo,
    toggleSidebar,
    removeToast,
  };
}
