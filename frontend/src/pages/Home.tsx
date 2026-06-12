import HomeClientWrapper from "@/components/home/HomeClientWrapper";
import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import LiveBattlePreview from "@/components/home/LiveBattlePreview";
import HowItWorks from "@/components/home/HowItWorks";
import TierComparison from "@/components/home/TierComparison";
import TrustFeatures from "@/components/home/TrustFeatures";

export default function Home() {
  return (
    <HomeClientWrapper>
      <div className="flex flex-col w-full">
        <HeroSection />
        <StatsBar />
        <LiveBattlePreview />
        <HowItWorks />
        <TierComparison />
        <TrustFeatures />
      </div>
    </HomeClientWrapper>
  );
}
