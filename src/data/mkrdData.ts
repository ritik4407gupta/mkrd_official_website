import { ServiceItem, ProjectCaseStudy, MaterialSpec, MachineSpec } from '../types';


// Project card visuals, generated from the real products and the real live
// sites rather than sourced as stock photography — see
// scripts/gen-project-visuals.py. The projects page previously used AI stock
// photos as placeholders for work that actually exists.
import pvSdmsSite from '../assets/projects/sdms-site.svg';
import pvSdmsTour from '../assets/projects/sdms-tour.svg';
import pvGstBilling from '../assets/projects/gst-billing.svg';
import pvWarehouse from '../assets/projects/warehouse.svg';
import pvTooling from '../assets/projects/tooling.svg';
import svPrinting from '../assets/projects/svc-printing.svg';
import svSoftware from '../assets/projects/svc-software.svg';
import svWeb from '../assets/projects/svc-web.svg';
import svTours from '../assets/projects/svc-tours.svg';
import svNetwork from '../assets/projects/svc-network.svg';

export const COMPANY_DETAILS = {
  name: "MKRD",
  legalName: "MKRD Engineers Pvt. Ltd.",
  shortName: "MKRD",
  descriptor: "Software, Web & 3D Printing",
  tagline: "Innovating Your Digital Tomorrow. Tailored Solutions.",
  address: "Gurugram, Haryana 122001, India",
  phone: "+91 9650020661",
  phoneFormatted: "+91 96500 20661",
  email: "mkrdengineers@gmail.com",
  secondaryEmail: "mkrdengineers@gmail.com",
  coordinates: {
    lat: "28.3619° N",
    long: "76.9366° E",
    locationName: "Gurugram, Haryana, India"
  },
  established: "2018",
  credential: "3D PRINTING · SOFTWARE · WEB & 360°",
  // GSTIN rather than CIN. Left blank until the real number is supplied —
  // everything that renders it hides the line when it is empty, and a GSTIN is
  // never something to guess at.
  gstin: "",
};

/**
 * The engineering side of the same company.
 *
 * MKRD is one entity. This site covers the software, web, 360° and 3D printing
 * work; the tooling practice — moulds, dies, sheet-metal tools, fixtures,
 * reverse engineering and flow analysis — has its own site at
 * mkrdengineers.com and is not this site's subject.
 *
 * It is named, linked and routed to, and deliberately not showcased at length
 * here: a visitor with a tooling enquiry should end up on the right page rather
 * than reading a simulation of work this site is not about.
 */
export const ENGINEERING_SIDE = {
  name: "MKRD Engineers",
  url: "https://www.mkrdengineers.com/",
  label: "Our engineering side",
  scope: [
    "Plastic injection mould design — 2-plate, 3-plate, hot runner, insert over-moulding, hand mould, double ejection stroke, auto-unscrewing",
    "Die-casting tool design — high pressure, low pressure, centre gating",
    "Sheet-metal tool design — progressive, part tooling, layout, trimming",
    "Jigs and fixtures — part holding, pulling, welding, and special-purpose machines",
    "Reverse engineering — 3D scanning, 2D↔3D conversion, product modification",
    "Mould flow analysis and assembly animation",
  ],
  ourPart:
    "The printing that goes with it — fit-check parts, moulding aids and fixture prototypes made here while a tool is still on the screen.",
};

