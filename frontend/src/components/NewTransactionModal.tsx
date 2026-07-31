import { TransactionModal } from "./TransactionModal";

type NewTransactionModalProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export const NewTransactionModal = ({
  onClose,
  onSuccess,
}: NewTransactionModalProps) => {
  return (
    <TransactionModal
      mode="create"
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};