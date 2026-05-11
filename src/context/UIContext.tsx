import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { playCheckSound } from '../lib/audio';

type ToastType = 'success' | 'error';

interface UIContextType {
  showToast: (message: string, type?: ToastType) => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
  showPrompt: (message: string, onConfirm: (value: string) => void) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{message: string, type: ToastType, visible: boolean}>({ message: '', type: 'success', visible: false });
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, onConfirm: () => void}>({ isOpen: false, message: '', onConfirm: () => {} });
  const [promptModal, setPromptModal] = useState<{isOpen: boolean, message: string, value: string, onConfirm: (val: string) => void}>({ isOpen: false, message: '', value: '', onConfirm: () => {} });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, visible: true });
    if (type === 'success') playCheckSound();
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, message, onConfirm });
  };

  const showPrompt = (message: string, onConfirm: (value: string) => void) => {
    setPromptModal({ isOpen: true, message, value: '', onConfirm });
  };

  return (
    <UIContext.Provider value={{ showToast, showConfirm, showPrompt }}>
      {children}

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-amber-900/40 rounded-xl p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-amber-400 mb-2">Confirmação</h3>
            <p className="text-zinc-300 text-sm mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium rounded-lg transition-colors text-sm border border-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className="px-4 py-2 bg-red-950 hover:bg-red-900 text-red-400 font-medium rounded-lg transition-colors text-sm border border-red-900/50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Modal */}
      {promptModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-amber-900/40 rounded-xl p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-amber-400 mb-2">Entrada de Dados</h3>
            <p className="text-zinc-300 text-sm mb-4">{promptModal.message}</p>
            <input
              type="text"
              value={promptModal.value}
              onChange={(e) => setPromptModal(prev => ({ ...prev, value: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && promptModal.value.trim()) {
                  promptModal.onConfirm(promptModal.value);
                  setPromptModal(prev => ({ ...prev, isOpen: false }));
                }
              }}
              className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 mb-6 text-amber-100 focus:outline-none focus:border-amber-600"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPromptModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium rounded-lg transition-colors text-sm border border-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (promptModal.value.trim()) {
                    promptModal.onConfirm(promptModal.value);
                    setPromptModal(prev => ({ ...prev, isOpen: false }));
                  }
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-lg transition-colors text-sm"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div 
        className={`fixed bottom-4 right-4 z-[9999] transition-all duration-300 transform ${
          toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
        }`}
      >
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md ${
          toast.type === 'success' 
            ? 'bg-green-950/90 border-green-900/50 text-green-400' 
            : 'bg-red-950/90 border-red-900/50 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      </div>
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
