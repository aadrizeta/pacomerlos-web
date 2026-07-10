'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isActiveLink } from '@/utils/nav';

const NAV_LINKS = [
  { name: 'Inicio', href: '/', external: false },
  { name: 'Sabores', href: '/sabores', external: false },
  { name: 'Sobre Nosotros', href: '/sobre-nosotros', external: false },
  { name: 'Síguenos', href: 'https://www.instagram.com/paco_merlos/', external: true },
] as const;

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:block">
      <ul className="flex items-center gap-1">
        {NAV_LINKS.map(({ name, href, external }) => {
          const active = !external && isActiveLink(pathname, href);
          return (
            <li key={name}>
              <Link
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                aria-current={active ? 'page' : undefined}
                className={`navlink ${external ? 'navlink-external' : ''} ${active ? 'navlink-active' : ''
                  }`}
              >
                {name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
