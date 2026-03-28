# UTF-8 Encoding Fix Examples

This document provides comprehensive examples of how to use the `fixEncoding` utility to resolve character encoding issues throughout the Minsah Beauty application.

## Quick Start

```tsx
import { fixEncoding } from '@/lib/fixEncoding';

// Basic usage
const corruptedText = "Watch this amazing before & after using our Rose Face Oil! 🌹";
const fixedText = fixEncoding(corruptedText);
// Result: "Watch this amazing before & after using our Rose Face Oil! 🌹"
```

## Component Examples

### 1. Marketing Hub Component

```tsx
import { fixEncoding } from '@/lib/fixEncoding';

export default function MarketingHub() {
  const socialPosts = [
    {
      text: 'New Vitamin C Serum is here! ✨',
      description: 'Amazing results! My skin looks so much better now. Thank you! ❤️'
    }
  ];

  return (
    <div>
      {socialPosts.map((post, index) => (
        <div key={index}>
          {/* Apply fixEncoding to user-generated content */}
          <p>{fixEncoding(post.text)}</p>
          <p>{fixEncoding(post.description)}</p>
        </div>
      ))}
    </div>
  );
}
```

### 2. Social Media Inbox

```tsx
import { fixEncoding } from '@/lib/fixEncoding';

export default function SocialMediaInbox() {
  const messages = [
    {
      platform: 'Instagram',
      content: { text: 'Love the new products! 🌟' },
      timestamp: '2024-01-15T10:30:00Z'
    }
  ];

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          <p>{message.platform} • {new Date(message.timestamp).toLocaleTimeString()}</p>
          <p>{fixEncoding(message.content.text)}</p>
        </div>
      ))}
    </div>
  );
}
```

### 3. Google Services Components

```tsx
import { fixEncoding } from '@/lib/fixEncoding';

export default function GoogleAnalytics() {
  const metrics = {
    topPages: [
      { title: 'Product: Premium Foundation 💄', views: 1234 },
      { title: 'Blog: Skincare Tips ✨', views: 987 }
    ],
    topProducts: [
      { itemName: 'Lipstick Collection 💄', sales: 456 }
    ]
  };

  return (
    <div>
      {/* Fix emoji icons in data displays */}
      <div className="text-3xl">{fixEncoding('📊')}</div>

      {/* Fix text content from APIs */}
      {metrics.topPages.map((page, index) => (
        <div key={index}>
          <h4>{fixEncoding(page.title)}</h4>
          <p>{page.views} views</p>
        </div>
      ))}

      {metrics.topProducts.map((product, index) => (
        <div key={index}>
          <span className="text-2xl">{fixEncoding('💄')}</span>
          <h4>{fixEncoding(product.itemName)}</h4>
          <p>{product.sales} sales</p>
        </div>
      ))}
    </div>
  );
}
```

### 4. Product Display Components

```tsx
import { fixEncoding } from '@/lib/fixEncoding';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="product-card">
      {/* Fix product names with emojis */}
      <h3>{fixEncoding(product.name)}</h3>

      {/* Fix descriptions with special characters */}
      <p>{fixEncoding(product.description)}</p>

      {/* Fix category icons */}
      <div className="category-icon">
        {fixEncoding(product.categoryIcon)}
      </div>
    </div>
  );
}
```

## Using the SafeText Component

```tsx
import SafeText from '@/components/SafeText';

export default function UserProfile() {
  const userData = {
    bio: "Beauty enthusiast 💄✨",
    favoriteProducts: ["Lipstick Collection 💄", "Face Mask Set ✨"]
  };

  return (
    <div>
      {/* SafeText automatically applies fixEncoding */}
      <SafeText as="h2" className="text-xl font-bold">
        {userData.bio}
      </SafeText>

      {/* Use as different HTML elements */}
      <SafeText as="p" className="text-gray-600">
        {userData.bio}
      </SafeText>

      {/* Array usage */}
      {userData.favoriteProducts.map((product, index) => (
        <SafeText key={index} as="li" className="list-item">
          {product}
        </SafeText>
      ))}
    </div>
  );
}
```

