import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center shrink-0">
      <Image
        src="/images/logo.png"
        alt="Morii Coffee"
        width={120}
        height={40}
        priority
        className="h-8 w-24 sm:h-[40px] sm:w-[120px]"
      />
    </Link>
  );
}
