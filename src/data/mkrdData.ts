import { ServiceItem, ProjectCaseStudy, MaterialSpec, MachineSpec } from '../types';

import heroImg from '../assets/images/hero_robotic_precision_1787995484245.jpg';
import printerImg from '../assets/images/printer_additive_fab_1787995499367.jpg';
import mouldImg from '../assets/images/mould_die_engineering_1787995513683.jpg';
import tourImg from '../assets/images/virtual_tour_scanning_1787995529203.jpg';
import softwareImg from '../assets/images/software_microservices_tech_1787995547133.jpg';

export const COMPANY_DETAILS = {
  name: "MKRD ENGINEERS PVT. LTD.",
  shortName: "MKRD",
  tagline: "Innovating Your Digital Tomorrow. Tailored Solutions.",
  address: "Gurgaon- Haryana (INDIA).",
  phone: "+91 9650020661",
  phoneFormatted: "+91 96500 20661",
  email: "mkrdengineers@gmail.com",
  secondaryEmail: "mkrdengineers@gmail.com",
  coordinates: {
    lat: "28.3619° N",
    long: "76.9366° E",
    locationName: "Gurgaon, Haryana, India"
  },
  established: "2018",
  isoCertified: "ISO 9001:2015 Quality Assured",
  cin: "U29253HR2018PTC073921",
};

