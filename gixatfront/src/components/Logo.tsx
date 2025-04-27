import Image from "next/image";

interface LogoProps {
  width?: number;
  height?: number;
  additionalClasses?: string; // Additional classes for customization
}

const Logo = ({
  width = 120,
  height = 40,
  additionalClasses = "",
}: LogoProps) => {
  return (
    <div className={additionalClasses}>
      <Image
        src="/images/widd-logo.webp"
        alt="WIDD ننشر الوِدّ بشغف اللعبة"
        width={width}
        height={height}
        className="object-contain"
      />
    </div>
  );
};

export default Logo;
