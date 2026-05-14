// src/app/companies/page.js
import CompaniesClient from './CompaniesClient';

export const metadata = {
  title: "Top Companies - Hiring Pakistan",
  description: "Browse top companies hiring in Pakistan",
};

export default function CompaniesPage() {
  return <CompaniesClient />;
}