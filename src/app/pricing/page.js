// src/app/pricing/page.js
import PricingClient from './PricingClient';

export const metadata = {
  title: "Pricing Plans - Hiring Pakistan",
  description: "Choose the best plan for your business",
};

export default function PricingPage() {
  return <PricingClient />;
}