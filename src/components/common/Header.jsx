import { useState } from 'react';
import {
  MdMenu,
  MdNotifications,
  MdSearch,
  MdAccountCircle,
  MdLogout,
} from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toggleSidebar } from '../../store/slices/ui.slice';
import { logout } from '../../store/slices/auth.slice';
import { notificationApi } from '../../services/api/notification.api';
import { ROUTES, STORAGE_KEYS } from '../../utils/constants';
import { storage } from '../../utils/storage';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  const hasToken = !!storage.get(STORAGE_KEYS.TOKEN);

  const { data: unreadData } = useQuery({
    queryKey: ['notification-unread-count'],
    queryFn: notificationApi.getUnreadCount,
    enabled: isAuthenticated && hasToken,
    refetchInterval: 30000,
    retry: 1,
  });

  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications', notifAnchorEl],
    queryFn: () => notificationApi.getNotifications({ limit: 10, page: 1 }),
    enabled: !!notifAnchorEl,
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notification-unread-count']);
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notification-unread-count']);
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const unreadCount = unreadData?.unreadCount ?? 0;
  const notifications = Array.isArray(notificationsData) ? notificationsData : [];

  const handleMenuOpen = () => setAnchorEl(true);
  const handleMenuClose = () => setAnchorEl(false);
  const handleNotifOpen = () => setNotifAnchorEl(true);
  const handleNotifClose = () => setNotifAnchorEl(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleMenuClose();
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markAsReadMutation.mutate(notif._id);
    }
    handleNotifClose();
    const { type, data } = notif;
    if (type === 'sos_alert' && data?.alertId) {
      navigate(`${ROUTES.SOS}/${data.alertId}`);
    } else if (type === 'driver_approval') {
      navigate(ROUTES.DRIVERS_PENDING);
    } else if (type === 'complaint' && data?.complaintId) {
      navigate(`/complaints/${data.complaintId}`);
    }
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 flex items-center flex-nowrap px-4 z-[1101] text-white shadow-md"
      style={{
        background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
      }}
    >
      <div className="flex items-center w-full min-w-0 flex-nowrap gap-2">
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 -ml-1 rounded-lg hover:bg-white/15 shrink-0"
          aria-label="toggle menu"
        >
          <MdMenu className="w-6 h-6" />
        </button>
        <span className="text-lg font-semibold shrink-0 whitespace-nowrap">Baneen Admin</span>
        <div className="hidden sm:flex relative flex-1 max-w-[220px] min-w-0">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80 pointer-events-none" />
          <input
            type="search"
            placeholder="Search…"
            className="w-full h-9 pl-9 pr-3 bg-white/10 border-0 rounded-lg text-sm text-white placeholder-white/60 focus:bg-white/20 focus:outline-none"
          />
        </div>
        <div className="flex-1 min-w-0" />

        {/* Notifications */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={handleNotifOpen}
            className="relative p-2 rounded-lg hover:bg-white/15 shrink-0"
            aria-label="notifications"
          >
            <MdNotifications className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-red-500 rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          {notifAnchorEl && (
            <>
              <div
                className="fixed inset-0 z-[1100]"
                onClick={handleNotifClose}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full mt-2 w-80 max-h-[400px] z-[1102] bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                  <span className="font-semibold text-slate-800">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      disabled={markAllReadMutation.isPending}
                      className="text-xs text-[#E91E63] hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto flex-1">
                  {notificationsLoading ? (
                    <div className="p-4 text-center text-slate-500 text-sm">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif._id}
                        type="button"
                        onClick={() => handleNotificationClick(notif)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors ${
                          !notif.isRead ? 'bg-pink-50/50' : ''
                        }`}
                      >
                        <div className="flex gap-2">
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#E91E63] shrink-0 mt-1.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {formatTime(notif.createdAt)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="border-t border-slate-200 p-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleNotifClose();
                        navigate('/dashboard');
                      }}
                      className="w-full text-center text-xs text-[#E91E63] font-medium py-2 hover:bg-slate-50 rounded"
                    >
                      View all
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Account menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={handleMenuOpen}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 shrink-0"
            aria-label="account menu"
          >
            {user?.name?.charAt(0) ? (
              <span className="text-sm font-semibold">{user.name.charAt(0)}</span>
            ) : (
              <MdAccountCircle className="w-6 h-6" />
            )}
          </button>
          {anchorEl && (
            <>
              <div className="fixed inset-0 z-[1100]" onClick={handleMenuClose} aria-hidden="true" />
              <div className="absolute right-0 top-full mt-2 py-1 min-w-[160px] z-[1102] bg-white rounded-lg shadow-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    handleMenuClose();
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <MdAccountCircle className="w-4 h-4 shrink-0" /> Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <MdLogout className="w-4 h-4 shrink-0" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
