export const INITIAL_TABLES = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  tableNumber: index + 1,
  capacity: (index % 4 === 0) ? 6 : (index % 3 === 0) ? 2 : 4,
  status: 'Available', // Available, Occupied, Order Preparing, Food Ready, Payment Pending
  currentOrderId: null
}));
