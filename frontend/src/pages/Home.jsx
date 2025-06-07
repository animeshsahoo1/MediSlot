import React, { useState, useEffect } from 'react';
import SplitText from '../components/SplitText';
import RotatingText from '../components/RotatingText ';
import Navbar from '../components/Navbar';
import { RiseLoader } from 'react-spinners';
import Footer from '../components/Footer';

const Home = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <RiseLoader color="#80ff6f" size={15} margin={2} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col w-full items-center justify-center px-4 sm:px-6 md:px-12">
        <div className="bg-[#9FE66F] w-full max-w-7xl h-[30rem] mt-12 rounded-[2rem] relative px-4 sm:px-8">
          <SplitText
            text="MediSlot"
            className="text-[#163200] absolute top-[8%] left-1/2 transform -translate-x-1/2 text-5xl sm:text-7xl md:text-9xl font-extrabold whitespace-nowrap scale-150"
          />

          <div className="flex flex-col sm:flex-row justify-center items-center absolute top-2/5 left-1/2 transform -translate-x-1/2 mt-8 w-full px-2 sm:px-0">
            <h1 className="text-3xl sm:text-4xl mr-0 sm:mr-6 text-center sm:text-left mb-2 sm:mb-0">
              Appointments Made
            </h1>
            <RotatingText
              texts={['Simple!', 'Easy!', 'Smart!']}
              mainClassName="px-4 bg-green-800 text-white text-3xl sm:text-4xl overflow-hidden py-2 justify-center rounded-lg w-fit"
              staggerFrom={'first'}
            />
          </div>

          <button
            type="button"
            className="flex z-10 items-center gap-2.5 border border-gray-500/30 px-6 py-3 text-sm sm:text-base text-gray-800 rounded-3xl bg-white hover:text-cyan-500 hover:bg-gray-900 hover:border-cyan-500/30 active:scale-95 transition absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer scale-110"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.13 14.652a.553.553 0 0 1-.78-.78l4.097-4.098a.552.552 0 0 1 .78.78zM5.882 6.95l-2.11 2.887s-.402-.343-1.224-.236C1.332 9.76.816 11.167.56 11.457.295 11.639-.553 9.829.555 8.16c1.872-2.815 5.327-1.21 5.327-1.21m5.169 5.168-2.887 2.11s.343.401.236 1.224c-.16 1.216-1.566 1.731-1.856 1.988-.182.265 1.629 1.112 3.295.005 2.817-1.872 1.212-5.327 1.212-5.327m5.303-6.198c.607-1.365.616-2.753-.07-3.686l.02-.02C17.375 1.145 18.129.16 17.986.018c-.142-.142-1.126.611-2.198 1.682l-.019.02c-.931-.685-2.32-.677-3.683-.071a13.3 13.3 0 0 0 1.895 2.374 13.3 13.3 0 0 0 2.373 1.898"
                fill="#06B6D4"
              />
              <path
                d="M13.363 4.639a14.2 14.2 0 0 1-2.054-2.58 7 7 0 0 0-1.279 1.016c-1.314 1.314-6.163 7.728-6.163 7.728l.865.865 2.305-2.305a1.134 1.134 0 0 1 1.602 1.602L6.334 13.27l.865.865s6.414-4.849 7.728-6.163a7 7 0 0 0 1.018-1.283 14.2 14.2 0 0 1-2.582-2.05m-2.978 2.978A1.355 1.355 0 1 1 12.3 5.7a1.355 1.355 0 0 1-1.916 1.917"
                fill="#06B6D4"
              />
            </svg>
            Register Now!
          </button>
        </div>

        <div className="mt-16 px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">About us</h1>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
