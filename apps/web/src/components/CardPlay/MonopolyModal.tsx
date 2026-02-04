import { ResourceType } from '@catan/shared';
import { useGameStore, useDevCardPlayPhase } from '../../stores/gameStore';
import { ResourceIcon } from '../ResourceIcon/ResourceIcon';

const RESOURCES: ResourceType[] = ['wood', 'brick', 'sheep', 'wheat', 'ore'];

const RESOURCE_COLORS: Record<ResourceType, string> = {
  wood: '#228B22',
  brick: '#B22222',
  sheep: '#90EE90',
  wheat: '#FFD700',
  ore: '#808080',
};

export function MonopolyModal() {
  const devCardPlayPhase = useDevCardPlayPhase();
  const sendMessage = useGameStore((s) => s.sendMessage);

  const isOpen = devCardPlayPhase === 'monopoly';

  const handleSelect = (resourceType: ResourceType) => {
    if (!sendMessage) return;
    sendMessage({
      type: 'monopoly_select',
      resourceType,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fdf6e3',
          border: '4px solid #8d6e63',
          borderRadius: '12px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
          width: '90%',
          maxWidth: '500px',
          padding: '0',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '2px dashed #d7ccc8',
            background: 'rgba(0,0,0,0.03)',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: '#5d4037',
              fontFamily: 'Fraunces, serif',
            }}
          >
            Monopoly
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          <p
            style={{
              fontSize: '14px',
              color: '#5d4037',
              marginTop: 0,
              marginBottom: '20px',
              lineHeight: 1.5,
            }}
          >
            Choose a resource type to take from all other players. You will
            receive ALL of that resource from every opponent.
          </p>

          {/* Resource selection buttons */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
            }}
          >
            {RESOURCES.map((resource) => (
              <button
                key={resource}
                onClick={() => handleSelect(resource)}
                style={{
                  background: 'white',
                  border: `2px solid ${RESOURCE_COLORS[resource]}`,
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s',
                  fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 8px rgba(0,0,0,0.15)';
                  e.currentTarget.style.backgroundColor =
                    RESOURCE_COLORS[resource];
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#5d4037';
                }}
              >
                <ResourceIcon type={resource} size="lg" />
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'inherit',
                  }}
                >
                  {resource.charAt(0).toUpperCase() + resource.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
