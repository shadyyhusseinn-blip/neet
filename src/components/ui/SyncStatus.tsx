import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { firebaseService } from '../../services/firebase';

export default function SyncStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  useEffect(() => {
    // Check Firebase connection status
    const checkConnection = () => {
      setIsConnected(firebaseService.isReady());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    // Listen for Firebase connection events
    const handleConnected = () => {
      setIsConnected(true);
      setLastSyncTime(new Date().toLocaleTimeString('ar-EG'));
      setSyncStatus('synced');
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setSyncStatus('idle');
    };

    window.addEventListener('firebase-connected', handleConnected);
    window.addEventListener('firebase-disconnected', handleDisconnected);

    return () => {
      clearInterval(interval);
      window.removeEventListener('firebase-connected', handleConnected);
      window.removeEventListener('firebase-disconnected', handleDisconnected);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isConnected || isSyncing) return;
    
    setIsSyncing(true);
    setSyncStatus('syncing');
    try {
      // Firestore handles sync automatically, this is just a visual indicator
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSyncTime(new Date().toLocaleTimeString('ar-EG'));
      setSyncStatus('synced');
    } catch (error) {
      console.error('Manual sync failed:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Connection Status */}
      <div
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300',
          isConnected
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        )}
        title={isConnected ? 'متصل بـ Firebase (Offline Persistence مفعّل)' : 'غير متصل بـ Firebase'}
      >
        {isConnected ? (
          <>
            <Wifi size={12} />
            <span className="hidden sm:inline">متصل</span>
          </>
        ) : (
          <>
            <WifiOff size={12} />
            <span className="hidden sm:inline">أوفلاين</span>
          </>
        )}
      </div>

      {/* Sync Status Indicator */}
      {syncStatus === 'synced' && isConnected && (
        <div
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          )}
          title="المزامنة تلقائية مفعّلة"
        >
          <CheckCircle size={12} />
          <span className="hidden sm:inline">مزامنة تلقائية</span>
        </div>
      )}

      {/* Manual Sync Button */}
      {isConnected && (
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300',
            isSyncing
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 cursor-not-allowed'
              : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
          )}
          title={isSyncing ? 'جاري المزامنة...' : 'تحديث المزامنة'}
        >
          <RefreshCw size={12} className={cn(isSyncing && 'animate-spin')} />
        </button>
      )}

      {/* Last Sync Time */}
      {lastSyncTime && isConnected && (
        <div
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.05] text-text-muted border border-white/10"
          title={`آخر تحديث: ${lastSyncTime}`}
        >
          <span className="opacity-60">آخر تحديث:</span>
          <span>{lastSyncTime}</span>
        </div>
      )}
    </div>
  );
}
