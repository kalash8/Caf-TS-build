import pageBg from '../Assets/pagebg.png';
import iconn from '../Assets/homeicon.png'

export default function Home() {
  return (
    <main 
      className="relative flex min-h-screen flex-col items-center justify-center pb-20 pr-6 pl-6 bg-no-repeat"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-[-1]" 
        style={{ backgroundImage: `url(${pageBg.src})`, opacity: 0.1 }}
      ></div>
      <img 
        src={iconn.src} 
        alt="CNX Cafe Logo" 
        className="w-96 md:w-80 mb-8" 
      />
      <h1 className="text-4xl text-center font-bold mb-8 drop-shadow-lg">Welcome to CNX Cafe</h1>
      <div className="space-x-4 text-center">
        {/* <span className="text-lg m-0 justify-center font-bold drop-shadow-md">Choose your Role</span> */}
        <br/>
        <a 
          href="/user/login" 
          className="inline-block px-6 py-3 mt-4 text-white rounded-lg font-semibold hover:scale-105 transition-transform duration-200 shadow-md"
          style={{ backgroundColor: '#003D5D', ':hover': { backgroundColor: '#005A8A' } }}
        >
          Order Food
        </a>
        <a 
          href="/vendor/login" 
          className="inline-block px-6 py-3 mt-4 text-white rounded-lg font-semibold hover:scale-105 transition-transform duration-200 shadow-md"
          style={{ backgroundColor: '#003D5D', ':hover': { backgroundColor: '#005A8A' } }}
        >
          Cook Food
        </a>
      </div>
    </main>
  );
}