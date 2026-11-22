import { CollapsedGameCard } from './CollapsedGameCard';
import { ExpandedGameCard } from './ExpandedGameCard';
import type { GameCardProps } from './GameCard.types';

export function GameCard(props: GameCardProps) {
  return props.isExpanded ? (
    <ExpandedGameCard {...props} />
  ) : (
    <CollapsedGameCard {...props} />
  );
}
