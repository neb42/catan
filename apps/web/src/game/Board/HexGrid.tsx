import { HexGrid as ReactHexGrid, Layout, Hexagon } from 'react-hexgrid';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';

import { useGameStore } from '../../stores/gameStore';
import { HexTile } from './HexTile';
import { Port } from './Port';
import { Road } from './Road';
import { Settlement } from './Settlement';

const normalizeEdgeId = (edgeId: string): string => {
  const [a, b] = edgeId.split('-');
  if (!a || !b) return edgeId;
  const [first, second] = [a, b].sort();
  return `${first}-${second}`;
};

export function HexGrid() {
  const gameState = useGameStore((state) => state.gameState);
  const myPlayerId = useGameStore((state) => state.myPlayerId);
  const selectedVertex = useGameStore((state) => state.selectedVertex);
  const selectedEdge = useGameStore((state) => state.selectedEdge);
  const setSelectedVertex = useGameStore((state) => state.setSelectedVertex);
  const setSelectedEdge = useGameStore((state) => state.setSelectedEdge);
  const sendMessage = useGameStore((state) => state.sendMessage);
  const lastError = useGameStore((state) => state.lastError);
  const setLastError = useGameStore((state) => state.setLastError);
  const [placementStatus, setPlacementStatus] = useState<string | null>(null);

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  const myPlayer = gameState.players.find((player) => player.id === myPlayerId);
  const isMyTurn = Boolean(myPlayerId && gameState.currentPlayer === myPlayerId);
  const isInitialPlacement = gameState.phase === 'initial_placement';
  const pendingRoad =
    isInitialPlacement && isMyTurn && myPlayer
      ? myPlayer.settlements.length > myPlayer.roads.length
      : false;
  const showVertices = isInitialPlacement && isMyTurn && !pendingRoad;
  const showEdges = isInitialPlacement && isMyTurn && pendingRoad;
  const playerColor = myPlayer?.color ?? '#2f2f2f';

  const occupiedVertices = useMemo(() => {
    const vertices = new Set<string>();
    gameState.players.forEach((player) => {
      player.settlements.forEach((vertexId) => vertices.add(vertexId));
      player.cities.forEach((vertexId) => vertices.add(vertexId));
    });
    return vertices;
  }, [gameState.players]);

  const occupiedEdges = useMemo(() => {
    const edges = new Set<string>();
    gameState.players.forEach((player) => {
      player.roads.forEach((edgeId) => edges.add(normalizeEdgeId(edgeId)));
    });
    return edges;
  }, [gameState.players]);

  const boardHexKeys = useMemo(() => {
    const keys = new Set<string>();
    gameState.board.hexes.forEach((hex) => {
      keys.add(`${hex.coord.q},${hex.coord.r}`);
    });
    return keys;
  }, [gameState.board.hexes]);

  useEffect(() => {
    if (!selectedVertex) return;
    if (!sendMessage || !myPlayerId) {
      setSelectedVertex(null);
      return;
    }
    if (!isMyTurn || !isInitialPlacement || pendingRoad) {
      setSelectedVertex(null);
      return;
    }

    setLastError(null);
    sendMessage({ type: 'place_settlement', playerId: myPlayerId, vertexId: selectedVertex });
    setPlacementStatus('Placing settlement...');
    setSelectedVertex(null);
  }, [
    selectedVertex,
    sendMessage,
    myPlayerId,
    setSelectedVertex,
    setLastError,
    isMyTurn,
    isInitialPlacement,
    pendingRoad,
  ]);

  useEffect(() => {
    if (!selectedEdge) return;
    if (!sendMessage || !myPlayerId) {
      setSelectedEdge(null);
      return;
    }
    if (!isMyTurn || !isInitialPlacement || !pendingRoad) {
      setSelectedEdge(null);
      return;
    }

    setLastError(null);
    sendMessage({ type: 'place_road', playerId: myPlayerId, edgeId: selectedEdge });
    setPlacementStatus('Placing road...');
    setSelectedEdge(null);
  }, [
    selectedEdge,
    sendMessage,
    myPlayerId,
    setSelectedEdge,
    setLastError,
    isMyTurn,
    isInitialPlacement,
    pendingRoad,
  ]);

  useEffect(() => {
    if (!placementStatus) return;
    const timeout = setTimeout(() => setPlacementStatus(null), 1600);
    return () => clearTimeout(timeout);
  }, [placementStatus]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <ReactHexGrid width={900} height={700} viewBox="-55 -55 110 110">
        <Layout size={{ x: 10, y: 10 }} flat={false} spacing={1.05}>
          {gameState.board.hexes.map((hex) => (
            <Hexagon
              key={`${hex.coord.q},${hex.coord.r}`}
              q={hex.coord.q}
              r={hex.coord.r}
              s={-hex.coord.q - hex.coord.r}
            >
              <HexTile
                hex={hex}
                showVertices={showVertices}
                showEdges={showEdges}
                selectedVertex={selectedVertex}
                selectedEdge={selectedEdge}
                onSelectVertex={(vertexId) => setSelectedVertex(vertexId)}
                onSelectEdge={(edgeId) => setSelectedEdge(normalizeEdgeId(edgeId))}
                playerColor={playerColor}
                occupiedVertices={occupiedVertices}
                occupiedEdges={occupiedEdges}
                boardHexKeys={boardHexKeys}
              />
            </Hexagon>
          ))}

          {gameState.board.ports.map((port, index) => (
            <Port
              key={`port-${index}`}
              position={port.position}
              type={port.type}
            />
          ))}

          {gameState.players.flatMap((player) =>
            player.roads.map((edgeId) => (
              <Road key={`${player.id}-${edgeId}`} edgeId={edgeId} color={player.color} />
            ))
          )}

          {gameState.players.flatMap((player) =>
            player.settlements.map((vertexId) => (
              <Settlement
                key={`${player.id}-${vertexId}`}
                vertexId={vertexId}
                color={player.color}
                isCity={false}
              />
            ))
          )}

          {gameState.players.flatMap((player) =>
            player.cities.map((vertexId) => (
              <Settlement
                key={`${player.id}-${vertexId}-city`}
                vertexId={vertexId}
                color={player.color}
                isCity
              />
            ))
          )}
        </Layout>
      </ReactHexGrid>

      {(placementStatus || (isMyTurn && lastError)) && (
        <div
          style={{
            marginTop: '0.75rem',
            textAlign: 'center',
            fontSize: 14,
            fontWeight: 600,
            color: lastError ? '#c62828' : '#1b5e20',
          }}
        >
          {lastError && isMyTurn ? lastError : placementStatus}
        </div>
      )}
    </motion.div>
  );
}
