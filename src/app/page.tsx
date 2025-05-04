import FeaturesSection from "@/components/home/feature-section";
import Footer from "@/components/home/footer";
import HeroSection from "@/components/home/hero-section";
import NavBar from "@/components/home/nav-bar";

const HomePage = () => {
  return (
    <main className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        <HeroSection />
        <div id="features">
          <FeaturesSection />
        </div>
      </main>
      <Footer />
    </main>
  );
};

export default HomePage;
