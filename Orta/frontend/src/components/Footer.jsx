export default function Footer() {
  return (
    <footer className="bg-[#d9ddb0] text-[#0d5f7a] px-10 pt-16 pb-10">
      
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 items-start">

        <div>
          <h3 className="text-2xl font-semibold mb-4">Orta</h3>
          <p className="max-w-xs">
            A platform for creating and finding teams to achieve goals together.
            Collaboration made simple.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-semibold mb-4">Platform</h3>
          <ul className="space-y-3">
            <li>Features</li>
            <li>How it Works</li>
            <li>Categories</li>
            <li>Pricing</li>
          </ul>
        </div>

        <div>
          <h3 className="text-2xl font-semibold mb-4">Company</h3>
          <ul className="space-y-3">
            <li>About Us</li>
            <li>Blog</li>
            <li>Careers</li>
            <li>Contact</li>
          </ul>
        </div>

        <div className="relative">
          <h3 className="text-2xl font-semibold mb-4">Connect</h3>

          <ul className="space-y-3">
            <li>X</li>
            <li>Facebook</li>
            <li>Instagram</li>
            <li>LinkedIn</li>
          </ul>

          <img
            src="/flower.png"
            className="absolute -bottom-6 right-0 w-32 md:w-40"
          />
        </div>

      </div>

      <p className="text-center mt-16 text-sm">
        © 2026 Orta. All rights reserved.
      </p>

    </footer>
  );
}