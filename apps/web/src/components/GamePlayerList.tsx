import { Player, PLAYER_COLOR_HEX } from '@catan/shared';
import { Avatar } from '@mantine/core';
import { motion } from 'motion/react';
import { useShallow } from 'zustand/react/shallow';
import {
  useCurrentPlayer,
  useGameStore,
  useTurnCurrentPlayer,
  useLongestRoadHolder,
  useLargestArmyHolder,
} from '../stores/gameStore';

type GamePlayerListProps = {
  players: Player[];
};

export function GamePlayerList({ players }: GamePlayerListProps) {
  // Get active player from store for placement phase highlighting
  const { id: placementPlayerId } = useCurrentPlayer();

  // Get current player for main game phase
  const turnCurrentPlayerId = useTurnCurrentPlayer();

  // Use main game player if available, otherwise use placement player
  const activePlayerId = turnCurrentPlayerId || placementPlayerId;

  // Read all player resources once at the top level with shallow equality
  const allPlayerResources = useGameStore(
    useShallow((state) => state.playerResources),
  );

  // Dev card state for badges
  const opponentDevCardCounts = useGameStore((s) => s.opponentDevCardCounts);
  const knightsPlayed = useGameStore((s) => s.knightsPlayed);
  const myDevCards = useGameStore((s) => s.myDevCards);
  const myPlayerId = useGameStore((s) => s.myPlayerId);

  // Longest road state
  const longestRoadHolderId = useLongestRoadHolder();

  // Largest army state
  const largestArmyHolderId = useLargestArmyHolder();

  // Settlements and roads for stats
  const settlements = useGameStore((s) => s.settlements);
  const roads = useGameStore((s) => s.roads);

  // Color mapping for backgrounds
  const colorMap: Record<string, string> = PLAYER_COLOR_HEX;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        width: '260px',
      }}
    >
      {players.map((player) => {
        const isActiveTurn = player.id === activePlayerId;
        const initials = player.nickname.slice(0, 2).toUpperCase();
        const playerColorHex = PLAYER_COLOR_HEX[player.color] || player.color;
        const playerResources = allPlayerResources[player.id] || {
          wood: 0,
          brick: 0,
          sheep: 0,
          wheat: 0,
          ore: 0,
        };

        // VP calculation from existing state
        const playerSettlements = settlements.filter(
          (s) => s.playerId === player.id,
        );
        const settlementCount = playerSettlements.filter(
          (s) => !s.isCity,
        ).length;
        const cityCount = playerSettlements.filter((s) => s.isCity).length;
        const hasLongestRoad = player.id === longestRoadHolderId;
        const hasLargestArmy = player.id === largestArmyHolderId;
        const longestRoadVP = hasLongestRoad ? 2 : 0;
        const largestArmyVP = hasLargestArmy ? 2 : 0;
        const publicVP =
          settlementCount + cityCount * 2 + longestRoadVP + largestArmyVP;

        // Calculate hidden VP from victory point cards (only for current player)
        const vpCardCount =
          player.id === myPlayerId
            ? myDevCards.filter((c) => c.type === 'victory_point').length
            : 0;
        const trueVP = publicVP + vpCardCount;

        // Calculate road count
        const roadCount = roads.filter((r) => r.playerId === player.id).length;

        // Calculate dev card count
        const devCardCount =
          player.id === myPlayerId
            ? myDevCards.length
            : opponentDevCardCounts[player.id] || 0;

        // Calculate total resource card count
        const totalCards = Object.values(playerResources).reduce(
          (sum, count) => sum + count,
          0,
        );

        return (
          <motion.div
            key={player.id}
            animate={
              isActiveTurn
                ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 10px 20px rgba(0,0,0,0.3)',
                      '0 15px 30px rgba(241,196,15,0.3)',
                      '0 10px 20px rgba(0,0,0,0.3)',
                    ],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: isActiveTurn ? Infinity : 0 }}
            style={{
              background: '#fdf6e3',
              border: isActiveTurn ? '4px solid #f1c40f' : '4px solid #8d6e63',
              borderRadius: '12px',
              width: '100%',
              position: 'relative',
              boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.3s, border 0.3s',
            }}
          >
            {/* Active turn marker */}
            <div
              style={{
                position: 'absolute',
                top: '-15px',
                right: '15px',
                background: '#f1c40f',
                color: '#333',
                padding: '4px 12px',
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: '11px',
                textTransform: 'uppercase',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                opacity: isActiveTurn ? 1 : 0,
                transition: 'opacity 0.3s',
              }}
            >
              {player.id === myPlayerId ? 'Your Turn' : 'Current Turn'}
            </div>

            {/* Player header */}
            <div
              style={{
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: '2px dashed #d7ccc8',
                background: 'rgba(0,0,0,0.03)',
              }}
            >
              {/* Avatar */}
              <Avatar
                size={40}
                radius="md"
                style={{
                  backgroundColor: colorMap[player.color] || player.color,
                  color: player.color === 'white' ? '#2D3142' : 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  fontFamily: 'Fraunces, serif',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
                  border: '2px solid rgba(0,0,0,0.1)',
                  flexShrink: 0,
                }}
              >
                {initials}
              </Avatar>

              {/* Player info */}
              <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                <h3
                  style={{
                    fontSize: '16px',
                    color: '#5d4037',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {player.nickname}
                  {player.id === myPlayerId && ' (You)'}
                </h3>

                {/* Achievement badges */}
                {(hasLongestRoad || hasLargestArmy) && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '4px',
                      marginTop: '4px',
                    }}
                  >
                    {hasLongestRoad && (
                      <div
                        style={{
                          background: '#ffe0b2',
                          color: '#e65100',
                          border: '1px solid #ffcc80',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="Longest Road"
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path d="M18 4l-6 16L6 4" />
                          <circle cx="12" cy="12" r="2" />
                        </svg>
                        Road
                      </div>
                    )}
                    {hasLargestArmy && (
                      <div
                        style={{
                          background: '#ffcdd2',
                          color: '#b71c1c',
                          border: '1px solid #ef9a9a',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="Largest Army"
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4 4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z" />
                          <path d="M12 12v10" />
                        </svg>
                        Army
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Stats area */}
            <div
              style={{
                padding: '15px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                justifyItems: 'center',
              }}
            >
              {/* Row 1: Settlements */}
              <div
                style={{
                  background: 'white',
                  border: '1px solid #d7ccc8',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
                title="Settlements"
              >
                <svg
                  style={{ width: '18px', height: '18px', color: '#5d4037' }}
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
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    right: '-6px',
                    background: '#5d4037',
                    color: 'white',
                    fontSize: '10px',
                    minWidth: '16px',
                    height: '16px',
                    padding: '0 4px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Inter, sans-serif',
                    boxSizing: 'border-box',
                  }}
                >
                  {settlementCount}
                </div>
              </div>

              {/* Row 1: Cities */}
              <div
                style={{
                  background: 'white',
                  border: '1px solid #d7ccc8',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
                title="Cities"
              >
                <svg
                  style={{ width: '18px', height: '18px', color: '#5d4037' }}
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
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    right: '-6px',
                    background: '#5d4037',
                    color: 'white',
                    fontSize: '10px',
                    minWidth: '16px',
                    height: '16px',
                    padding: '0 4px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Inter, sans-serif',
                    boxSizing: 'border-box',
                  }}
                >
                  {cityCount}
                </div>
              </div>

              {/* Row 1: Roads */}
              <div
                style={{
                  background: 'white',
                  border: '1px solid #d7ccc8',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
                title="Roads Built"
              >
                <svg
                  style={{ width: '18px', height: '18px', color: '#5d4037' }}
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
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    right: '-6px',
                    background: '#5d4037',
                    color: 'white',
                    fontSize: '10px',
                    minWidth: '16px',
                    height: '16px',
                    padding: '0 4px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Inter, sans-serif',
                    boxSizing: 'border-box',
                  }}
                >
                  {roadCount}
                </div>
              </div>

              {/* Row 2: Knights */}
              <div
                style={{
                  background: 'white',
                  border: '1px solid #d7ccc8',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
                title="Knights Played"
              >
                <svg
                  style={{ width: '18px', height: '18px', color: '#5d4037' }}
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
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    right: '-6px',
                    background: '#5d4037',
                    color: 'white',
                    fontSize: '10px',
                    minWidth: '16px',
                    height: '16px',
                    padding: '0 4px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Inter, sans-serif',
                    boxSizing: 'border-box',
                  }}
                >
                  {knightsPlayed[player.id] || 0}
                </div>
              </div>

              {/* Row 2: Dev Cards */}
              <div
                style={{
                  background: 'white',
                  border: '1px solid #d7ccc8',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
                title="Development Cards Held"
              >
                <svg
                  style={{ width: '18px', height: '18px', color: '#2c3e50' }}
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
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    right: '-6px',
                    background: '#34495e',
                    color: 'white',
                    fontSize: '10px',
                    minWidth: '16px',
                    height: '16px',
                    padding: '0 4px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Inter, sans-serif',
                    boxSizing: 'border-box',
                  }}
                >
                  {devCardCount}
                </div>
              </div>

              {/* Row 2: Victory Points */}
              <div
                style={{
                  background: 'white',
                  border: '1px solid #d7ccc8',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
                title="Victory Points"
              >
                <svg
                  style={{ width: '18px', height: '18px', color: '#d35400' }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    right: '-6px',
                    background: '#e67e22',
                    color: 'white',
                    fontSize: '10px',
                    minWidth: '16px',
                    height: '16px',
                    padding: '0 4px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Inter, sans-serif',
                    boxSizing: 'border-box',
                  }}
                >
                  {publicVP}
                  {player.id === myPlayerId && vpCardCount > 0 && (
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#27ae60',
                        fontWeight: 'bold',
                        marginLeft: '2px',
                      }}
                      title={`True score: ${trueVP} (includes ${vpCardCount} hidden VP card${vpCardCount !== 1 ? 's' : ''})`}
                    >
                      *
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Resource cards display */}
            <div
              style={{
                position: 'absolute',
                bottom: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#fff',
                border: '1px solid #ccc',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
                zIndex: 2,
              }}
            >
              <svg
                style={{ width: '14px', height: '14px' }}
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
              {totalCards} Cards
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
