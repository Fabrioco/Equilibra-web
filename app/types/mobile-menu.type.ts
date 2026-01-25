import { Transaction } from "./transaction.type";

export type MobileMenuProps = {
  transaction: Transaction;
  onClose: () => void;
  onDelete: (id: number, scope: "one" | "all") => Promise<void>;
  onEdit: (transaction: Transaction) => void;
};
