export interface ServiceItem {
  id: string;
  title: string;
  category: 'engineering' | 'digital' | 'additive' | 'immersive';
  shortDesc: string;
  fullDesc: string;
  keyBenefits: string[];
  process: { step: string; label: string; desc: string }[];
  techStack: string[];
  image: string;
  stats: { label: string; value: string }[];
}

export interface ProjectCaseStudy {
  id: string;
  title: string;
  client: string;
  category: string;
  description: string;
  longDescription: string;
  image: string;
  link?: string;
  isExternal?: boolean;
  deliverables: string[];
  metrics: { label: string; value: string }[];
  tags: string[];
}

export interface MaterialSpec {
  id: string;
  name: string;
  category: string;
  tensileStrength: string;
  heatDeflection: string;
  density: string;
  color: string;
  costTier: '$' | '$$' | '$$$' | '$$$$';
  description: string;
}

export interface MachineSpec {
  id: string;
  name: string;
  type: string;
  workEnvelope: string;
  tolerance: string;
  keyCapability: string;
  status: 'ONLINE' | 'ACTIVE' | 'MAINTENANCE';
}

export interface QuoteRequestData {
  serviceId: string;
  projectName: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  material?: string;
  quantity: number;
  timeline: string;
  description: string;
  hasCadFile: boolean;
}
