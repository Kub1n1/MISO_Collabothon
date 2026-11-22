import type { GameEvent, MandatoryEventSettlement } from '../../../types';

export interface GameCardProps {
  card: GameEvent;
  isMandatory: boolean;
  isResolved?: boolean;
  isExpanded: boolean;
  onSelect: (id: number) => void;
  onPlay: (
    card: GameEvent,
    optionIndex: number | null,
    settlement: MandatoryEventSettlement
  ) => boolean;
}
