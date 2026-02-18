import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import { useSelector } from 'react-redux';

const DRAWER_WIDTH = 240;

const MainLayout = ({ children }) => {
  const { sidebarOpen } = useSelector((state) => state.ui);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Header />
      <Sidebar />
      <main
        className="flex-1 min-w-0 min-h-screen overflow-auto"
        style={{
          marginLeft: sidebarOpen ? DRAWER_WIDTH : 0,
          paddingTop: 80,
          paddingRight: 24,
          paddingBottom: 24,
          paddingLeft: 24,
          backgroundColor: '#F8FAFC',
          transition: 'margin 200ms ease',
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