export const SERVICES: ServiceItem[] = [
  {
    id: "3d-printing-prototyping",
    title: "Advanced 3D Printing & Prototyping",
    category: "additive",
    shortDesc: "Rapid and cost-effective additive manufacturing of complex geometric prototypes with industrial polymers, resins, and metals.",
    fullDesc: "MKRD provides cutting-edge additive manufacturing capabilities designed for rapid iteration, functional test parts, low-volume production, and complex lattice structures. From aerospace-grade carbon fiber composites to biocompatible resins, we turn CAD models into physical reality in hours.",
    keyBenefits: [
      "Accelerated Development: Shorten R&D cycles from weeks to days with same-day print turnaround.",
      "Complex Geometries: Produce internal lattice channels, overhangs, and conformal cavities impossible via traditional CNC.",
      "Diverse Material Choices: Industrial PEEK, Carbon-Fiber PLA/Nylon, Titanium Ti64, TPU flexible elastomers, and high-temp resins.",
      "Micro-Tolerance Precision: Layer resolution down to 25 microns for flawless cosmetic and dimensional fidelity."
    ],
    process: [
      { step: "01", label: "CAD Modeling & Optimization", desc: "Design evaluation, mesh validation, DfAM (Design for Additive Manufacturing) analysis." },
      { step: "02", label: "Preparation & Slicing", desc: "Optimal orientation, layer thickness selection, support structure generation, and thermal simulation." },
      { step: "03", label: "Precision Printing", desc: "Controlled chamber extrusion / photopolymer curing with automated bed leveling." },
      { step: "04", label: "Post-Processing & QA", desc: "Support removal, UV cure/annealing, vapor smoothing, and CMM dimensional inspection." }
    ],
    techStack: ["Industrial FDM", "SLA Photopolymer", "SLS Powder Fusion", "Carbon Fiber Matrix", "Autodesk Fusion 360", "Siemens NX"],
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop", // Additive/Prototyping
    stats: [
      { label: "Layer Resolution", value: "25 μm" },
      { label: "Build Chamber", value: "450×450×500 mm" },
      { label: "Turnaround", value: "< 24 Hours" }
    ]
  },
  {
    id: "plastic-injection-mould",
    title: "Plastic Injection Mould & Tooling",
    category: "engineering",
    shortDesc: "Sub-micron precision injection mould design, die casting tool engineering, sheet-metal tooling, and mould flow thermal analysis.",
    fullDesc: "With decades of combined tooling mastery, MKRD delivers world-class mould designs, core-cavity machining, slider/lifter mechanisms, and hot runner configurations for automotive, medical, and consumer appliance OEMs.",
    keyBenefits: [
      "Sub-Micron Dimensional Control: Strict GD&T tolerances ensuring tight shut-offs and flash-free parting lines.",
      "Mould Flow Simulation: Full rheological, warpage, cooling, and sink mark analysis before steel is cut.",
      "Extended Tool Life: Certified H13, P20, and Stavax hardened tool steels delivering 1,000,000+ cycle guarantees.",
      "Quick-Change Modular Inserts: Fast maintenance and interchangeability for multi-cavity production lines."
    ],
    process: [
      { step: "01", label: "Part Feasibility & DFM", desc: "Draft angle analysis, wall thickness uniformity, gating location optimization." },
      { step: "02", label: "3D Tool Architecture", desc: "Multi-cavity layout, cooling channel design, ejection kinematics, slider/lifter simulation." },
      { step: "03", label: "Mould Flow & Thermal Analysis", desc: "Pressure drop, fill time, weld line tracking, and shrinkage prediction." },
      { step: "04", label: "CNC Machining & T1 Trial", desc: "High-speed 5-axis milling, wire EDM, hand polishing, and first-shot trial sampling." }
    ],
    techStack: ["Siemens NX Mold Wizard", "Moldflow Insight", "CREO Parametric", "5-Axis High Speed Milling", "Charmilles Wire EDM"],
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=2071&auto=format&fit=crop", // Injection Moulding
    stats: [
      { label: "Tooling Tolerance", value: "±0.005 mm" },
      { label: "Tool Life Rating", value: "1M+ Shots" },
      { label: "Core/Cavity Steels", value: "H13 / P20 / 2316" }
    ]
  },
  {
    id: "360-virtual-tours",
    title: "Immersive 360° Virtual Tours & Digital Twins",
    category: "immersive",
    shortDesc: "High-definition interactive spatial virtual experiences, LiDAR scanning, and 3D digital twins for universities, industrial plants, and real estate.",
    fullDesc: "Bring physical campuses, industrial factories, and institutions to life with interactive 360° virtual tours. Equipped with spatial audio, interactive data hotspots, floorplan navigation, and VR headset compatibility, as proven in our landmark SDMS project.",
    keyBenefits: [
      "Global Reach: Showcase physical infrastructure to international stakeholders, students, and clients anytime.",
      "Radical Transparency: Allow users to navigate every corridor, laboratory, assembly line, and facility freely.",
      "Rich Interactive Hotspots: Embed PDF brochures, video demonstrations, equipment spec sheets, and live chat within the 360 view.",
      "Cross-Platform Performance: Blazing fast web delivery on desktop, mobile iOS/Android, and VR headsets."
    ],
    process: [
      { step: "01", label: "Site Survey & Planning", desc: "Path mapping, lighting evaluation, node placement, and architectural layout indexing." },
      { step: "02", label: "High-Res HDR Capture", desc: "Ultra-high resolution 12K panoramic photography and spatial LiDAR point cloud capture." },
      { step: "03", label: "Editing & Stitching", desc: "Color grading, zenith/nadir retouching, spherical HDR blending, and spatial audio alignment." },
      { step: "04", label: "Interactive Integration", desc: "Custom branded UI, floorplans, hotspot metadata, search indexing, and CDN deployment." }
    ],
    techStack: ["12K HDR Panoramas", "Spatial LiDAR", "Three.js / WebGL", "Matterport / Custom Engine", "Spatial 3D Audio"],
    image: "https://images.unsplash.com/photo-1617791160505-6f00504e3519?q=80&w=2100&auto=format&fit=crop", // Digital Twin / Virtual Reality
    stats: [
      { label: "Resolution", value: "12K Panoramic" },
      { label: "Virtual Nodes", value: "100+ Per Facility" },
      { label: "Engagement Lift", value: "+340%" }
    ]
  },
  {
    id: "custom-software-development",
    title: "Custom Software & Enterprise Systems",
    category: "digital",
    shortDesc: "Innovating your digital developments with bespoke web platforms, enterprise ERP/CRM solutions, and scalable business logic.",
    fullDesc: "We build enterprise-grade software that bridges hardware engineering and business operations. From custom manufacturing execution systems (MES) to client portals, our software delivers flawless reliability and ironclad security.",
    keyBenefits: [
      "Operational Efficiency: Automate repetitive workflows, reduce manual data entry, and streamline operations.",
      "Greater Control: Centralized admin dashboards with real-time audit logs, telemetry, and permissions.",
      "Limitless Scalability: Cloud-native architectures that expand effortlessly with your business expansion.",
      "Rock-Solid Security: End-to-end encryption, role-based access control (RBAC), and regulatory compliance."
    ],
    process: [
      { step: "01", label: "Business Analysis", desc: "Requirement discovery, system architecture design, data flow diagrams." },
      { step: "02", label: "Agile Development", desc: "Iterative sprint cycles, continuous code reviews, CI/CD pipeline integration." },
      { step: "03", label: "Rigorous QA & Testing", desc: "Unit, integration, security vulnerability, and load stress testing." },
      { step: "04", label: "Deployment & 24/7 Support", desc: "Zero-downtime cloud launch, telemetry monitoring, and ongoing maintenance." }
    ],
    techStack: ["React 19 / Next.js", "Node.js / Express", "PostgreSQL / Prisma", "Docker / Kubernetes", "Tailwind CSS"],
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop", // Software
    stats: [
      { label: "Uptime SLA", value: "99.95%" },
      { label: "Security Level", value: "Enterprise RBAC" },
      { label: "Architecture", value: "Cloud-Native" }
    ]
  },
  {
    id: "automation-robotics",
    title: "Industrial Automation & Robotics",
    category: "engineering",
    shortDesc: "Robotic actuators, automated inspection systems, PLC integration, and smart manufacturing workflows.",
    fullDesc: "MKRD integrates hardware automation with smart software. We design end-of-arm tooling, automated pick-and-place fixtures, pneumatic/hydraulic actuators, and smart sensors for factory floors.",
    keyBenefits: [
      "Enhanced Efficiency: Multiply throughput while minimizing cycle times and labor-intensive bottlenecks.",
      "Fault Tolerance: Intelligent sensors detecting anomalies before defects propagate downstream.",
      "Workforce Safety: Automate dangerous handling and ergonomic strain operations.",
      "Real-time Telemetry: Live line dashboards tracking OEE (Overall Equipment Effectiveness) in real time."
    ],
    process: [
      { step: "01", label: "Assessment & Feasibility", desc: "Cycle time analysis, payload calculations, sensor requirements, safety zones." },
      { step: "02", label: "Mechanical Implementation", desc: "Actuator fabrication, PLC ladder programming, pneumatic routing, electrical wiring." },
      { step: "03", label: "Calibration & Training", desc: "Fine precision calibration, safety testing, and operator training documentation." }
    ],
    techStack: ["PLC Programming (Siemens/Omron)", "Robotic Actuators", "Modbus / MQTT IoT", "Machine Vision QA"],
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=2070&auto=format&fit=crop", // Robotics/Automation
    stats: [
      { label: "Cycle Speedup", value: "up to 4.5x" },
      { label: "Repeatability", value: "±0.02 mm" },
      { label: "OEE Improvement", value: "+38%" }
    ]
  },
  {
    id: "microservices-cloud",
    title: "Microservices & Distributed Architecture",
    category: "digital",
    shortDesc: "Modular, fault-tolerant microservice ecosystems connected via high-performance APIs and message brokers.",
    fullDesc: "Break free from monolithic bottlenecks. Our microservice engineering partitions complex business domains into decoupled, containerized services that deploy and scale independently without downtime.",
    keyBenefits: [
      "Zero-Downtime Releases: Update individual services without taking down the entire platform.",
      "Fault Isolation: Prevent cascading failures—a crash in one service never halts core operations.",
      "Optimized Resource Usage: Auto-scale high-load microservices dynamically while conserving idle compute.",
      "Multi-Language Polyglot Support: Pick the optimal runtime for each micro-domain (Node, Go, Python)."
    ],
    process: [
      { step: "01", label: "Domain-Driven Design", desc: "Bounded context identification, service boundary mapping, API contracts." },
      { step: "02", label: "Containerization & Mesh", desc: "Docker image optimization, Kubernetes orchestrations, Envoy service mesh." },
      { step: "03", label: "Event Bus & Telemetry", desc: "Kafka/RabbitMQ asynchronous queues, Prometheus metrics, distributed tracing." }
    ],
    techStack: ["Kubernetes (K8s)", "Docker", "gRPC / GraphQL", "Kafka", "Prometheus & Grafana"],
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop", // Cloud/Microservices
    stats: [
      { label: "Fault Isolation", value: "100%" },
      { label: "Deploy Frequency", value: "On-Demand" },
      { label: "Latency", value: "< 15ms p99" }
    ]
  },
  {
    id: "website-development-redesign",
    title: "Website Development & Modern Redesign",
    category: "digital",
    shortDesc: "High-performance, cinematic, responsive web platforms engineered to convert visitors and elevate corporate brand authority.",
    fullDesc: "We craft bespoke digital experiences with cinematic visual hierarchy, silky smooth animations, high-contrast typography, and uncompromising mobile responsiveness that leave lasting impressions.",
    keyBenefits: [
      "User Engagement: Immersive storytelling and responsive interactions that keep high-value clients engaged.",
      "Conversion Optimization: Clear user pathways, strategic CTAs, and frictionless inquiry funnels.",
      "Distinctive Brand Identity: Bespoke aesthetics that separate your enterprise from generic corporate templates.",
      "Lighthouse 95+ Performance: Optimized assets, instant page transitions, and SEO-first metadata."
    ],
    process: [
      { step: "01", label: "Strategy & Wireframing", desc: "Brand tone analysis, information architecture, user journeys, technical specs." },
      { step: "02", label: "Bespoke Visual Design", desc: "Typographic pairing, dark/light contrast balancing, 3D asset integration, motion choreography." },
      { step: "03", label: "Frontend Engineering", desc: "React/TypeScript implementation, hardware-accelerated animations, responsive adaptation." },
      { step: "04", label: "Production Launch", desc: "SSL certification, CDN distribution, analytics tracking, and speed optimization." }
    ],
    techStack: ["React 19", "Tailwind CSS", "Motion / GSAP", "Three.js WebGL", "Vite"],
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=2128&auto=format&fit=crop", // Web Design
    stats: [
      { label: "Lighthouse Score", value: "98/100" },
      { label: "Mobile Responsiveness", value: "100% Fluid" },
      { label: "Interaction Speed", value: "60 FPS" }
    ]
  },
  {
    id: "reliable-network-solutions",
    title: "Reliable Network & Infrastructure Solutions",
    category: "digital",
    shortDesc: "Robust, secure, and high-bandwidth data network infrastructure for manufacturing plants and corporate campuses.",
    fullDesc: "MKRD designs and deploys mission-critical network backbones. From structured optical fiber cabling and software-defined WANs to managed firewall security, we ensure zero packet loss and 24/7 uptime.",
    keyBenefits: [
      "Reduced Downtime: Redundant failover routing and uninterruptible network topology.",
      "Effortless Scalability: Structured backbone supporting hundreds of IoT devices, CNC links, and workstations.",
      "Hardened Security: VLAN segmentation, firewall intrusion prevention, and encrypted access tunnels.",
      "Proactive Monitoring: Automated SNMP diagnostics alerting network engineers before issues affect production."
    ],
    process: [
      { step: "01", label: "Network Audit & Heatmap", desc: "Bandwidth profiling, RF wireless heatmapping, cable path verification." },
      { step: "02", label: "Custom Topology Design", desc: "Core/distribution/access switch layering, VLAN security isolation." },
      { step: "03", label: "Deployment & Termination", desc: "Cat6A/Fiber optic splicing, server rack patching, UPS backup configuration." },
      { step: "04", label: "Ongoing NOC Support", desc: "Continuous packet monitoring, firmware security patching, and SLA management." }
    ],
    techStack: ["Cisco & Ubiquiti Enterprise", "OM4 Optical Fiber", "Fortinet Security", "SNMP Telemetry"],
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop", // Network Servers
    stats: [
      { label: "Bandwidth Cap", value: "10 Gbps SFP+" },
      { label: "Packet Loss", value: "0.001%" },
      { label: "Failover Time", value: "< 200ms" }
    ]
  },
  {
    id: "billing-invoicing-software",
    title: "Integrated Billing & Invoicing Systems",
    category: "digital",
    shortDesc: "Streamlined financial management, automated GST invoicing, client portals, and real-time ledger reporting.",
    fullDesc: "Eliminate manual bookkeeping errors and speed up cash flow. MKRD's billing systems handle multi-tier pricing, recurring subscriptions, automated GST compliance, and payment gateway webhooks.",
    keyBenefits: [
      "Accurate Records: Zero discrepancy reconciliation with automated audit trail logging.",
      "Faster Payments: Automated payment reminder dispatch and instant UPI/Credit Card settlement links.",
      "Rich Financial Reporting: Real-time revenue analytics, tax breakdowns, and exportable balance sheets.",
      "Modular Integration: Seamlessly hooks into existing ERPs, inventory databases, and CRM platforms."
    ],
    process: [
      { step: "01", label: "Financial Flow Mapping", desc: "Tax rules, payment terms, currency handling, invoice customization." },
      { step: "02", label: "System Integration", desc: "Database schema creation, banking gateway webhooks, email/SMS notifications." },
      { step: "03", label: "Staff Training & Cutover", desc: "Onboarding team, sandbox testing, data migration from legacy spreadsheets." },
      { step: "04", label: "Generate & Track", desc: "Real-time automated invoice creation, payment status tracking, and compliance filings." }
    ],
    techStack: ["Node.js / Express", "PostgreSQL", "Razorpay / Stripe Webhooks", "Automated PDF Generation"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop", // Dashboard/Finance
    stats: [
      { label: "Billing Cycle Reduction", value: "70%" },
      { label: "Tax Compliance", value: "100% GST-Ready" },
      { label: "Payment Speedup", value: "2.4x" }
    ]
  }
];

export const CASE_STUDIES: ProjectCaseStudy[] = [
  {
    id: "sdms-virtual-tour",
    title: "SDMS 360° Immersive Virtual Campus Tour",
    client: "SDMS Educational Institutions",
    category: "360 Virtual Tours & Digital Twin",
    description: "Full spatial digital twin and high-definition 360° virtual tour capturing modern academic labs, campus halls, and facilities.",
    longDescription: "MKRD Engineers engineered and deployed a high-resolution interactive 360° virtual tour for SDMS. The project enables prospective students, parents, and international visitors to explore over 80 panoramic nodes with spatial map navigation, equipment info cards, and seamless mobile responsiveness.",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop", // Campus/University
    link: "/sdms_virtual_tour/index.html",
    isExternal: true,
    deliverables: [
      "80+ High-Resolution 12K HDR Panorama Capture",
      "Interactive Campus Floorplan & Dynamic Wayfinding",
      "Embedded Laboratory Equipment & Facility Hotspots",
      "Mobile-Optimized Touch Panning and Gyroscope Support"
    ],
    metrics: [
      { label: "Panoramic Nodes", value: "85+" },
      { label: "Visitor Retention", value: "+280%" },
      { label: "Global Views", value: "50,000+" }
    ],
    tags: ["Spatial 360", "Interactive Tour", "Virtual Reality", "Education"]
  },
  {
    id: "sdms-institutional-portal",
    title: "SDMS Official Institutional Digital Platform",
    client: "SDMS Educational Institutions",
    category: "Enterprise Web Systems",
    description: "Modern, high-performance web platform for admissions, curriculum management, news updates, and student services.",
    longDescription: "Developed the complete digital architecture for SDMS (https://sdms.edu.in/), featuring an intuitive user interface, lightning-fast load times, comprehensive academic department portals, and an automated inquiry processing pipeline.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop", // Web platform/Portal
    link: "https://sdms.edu.in/",
    isExternal: true,
    deliverables: [
      "Bespoke Responsive Web Architecture",
      "Admissions & Student Inquiry Management Portal",
      "Departmental Faculty & Coursework Catalogs",
      "SEO Optimization & Sub-Second Page Speeds"
    ],
    metrics: [
      { label: "Page Load Speed", value: "0.8s" },
      { label: "Inquiry Conversion", value: "+45%" },
      { label: "Mobile Traffic", value: "72%" }
    ],
    tags: ["Web Engineering", "Admissions Portal", "Cloud Hosting", "UI/UX"]
  },
  {
    id: "automotive-injection-moulding",
    title: "Automotive Precision Injection Mould & Die Tooling",
    client: "Tier-1 Automotive Component Manufacturer",
    category: "Precision Mould & Tooling",
    description: "High-cavity precision injection mould tooling engineered for automotive interior dash consoles and electrical housings.",
    longDescription: "MKRD Engineers designed and fabricated a 4-cavity hardened H13 steel injection mould with hot runner sequential valve gating. Delivered under strict GD&T tolerance of ±0.005mm with comprehensive mould flow cooling analysis.",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2062&auto=format&fit=crop", // Automotive / CNC
    deliverables: [
      "Comprehensive DFM & Rheological Mouldflow Analysis",
      "4-Cavity H13 Hardened Core/Cavity Tooling",
      "Integrated Synchronized Lifter/Slider Kinematics",
      "First-Shot T1 Quality Sign-Off & CMM Verification"
    ],
    metrics: [
      { label: "Machining Tolerance", value: "±0.005 mm" },
      { label: "Shot Life Guarantee", value: "1,200,000" },
      { label: "Cycle Time Reduction", value: "-18%" }
    ],
    tags: ["Injection Mould", "Automotive", "Mouldflow", "5-Axis CNC"]
  },
  {
    id: "aerospace-additive-prototyping",
    title: "Advanced Additive Prototyping for Drone Airframe",
    client: "Autonomous UAV Systems Laboratory",
    category: "3D Printing & Additive",
    description: "Carbon-fiber reinforced lightweight structural brackets and internal avionics ducts produced via additive fabrication.",
    longDescription: "Leveraging carbon-composite FDM and high-detail SLA photopolymers, MKRD rapid-prototyped aerodynamic structural mounts for high-altitude UAV airframes. Reduced overall part weight by 38% while maintaining rigid vibration resistance.",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=2139&auto=format&fit=crop", // Drone/UAV
    deliverables: [
      "Topology Optimization & Internal Lattice Design",
      "Continuous Carbon-Fiber Composite Printing",
      "Tensile & Thermal Deflection Stress Testing",
      "Delivered in 48-Hour Rapid Iteration Cycles"
    ],
    metrics: [
      { label: "Weight Reduction", value: "38%" },
      { label: "Print Turnaround", value: "36 Hours" },
      { label: "Tensile Strength", value: "185 MPa" }
    ],
    tags: ["3D Printing", "Carbon Fiber", "Topology Optimization", "Aerospace"]
  },
  {
    id: "industrial-iot-billing-microservices",
    title: "Smart Factory Billing & Microservice Engine",
    client: "Industrial Components Manufacturing Group",
    category: "Microservices & Software",
    description: "Cloud-native microservice architecture handling automated GST invoicing, real-time machine telemetry, and work orders.",
    longDescription: "Architected a decoupled microservices platform in Kubernetes connecting plant-floor PLC telemetry with enterprise billing, dispatch tracking, and financial reconciliation dashboards.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop", // Motherboard/Tech/IoT
    deliverables: [
      "Decoupled Dockerized Microservices Architecture",
      "Automated GST & E-Way Bill Integration",
      "Real-time Line Telemetry & Work Order Dispatch",
      "Role-Based Multi-Plant Access Management"
    ],
    metrics: [
      { label: "Invoice Processing Time", value: "Instant" },
      { label: "Monthly Uptime", value: "99.98%" },
      { label: "Plants Connected", value: "6 Facilities" }
    ],
    tags: ["Microservices", "Billing Software", "Docker/K8s", "IoT Telemetry"]
  }
];

export const MATERIALS_DB: MaterialSpec[] = [
  {
    id: "carbon-peek",
    name: "Carbon-Fiber PEEK",
    category: "High-Performance Thermoplastic",
    tensileStrength: "190 MPa",
    heatDeflection: "260°C",
    density: "1.38 g/cm³",
    color: "#1e293b",
    costTier: "$$$$",
    description: "Extreme chemical resistance, aerospace-grade strength-to-weight ratio, suitable for autoclave and engine bay components."
  },
  {
    id: "titanium-ti64",
    name: "Titanium Ti-6Al-4V (Grade 5)",
    category: "Direct Metal Laser Sintering (DMLS)",
    tensileStrength: "950 MPa",
    heatDeflection: "400°C+",
    density: "4.43 g/cm³",
    color: "#94a3b8",
    costTier: "$$$$",
    description: "Exceptional biocompatibility, structural rigidity, and corrosion resistance for aerospace and surgical implants."
  },
  {
    id: "polycarbonate-cf",
    name: "Polycarbonate Carbon Fiber (PC-CF)",
    category: "Engineering Composite",
    tensileStrength: "105 MPa",
    heatDeflection: "145°C",
    density: "1.22 g/cm³",
    color: "#0f172a",
    costTier: "$$$",
    description: "High impact resistance, dimensional stability, and matte aesthetic finish for functional housings and jigs."
  },
  {
    id: "tough-resin",
    name: "Engineering Tough 2000 Resin",
    category: "SLA Photopolymer",
    tensileStrength: "65 MPa",
    heatDeflection: "75°C",
    density: "1.15 g/cm³",
    color: "#0284c7",
    costTier: "$$",
    description: "Simulates ABS injection molded parts with high elongation at break; perfect for snap-fit enclosures and wear assemblies."
  },
  {
    id: "petg-industrial",
    name: "Industrial PETG+",
    category: "Standard Prototyping Polymer",
    tensileStrength: "50 MPa",
    heatDeflection: "72°C",
    density: "1.27 g/cm³",
    color: "#059669",
    costTier: "$",
    description: "Durable, water-resistant, odorless, and highly cost-effective for general enclosure prototypes and testing."
  }
];

export const MACHINERY_SPECS: MachineSpec[] = [
  {
    id: "vmc-5axis",
    name: "DMG MORI 5-Axis High-Speed VMC",
    type: "Subtractive CNC Milling",
    workEnvelope: "750 × 650 × 560 mm",
    tolerance: "±0.003 mm",
    keyCapability: "High-speed hardened tool steel machining up to 24,000 RPM spindle speed.",
    status: "ACTIVE"
  },
  {
    id: "fdm-industrial",
    name: "MKRD High-Temp Dual-Extrusion 3D Cell",
    type: "Additive FDM/FFF",
    workEnvelope: "450 × 450 × 500 mm",
    tolerance: "±0.05 mm",
    keyCapability: "Chamber heating to 90°C and nozzle to 450°C for continuous Carbon PEEK/Ultem.",
    status: "ACTIVE"
  },
  {
    id: "sla-precision",
    name: "Formlabs Form 4L Industrial Photopolymer",
    type: "Additive SLA / MSLA",
    workEnvelope: "335 × 200 × 300 mm",
    tolerance: "±0.025 mm",
    keyCapability: "Sub-pixel anti-aliasing with biocompatible and engineering resins.",
    status: "ONLINE"
  },
  {
    id: "cmm-inspection",
    name: "Zeiss Coordinate Measuring Machine (CMM)",
    type: "Metrology & Quality Assurance",
    workEnvelope: "1000 × 1200 × 800 mm",
    tolerance: "±0.001 mm (1 Micron)",
    keyCapability: "Automated 3D contact scanning, GD&T reporting, and reverse engineering point clouds.",
    status: "ONLINE"
  }
];

export const CLIENT_PARTNERS = [
  { name: "SDMS Educational Institutions", category: "Education & Virtual Twins" },
  { name: "Automotive Precision OEM", category: "Tier-1 Auto Moulding" },
  { name: "Precision Robotics Labs", category: "Industrial Automation" },
  { name: "AeroTech Dynamics", category: "Additive UAV Components" },
  { name: "InfraCloud Networks", category: "Enterprise Systems" }
];
