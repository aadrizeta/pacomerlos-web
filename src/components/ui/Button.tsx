import Link from "next/link";

export interface CtaButtonProps {
  label: string;
  href: string;
  bgColor?: string;
  textColor?: string;
  external?: boolean;
}

export default function CtaButton({
  label,
  href,
  bgColor = "var(--paco-orange)",
  textColor = "var(--paco-cream)",
  external = false
}: CtaButtonProps) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      <button style={{ backgroundColor: bgColor, color: textColor }} className="button">{label}</button>
    </Link>
  );
}
