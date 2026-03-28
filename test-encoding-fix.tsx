import { fixEncoding } from '@/lib/fixEncoding';

// Test cases for the encoding fix
const testCases = [
  '❤️ 1.2K\n💬 89\n👁️ 8.9K\n📊 5.2%',
  '❤️ 5.7K\n💬 234\n👁️ 123.5K\n📊 12.3%',
  '👁️ 45.7K\n📊 4.1%',
  '📅 Upcoming Scheduled Posts:',
  'Perfect Beauty Gifts for Everyone! 🎁'
];

console.log('=== Testing Encoding Fix ===');
testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}:`);
  console.log('Before:', testCase);
  console.log('After :', fixEncoding(testCase));
  console.log('---');
});

// Expected output:
// Test 1: Should show ❤️, 💬, 👁️, 📊 correctly
// Test 2: Should show ❤️, 💬, 👁️, 📊 correctly
// Test 3: Should show 👁️, 📊 correctly
// Test 4: Should show 📅 correctly
// Test 5: Should show 🎁 correctly

export default function EncodingTest() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Encoding Fix Test Results</h2>

      <div className="space-y-4">
        {testCases.map((testCase, index) => (
          <div key={index} className="border p-4 rounded">
            <h3 className="font-semibold mb-2">Test {index + 1}:</h3>
            <div className="space-y-2">
              <div>
                <strong>Before:</strong>
                <pre className="text-red-600">{testCase}</pre>
              </div>
              <div>
                <strong>After:</strong>
                <pre className="text-green-600">{fixEncoding(testCase)}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}