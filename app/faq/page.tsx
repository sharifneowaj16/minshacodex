import Navbar from '../components/Header';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';

const faqs = [
  {
    question: 'What makes your products natural?',
    answer: 'All our products are made with 100% natural ingredients, free from harmful chemicals and toxins. We source our ingredients from trusted suppliers who share our commitment to quality and sustainability.',
  },
  {
    question: 'Do you offer international shipping?',
    answer: 'Yes, we ship worldwide. Shipping costs and delivery times vary by location. Please check our shipping page for more details.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy on all unopened products. If you\'re not satisfied with your purchase, please contact our customer service team.',
  },
  {
    question: 'Are your products tested on animals?',
    answer: 'No, we are a cruelty-free brand. None of our products are tested on animals, and we are committed to ethical practices.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

