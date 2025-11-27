'use client';

import { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import Image from 'next/image';

interface Slide {
  id: number;
  title: string;
  image: string; // مسیر عکس
}

const slides: Slide[] = [
  { id: 1, title: 'A Class', image: '/images/carousel/a.jpg' },
  { id: 2, title: 'B Class', image: '/images/carousel/b.jpg' },
  { id: 3, title: 'C Class', image: '/images/carousel/c.jpg' },
  { id: 4, title: 'D Class', image: '/images/carousel/d.jpg' },
  { id: 5, title: 'E Class', image: '/images/carousel/e.jpg' },
  { id: 6, title: 'G Class', image: '/images/carousel/g.jpg' },
];

export default function BMWCarousel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#171f21] to-[#3e5b69] p-4">
      <div className="w-full max-w-6xl">
        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={2.75}
          speed={600}
          loop={true}
          modules={[EffectCoverflow, Pagination]}
          pagination={{
            el: '.custom-pagination',
            clickable: false,
          }}
          coverflowEffect={{
            rotate: 10,
            stretch: 0,
            depth: 100,
            modifier: 3,
            slideShadows: true,
          }}
          className="pb-16"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              {({ isActive }) => (
                <div
                  className="relative h-96 rounded-2xl overflow-hidden filter grayscale-[0.6] bg-cover bg-center flex flex-col justify-end items-center pb-20"
                  style={{
                    backgroundImage: `linear-gradient(to top, #0f2027, #203a4300, #2c536400), url('${slide.image}')`,
                  }}
                >
                  {/* متن فقط روی اسلاید فعال */}
                  <div
                    className={`text-center transition-opacity duration-300 ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <h2 className="text-white text-xl font-normal uppercase tracking-wider mb-2">
                      {slide.title}
                    </h2>
                    <a
                      href="#"
                      className="inline-block px-7 py-2 bg-white text-[#717171] font-medium text-sm uppercase rounded-full hover:text-[#005baa] transition-colors"
                    >
                      explore
                    </a>
                  </div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* پیجینیشن سفارشی */}
        <div className="custom-pagination flex justify-center gap-2 mt-8 scale-150"></div>
      </div>
    </div>
  );
}