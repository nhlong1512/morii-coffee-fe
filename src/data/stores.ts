export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
}

export const stores: Store[] = [
  {
    id: "store-001",
    name: "Morii Coffee - District 1",
    address: "42 Nguyen Hue Boulevard, Ben Nghe Ward, District 1",
    city: "Ho Chi Minh City",
    lat: 10.7739,
    lng: 106.7029,
    phone: "+84 28 1234 5678",
    hours: "Mon-Sun: 7:00 AM - 10:00 PM",
  },
  {
    id: "store-002",
    name: "Morii Coffee - District 3",
    address: "15 Vo Van Tan Street, Ward 6, District 3",
    city: "Ho Chi Minh City",
    lat: 10.7769,
    lng: 106.6897,
    phone: "+84 28 2345 6789",
    hours: "Mon-Sun: 7:00 AM - 9:30 PM",
  },
  {
    id: "store-003",
    name: "Morii Coffee - Hoan Kiem",
    address: "8 Ma May Street, Hang Buom Ward, Hoan Kiem District",
    city: "Hanoi",
    lat: 21.034,
    lng: 105.852,
    phone: "+84 24 3456 7890",
    hours: "Mon-Sun: 6:30 AM - 10:00 PM",
  },
  {
    id: "store-004",
    name: "Morii Coffee - Da Nang",
    address: "120 Bach Dang Street, Hai Chau District",
    city: "Da Nang",
    lat: 16.0678,
    lng: 108.2208,
    phone: "+84 236 456 7891",
    hours: "Mon-Sun: 7:00 AM - 9:00 PM",
  },
  {
    id: "store-005",
    name: "Morii Coffee - Thu Duc",
    address: "72 Vo Chi Cong Street, Thu Duc City",
    city: "Ho Chi Minh City",
    lat: 10.8456,
    lng: 106.7722,
    phone: "+84 28 5678 9012",
    hours: "Mon-Fri: 7:00 AM - 9:00 PM, Sat-Sun: 7:00 AM - 10:00 PM",
  },
];
