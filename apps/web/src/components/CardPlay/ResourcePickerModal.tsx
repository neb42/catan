import { useState } from 'react';
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

export function ResourcePickerModal() {
  const devCardPlayPhase = useDevCardPlayPhase();
  const sendMessage = useGameStore((s) => s.sendMessage);
  const [selected, setSelected] = useState<ResourceType[]>([]);

  const isOpen = devCardPlayPhase === 'year_of_plenty';

  const handleSelect = (resource: ResourceType) => {
    if (selected.length >= 2) return;
    setSelected([...selected, resource]);
  };

  const handleRemove = (index: number) => {
    setSelected(selected.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selected.length !== 2 || !sendMessage) return;

    sendMessage({
      type: 'year_of_plenty_select',
      resources: selected as [ResourceType, ResourceType],
    });

    setSelected([]);
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
            Year of Plenty
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          <p
            style={{
              fontSize: '14px',
              color: '#5d4037',
              marginTop: 0,
              marginBottom: '16px',
              lineHeight: 1.5,
            }}
          >
            Select 2 resources to take from the bank. You can select the same
            resource twice.
          </p>

          {/* Selected section */}
          <div
            style={{
              background: 'rgba(0,0,0,0.03)',
              borderBottom: '2px dashed #d7ccc8',
              padding: '12px',
              marginBottom: '16px',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#5d4037',
                }}
              >
                Selected:
              </span>
              {selected.length === 0 && (
                <span style={{ fontSize: '14px', color: '#a1887f' }}>None</span>
              )}
              {selected.map((resource, i) => (
                <div
                  key={i}
                  onClick={() => handleRemove(i)}
                  style={{
                    background: RESOURCE_COLORS[resource],
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow =
                      '0 2px 4px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {resource.charAt(0).toUpperCase() + resource.slice(1)} ✕
                </div>
              ))}
            </div>
          </div>

          {/* Resource selection buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '20px',
            }}
          >
            {RESOURCES.map((resource) => (
              <button
                key={resource}
                onClick={() => handleSelect(resource)}
                disabled={selected.length >= 2}
                style={{
                  background: 'white',
                  border: `2px solid ${RESOURCE_COLORS[resource]}`,
                  borderRadius: '8px',
                  padding: '10px 16px',
                  cursor: selected.length >= 2 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: RESOURCE_COLORS[resource],
                  opacity: selected.length >= 2 ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (selected.length < 2) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 8px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <ResourceIcon type={resource} size="sm" />
                {resource.charAt(0).toUpperCase() + resource.slice(1)}
              </button>
            ))}
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={selected.length !== 2}
            style={{
              width: '100%',
              background: selected.length === 2 ? '#5d4037' : '#d7ccc8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: selected.length === 2 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={(e) => {
              if (selected.length === 2) {
                e.currentTarget.style.background = '#4e342e';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (selected.length === 2) {
                e.currentTarget.style.background = '#5d4037';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            Take {selected.length}/2 Resources
          </button>
        </div>
      </div>
    </div>
  );
}
