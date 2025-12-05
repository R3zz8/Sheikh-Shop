'use client';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

interface Slide {
  id: number;
  title: string;
  image: string;
}

const images = [
  '/assets/carousel/carousel1.jpg',
  '/assets/carousel/carousel2.jpg',
  '/assets/carousel/carousel3.jpg',
  '/assets/carousel/carousel4.jpg',
  '/assets/carousel/carousel5.jpg',
];

const slides: Slide[] = images.map((image, index) => ({
  id: index + 1,
  title: `Class ${String.fromCharCode(65 + index)}`, // A, B, C, ...
  image,
}));

export default function BMWCarousel() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (!isDesktop) {
    return null;
  }

  return (
    <div
      className="hidden lg:flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: '#3E1F0F' }}
    >
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
                    backgroundImage: `url('${slide.image}')`,
                  }}
                >
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

        <div className="custom-pagination flex justify-center gap-2 mt-8 scale-150"></div>
      </div>
    </div>
  );
}