export const SERVICES: ServiceItem[] = [
  {
    id: "3d-printing-prototyping",
    title: "3D Printing & Rapid Prototyping",
    category: "additive",
    owner: "mkrd",
    shortDesc:
      "Both processes in-house — wire (FDM) for functional parts and liquid (resin) for fine detail — with a material grade picked per job, usually same or next day.",
    fullDesc:
      "These are our own machines, not a broker's. Two processes sit side by side: wire for parts that have to work, liquid for parts that have to look right or carry features a nozzle cannot resolve. Which one runs, and which grade of material goes in it, is a decision we make against your part rather than a menu you pick from blind.",
    keyBenefits: [
      "Two processes, one enquiry. Wire (FDM) for functional parts and fixtures; liquid (resin) for fine detail, thin walls and surface finish.",
      "Material graded to the job, from an economical prototype grade up to carbon-filled nylon or tough resin where the part has to survive being used.",
      "Same or next day on small parts. Send an STL or a STEP file in the morning and the part usually exists that afternoon.",
      "No minimum order. One part is a normal job here — owning the machines is precisely what lets us take the jobs a bureau will not."
    ],
    process: [
      { step: "01", label: "File check & process choice", desc: "Mesh and solid validation, wall thickness, and a call on wire versus liquid — with a note back if the geometry will print badly as drawn." },
      { step: "02", label: "Orientation & slicing", desc: "Orientation for strength and finish, layer height, perimeters, infill and support strategy." },
      { step: "03", label: "Print", desc: "Wire on a heated bed at the material's own temperature profile, or liquid in the resin vat where detail is the point." },
      { step: "04", label: "Finish & check", desc: "Support removal, resin wash and UV cure where it applies, cleanup, and a dimensional check on the features that matter." }
    ],
    techStack: ["FDM / FFF — wire", "Resin — liquid", "STL · STEP · 3MF", "PLA+ · ABS · PETG · TPU · CF nylon", "Standard & tough resin"],
    image: svPrinting,
    stats: [
      { label: "Processes", value: "Wire + Liquid" },
      { label: "FDM Envelope", value: "245 × 245 × 270 mm" },
      { label: "Quoted Tolerance", value: "0.1 mm" }
    ]
  },
  {
    id: "custom-software-development",
    title: "Custom Software for Manufacturing",
    category: "digital",
    owner: "mkrd",
    shortDesc:
      "Desktop and web applications for businesses that make and move physical things — stock, stores, documents, compliance and the reporting around them.",
    fullDesc:
      "We build software the way a workshop needs it: it has to work when the internet does not, it has to survive a shop-floor machine, and the numbers have to reconcile. Two of our own products are in daily commercial use — GST Billing Suite and Warehouse Manager — and both are on this site to be opened and used, not watched in a video.",
    keyBenefits: [
      "Offline-first where it matters. A stores counter or a billing desk keeps working through a network outage and reconciles when the link returns.",
      "Money handled as integers. Our billing engine carries every amount in paise with half-up rounding, so a filed return matches the ledger to the rupee.",
      "LAN synchronisation between machines on the same site, without depending on a cloud account.",
      "Role-gated access with an audit trail on every movement, so a stores discrepancy has a name and a timestamp against it."
    ],
    process: [
      { step: "01", label: "Walk the process", desc: "Sit with the people doing the job now — the register, the spreadsheet, the workarounds — before any schema is drawn." },
      { step: "02", label: "Build in slices", desc: "The narrowest useful version first, in their hands, then widen it. No six-month reveal." },
      { step: "03", label: "Test against real data", desc: "Migrated from the existing spreadsheets and ledgers, so edge cases surface before cutover, not after." },
      { step: "04", label: "Cutover & support", desc: "Parallel running, staff training, signed installers, then ongoing fixes and changes." }
    ],
    techStack: ["Python / PyQt desktop", "React / TypeScript", "SQLite · PostgreSQL", "LAN sync", "Signed Windows & macOS installers"],
    image: svSoftware,
    stats: [
      { label: "Products Shipped", value: "2 in daily use" },
      { label: "Runs", value: "Offline-first" },
      { label: "Platforms", value: "Windows · macOS · Web" }
    ]
  },
  {
    id: "billing-invoicing-software",
    title: "GST Billing & Compliance",
    category: "digital",
    owner: "mkrd",
    shortDesc:
      "Our own GST billing product: invoices, quotations, proforma, delivery challans and purchase orders, with e-way bills and GSTR filing support built in.",
    fullDesc:
      "GST Billing Suite is a product we designed, built and licence. It decides CGST + SGST versus IGST automatically from the state codes in each party's GSTIN, generates GSTR-1 data, imports and reconciles GSTR-2B, and talks to the NIC e-way bill system to generate, cancel, extend and update consignments. You can open the real interface on our simulation page and issue a document in it.",
    keyBenefits: [
      "The tax decision is made for you. Intra-state and inter-state supply is determined from the GSTIN, not left to whoever is typing.",
      "Rounding that survives an audit. Amounts are held as integer paise and half-rate quantisation is applied before the split, so CGST + SGST always equals the total.",
      "E-way bills without a second portal. Generate, cancel, extend validity and update vehicle or transporter from inside the invoice.",
      "Your document numbering, not ours. Prefixes, financial-year tokens, custom fields and print templates are all configurable."
    ],
    process: [
      { step: "01", label: "Set up the workspace", desc: "Company details, GSTIN, document series, tax rates, HSN catalogue and print templates." },
      { step: "02", label: "Import what exists", desc: "Customers, products and opening balances brought across from spreadsheets or the previous system." },
      { step: "03", label: "Run in parallel", desc: "A month alongside the old process, with the returns compared line by line before cutover." },
      { step: "04", label: "File and reconcile", desc: "GSTR-1 generation, GSTR-2B import, purchase reconciliation, and support through the first filing cycles." }
    ],
    techStack: ["Python / PyQt", "SQLite", "NIC e-way bill API", "GSTR-1 / GSTR-2B", "Encrypted backup"],
    image: pvGstBilling,
    stats: [
      { label: "Document Types", value: "IN · QT · PI · DC · PO" },
      { label: "Tax Engine", value: "CGST / SGST / IGST" },
      { label: "Money Precision", value: "Integer paise" }
    ]
  },
  {
    id: "website-development-redesign",
    title: "Website Design & Development",
    category: "digital",
    owner: "mkrd",
    shortDesc:
      "Responsive, fast websites for institutions and manufacturers — built, not templated. sdms.edu.in is ours, and so is the site you are reading.",
    fullDesc:
      "We build the whole thing: information architecture, visual design, front-end engineering and launch. The work you can check is public — the SDMS institutional site at sdms.edu.in, the 360° campus tour beside it, and this site, whose 3D scenes are generated from real engineering geometry rather than dropped in as stock.",
    keyBenefits: [
      "Built for the connection your visitors actually have. Assets are compressed and code-split rather than shipped whole and hoped for.",
      "Content you can verify. We check the claims on a page against a source before it goes live — including yours.",
      "Designed on a real system. Colour, type and motion come from one token set, so the site stays consistent as it grows.",
      "Accessible by default. Keyboard navigation, visible focus, honest alt text and reduced-motion support are part of the build, not a later pass."
    ],
    process: [
      { step: "01", label: "Structure", desc: "What the site is for, who reads it, what each page has to do, and what has to be true on it." },
      { step: "02", label: "Design", desc: "Type pairing, colour tokens, layout system and motion language, applied across the whole site rather than page by page." },
      { step: "03", label: "Build", desc: "React and TypeScript, code-split routes, compressed assets, WebGL where it earns its place." },
      { step: "04", label: "Launch & keep", desc: "Deploy, analytics, and the ongoing changes a live site needs." }
    ],
    techStack: ["React · TypeScript", "Vite", "Tailwind CSS", "Three.js / WebGL", "Motion / GSAP"],
    image: svWeb,
    stats: [
      { label: "Public Work", value: "sdms.edu.in" },
      { label: "Approach", value: "Built, not templated" },
      { label: "Delivery", value: "Design → build → launch" }
    ]
  },
  {
    id: "360-virtual-tours",
    title: "360° Virtual Tours",
    category: "immersive",
    owner: "mkrd",
    shortDesc:
      "Interactive panoramic walkthroughs of campuses and facilities, navigable in a browser with no install — as delivered for SDMS.",
    fullDesc:
      "A prospective student, parent or client can move through your site node by node, read hotspots on the rooms and equipment, and orient themselves on a floorplan, from a phone on the other side of the country. Our SDMS campus tour is live at virtual-tour.sdms.edu.in and is the honest reference for what this looks like.",
    keyBenefits: [
      "Nothing to install. It opens in a browser tab on desktop and mobile.",
      "Navigable, not just watchable. Node-to-node movement with an interactive floorplan, rather than a video someone sits through.",
      "Hotspots carry the detail — equipment notes, department information, links and documents placed where they belong in the space.",
      "Touch panning and device orientation on mobile, so a phone works the way people expect it to."
    ],
    process: [
      { step: "01", label: "Walk the site", desc: "Route planning, node placement, and a lighting check on the spaces that will be hard." },
      { step: "02", label: "Panoramic capture", desc: "Full spherical capture at every node, bracketed where the lighting demands it." },
      { step: "03", label: "Stitch & retouch", desc: "Blending, colour matching between nodes, and zenith/nadir cleanup." },
      { step: "04", label: "Build & host", desc: "Navigation, floorplan, hotspot content, branding, and deployment on your own domain." }
    ],
    techStack: ["Spherical panoramic capture", "Three.js / WebGL", "Floorplan navigation", "Hotspot authoring", "Mobile gyroscope"],
    image: svTours,
    stats: [
      { label: "Live Example", value: "virtual-tour.sdms.edu.in" },
      { label: "Delivery", value: "Browser, no install" },
      { label: "Mobile", value: "Touch + gyroscope" }
    ]
  },
  {
    id: "reliable-network-solutions",
    title: "Network & On-Site Server Setup",
    category: "digital",
    owner: "mkrd",
    shortDesc:
      "Structured cabling, on-site servers and LAN setup for offices and small plants — the plumbing our own software runs on.",
    fullDesc:
      "Our stores and billing software synchronises over a local network and backs up to a machine in the building, so we set those up as a matter of course. If your site needs the network before it can have the software, we do that part too: cabling, switching, an on-site server, user accounts and a backup that someone has actually tested by restoring from it.",
    keyBenefits: [
      "A LAN your software can rely on, rather than one that mostly works.",
      "An on-site server for file sharing, application hosting and backup, so operations do not stop when the internet does.",
      "Backups that have been restored from at least once, in front of you.",
      "Segmented access, so a shop-floor terminal is not on the same footing as the accounts machine."
    ],
    process: [
      { step: "01", label: "Survey", desc: "Walk the building, map cable routes, check where the dead spots and the noise sources are." },
      { step: "02", label: "Design", desc: "Switch layout, cable plan, server sizing, address plan and access segmentation." },
      { step: "03", label: "Install", desc: "Cabling and termination, rack and switch setup, server build, accounts and shares." },
      { step: "04", label: "Hand over", desc: "Documented layout, tested restore, and someone on your side who knows how it works." }
    ],
    techStack: ["Structured cabling", "Managed switching", "Ubuntu server", "LAN sync", "Scheduled backup"],
    image: svNetwork,
    stats: [
      { label: "Scope", value: "Cable → switch → server" },
      { label: "Backup", value: "Tested by restoring" },
      { label: "Built For", value: "Offices & small plants" }
    ]
  },
  {
    id: "plastic-injection-mould",
    title: "Mould & Tooling Design",
    category: "engineering",
    owner: "parent",
    shortDesc:
      "Injection moulds, die-casting tools, sheet-metal tooling and production fixtures — MKRD's engineering side, at mkrdengineers.com, with the printing and prototyping done here.",
    fullDesc:
      "Tool design is MKRD's engineering side, and it has its own site at mkrdengineers.com — that is where the mould, die and fixture work lives, and where a tooling enquiry belongs. This site is the software, web and 3D printing half of the same company. What we do alongside the tooling is the printing: the fit-check parts, moulding aids and fixture prototypes that let a design be checked before steel is committed.",
    keyBenefits: [
      "One company, one enquiry. The tool design is handled by our engineering side; the printed prototypes are made here.",
      "Mould construction: two-plate, three-plate, hot runner, insert over-moulding, hand mould, double ejection stroke and auto-unscrewing.",
      "Plus die-casting and progressive sheet-metal tooling, jigs and fixtures, reverse engineering, and mould flow analysis.",
      "And the printed proof — fit-check parts, moulding aids and fixture mock-ups made while the tool is still on the screen."
    ],
    process: [
      { step: "01", label: "Enquiry", desc: "Send the part, a drawing or a model. We read it and say which side of the house it belongs to." },
      { step: "02", label: "Tool design", desc: "Feasibility, cavity and core layout, feed, cooling and ejection, with flow analysis run before steel is cut." },
      { step: "03", label: "Printed proof", desc: "Our part of it — fit-check components, moulding aids and fixture prototypes printed in-house while the tool is still on the screen." },
      { step: "04", label: "Handover", desc: "The tool package goes to you and your moulder. We stay on the prototyping side of it." }
    ],
    techStack: ["Injection mould design", "Die casting & sheet metal", "Jigs, fixtures & SPM", "Reverse engineering", "Mould flow analysis"],
    image: pvTooling,
    stats: [
      { label: "Detailed At", value: "mkrdengineers.com" },
      { label: "Printed", value: "In-house" },
      { label: "Since", value: "2018" }
    ]
  }
];

