import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GtaSyllabusMap } from '../../components/map/GtaSyllabusMap';

export const SyllabusPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen bg-[#050811] overflow-hidden">
      <GtaSyllabusMap
        isOpen={true}
        onClose={() => navigate('/dashboard')}
        onStartQuest={(node) => {
          navigate(`/quest/${node.id}`);
        }}
      />
    </div>
  );
};
