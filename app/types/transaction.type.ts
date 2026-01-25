export type Transaction = {
  id: number;
  type: "INCOME" | "EXPENSE";
  title: string;
  amount: number;
  category: string;
  date: string;
  recurrence: string;
  totalInstallment: number;
  installmentIndex: number;
  installmentGroupId: string;
};
