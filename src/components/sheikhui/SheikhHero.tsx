import Image from "next/image";

export default function SheikhHero() {
  return (
    <div className="flex items-center justify-center">
      <Image
        src="/assets/sheikh/sheikh.png"
        alt="Sheikh Hero"
        width={400}
        height={400}
        priority
        className="drop-shadow-[0_0_35px_rgba(255,215,0,0.35)] 
                   max-w-[70vw] sm:max-w-[60vw] md:max-w-[50vw] lg:max-w-[400px]"
      />
    </div>
  );
}
