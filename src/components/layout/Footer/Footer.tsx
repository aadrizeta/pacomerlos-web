export default function Footer() {
  return (
    <footer className="border-t border-black/10">
      <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-black/60">
        <p>&copy; {new Date().getFullYear()} Pacomerlos</p>
      </div>
    </footer>
  );
}
