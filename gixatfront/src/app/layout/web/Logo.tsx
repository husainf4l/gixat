import Image from "next/image";

interface LogoProps {
  width?: number;
  height?: number;
  additionalClasses?: string;
}

const Logo = ({
  width = 120,
  height = 40,
  additionalClasses = "",
}: LogoProps) => {
  // Always use the white version of the logo since we're always in dark mode
  const logoSrc = "/images/gixat-logow.png";

  return (
    <div className={additionalClasses}>
      <Image
        src={logoSrc}
        alt="GIXAT - Garage System Management"
        width={width}
        height={height}
        className="object-contain"
      />
    </div>
  );
};

export default Logo;