export const CASE_STUDIES: ProjectCaseStudy[] = [
  {
    id: "gst-billing-suite",
    title: "GST Billing Suite",
    client: "MKRD product — licensed to manufacturing and trading businesses",
    category: "Product Engineering — Desktop Software",
    description:
      "A full GST compliance and invoicing desktop application: documents, e-way bills, GSTR filing support and multi-site sync, running offline on Windows and macOS.",
    longDescription:
      "MKRD designed, built and ships GST Billing Suite as a licensed product. It issues invoices, quotations, proforma invoices, delivery challans and purchase orders; determines CGST+SGST versus IGST automatically from the state codes in each party's GSTIN; and carries all money as integer paise with half-up rounding so totals reconcile exactly against a filed return. It generates GSTR-1 data, imports and reconciles GSTR-2B, and talks to the NIC e-way bill system to generate, cancel, extend and update consignments. Workspaces, licensing, LAN synchronisation and encrypted backup are built in.",
    image: pvGstBilling,
    deliverables: [
      "Invoice, Quotation, Proforma, Delivery Challan and Purchase Order documents",
      "NIC e-way bill generate, cancel, extend validity and update vehicle/transporter",
      "GSTR-1 generation and GSTR-2B import with purchase reconciliation",
      "Configurable document numbering, custom fields and print templates",
      "Multi-workspace operation with LAN sync and encrypted cloud backup",
      "Signed installers for Windows and macOS"
    ],
    metrics: [
      { label: "Tax Engine", value: "CGST / SGST / IGST" },
      { label: "Money Precision", value: "Integer paise" },
      { label: "Platforms", value: "Windows + macOS" }
    ],
    tags: ["GST Compliance", "E-Way Bill", "Desktop Software", "Product"]
  },
  {
    id: "warehouse-manager",
    title: "Warehouse Manager",
    client: "MKRD product — deployed for inventory and stores operations",
    category: "Product Engineering — Desktop Software",
    description:
      "Stores and inventory control with RFID and barcode identification, employee and vendor ledgers, issue/return requests and multi-machine LAN synchronisation.",
    longDescription:
      "Warehouse Manager tracks stock through its whole working life: goods in, issue to an employee or a vendor, return, transfer and scrap. Items are identified by barcode or RFID tag, requests are raised and approved in the app, and every movement lands in a transaction ledger that can be exported or reported on. Access is role-gated, several machines on the same network stay in sync over LAN, and backups run on a schedule.",
    image: pvWarehouse,
    deliverables: [
      "Product master with categories, stock levels and low-stock alerts",
      "RFID tag administration and barcode scanning workflows",
      "Issue, return, transfer and scrap transactions against employees and vendors",
      "Request raising and approval with a full audit trail",
      "Role-gated access and multi-machine LAN synchronisation",
      "Reports, CSV export, PDF generation and scheduled backup"
    ],
    metrics: [
      { label: "Identification", value: "RFID + Barcode" },
      { label: "Sync", value: "Multi-machine LAN" },
      { label: "Access", value: "Role-gated" }
    ],
    tags: ["Inventory", "RFID", "Desktop Software", "Product"]
  },
  {
    id: "mould-tooling-programme",
    title: "Mould & Tooling Design — Group Capability",
    client: "Automotive, electrical and consumer OEMs",
    category: "MKRD Engineering — Mould & Tooling Design",
    description:
      "The tooling practice, covered in full at mkrdengineers.com. It is listed here because that is where a tooling enquiry belongs, and because we print the prototypes alongside it.",
    longDescription:
      "MKRD's engineering side designs injection moulds — two-plate and three-plate, hot runner, insert over-moulding, hand moulds, double-ejection-stroke and auto-unscrewing constructions — along with high-pressure, low-pressure and centre-gated die-casting tools, progressive and trimming sheet-metal tooling, and the jigs, fixtures and special-purpose machines around them. Mould flow analysis is run before steel is committed. This site covers the other half of the same company — software, web, 360° and 3D printing — so what belongs here is the printing that goes with the tooling: fit-check parts, moulding aids and fixture prototypes made in-house while a tool is still on the screen.",
    image: pvTooling,
    deliverables: [
      "2-plate, 3-plate, hot-runner, insert over-moulding and auto-unscrewing mould design",
      "Die-casting tool design — high pressure, low pressure and centre gating",
      "Progressive and trimming sheet-metal tooling",
      "Part-holding, pulling and welding fixtures, and SPM design",
      "Mould flow analysis and assembly animation",
      "Reverse engineering — 3D scanning, 2D↔3D conversion, product modification"
    ],
    metrics: [
      { label: "Detailed At", value: "mkrdengineers.com" },
      { label: "Printed By", value: "MKRD Engineers" },
      { label: "Tool Types", value: "Mould · Die · Sheet-Metal" }
    ],
    tags: ["Mould & Tooling", "Injection Mould", "Die Casting", "Prototyping"]
  },
  {
    id: "sdms-virtual-tour",
    title: "SDMS 360° Virtual Campus Tour",
    client: "SDMS Educational Institutions",
    category: "360° Virtual Tours & Digital Twins",
    description:
      "An interactive 360° walkthrough of the SDMS campus — labs, halls and facilities — that a prospective student can explore from a browser.",
    longDescription:
      "MKRD captured and built an interactive panoramic tour of the SDMS campus, letting prospective students, parents and visitors move through the site from node to node with map navigation and information hotspots. It runs in the browser with no install, and supports touch panning and device orientation on mobile.",
    image: pvSdmsTour,
    link: "https://virtual-tour.sdms.edu.in/",
    isExternal: true,
    deliverables: [
      "360° panoramic capture across campus interiors and exteriors",
      "Node-to-node navigation with an interactive floorplan",
      "Information hotspots on facilities and laboratory equipment",
      "Touch panning and gyroscope support on mobile",
      "Hosted at virtual-tour.sdms.edu.in"
    ],
    metrics: [
      { label: "Delivery", value: "Browser, no install" },
      { label: "Navigation", value: "Map + hotspots" },
      { label: "Mobile", value: "Touch + gyroscope" }
    ],
    tags: ["360° Tour", "Digital Twin", "Education", "WebGL"]
  },
  {
    id: "sdms-institutional-portal",
    title: "SDMS Institutional Website",
    client: "SDMS Educational Institutions",
    category: "Web Engineering",
    description:
      "The public website for SDMS Educational Institutions — departments, courses, admissions enquiry and news — live at sdms.edu.in.",
    longDescription:
      "MKRD built and delivered the SDMS institutional website: a responsive public site covering academic departments and coursework, admissions and enquiry handling, news and announcements, and the institution's public-facing information.",
    image: pvSdmsSite,
    link: "https://sdms.edu.in/",
    isExternal: true,
    deliverables: [
      "Responsive site architecture and page templates",
      "Department and coursework catalogues",
      "Admissions and enquiry handling",
      "News and announcements",
      "Live at sdms.edu.in"
    ],
    metrics: [
      { label: "Status", value: "Live" },
      { label: "Scope", value: "Full public site" },
      { label: "Build", value: "Responsive web" }
    ],
    tags: ["Web Engineering", "Education", "Admissions", "Responsive"]
  }
];

