import React, { useState } from 'react';
import { RegistrationArea } from './components/RegistrationArea';
import { DataVisualization } from './components/DataVisualization';
import { Plus, BarChart3 } from 'lucide-react';

type ActiveSection = 'registration' | 'visualization';

function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('registration');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const NavButton: React.FC<{
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
  }> = ({ active, onClick, icon, label }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        active
          ? 'bg-blue-600 text-white shadow-lg transform scale-105'
          : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg hover:transform hover:scale-105'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Customer Reward Points Management
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete system for managing customer registrations, establishments, purchases, and reward points tracking
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <NavButton
            active={activeSection === 'registration'}
            onClick={() => setActiveSection('registration')}
            icon={<Plus className="w-5 h-5" />}
            label="Registration Area"
          />
          <NavButton
            active={activeSection === 'visualization'}
            onClick={() => setActiveSection('visualization')}
            icon={<BarChart3 className="w-5 h-5" />}
            label="Data Visualization"
          />
        </div>

        <div className="max-w-4xl mx-auto">
          {activeSection === 'registration' && <RegistrationArea onSuccess={handleSuccess} />}
          {activeSection === 'visualization' && <DataVisualization key={refreshKey} />}
        </div>

        <div className="text-center mt-12 text-gray-500">
          <p>Built with React, TypeScript, and Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}

export default App;