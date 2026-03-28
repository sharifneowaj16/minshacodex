import Navbar from '../components/Header';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Message</label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                    placeholder="Your message..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
                >
                  Send Message
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
                  <p className="text-gray-600">27 Division St, New York, NY 10002, USA</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                  <p className="text-gray-600">
                    <a href="tel:+13459971345" className="hover:text-pink-600">+1 345 99 71 345</a>
                  </p>
                  <p className="text-gray-600">
                    <a href="tel:+13457464975" className="hover:text-pink-600">+1 345 74 64 975</a>
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600">
                    <a href="mailto:info@minsahbeauty.com" className="hover:text-pink-600">info@minsahbeauty.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