/**
 * The material list.
 *
 * Two processes run here — wire (FDM) and liquid (resin) — and the shop stocks
 * a ladder of grades within each, because the right answer for a presentation
 * model is not the right answer for a fixture that has to hold shape warm. What
 * gets loaded is a per-job decision, so `costTier` is doing real work in this
 * table rather than decorating it.
 */
export const MATERIALS_DB: MaterialSpec[] = [
  {
    id: "pla-plus",
    name: "PLA+ (Engineering Grade)",
    category: "FDM Thermoplastic",
    tensileStrength: "≈ 60 MPa",
    heatDeflection: "≈ 60 °C",
    density: "1.24 g/cm³",
    color: "#7C71FF",
    costTier: "$",
    description:
      "Highest detail and dimensional stability of the wire materials. First choice for form and fit checks, presentation models and low-load fixtures."
  },
  {
    id: "abs",
    name: "ABS",
    category: "FDM Thermoplastic",
    tensileStrength: "≈ 40 MPa",
    heatDeflection: "≈ 98 °C",
    density: "1.04 g/cm³",
    color: "#8B7DFF",
    costTier: "$",
    description:
      "Tougher and more heat-tolerant than PLA, and it can be vapour-smoothed. Used where a prototype has to approximate a moulded ABS part."
  },
  {
    id: "petg",
    name: "PETG",
    category: "FDM Thermoplastic",
    tensileStrength: "≈ 50 MPa",
    heatDeflection: "≈ 70 °C",
    density: "1.27 g/cm³",
    color: "#A79CFF",
    costTier: "$",
    description:
      "Impact resistant, low-warp and chemically stable. The default for shop-floor jigs, guards and parts that see handling."
  },
  {
    id: "tpu",
    name: "TPU (Flexible)",
    category: "FDM Elastomer",
    tensileStrength: "≈ 30 MPa",
    heatDeflection: "—",
    density: "1.21 g/cm³",
    color: "#5B4DF5",
    costTier: "$$",
    description:
      "Shore-A flexible. Gaskets, soft-touch grips, protective bumpers and over-mould studies before a two-shot tool is committed."
  },
  {
    id: "nylon-cf",
    name: "Carbon-Filled Nylon",
    category: "FDM Composite",
    tensileStrength: "≈ 70 MPa",
    heatDeflection: "≈ 140 °C",
    density: "1.18 g/cm³",
    color: "#241BB4",
    costTier: "$$$",
    description:
      "Stiff, dimensionally stable and heat tolerant. Reserved for load-bearing fixtures and parts that have to hold tolerance warm."
  },
  {
    id: "standard-resin",
    name: "Standard Resin",
    category: "Resin Photopolymer",
    tensileStrength: "≈ 50 MPa",
    heatDeflection: "≈ 60 °C",
    density: "1.18 g/cm³",
    color: "#C2BBFF",
    costTier: "$$",
    description:
      "The liquid process, for anything where surface finish and fine detail matter more than toughness — appearance models, small assemblies, thin features a nozzle cannot resolve."
  },
  {
    id: "tough-resin",
    name: "Tough / ABS-Like Resin",
    category: "Resin Photopolymer",
    tensileStrength: "≈ 55 MPa",
    heatDeflection: "≈ 75 °C",
    density: "1.15 g/cm³",
    color: "#AEB4DE",
    costTier: "$$$",
    description:
      "Resin detail with enough impact resistance to be handled and assembled. Snap fits, clips and functional appearance parts."
  }
];

