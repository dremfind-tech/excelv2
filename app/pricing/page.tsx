import { Pricing } from "@/components/pricing";
import { FeatureComparisonTable } from "@/components/feature-comparison";

export default function PricingPage() {
  return (
    <div>
      <Pricing />
      <FeatureComparisonTable billing="monthly" />
      <FeatureComparisonTable billing="yearly" />
    </div>
  );
}
