import { IconLink } from "./iconLink";

interface SocialLink {
  href: string;
  icon: string;
  label: string;
  hoverColor?: string;
}

const socialLinks: SocialLink[] = [
  {
    href: "https://instagram.com",
    icon: "icons8-instagram.svg",
    label: "Instagram",
    hoverColor: "#E1306C",
  },
  {
    href: "https://x.com",
    icon: "icons8-x.svg",
    label: "Twitter",
    hoverColor: "#ffffff",
  },
  {
    href: "https://tiktok.com",
    icon: "icons8-tik-tok.svg",
    label: "TikTok",
    hoverColor: "#FE2C55",
  },
  {
    href: "https://youtube.com",
    icon: "icons8-youtube.svg",
    label: "YouTube",
    hoverColor: "#FF0000",
  },
  {
    href: "https://facebook.com",
    icon: "icons8-facebook-nuevo.svg",
    label: "Facebook",
    hoverColor: "#1877F2",
  },
];

export default function IconRow() {
  return (
    <div className="icon-row">
      {socialLinks.map((link) => (
        <IconLink
          key={link.href}
          href={link.href}
          icon={link.icon}
          label={link.label}
          hoverColor={link.hoverColor}
        />
      ))}
    </div>
  );
}