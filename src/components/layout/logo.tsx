import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <Image src="/images/logo.png" alt="Morii Coffee" width={120} height={40} className="h-10 w-auto" />
    </Link>
  );
}
