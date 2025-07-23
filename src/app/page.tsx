import Banner from '@/components/banner';
import Welcome from '@/components/Welcome';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Banner />
      <Welcome />
      <div className="flex gap-4 mt-8">
        <Link href="/register">
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded shadow transition">
            Sign Up
          </button>
        </Link>
        <Link href="/login">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow transition">
            Login
          </button>
        </Link>
      </div>
    </div>
  );
}
