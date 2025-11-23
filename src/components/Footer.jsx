export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold text-teal-500 mb-4">Wanderlust.</h3>
          <p className="text-gray-400 text-sm">
            Making your dream destinations a reality since 2023.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>About Us</li>
            <li>Destinations</li>
            <li>Packages</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Contact</h4>
          <p className="text-gray-400 text-sm">Sylhet, Bangladesh</p>
          <p className="text-gray-400 text-sm">contact@wanderlust.com</p>
        </div>
      </div>
      <div className="text-center text-gray-600 text-xs mt-10 border-t border-gray-800 pt-4">
        © 2024 Wanderlust Agency. All rights reserved.
      </div>
    </footer>
  );
}
