import React, { useState, ReactNode } from 'react';
import { TransitionGroup, Transition } from 'react-transition-group';
import clsx from 'clsx';
import { Toast, ToastContext } from '../../context/ToastContext';

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);

    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration ?? 3000);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 md:bottom-6 md:right-6 top-4 md:top-auto">
        <TransitionGroup component={null}>
          {toasts.map((toast) => (
            <Transition key={toast.id} timeout={300} unmountOnExit>
              {(state) => (
                <div
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white transition-all duration-300',
                    {
                      'bg-green-500': toast.type === 'success',
                      'bg-red-500': toast.type === 'error',
                      'bg-yellow-500': toast.type === 'warning',
                      'bg-blue-500': toast.type === 'info',
                    },
                    state === 'entering' ? 'opacity-0 translate-y-2' : '',
                    state === 'entered' ? 'opacity-100 translate-y-0' : '',
                    state === 'exiting' ? 'opacity-0 translate-y-2' : '',
                    state === 'exited' ? 'opacity-0' : ''
                  )}
                >
                  <span>{toast.message}</span>
                  <button onClick={() => removeToast(toast.id)} className="text-white hover:text-gray-200 ml-2">
                    ×
                  </button>
                </div>
              )}
            </Transition>
          ))}
        </TransitionGroup>
      </div>
    </ToastContext.Provider>
  );
};
