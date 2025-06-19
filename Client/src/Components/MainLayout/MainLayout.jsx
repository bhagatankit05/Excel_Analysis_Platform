// src/components/Layouts/MainLayout.jsx

import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <div style={{ padding: '20px', minHeight: 'calc(100vh - 140px)' }}>
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default MainLayout;
