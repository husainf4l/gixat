import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import ImmersiveSportsSection from "@/components/home/ImmersiveSportsSection";
import DownloadSection from "@/components/home/DownloadSection";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <FeaturesSection />
      <ImmersiveSportsSection />
      <DownloadSection />
      <Footer />
    </main>
  );
}
