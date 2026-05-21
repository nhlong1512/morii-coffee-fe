export interface BlogComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  comment: string;
  date: string;
  replies: BlogComment[];
}

export interface StoreTestimonial {
  id: string;
  storeId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export const blogComments: BlogComment[] = [
  {
    id: "cmt-001",
    postId: "blog-001",
    userId: "user-002",
    userName: "Mai Tran",
    userAvatar: "/images/user/avatar-2.jpg",
    comment:
      "This guide is exactly what I needed! I just got a V60 and was struggling with the technique. The tip about concentric circles really helped.",
    date: "2025-12-16",
    replies: [
      {
        id: "cmt-001-r1",
        postId: "blog-001",
        userId: "user-003",
        userName: "Duc Nguyen",
        userAvatar: "/images/user/avatar-3.jpg",
        comment:
          "I had the same experience! Also try adjusting your grind size - slightly coarser works better for the V60 in my opinion.",
        date: "2025-12-17",
        replies: [],
      },
    ],
  },
  {
    id: "cmt-002",
    postId: "blog-001",
    userId: "user-005",
    userName: "Hoa Le",
    userAvatar: "/images/user/avatar-5.jpg",
    comment:
      "Would love a follow-up article on the Chemex method! Great writing as always.",
    date: "2025-12-18",
    replies: [],
  },
  {
    id: "cmt-003",
    postId: "blog-002",
    userId: "user-007",
    userName: "An Bui",
    userAvatar: "/images/user/avatar-7.jpg",
    comment:
      "So inspiring to see the direct trade approach. It is great to know my coffee supports farming families directly.",
    date: "2025-12-01",
    replies: [
      {
        id: "cmt-003-r1",
        postId: "blog-002",
        userId: "user-009",
        userName: "Vy Hoang",
        userAvatar: "/images/user/avatar-9.jpg",
        comment:
          "Agreed! Transparency in sourcing is so important. Would love to see a video documentary about the farm visits.",
        date: "2025-12-02",
        replies: [],
      },
    ],
  },
  {
    id: "cmt-004",
    postId: "blog-003",
    userId: "user-010",
    userName: "Quang Phan",
    userAvatar: "/images/user/avatar-10.jpg",
    comment:
      "The cold brew lemonade recipe is a game changer! I was skeptical at first but it is surprisingly refreshing.",
    date: "2025-10-12",
    replies: [],
  },
  {
    id: "cmt-005",
    postId: "blog-003",
    userId: "user-011",
    userName: "Nhi Do",
    userAvatar: "/images/user/avatar-11.jpg",
    comment:
      "Made the Vietnamese iced coffee recipe at home. So good! Can you share the exact ratio of condensed milk you use?",
    date: "2025-10-15",
    replies: [
      {
        id: "cmt-005-r1",
        postId: "blog-003",
        userId: "user-006",
        userName: "Khoa Vo",
        userAvatar: "/images/user/avatar-6.jpg",
        comment:
          "I usually do 2 tablespoons of condensed milk per 200ml of cold brew. Adjust to your sweetness preference!",
        date: "2025-10-16",
        replies: [],
      },
    ],
  },
  {
    id: "cmt-006",
    postId: "blog-004",
    userId: "user-012",
    userName: "Bao Truong",
    userAvatar: "/images/user/avatar-12.jpg",
    comment:
      "Finally I understand why some coffees taste so different! The roast level explanation was very clear and helpful.",
    date: "2025-09-25",
    replies: [],
  },
  {
    id: "cmt-007",
    postId: "blog-005",
    userId: "user-013",
    userName: "Thao Ly",
    userAvatar: "/images/user/avatar-13.jpg",
    comment:
      "The meaning behind the name 'Morii' is beautiful. This is exactly the feeling I get when I visit your cafes. Keep doing what you do!",
    date: "2025-08-20",
    replies: [],
  },
  {
    id: "cmt-008",
    postId: "blog-006",
    userId: "user-014",
    userName: "Tung Cao",
    userAvatar: "/images/user/avatar-14.jpg",
    comment:
      "I had no idea storing coffee in the fridge was a bad idea! I have been doing it wrong for years. Thanks for the tips.",
    date: "2025-08-05",
    replies: [
      {
        id: "cmt-008-r1",
        postId: "blog-006",
        userId: "user-015",
        userName: "Kim Ngo",
        userAvatar: "/images/user/avatar-15.jpg",
        comment:
          "Same here! I switched to an airtight container and the difference in freshness is noticeable.",
        date: "2025-08-06",
        replies: [],
      },
    ],
  },
];

export const storeTestimonials: StoreTestimonial[] = [
  {
    id: "test-001",
    storeId: "store-001",
    userName: "Mai Tran",
    rating: 5,
    comment: "Beautiful space in the heart of District 1. The staff is incredibly friendly and the coffee is always perfect.",
    date: "2025-12-10",
  },
  {
    id: "test-002",
    storeId: "store-001",
    userName: "Duc Nguyen",
    rating: 4,
    comment: "Great atmosphere and excellent espresso. Can get crowded on weekends but worth the wait.",
    date: "2025-11-28",
  },
  {
    id: "test-003",
    storeId: "store-001",
    userName: "Hoa Le",
    rating: 5,
    comment: "My favorite coffee shop in Saigon. The interior design is stunning and the matcha latte is to die for.",
    date: "2025-11-15",
  },
  {
    id: "test-004",
    storeId: "store-002",
    userName: "An Bui",
    rating: 5,
    comment: "Quiet and cozy spot in District 3. Perfect for working or reading. Love the natural lighting.",
    date: "2025-12-05",
  },
  {
    id: "test-005",
    storeId: "store-002",
    userName: "Tam Dang",
    rating: 4,
    comment: "Consistently good coffee and pastries. The cinnamon rolls are a must-try!",
    date: "2025-11-20",
  },
  {
    id: "test-006",
    storeId: "store-003",
    userName: "Vy Hoang",
    rating: 5,
    comment: "The Hoan Kiem location has such a charming old-quarter vibe. Best cold brew in Hanoi!",
    date: "2025-12-12",
  },
  {
    id: "test-007",
    storeId: "store-003",
    userName: "Quang Phan",
    rating: 5,
    comment: "Love the blend of modern coffee culture and traditional Hanoi architecture. A must-visit!",
    date: "2025-10-30",
  },
  {
    id: "test-008",
    storeId: "store-004",
    userName: "Nhi Do",
    rating: 4,
    comment: "Great addition to the Da Nang coffee scene. The riverside views are a nice bonus.",
    date: "2025-12-01",
  },
  {
    id: "test-009",
    storeId: "store-004",
    userName: "Bao Truong",
    rating: 5,
    comment: "Perfect stop after a morning at My Khe beach. The iced drinks are especially good here.",
    date: "2025-11-25",
  },
  {
    id: "test-010",
    storeId: "store-005",
    userName: "Thao Ly",
    rating: 4,
    comment: "Spacious and modern. Great for groups and the parking is convenient. Coffee quality is top notch.",
    date: "2025-12-08",
  },
  {
    id: "test-011",
    storeId: "store-005",
    userName: "Kim Ngo",
    rating: 5,
    comment: "The Thu Duc location has quickly become my go-to workspace. Fast wifi, great coffee, and friendly baristas.",
    date: "2025-12-14",
  },
];
