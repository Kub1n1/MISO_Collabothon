import type { GameEvent, MandatoryEventSettlement, SavingsBuckets } from '../../../store/types';
import { EventOptionSelection } from './EventOptionSelection';
import { NoEffectSettlement } from './NoEffectSettlement';
import { UnaffordableOptionalSettlement } from './UnaffordableOptionalSettlement';
import { BankruptcySettlement } from './BankruptcySettlement';
import { PaymentSettlement } from './PaymentSettlement';
import { IncomeSettlement } from './IncomeSettlement';
import { CloseEventSettlement } from './CloseEventSettlement';

interface Props {
  card: GameEvent;
  isMandatory: boolean;
  selectedOptionIndex: number | null;
  effect: GameEvent['effect'];
  eventAmount: number;
  requiredPayment: number;
  maxAvailable: number;
  savings: SavingsBuckets;
  savingsPayment: SavingsBuckets;
  loanAmount: number;
  maxLoan: number;
  paymentIsValid: boolean;
  totalSavingsPayment: number;
  onSelectOption: (index: number) => void;
  onUpdateSavings: (bucket: keyof SavingsBuckets, value: number) => void;
  onSetSavings: (payment: SavingsBuckets) => void;
  onUpdateLoan: (value: number) => void;
  onSetError: (error: string | null) => void;
  onSubmit: (settlement: MandatoryEventSettlement) => void;
}

export function EventSettlement(props: Props) {
  if (props.card.options?.length && props.selectedOptionIndex === null) {
    return (
      <EventOptionSelection
        card={props.card}
        onSelectOption={props.onSelectOption}
      />
    );
  }

  if (!props.effect) {
    return <NoEffectSettlement />;
  }

  if (props.eventAmount < 0) {
    if (props.maxAvailable < props.requiredPayment) {
      if (!props.isMandatory) {
        return <UnaffordableOptionalSettlement />;
      }

      return (
        <BankruptcySettlement
          onSubmit={props.onSubmit}
          savings={{ sock: 0, account: 0, stocks: 0 }}
        />
      );
    }

    return (
      <PaymentSettlement
        cardId={props.card.id}
        requiredPayment={props.requiredPayment}
        savings={props.savings}
        savingsPayment={props.savingsPayment}
        loanAmount={props.loanAmount}
        maxLoan={props.maxLoan}
        paymentIsValid={props.paymentIsValid}
        totalSavingsPayment={props.totalSavingsPayment}
        onUpdateSavings={props.onUpdateSavings}
        onSetSavings={props.onSetSavings}
        onUpdateLoan={props.onUpdateLoan}
        onSetError={props.onSetError}
        onSubmit={props.onSubmit}
      />
    );
  }

  if (props.eventAmount > 0) {
    return (
      <IncomeSettlement
        eventAmount={props.eventAmount}
        onSubmit={props.onSubmit}
      />
    );
  }

  return <CloseEventSettlement onSubmit={props.onSubmit} />;
}