## API Route Examples

### 1. Fetching External Data

```tsx
import { fixEncoding } from '@/lib/fixEncoding';

export async function GET() {
  // Fetch data from external API that might have encoding issues
  const response = await fetch('https://external-beauty-api.com/products');
  const data = await response.json();

  // Fix encoding for all string fields
  const fixedData = {
    ...data,
    products: data.products.map((product: any) => ({
      ...product,
      name: fixEncoding(product.name),
      description: fixEncoding(product.description),
      category: fixEncoding(product.category)
    }))
  };

  return new Response(JSON.stringify(fixedData), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}
```

### 2. Processing Form Data

```tsx
import { fixEncoding } from '@/lib/fixEncoding';

export async function POST(request: Request) {
  const formData = await request.json();

  // Fix encoding for user input
  const fixedData = {
    name: fixEncoding(formData.name),
    message: fixEncoding(formData.message),
    review: fixEncoding(formData.review)
  };

  // Process the fixed data...

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}
```

## Advanced Usage

### 1. Fixing Arrays of Strings

```tsx
import { fixEncodingArray } from '@/lib/fixEncoding';

const corruptedEmojis = ['✨', '💄', '🌸'];
const fixedEmojis = fixEncodingArray(corruptedEmojis);
// Result: ['✨', '💄', '🌸']
```

### 2. Fixing Objects with Nested Strings

```tsx
import { fixEncodingObject } from '@/lib/fixEncoding';

const corruptedData = {
  title: 'New Product Launch ✨',
  description: 'Check out our amazing lipstick collection 💄',
  metadata: {
    tags: ['beauty ✨', 'makeup 💄'],
    category: 'skincare 🌸'
  }
};

const fixedData = fixEncodingObject(corruptedData);
// All string fields are automatically fixed
```

### 3. Custom Hook

```tsx
import { useFixedText } from '@/components/SafeText';

export default function ProductReviews() {
  const [reviews, setReviews] = useState([]);

  // Fixed text hook
  const fixedReviewText = useFixedText(reviews[0]?.text);

  return (
    <div>
      <p>{fixedReviewText}</p>
    </div>
  );
}
```

## Common Encoding Issues Fixed

| Corrupted | Fixed | Description |
|-----------|-------|-------------|
| `âœ¨` | `✨` | Sparkles emoji |
| `âœ…` | `✅` | Check mark |
| `â˜…` | `★` | Star |
| `â†` | `→` | Right arrow |
| `âðŸ''` | `💄` | Lipstick |
| `âðŸŒ¸` | `🌸` | Cherry blossom |
| `âðŸ'–` | `💖` | Sparkling heart |
| `âðŸŒ¹` | `🌹` | Rose |
| `â‰ˆ` | `≈` | Approximately equal |

## Testing the Fix

After implementing the encoding fix, test with these examples:

```tsx
// Test cases
const testCases = [
  'Watch this amazing before & after using our Rose Face Oil! 🌹',
  'New Vitamin C Serum is here! ✨',
  'Amazing results! My skin looks so much better now. Thank you! ❤️',
  'Transform your skincare routine with our new collection! ✨'
];

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}:`);
  console.log('Before:', testCase);
  console.log('After:', fixEncoding(testCase));
  console.log('---');
});
```

## Implementation Checklist

- [x] Create `/lib/fixEncoding.ts` utility
- [x] Update `middleware.ts` with UTF-8 headers
- [x] Apply `fixEncoding` to Marketing Hub components
- [x] Apply `fixEncoding` to Social Media Inbox
- [x] Create SafeText component
- [x] Update components that display user-generated content
- [x] Test the implementation
- [ ] Restart development server
- [ ] Verify emojis display correctly in browser

## Restart Development Server

After implementing these changes, restart your development server:

```bash
npm run dev
```

The UTF-8 headers and encoding fixes will now work automatically for all requests and responses.