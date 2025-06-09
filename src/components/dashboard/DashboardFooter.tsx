
import React from 'react';

const DashboardFooter: React.FC = () => {
  return (
    <footer className="bg-white py-6 border-t border-green-100">
      <div className="container mx-auto px-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
      </div>
    </footer>
  );
};

export default DashboardFooter;
