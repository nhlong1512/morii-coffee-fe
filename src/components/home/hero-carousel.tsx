"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getBanners } from "@/services/banners-service";
import { Button } from "@/components/ui/button";
import type { ApiBanner } from "@/types/api";

const BRAND_GRADIENT = "bg-gradient-to-r from-[#0d4a34] to-[#146d4d]";

function isCurrentlyActive(banner: ApiBanner): boolean {
  const now = Date.now();
  return (
    banner.isActive &&
    new Date(banner.startDate).getTime() <= now &&
    now <= new Date(banner.endDate).getTime()
  );
}

function CarouselSkeleton() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="flex h-125 animate-pulse items-center justify-center bg-muted md:h-150">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-72 rounded-lg bg-muted-foreground/20" />
          <div className="mx-auto h-5 w-96 rounded bg-muted-foreground/15" />
          <div className="mx-auto h-11 w-32 rounded-full bg-muted-foreground/20" />
        </div>
      </div>
    </section>
  );
}

function CarouselFallback() {
  return (
    <section className="relative w-full overflow-hidden">
      <div
        className={cn(
          "flex h-125 items-center justify-center md:h-150",
          BRAND_GRADIENT
        )}
      >
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-6xl">
            Welcome to Morii Coffee
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90 md:text-xl">
            Artisan coffee crafted with passion.
          </p>
          <Button asChild size="lg" className="rounded-full px-8 text-base">
            <Link href="/products">Shop Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function HeroCarousel() {
  const [activeBanners, setActiveBanners] = useState<ApiBanner[] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  useEffect(() => {
    getBanners()
      .then((all) => {
        const filtered = all
          .filter(isCurrentlyActive)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        setActiveBanners(filtered);
      })
      .catch(() => setActiveBanners([]));
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  // Still loading
  if (activeBanners === null) return <CarouselSkeleton />;

  // No active banners
  if (activeBanners.length === 0) return <CarouselFallback />;

  return (
    <section className="relative w-full overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {activeBanners.map((banner, index) => (
            <div key={banner.id} className="min-w-0 shrink-0 grow-0 basis-full">
              <div className="relative flex h-125 items-center justify-center md:h-150">
                {/* Background — image or branded gradient */}
                {banner.imageUrl ? (
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                ) : (
                  <div className={cn("absolute inset-0", BRAND_GRADIENT)} />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Content */}
                <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
                  <AnimatePresence mode="wait">
                    {selectedIndex === index && (
                      <motion.div
                        key={banner.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      >
                        <motion.h1
                          className="mb-4 text-4xl font-bold tracking-tight md:text-6xl"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1, duration: 0.5 }}
                        >
                          {banner.title}
                        </motion.h1>
                        {banner.subtitle && (
                          <motion.p
                            className="mx-auto mb-8 max-w-2xl text-lg text-white/90 md:text-xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.5 }}
                          >
                            {banner.subtitle}
                          </motion.p>
                        )}
                        {banner.cta && banner.ctaLink && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                          >
                            <Button asChild size="lg" className="rounded-full px-8 text-base">
                              <Link href={banner.ctaLink}>{banner.cta}</Link>
                            </Button>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow Controls */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {activeBanners.map((banner, index) => (
          <button
            key={banner.id}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-2.5 rounded-full transition-all duration-300",
              selectedIndex === index
                ? "w-8 bg-white"
                : "w-2.5 bg-white/50 hover:bg-white/75"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
