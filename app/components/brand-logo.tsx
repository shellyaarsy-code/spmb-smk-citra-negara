import Image from "next/image";

type BrandLogoProps = {
  width?: number;
  className?: string;
};

export default function BrandLogo({ width = 32, className }: BrandLogoProps) {
  return (
    <Image
      src="/logo-cn-transparent.svg"
      alt="Logo resmi SMK Citra Negara"
      width={width}
      height={width}
      className={className ? `cn-brand-logo ${className}` : "cn-brand-logo"}
      priority={width >= 40}
    />
  );
}
