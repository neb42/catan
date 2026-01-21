import { motion } from 'motion/react';

import { useGameStore } from '../../stores/gameStore';

const resources = [
  { type: 'wood', label: 'Wood', bg: '#81C784', border: '#4CAF50', icon: '🌲' },
  { type: 'brick', label: 'Brick', bg: '#FF8A65', border: '#E64A19', icon: '🧱' },
  { type: 'sheep', label: 'Sheep', bg: '#C5E1A5', border: '#7CB342', icon: '🐑' },
  { type: 'wheat', label: 'Wheat', bg: '#FFF176', border: '#FBC02D', icon: '🌾' },
  { type: 'ore', label: 'Ore', bg: '#B0BEC5', border: '#546E7A', icon: '⛰️' },
] as const;

export function ResourceCards({ playerId }: { playerId: string | null }) {
  const player = useGameStore((state) =>
    state.gameState?.players.find((candidate) => candidate.id === playerId)
  );

  if (!player) return null;

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        paddingTop: '20px',
        gap: 0,
      }}
    >
      {resources.map((resource, index) => {
        const count = player.resources[resource.type] ?? 0;

        return (
          <motion.div
            key={`${resource.type}-${count}`}
            whileHover={{ y: -20, marginRight: 10 }}
            initial={{ scale: 1 }}
            animate={{ scale: count > 0 ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.4 }}
            style={{
              width: 90,
              height: 130,
              background: resource.bg,
              borderRadius: 12,
              borderBottom: `4px solid ${resource.border}`,
              marginRight: -40,
              boxShadow: '-2px 0 10px rgba(0,0,0,0.05)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 10,
              fontFamily: 'Fredoka, sans-serif',
              fontWeight: 700,
              color: '#fff',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              zIndex: index,
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>{resource.label}</span>
            <span style={{ fontSize: '1.8rem' }}>{resource.icon}</span>
            <span style={{ fontSize: '0.8rem' }}>×{count}</span>

            {count > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  background: '#EF5350',
                  color: 'white',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  fontWeight: 700,
                }}
              >
                {count}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
