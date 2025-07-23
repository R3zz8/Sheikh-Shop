import { Mail, MapPin, Phone, Youtube, Twitter, Instagram, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';

export default function Footer() {
    return (
        <footer className="w-full bg-gray-900 text-white">
            {/* Call to Action - Green Box */}
            <div className="w-full flex justify-center bg-green-700 py-6 px-4">
                <div className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                    <div className="text-xl font-semibold">Need free consultation?</div>
                    <div className="text-sm opacity-90">For free consultation, contact us</div>
                    <Button className="bg-white text-green-700 hover:bg-green-100 font-bold px-6 py-2 rounded shadow" variant="outline">
                        Get Consultation
                    </Button>
                </div>
            </div>
            {/* Main Footer - Blue/Gray Box */}
            <div className="w-full bg-gray-800 border-t border-gray-700">
                <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                    {/* About Us */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">About Us</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            To change this text, click the edit button. Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        </p>
                    </div>
                    {/* Important Pages */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Important Pages</h3>
                        <ul className="space-y-2 text-gray-300 text-sm">
                            <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
                            <li><a href="#" className="hover:text-white transition">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                            <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                        </ul>
                    </div>
                    {/* Shop */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Shop</h3>
                        <ul className="space-y-2 text-gray-300 text-sm">
                            <li><a href="#" className="hover:text-white transition">Drinks</a></li>
                            <li><a href="#" className="hover:text-white transition">Supplements</a></li>
                            <li><a href="#" className="hover:text-white transition">Spices</a></li>
                        </ul>
                    </div>
                    {/* Contact Us */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Contact Us</h3>
                        <ul className="space-y-2 text-gray-300 text-sm mb-4">
                            <li className="flex items-center gap-2"><Phone size={16} /> 0912345678</li>
                            <li className="flex items-center gap-2"><Mail size={16} /> info@example.com</li>
                            <li className="flex items-center gap-2"><MapPin size={16} /> Tehran, Example Street...</li>
                        </ul>
                        <div className="flex gap-4">
                            <a href="#" aria-label="WhatsApp" className="hover:text-green-400 transition"><MessageCircle size={22} /></a>
                            <a href="#" aria-label="YouTube" className="hover:text-red-500 transition"><Youtube size={22} /></a>
                            <a href="#" aria-label="Twitter" className="hover:text-blue-400 transition"><Twitter size={22} /></a>
                            <a href="#" aria-label="Instagram" className="hover:text-pink-400 transition"><Instagram size={22} /></a>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="border-t border-gray-700 pt-6 pb-2 text-center text-gray-400 text-xs">
                        &copy; {new Date().getFullYear()} All rights reserved for Example Shop.
                    </div>
                </div>
            </div>
        </footer>
    );
} 