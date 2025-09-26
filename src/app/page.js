// app/page.js
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to Cafeteria App</h1>
      <div className="space-x-4">
        <a href="/user/login" className="text-blue-500 hover:underline">User App</a>
        <a href="/vendor/login" className="text-blue-500 hover:underline">Vendor App</a>
      </div>
    </main>
  );
}