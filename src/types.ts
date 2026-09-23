export interface ServiceItem {
  id: string;
  title: string;
  category: 'engineering' | 'digital' | 'additive' | 'immersive';
  /**
   * Which side of MKRD does this work. One company, two sites: this one covers
   * software, web, 360° and 3D printing; the tooling practice is detailed at
   * mkrdengineers.com. Services marked 'parent' are named and linked here, not
   * showcased at length — a tooling enquiry should end up on the right page.
   */
  owner: 'mkrd' | 'parent';
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
