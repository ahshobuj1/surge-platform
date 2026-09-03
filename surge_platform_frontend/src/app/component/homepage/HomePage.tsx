import { BenefitsBento } from "./BenefitsBento";
import { CTABanner } from "./CTABanner";
import { FAQSection } from "./FAQSection";
import { FeaturesGrid } from "./FeaturesGrid";
import { Footer } from "./Footer";
import { HeroSection } from "./HeroSection";
import { HowItWorks } from "./HowItWorks";
import { IntegrationsSection } from "./IntegrationsSection";
import { Navbar } from "./Navbar";
import { PricingSection } from "./PricingSection";
import { TrustedBy } from "./TrustedBy";

 
export function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <TrustedBy />
        <FeaturesGrid />
        <BenefitsBento />
        <HowItWorks />
        <IntegrationsSection />
        <PricingSection />
        <FAQSection />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
 