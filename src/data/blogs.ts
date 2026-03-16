export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  category: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "blog-001",
    title: "The Art of Pour-Over: A Beginner's Guide",
    slug: "art-of-pour-over-beginners-guide",
    excerpt:
      "Discover the meditative ritual of pour-over coffee brewing and learn how to craft the perfect cup at home.",
    content: `Pour-over coffee is more than a brewing method — it's a ritual. The slow, deliberate process of pouring hot water over freshly ground coffee produces a clean, flavorful cup that highlights the unique characteristics of each bean.

To get started, you'll need a pour-over dripper (we recommend the V60 or Kalita Wave), paper filters, a gooseneck kettle, a scale, and freshly roasted coffee beans.

The Basics:
1. Heat your water to 200-205°F (93-96°C).
2. Use a 1:16 coffee-to-water ratio — about 22g of coffee for 350ml of water.
3. Rinse your filter with hot water to remove paper taste.
4. Bloom your grounds with twice their weight in water for 30-45 seconds.
5. Pour in slow, concentric circles, maintaining a steady flow.

The entire brew should take about 3-4 minutes. The result? A bright, nuanced cup that lets you taste every note the roaster intended.`,
    author: "Linh Nguyen",
    date: "2025-12-15",
    image: "/images/blog/pour-over-guide.jpg",
    category: "Brewing Guide",
  },
  {
    id: "blog-002",
    title: "From Farm to Cup: Our Direct Trade Journey",
    slug: "farm-to-cup-direct-trade-journey",
    excerpt:
      "Follow our team as we visit coffee farms in Vietnam's Central Highlands to source the finest beans.",
    content: `At Morii Coffee, we believe great coffee starts at the source. That's why we travel directly to coffee farms in Dak Lak, Lam Dong, and Gia Lai provinces in Vietnam's Central Highlands — one of the world's premier coffee-growing regions.

Our direct trade approach means we work hand-in-hand with farming families, paying fair prices that reflect the true value of their craft. This isn't just about sourcing beans; it's about building relationships that span generations.

During our latest visit, we partnered with the Tran family farm in Dak Lak, where they've been growing Robusta and Arabica varieties for over 40 years. Their meticulous processing methods — including honey and natural processing — produce beans with incredible sweetness and complexity.

We're proud to bring these exceptional coffees to your cup, knowing that every sip supports sustainable farming practices and thriving communities.`,
    author: "Minh Tran",
    date: "2025-11-28",
    image: "/images/blog/direct-trade-journey.jpg",
    category: "Origins",
  },
  {
    id: "blog-003",
    title: "5 Cold Brew Recipes for Summer",
    slug: "5-cold-brew-recipes-for-summer",
    excerpt:
      "Beat the heat with these refreshing cold brew recipes that go beyond the basics.",
    content: `Summer calls for cold coffee, and we've got five creative recipes that'll keep you cool and caffeinated all season long.

1. Coconut Cold Brew — Mix cold brew concentrate with coconut cream and a touch of agave. Serve over coconut ice cubes for an extra tropical twist.

2. Cold Brew Lemonade — Combine equal parts cold brew and fresh lemonade over ice. The citrus cuts through the coffee's bitterness for a surprisingly refreshing drink.

3. Vietnamese-Style Iced Coffee — Our take on ca phe sua da: strong cold brew with sweetened condensed milk over crushed ice. Rich, sweet, and absolutely addictive.

4. Cold Brew Float — Pour cold brew over a scoop of vanilla bean ice cream. It's dessert and your afternoon pick-me-up in one glass.

5. Spiced Cold Brew Tonic — Mix cold brew with tonic water, a dash of cinnamon syrup, and a squeeze of orange. The effervescence adds a whole new dimension to your coffee experience.`,
    author: "Ha Pham",
    date: "2025-10-10",
    image: "/images/blog/cold-brew-recipes.jpg",
    category: "Recipes",
  },
  {
    id: "blog-004",
    title: "Understanding Coffee Roast Levels",
    slug: "understanding-coffee-roast-levels",
    excerpt:
      "Light, medium, or dark? Learn how roast levels affect your coffee's flavor profile.",
    content: `The roast level of your coffee has a dramatic impact on flavor, aroma, and body. Here's what you need to know about each level.

Light Roast (City Roast) — Light roasts preserve the bean's original character. Expect bright acidity, floral or fruity notes, and a lighter body. These roasts are ideal for pour-over and other manual brewing methods.

Medium Roast (City+ to Full City) — The sweet spot for many coffee lovers. Medium roasts balance the bean's natural flavors with the caramelization that comes from roasting. You'll taste chocolate, nuts, and a pleasant sweetness with moderate acidity.

Dark Roast (Full City+ to French) — Dark roasts emphasize roast character over origin flavors. Expect bold, smoky, or chocolatey notes with a heavier body and lower acidity. These roasts shine in espresso-based drinks.

At Morii Coffee, we roast each origin to the level that best showcases its unique qualities. Our espresso blend leans medium-dark for richness, while our single origins are typically light to medium to highlight terroir.`,
    author: "Linh Nguyen",
    date: "2025-09-22",
    image: "/images/blog/roast-levels.jpg",
    category: "Education",
  },
  {
    id: "blog-005",
    title: "The Story Behind Morii Coffee",
    slug: "story-behind-morii-coffee",
    excerpt:
      "How a love for Vietnamese coffee culture and Japanese aesthetics inspired our brand.",
    content: `Morii is a Japanese word that describes the feeling of the world moving ahead while you are standing still — a bittersweet awareness of time passing. It's the feeling you get in a quiet coffee shop on a rainy afternoon, watching the world through a fogged-up window.

We founded Morii Coffee in 2022 with a simple mission: to create spaces and experiences that invite you to slow down. In a world that moves faster every day, we believe the ritual of coffee — grinding beans, waiting for the brew, savoring the first sip — is a small but meaningful act of presence.

Our menu draws from Vietnamese coffee traditions (ca phe sua da, egg coffee, salt coffee) and Japanese craft (pour-over, siphon brewing, meticulous attention to detail). The result is a menu that feels both familiar and surprising.

Every Morii location is designed as a sanctuary. Natural materials, warm lighting, and carefully curated music create an atmosphere where you can breathe, think, and simply be.`,
    author: "Minh Tran",
    date: "2025-08-15",
    image: "/images/blog/morii-story.jpg",
    category: "About Us",
  },
  {
    id: "blog-006",
    title: "How to Store Coffee Beans Properly",
    slug: "how-to-store-coffee-beans-properly",
    excerpt:
      "Keep your beans fresh and flavorful with these essential storage tips.",
    content: `You've invested in great coffee — now let's make sure you store it right. Proper storage can mean the difference between a vibrant cup and a stale one.

The Enemies of Fresh Coffee:
1. Air — Oxygen causes oxidation, which degrades flavor compounds.
2. Moisture — Humidity accelerates staleness and can cause mold.
3. Heat — High temperatures speed up chemical reactions that break down aromatics.
4. Light — UV rays degrade the organic compounds that give coffee its flavor.

Best Practices:
- Store beans in an opaque, airtight container at room temperature.
- Buy only what you'll use within 2-3 weeks.
- Never store coffee in the fridge — it absorbs odors from other foods.
- If you must store long-term, freeze beans in airtight portions and thaw only what you need.
- Grind just before brewing for maximum freshness.

At Morii Coffee, we roast in small batches and ship within 48 hours of roasting. We print the roast date on every bag so you always know how fresh your beans are.`,
    author: "Ha Pham",
    date: "2025-07-30",
    image: "/images/blog/coffee-storage.jpg",
    category: "Tips",
  },
];
