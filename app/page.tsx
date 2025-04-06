import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { signOut } from '@/actions/auth';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // If no user or error, redirect to login
  if (!user || error) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Drive</h1>
          <form action={signOut}>
            <button
              type="submit"
              className="py-2 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Welcome back, {user.email}!
        </h2>
        <p className="text-gray-600">
          This is your productivity hub. Start tracking your habits and sleep here.
        </p>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-t py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          © 2025 Drive. All rights reserved.
        </div>
      </footer>
    </div>
  );
}