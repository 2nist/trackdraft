import { create } from 'zustand';
import { Toast, ToastType } from '../components/common/Toast';

interface ToastState {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  showToast: (message: string, type: ToastType = 'info', duration?: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = { id, message, type, duration };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    return id;
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  showSuccess: (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type: 'success' }],
    }));
  },

  showError: (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type: 'error', duration: 5000 }],
    }));
  },

  showInfo: (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type: 'info' }],
    }));
  },

  showWarning: (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type: 'warning', duration: 4000 }],
    }));
  },
}));

