// src/app/blog/page.js
import BlogClient from './BlogClient';

export const metadata = {
  title: "Blog & Tips - Hiring Pakistan",
  description: "Career tips, job search advice, and industry insights",
};

export default function BlogPage() {
  return <BlogClient />;
}