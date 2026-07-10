'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isActiveLink } from '@/utils/nav';

const NAV_LINKS = [
  { name: 'Inicio', href: '/', external: false },
  { name: 'Sabores', href: '/sabores', external: false },
  { name: 'Sobre Nosotros', href: '/sobre-nosotros', external: false },
  { name: 'Síguenos', href: 'https://www.instagram.com/paco_merlos/', external: true },
] as const;

interface DropdownNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DropdownNav({ isOpen, onClose }: DropdownNavProps) {
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <nav
      className={`fixed inset-0 z-40 flex flex-col bg-paco-cream transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      aria-hidden={!isOpen}
    >
      <ul className="mt-24 flex flex-col gap-2 px-6">
        {NAV_LINKS.map(({ name, href, external }) => {
          const isActive = !external && isActiveLink(pathname, href);
          const colorClass = external
            ? 'text-paco-purple'
            : isActive
              ? 'text-paco-orange'
              : 'text-paco-dark';
          return (
            <li
              key={name}
              className={`border-b border-paco-orange/40 ${isActive ? 'bg-paco-orange/10' : ''}`}
            >
              <Link
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
                className={`block px-2 py-4 font-now text-3xl uppercase tracking-wide transition-colors ${colorClass}`}
              >
                {name}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="flex-1" onClick={onClose} aria-hidden />
    </nav>
  );
}
