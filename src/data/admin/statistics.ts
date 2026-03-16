export const dashboardStats = {
  totalRevenue: {
    value: 148520000,
    percentChange: 12.5,
  },
  totalOrders: {
    value: 3842,
    percentChange: 8.3,
  },
  newUsers: {
    value: 284,
    percentChange: -2.1,
  },
  activeProducts: {
    value: 156,
    percentChange: 5.7,
  },
};

function generateRevenueData(): { date: string; revenue: number }[] {
  const data: { date: string; revenue: number }[] = [];
  const baseDate = new Date("2026-02-14");
  for (let i = 29; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    const base = 3500000 + Math.floor(Math.random() * 2500000);
    const weekday = date.getDay();
    const multiplier = weekday === 0 || weekday === 6 ? 1.3 : 1;
    data.push({
      date: date.toISOString().split("T")[0],
      revenue: Math.round(base * multiplier),
    });
  }
  return data;
}

export const revenueData = generateRevenueData();

export const ordersByStatus: { status: string; count: number; fill: string }[] =
  [
    { status: "Completed", count: 2456, fill: "hsl(142, 71%, 45%)" },
    { status: "Processing", count: 842, fill: "hsl(217, 91%, 60%)" },
    { status: "Pending", count: 389, fill: "hsl(45, 93%, 47%)" },
    { status: "Cancelled", count: 155, fill: "hsl(0, 84%, 60%)" },
  ];

export const topProducts: {
  name: string;
  unitsSold: number;
  revenue: number;
}[] = [
  { name: "Vietnamese Phin Filter Coffee", unitsSold: 1240, revenue: 37200000 },
  { name: "Salted Caramel Cold Brew", unitsSold: 980, revenue: 34300000 },
  { name: "Coconut Milk Latte", unitsSold: 875, revenue: 30625000 },
  { name: "Classic Espresso", unitsSold: 820, revenue: 20500000 },
  { name: "Matcha Oat Latte", unitsSold: 760, revenue: 30400000 },
  { name: "Brown Sugar Boba Coffee", unitsSold: 695, revenue: 27800000 },
  { name: "Iced Americano", unitsSold: 650, revenue: 16250000 },
  { name: "Hazelnut Cappuccino", unitsSold: 580, revenue: 23200000 },
  { name: "Morii Signature Blend (250g)", unitsSold: 420, revenue: 33600000 },
  { name: "Vanilla Bean Frappuccino", unitsSold: 390, revenue: 17550000 },
];

function generateNewUsersData(): { date: string; users: number }[] {
  const data: { date: string; users: number }[] = [];
  const baseDate = new Date("2026-02-14");
  for (let i = 29; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split("T")[0],
      users: 5 + Math.floor(Math.random() * 15),
    });
  }
  return data;
}

export const newUsersData = generateNewUsersData();

export const loyaltyData: {
  month: string;
  issued: number;
  redeemed: number;
}[] = [
  { month: "Sep 2025", issued: 24500, redeemed: 18200 },
  { month: "Oct 2025", issued: 28300, redeemed: 21400 },
  { month: "Nov 2025", issued: 31200, redeemed: 24800 },
  { month: "Dec 2025", issued: 38500, redeemed: 32100 },
  { month: "Jan 2026", issued: 26800, redeemed: 20500 },
  { month: "Feb 2026", issued: 29400, redeemed: 22300 },
];
