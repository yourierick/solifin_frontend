import { useTheme } from '../contexts/ThemeContext';
import Tree from 'react-d3-tree';
import { useCallback, useState } from 'react';

// Données d'exemple pour l'arbre de parrainage
const generateReferralData = (depth = 4) => {
  const generateUser = (level, parent = '') => {
    const id = parent ? `${parent}-${Math.random().toString(36).substr(2, 5)}` : 'root';
    const user = {
      name: id === 'root' ? 'Vous' : `Filleul ${id}`,
      attributes: {
        niveau: `Niveau ${level}`,
        gains: `${Math.floor(Math.random() * 1000)}€`,
        statut: Math.random() > 0.3 ? 'Actif' : 'Inactif'
      },
      children: level < depth ? Array(Math.floor(Math.random() * 3) + 1).fill(null).map(() => generateUser(level + 1, id)) : []
    };
    return user;
  };

  return generateUser(0);
};

const getLevelGradient = (level) => {
  const gradients = [
    ['#16a34a', '#22c55e'], // primary
    ['#2563eb', '#3b82f6'], // blue
    ['#7c3aed', '#8b5cf6'], // purple
    ['#db2777', '#ec4899'], // pink
    ['#ea580c', '#f97316']  // orange
  ];
  return gradients[level] || gradients[0];
};

const CustomNode = ({ nodeDatum, isDarkMode, toggleNode }) => {
  const [isHovered, setIsHovered] = useState(false);
  const level = nodeDatum.attributes.niveau.split(' ')[1];
  const [gradientStart, gradientEnd] = getLevelGradient(parseInt(level));
  const uniqueId = `gradient-${nodeDatum.name.replace(/\s+/g, '-').toLowerCase()}`;
  
  // Définition des couleurs adaptatives
  const colors = {
    background: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    border: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.8)',
    text: isDarkMode ? '#FFFFFF' : '#000000',
    activeStatus: isDarkMode ? '#6EE7B7' : '#059669',
    inactiveStatus: isDarkMode ? '#FCA5A5' : '#DC2626',
    shadow: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)',
  };

  return (
    <g 
      onClick={toggleNode}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      <defs>
        <radialGradient id={uniqueId}>
          <stop offset="0%" stopColor={gradientEnd} />
          <stop offset="100%" stopColor={gradientStart} />
        </radialGradient>
      </defs>

      {/* Cercle d'ombre */}
      <circle
        r={22}
        fill={colors.shadow}
        transform="translate(2, 2)"
      />

      {/* Cercle principal */}
      <circle 
        r={20} 
        fill={`url(#${uniqueId})`}
        stroke={colors.border}
        strokeWidth={isHovered ? 3 : 2}
        style={{
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        }}
      />

      {/* Conteneur des informations */}
      <g className="rd3t-label">
        {/* Fond du texte avec effet de flou */}
        <rect
          x="-65"
          y="25"
          width="130"
          height="65"
          rx="10"
          fill={colors.background}
          stroke={colors.border}
          strokeWidth="1"
          filter={isDarkMode ? 'url(#blur-dark)' : 'url(#blur-light)'}
          style={{
            transition: 'all 0.3s ease',
            opacity: isHovered ? 1 : 0.95,
          }}
        />

        {/* Filtres pour l'effet de flou */}
        <defs>
          <filter id="blur-dark" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
          <filter id="blur-light" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        {/* Nom avec effet de texte */}
        <text
          className="rd3t-label__title"
          textAnchor="middle"
          x="0"
          y="50"
          fill={colors.text}
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            textShadow: isDarkMode ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          {nodeDatum.name}
        </text>

        {/* Gains */}
        <text
          className="rd3t-label__attributes"
          x="0"
          y="65"
          textAnchor="middle"
          fill={colors.text}
          style={{
            fontSize: '12px',
            transition: 'all 0.3s ease',
            letterSpacing: '0.025em',
            opacity: 0.8,
          }}
        >
          {nodeDatum.attributes.gains}
        </text>

        {/* Statut avec effet de brillance */}
        <text
          className="rd3t-label__attributes"
          x="0"
          y="80"
          textAnchor="middle"
          fill={nodeDatum.attributes.statut === 'Actif' ? colors.activeStatus : colors.inactiveStatus}
          style={{
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            filter: isHovered ? 'brightness(1.2)' : 'brightness(1)',
            textShadow: isDarkMode 
              ? '0 0 8px rgba(110, 231, 183, 0.3)' 
              : '0 0 8px rgba(5, 150, 105, 0.2)',
          }}
        >
          {nodeDatum.attributes.statut}
        </text>
      </g>
    </g>
  );
};

export default function ReferralTree() {
  const { isDarkMode } = useTheme();
  const treeData = generateReferralData();

  const renderCustomNode = useCallback((props) => (
    <CustomNode {...props} isDarkMode={isDarkMode} />
  ), [isDarkMode]);

  return (
    <div className="space-y-4">
      <div className={`w-full p-4 rounded-lg ${
        isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
      } shadow-lg backdrop-blur-sm`}>
        <h2 className={`text-xl font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Mon réseau de parrainage
        </h2>
        <p className={`text-sm ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Visualisez votre réseau jusqu'à la 4ème génération. Cliquez sur les nœuds pour les développer/réduire.
        </p>
      </div>

      <div className={`w-full h-[700px] ${
        isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
      } rounded-lg shadow-lg p-4 relative backdrop-blur-sm`}>
        <div className="absolute inset-0 overflow-hidden">
          <Tree
            data={treeData}
            orientation="vertical"
            renderCustomNodeElement={renderCustomNode}
            pathFunc="step"
            separation={{ siblings: 2, nonSiblings: 2.5 }}
            translate={{ x: 500, y: 50 }}
            nodeSize={{ x: 150, y: 120 }}
            pathClassFunc={() => `stroke-current ${
              isDarkMode ? 'text-gray-600 stroke-[1.5]' : 'text-gray-300 stroke-2'
            } transition-all duration-300`}
            zoomable={true}
            draggable={true}
            collapsible={true}
          />
        </div>
      </div>
    </div>
  );
} 