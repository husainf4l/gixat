import Link from "next/link";
import BackIcon from "@/components/icons/BackIcon";

const BackButton: React.FC = () => (
  <div className="absolute top-4 left-4 z-50">
    <Link
      href="/app"
      className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all flex items-center justify-center"
    >
      <BackIcon />
    </Link>
  </div>
);

export default BackButton;
