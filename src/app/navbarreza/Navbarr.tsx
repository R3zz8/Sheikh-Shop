import Link from 'next/link';

export default function Navbarr() {
  return (
    <header className=" bg-[url('/noor.jpg')] bg-no-repeat bg-cover backdrop-blur-lg bg-center border-b border-green-800 min-w-full fixed top-0 z-10 min-h-screen ">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center shadow-sm shadow-white">
        {/* Logo یا نام برند (مثلاً Prisma) */}
        <div className="text-xl font-bold text-white">SHEIKH SHOP</div>

        {/* لینک‌های میانی */}
        <div className=" backdrop-blur-sm flex space-x-6 rounded-full p-1 font-bold border texl-lg">
          <Link href="/products" className="text-black hover:text-white-300 px-3 py-2 rounded transition duration-300">Products</Link>
          <Link href="/pricing" className="text-black hover:text-green-300 px-3 py-2 rounded transition duration-300">Pricing</Link>
          <Link href="/resources" className="text-black hover:text-white px-3 py-2 rounded transition duration-300">Resources</Link>
          <Link href="/docs" className="text-black hover:text-green-300 px-3 py-2 rounded transition duration-300">Docs</Link>
          <Link href="/blog" className="text-black hover:text-green-300 px-3 py-2 rounded transition duration-300">Blog</Link>
        </div>
     {/* دکمه‌های Login و Signup */}
     <div className="flex space-x-4">
          <button className="text-black hover:text-green-900 px-4 py-2 rounded transition duration-300 font-bold text-lg">Log In</button>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 font-bold">Sign Up</button>
        </div>
       
      </nav>

      <div className='text-center text-5xl font-bold text-white pt-60'>WEllCOME TO SHEIKHSHOP</div>
    </header>
  );
}
