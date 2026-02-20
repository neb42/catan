import { Howl } from 'howler';
import { useGameStore } from '../stores/gameStore';

export type SoundName =
  | 'diceRoll'
  | 'buildRoad'
  | 'buildSettlement'
  | 'buildCity'
  | 'resourceGain'
  | 'yourTurn'
  | 'tradeOffer'
  | 'tradeComplete'
  | 'robberWarning'
  | 'robberPlace'
  | 'robberSteal'
  | 'devCardBuy'
  | 'devCardPlay'
  | 'victory'
  | 'negative';

interface SoundConfig {
  src: string[];
  volume: number;
}

const SOUND_CONFIG: Record<SoundName, SoundConfig> = {
  diceRoll: { src: ['/sounds/dice-roll.mp3'], volume: 0.7 },
  buildRoad: { src: ['/sounds/build-road.mp3'], volume: 0.7 },
  buildSettlement: { src: ['/sounds/build-settlement.mp3'], volume: 0.7 },
  buildCity: { src: ['/sounds/build-city.mp3'], volume: 0.7 },
  resourceGain: { src: ['/sounds/resource-gain.mp3'], volume: 0.5 },
  yourTurn: { src: ['/sounds/your-turn.mp3'], volume: 0.7 },
  tradeOffer: { src: ['/sounds/trade-offer.mp3'], volume: 0.6 },
  tradeComplete: { src: ['/sounds/trade-complete.mp3'], volume: 0.7 },
  robberWarning: { src: ['/sounds/robber-warning.mp3'], volume: 0.7 },
  robberPlace: { src: ['/sounds/robber-place.mp3'], volume: 0.7 },
  robberSteal: { src: ['/sounds/robber-steal.mp3'], volume: 0.6 },
  devCardBuy: { src: ['/sounds/dev-card-buy.mp3'], volume: 0.6 },
  devCardPlay: { src: ['/sounds/dev-card-play.mp3'], volume: 0.7 },
  victory: { src: ['/sounds/victory.mp3'], volume: 0.8 },
  negative: { src: ['/sounds/negative.mp3'], volume: 0.6 },
};

class SoundService {
  private sounds: Map<SoundName, Howl> = new Map();
  private initialized = false;

  init(): void {
    if (this.initialized) return;

    for (const [name, config] of Object.entries(SOUND_CONFIG)) {
      const howl = new Howl({
        src: config.src,
        volume: config.volume,
        preload: true,
      });
      this.sounds.set(name as SoundName, howl);
    }

    this.initialized = true;
  }

  play(name: SoundName): void {
    if (!useGameStore.getState().soundEnabled) return;

    const sound = this.sounds.get(name);
    if (sound) {
      sound.play();
    }
  }
}

export const soundService = new SoundService();
