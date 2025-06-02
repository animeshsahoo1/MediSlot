import React, { useState } from "react";
import { assets } from "../assets_frontend/assets";
import AuthModal from "./AuthModal";


const Navbar = () => {
    const [open, setOpen] = React.useState(false)
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('login');
    const openModal = (type) => {
        setModalType(type);
        setModalOpen(true);
    };
    return (
        <>
        <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">

            <a href="#">
                <img className="h-15 w-15 scale-200 -p-10" src={assets.logo}  />
            </a>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-18 ">
                <a href="#" className="hover:scale-110 hover:text-gray-600">Home</a>
                <a href="#" className="hover:scale-110 hover:text-gray-600">About</a>
                <a href="#" className="hover:scale-110 hover:text-gray-600">Contact</a>
                <button  onClick={() => {
                    openModal('login');
                    setMobileMenuOpen(false);
                 }}
                 className="cursor-pointer px-8 py-2 ml-80 bg-primary hover:bg-primary-dull border border-gray-800 hover:scale-110 transition text-gray-800 hover:text-white rounded-full">
                    Login
                </button>
            </div>

            <button onClick={() => open ? setOpen(false) : setOpen(true)} aria-label="Menu" className="sm:hidden">
                {/* Menu Icon SVG */}
                <svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="21" height="1.5" rx=".75" fill="#426287" />
                    <rect x="8" y="6" width="13" height="1.5" rx=".75" fill="#426287" />
                    <rect x="6" y="13" width="15" height="1.5" rx=".75" fill="#426287" />
                </svg>
            </button>

            {/* Mobile Menu */}
            <div className={`${open ? 'flex' : 'hidden'} absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden`}>
                <a href="#" className="block">Home</a>
                <a href="#" className="block">About</a>
                <a href="#" className="block">Contact</a>
                <button
                 onClick={() => {
                  openModal('login');
                  setMobileMenuOpen(false);
                 }}
                 className="cursor-pointer px-6 py-2 mt-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full text-sm">
                    Login
                </button>
            </div>

        </nav>
        <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} type={modalType} setType={setModalType}/>
        </>
    )
}

export default Navbar; 