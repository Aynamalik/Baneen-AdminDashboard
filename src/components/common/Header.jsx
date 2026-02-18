import { useState } from 'react';
import {
  MdMenu,
  MdNotifications,
  MdSearch,
  MdAccountCircle,
  MdLogout,
} from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../store/slices/ui.slice';
import { logout } from '../../store/slices/auth.slice';
import { useNavigate } from 'react-router-dom';

const DRAWER_WIDTH = 240;

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { sidebarOpen } = useSelector((state) => state.ui);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = () => setAnchorEl(true);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleMenuClose();
  };

  return (
    <header
      className="fixed top-0 h-16 flex items-center flex-nowrap px-4 z-[1101] text-white shadow-md"
      style={{
        left: sidebarOpen ? DRAWER_WIDTH : 0,
        right: 0,
        background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
        transition: 'left 200ms ease',
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
        <button className="relative p-2 rounded-lg hover:bg-white/15 shrink-0">
          <MdNotifications className="w-5 h-5" />
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold bg-red-500 rounded-full">4</span>
        </button>
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
                  onClick={handleMenuClose}
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
