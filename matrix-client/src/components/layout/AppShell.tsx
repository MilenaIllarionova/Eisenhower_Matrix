import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getSocket, disconnectSocket } from '../../services/socket';
import { useToastStore } from '../../store/useToastStore';
import { useAuthStore } from '../../store/useAuthStore';

/**
 * Базовый layout приложения: боковая панель + контент.
 * Подключает Socket.IO и пробрасывает входящие уведомления в тосты.
 */
export default function AppShell() {
  const token = useAuthStore((s) => s.token);
  const pushToast = useToastStore((s) => s.push);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    const socket = getSocket();
    const handler = (n: { type: string; message: string }) => {
      const title =
        n.type === 'task_assigned'? 'Новая задача'
          : n.type === 'task_review_requested'? 'Завершение задачи'
          : n.type === 'task_completed' ? 'Задача принята'
          : n.type === 'project_invited' ? 'Приглашение на доску'
          : 'Уведомление';
      pushToast({ title, body: n.message });
    };
    socket.on('notification:new', handler);
    return () => {socket.off('notification:new', handler); };
  }, [token, pushToast]);

  useEffect(() => () => disconnectSocket(), []);

  return (
    <div className="h-screen flex bg-bg overflow-hidden">
      {/* Оверлей для планшета */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Сайдбар */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 px-8 py-8 overflow-y-auto overflow-x-hidden">
        {/* Гамбургер — только на планшете */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden mb-4 p-2 rounded-xl bg-bg-panel text-white"
          aria-label="Открыть меню"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Outlet />
      </main>
    </div>
  );
}
