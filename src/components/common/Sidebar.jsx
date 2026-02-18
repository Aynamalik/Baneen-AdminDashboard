import { useNavigate, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdPeople,
  MdDirectionsCar,
  MdPendingActions,
  MdLocalTaxi,
  MdUpdate,
  MdPayment,
  MdCardMembership,
  MdReportProblem,
  MdEmergency,
  MdAssessment,
  MdSmartToy,
  MdSettings,
} from 'react-icons/md';
import { useSelector } from 'react-redux';
import { ROUTES } from '../../utils/constants';

const DRAWER_WIDTH = 240;

const menuItems = [
  { text: 'Dashboard', icon: MdDashboard, path: ROUTES.DASHBOARD },
  { text: 'Users', icon: MdPeople, path: ROUTES.USERS },
  { text: 'Drivers', icon: MdDirectionsCar, path: ROUTES.DRIVERS },
  { text: 'Pending Drivers', icon: MdPendingActions, path: ROUTES.DRIVERS_PENDING },
  { text: 'Rides', icon: MdLocalTaxi, path: ROUTES.RIDES },
  { text: 'Active Rides', icon: MdUpdate, path: ROUTES.RIDES_ACTIVE },
  { text: 'Payments', icon: MdPayment, path: ROUTES.PAYMENTS },
  { text: 'Subscriptions', icon: MdCardMembership, path: ROUTES.SUBSCRIPTIONS },
  { text: 'Complaints', icon: MdReportProblem, path: ROUTES.COMPLAINTS },
  { text: 'SOS Alerts', icon: MdEmergency, path: ROUTES.SOS },
  { text: 'Reports', icon: MdAssessment, path: ROUTES.REPORTS },
  { text: 'Chatbot', icon: MdSmartToy, path: ROUTES.CHATBOT },
  { text: 'Settings', icon: MdSettings, path: ROUTES.SETTINGS },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen } = useSelector((state) => state.ui);

  return (
    <aside
      className="fixed top-0 left-0 h-full z-[1100] flex flex-col shrink-0 overflow-hidden transition-[width] duration-200 ease-out"
      style={{ width: sidebarOpen ? DRAWER_WIDTH : 0 }}
    >
      <div
        className="h-full flex flex-col bg-white border-r border-slate-200/80 shadow-sm"
        style={{ width: DRAWER_WIDTH, minWidth: DRAWER_WIDTH }}
      >
        <div className="h-16 shrink-0" aria-hidden="true" />
        <nav
          className="flex-1 overflow-y-auto py-3 px-3 flex flex-col flex-nowrap gap-0.5"
          style={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap' }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = location.pathname === item.path;
            return (
              <button
                key={item.text}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left border-0 cursor-pointer text-sm font-medium transition-all duration-150 shrink-0
                  ${isSelected
                    ? 'bg-[#E91E63] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              style={{ width: '100%', minWidth: 0 }}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{item.text}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
