export interface FeatureItem {
  id: string;
  iconName: string;
  title: string;
  badge?: string;
  description: string;
  highlight: string;
  category: 'code' | 'career' | 'deploy' | 'collab';
}

export interface StepItem {
  number: string;
  step: string;
  title: string;
  description: string;
  details: string[];
  codePreview?: string;
  stat: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  popular?: boolean;
  features: string[];
  cta: string;
  ctaVariant: 'primary' | 'secondary' | 'outline';
}

export interface TestimonialItem {
  name: string;
  handle: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  metrics: string;
  rating: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface PortfolioPreview {
  id: string;
  name: string;
  role: string;
  style: string;
  avatar: string;
  bio: string;
  skills: string[];
  stats: {
    githubStars: number;
    repos: number;
    views: string;
  };
  featuredProject: {
    title: string;
    description: string;
    tags: string[];
  };
}