/**
 * The equipment behind THIS site. Mould flow analysis, CAD tool design and
 * reverse engineering were on this list; they belong to MKRD's engineering side
 * and are covered at mkrdengineers.com, so they have been moved out rather than
 * padding the machinery list of a site about printing and software.
 */
export const MACHINERY_SPECS: MachineSpec[] = [
  {
    id: "fdm-printer",
    name: "FDM / FFF 3D Printer",
    type: "Additive — wire (filament)",
    workEnvelope: "245 × 245 × 270 mm",
    tolerance: "0.1 mm",
    keyCapability:
      "Functional prototypes, fit-check parts, jigs and moulding aids in PLA+, ABS, PETG, TPU and carbon-filled nylon, typically same or next day.",
    status: "ONLINE"
  },
  {
    id: "resin-printer",
    name: "Resin 3D Printer",
    type: "Additive — liquid (photopolymer)",
    workEnvelope: "Bench-format resin vat",
    tolerance: "Fine-feature detail",
    keyCapability:
      "Surface finish and small features a 0.4 mm nozzle cannot resolve — appearance models, thin walls, fine text and small assemblies.",
    status: "ONLINE"
  },
  {
    id: "post-processing",
    name: "Finishing & Post-Processing",
    type: "Support removal · wash · cure · finish",
    workEnvelope: "Both processes",
    tolerance: "Per drawing on the features that matter",
    keyCapability:
      "Support removal, resin wash and UV cure, cleanup, and a dimensional check against the drawing before anything leaves.",
    status: "ACTIVE"
  },
  {
    id: "software-workstations",
    name: "Software & Web Development",
    type: "Product engineering",
    workEnvelope: "Desktop · web · 360°",
    tolerance: "—",
    keyCapability:
      "GST Billing Suite and Warehouse Manager are built and shipped here, along with client web platforms and 360° tours.",
    status: "ACTIVE"
  }
];

export const CLIENT_PARTNERS = [
  { name: "UNO Minda", category: "Automotive Components" },
  { name: "UNO Minda Lighting", category: "Automotive Lighting" },
  { name: "UNO Minderika", category: "Automotive Systems" },
  { name: "Panasonic India", category: "Consumer Electronics" },
  { name: "Schneider Electric India", category: "Electrical & Automation" },
  { name: "L&T Electrical & Automation", category: "Electrical & Automation" },
  { name: "PG Electroplast", category: "Contract Manufacturing" },
  { name: "Shankar Moulding", category: "Plastic Moulding" },
  { name: "ALP Overseas", category: "Industrial Manufacturing" },
  { name: "Paramjyoti Movers", category: "Logistics & Handling" },
  { name: "SDMS Educational Institutions", category: "Education — Web & 360° Tour" }
];
