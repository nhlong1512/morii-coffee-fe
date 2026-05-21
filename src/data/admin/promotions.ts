export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  value: number;
  minimumOrder: number;
  usageCount: number;
  maxUsage: number;
  expiryDate: string;
  active: boolean;
  applicableCategories: string[];
}

export interface BannerCampaign {
  id: string;
  title: string;
  image: string;
  link: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export const coupons: Coupon[] = [
  {
    id: "cpn-001",
    code: "MORII10",
    discountType: "percentage",
    value: 10,
    minimumOrder: 50000,
    usageCount: 342,
    maxUsage: 1000,
    expiryDate: "2026-06-30",
    active: true,
    applicableCategories: ["coffee", "tea", "pastry"],
  },
  {
    id: "cpn-002",
    code: "WELCOME25K",
    discountType: "fixed",
    value: 25000,
    minimumOrder: 100000,
    usageCount: 156,
    maxUsage: 500,
    expiryDate: "2026-12-31",
    active: true,
    applicableCategories: ["coffee", "tea", "pastry", "merchandise"],
  },
  {
    id: "cpn-003",
    code: "COLDBREW20",
    discountType: "percentage",
    value: 20,
    minimumOrder: 0,
    usageCount: 89,
    maxUsage: 200,
    expiryDate: "2026-04-30",
    active: true,
    applicableCategories: ["coffee"],
  },
  {
    id: "cpn-004",
    code: "SUMMER15",
    discountType: "percentage",
    value: 15,
    minimumOrder: 75000,
    usageCount: 500,
    maxUsage: 500,
    expiryDate: "2025-09-30",
    active: false,
    applicableCategories: ["coffee", "tea"],
  },
  {
    id: "cpn-005",
    code: "FREESHIP",
    discountType: "fixed",
    value: 30000,
    minimumOrder: 150000,
    usageCount: 210,
    maxUsage: 1000,
    expiryDate: "2026-08-31",
    active: true,
    applicableCategories: ["coffee", "tea", "pastry", "merchandise"],
  },
  {
    id: "cpn-006",
    code: "BIRTHDAY50",
    discountType: "percentage",
    value: 50,
    minimumOrder: 0,
    usageCount: 45,
    maxUsage: 0,
    expiryDate: "2026-12-31",
    active: true,
    applicableCategories: ["coffee", "tea", "pastry"],
  },
  {
    id: "cpn-007",
    code: "SPRING30",
    discountType: "percentage",
    value: 30,
    minimumOrder: 100000,
    usageCount: 78,
    maxUsage: 300,
    expiryDate: "2026-05-31",
    active: true,
    applicableCategories: ["coffee", "merchandise"],
  },
  {
    id: "cpn-008",
    code: "TET2026",
    discountType: "fixed",
    value: 50000,
    minimumOrder: 200000,
    usageCount: 320,
    maxUsage: 400,
    expiryDate: "2026-02-28",
    active: false,
    applicableCategories: ["coffee", "tea", "pastry", "merchandise"],
  },
];

export const bannerCampaigns: BannerCampaign[] = [
  {
    id: "bnr-001",
    title: "Spring Collection Launch",
    image: "/images/banners/spring-collection.jpg",
    link: "/products?collection=spring",
    startDate: "2026-03-01",
    endDate: "2026-04-30",
    active: true,
  },
  {
    id: "bnr-002",
    title: "Weekend Drink Special",
    image: "/images/banners/double-points.jpg",
    link: "/products?collection=weekend-specials",
    startDate: "2026-03-20",
    endDate: "2026-03-22",
    active: true,
  },
  {
    id: "bnr-003",
    title: "New Cold Brew Series",
    image: "/images/banners/cold-brew.jpg",
    link: "/products?category=cold-brew",
    startDate: "2026-03-15",
    endDate: "2026-05-31",
    active: true,
  },
  {
    id: "bnr-004",
    title: "Tet Holiday Special",
    image: "/images/banners/tet-special.jpg",
    link: "/products?collection=tet",
    startDate: "2026-01-20",
    endDate: "2026-02-15",
    active: false,
  },
  {
    id: "bnr-005",
    title: "Refer a Friend — Get 50K",
    image: "/images/banners/referral.jpg",
    link: "/referral",
    startDate: "2026-02-01",
    endDate: "2026-06-30",
    active: true,
  },
  {
    id: "bnr-006",
    title: "Morii x Local Artist Merch Drop",
    image: "/images/banners/artist-collab.jpg",
    link: "/products?collection=artist-collab",
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    active: false,
  },
];
