import { create } from 'zustand';

interface OrderStore {
  tableId: string | null;
  tableNumber: number | null;
  currentOrderId: string | null;
  isSubmitting: boolean;
  setTableInfo: (tableId: string, tableNumber: number) => void;
  setCurrentOrderId: (orderId: string | null) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  tableId: null,
  tableNumber: null,
  currentOrderId: null,
  isSubmitting: false,

  setTableInfo: (tableId, tableNumber) =>
    set({ tableId, tableNumber }),

  setCurrentOrderId: (orderId) =>
    set({ currentOrderId: orderId }),

  setIsSubmitting: (isSubmitting) =>
    set({ isSubmitting }),

  reset: () =>
    set({
      tableId: null,
      tableNumber: null,
      currentOrderId: null,
      isSubmitting: false
    }),
}));
