import Link from 'next/link';

export default function GalleryButton() {
  return (
    <Link
      href="/sabores"
      className="bg-paco-orange text-white py-2 px-4 rounded-md hover:bg-paco-orange-dark transition-colors duration-200 text-lg md:text-2xl mt-5"
    >
      Ver Todos
    </Link>
  );
}