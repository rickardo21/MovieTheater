import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-black">
      <Outlet />
    </div>
  );
};

export default MainLayout;
