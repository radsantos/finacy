import { TransactionModal } from "./TransactionModal";

import type { Transaction } from "../types/transaction";

type EditTransactionModalProps = {
  transaction: Transaction;
  onClose: () => void;
  onSuccess: () => void;
};

export const EditTransactionModal = ({
  transaction,
  onClose,
  onSuccess,
}: EditTransactionModalProps) => {
  return (
    <TransactionModal
      mode="edit"
      transaction={transaction}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};