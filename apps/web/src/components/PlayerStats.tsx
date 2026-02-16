import { ReactNode } from 'react';

type PlayerStatProps = {
  icon: ReactNode;
  count: number;
  title: string;
  isWarning?: boolean;
};

function PlayerStat({ icon, count, title, isWarning = false }: PlayerStatProps) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #d7ccc8',
        borderRadius: '50%',
        width: '100%',
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
      title={title}
    >
      {icon}
      <div
        style={{
          position: 'absolute',
          bottom: '-6px',
          right: '-6px',
          background: isWarning ? '#e74c3c' : '#5d4037',
          color: 'white',
          fontSize: '0.85rem',
          width: '1.5rem',
          height: '1.5rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          boxSizing: 'border-box',
          lineHeight: 1,
        }}
      >
        {count}
      </div>
    </div>
  );
}

type PlayerStatsProps = {
  settlementCount: number;
  cityCount: number;
  roadCount: number;
  knightsPlayed: number;
  devCardCount: number;
  totalCards: number;
};

const sizeSize = {
width: '50%',height: '50%', color: '#5d4037', };

export function PlayerStats({
  settlementCount,
  cityCount,
  roadCount,
  knightsPlayed,
  devCardCount,
  totalCards,
}: PlayerStatsProps) {
  return (
    <div
      style={{
        padding: '15px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        justifyItems: 'center',
      }}
    >
      <PlayerStat
        title="Settlements"
        count={settlementCount}
        icon={
          <svg
            style={{ ...sizeSize}}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        }
      />
      <PlayerStat
        title="Cities"
        count={cityCount}
        icon={
          <svg
            style={{ ...sizeSize}}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 22h20" />
            <path d="M4 22V9l7-4 2 2 5-3v18" />
            <path d="M9 22V12h6v10" />
          </svg>
        }
      />
      <PlayerStat
        title="Roads Built"
        count={roadCount}
        icon={
          <svg
            style={{ ...sizeSize}}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 4l-6 16L6 4" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        }
      />
      <PlayerStat
        title="Knights Played"
        count={knightsPlayed}
        icon={
          <svg
            style={{ ...sizeSize }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4 4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z" />
            <path d="M12 12v10" />
            <path d="M9 16h6" />
          </svg>
        }
      />
      <PlayerStat
        title="Development Cards Held"
        count={devCardCount}
        icon={
          <svg
            style={{ ...sizeSize }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <path d="M12 18h.01" />
            <path d="M12 14c0-2 1-3 2-4 .5-.5 1-1.5 1-2.5 0-2-1.5-3-3-3s-3 1-3 3" />
          </svg>
        }
      />
      <PlayerStat
        title="Resource Cards Held"
        count={totalCards}
        isWarning={totalCards > 7}
        icon={
          <svg
            style={{
              width: '50%',
              height: '50%',
              color: totalCards > 7 ? '#e74c3c' : '#5d4037',
            }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect
              x="6"
              y="2"
              width="12"
              height="16"
              rx="2"
              transform="rotate(-10 12 10)"
            />
            <rect
              x="6"
              y="2"
              width="12"
              height="16"
              rx="2"
              transform="rotate(0 12 10)"
            />
            <rect
              x="6"
              y="2"
              width="12"
              height="16"
              rx="2"
              transform="rotate(10 12 10)"
            />
          </svg>
        }
      />
    </div>
  );
}
