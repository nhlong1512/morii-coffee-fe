import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/images/logo.png"
        alt="Morii Coffee"
        width={120}
        height={40}
        priority
        className="h-[40px] w-[120px]"
      />
    </Link>
  );
}
