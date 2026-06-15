import Image from 'next/image';
import Link from 'next/link';

export default function HeaderLogo() {
  return (
    <Link href="/" className="header-logo" aria-label="Paco Merlos — Inicio">
      <Image
        src="/img/logos/logo-paco-merlos.webp"
        alt="Paco Merlos"
        width={200}
        height={40}
        priority
      />
    </Link>
  );
}
