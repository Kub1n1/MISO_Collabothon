import { RoomProps } from './store';

export interface CardData {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  fullDesc: string;
  targetProp: keyof RoomProps;
  isMandatory?: boolean; // Czy karta jest obowiązkowa (np. losowe wydarzenie życiowe / rachunek)
}