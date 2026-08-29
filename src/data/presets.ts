import { TaxonomySchema, FileItem } from '../types';

export const DEFAULT_TAXONOMIES: TaxonomySchema[] = [
  {
    id: 'finance-tax',
    name: 'Finance & Accounts Payable',
    description: 'Automated invoice processing, expense receipts, tax forms, purchase orders, and audit statements.',
    industry: 'Financial Services',
    version: '2.4.0',
    defaultThreshold: 0.75,
    strictMode: true,
    enableSecondaryClassification: true,
    systemInstructions: 'Analyze financial records with strict accuracy on amounts, vendor entities, due dates, currency, and tax IDs.',
    categories: [
      {
        id: 'cat-inv',
        name: 'Vendor Invoice',
        code: 'INV',
        description: 'Bills and payment requests issued by external suppliers and vendors for products or services delivered.',
        color: '#6366f1', // Indigo
        iconName: 'Receipt',
        keywords: ['invoice', 'bill to', 'remittance', 'total due', 'due date', 'tax id', 'line items', 'iban'],
        confidenceThreshold: 0.8,
        priority: 'high',
        requiredFields: [
          { id: 'f-1', name: 'Invoice Number', key: 'invoice_number', type: 'string', description: 'Unique identifier of the invoice', required: true },
          { id: 'f-2', name: 'Vendor Name', key: 'vendor_name', type: 'string', description: 'Name of the issuing vendor company', required: true },
          { id: 'f-3', name: 'Total Amount', key: 'total_amount', type: 'number', description: 'Total payable amount including taxes', required: true },
          { id: 'f-4', name: 'Due Date', key: 'due_date', type: 'date', description: 'Payment expiration date', required: true },
          { id: 'f-5', name: 'Currency', key: 'currency', type: 'string', description: 'ISO Currency code e.g. USD, EUR', required: true },
        ],
        exclusionRules: 'Do not categorize internal expense reimbursements or blank receipts as vendor invoices.',
      },
      {
        id: 'cat-po',
        name: 'Purchase Order',
        code: 'PO',
        description: 'Official commercial authorization document issued by a buyer committing to pay the seller for specified items.',
        color: '#06b6d4', // Cyan
        iconName: 'ShoppingCart',
        keywords: ['purchase order', 'po number', 'vendor confirmation', 'requisition', 'shipping terms', 'net 30'],
        confidenceThreshold: 0.75,
        priority: 'medium',
        requiredFields: [
          { id: 'f-6', name: 'PO Number', key: 'po_number', type: 'string', description: 'Purchase order reference identifier', required: true },
          { id: 'f-7', name: 'Requester', key: 'requester', type: 'string', description: 'Department or person requesting purchase', required: true },
          { id: 'f-8', name: 'Authorized Total', key: 'authorized_total', type: 'number', description: 'Approved budget cap', required: true },
        ],
      },
      {
        id: 'cat-rcpt',
        name: 'Expense Receipt',
        code: 'RCPT',
        description: 'Proof of transaction or payment for employee travel, meals, subscriptions, or incidental out-of-pocket expenses.',
        color: '#10b981', // Emerald
        iconName: 'Tag',
        keywords: ['receipt', 'pos terminal', 'paid card', 'cashier', 'subtotal', 'gratuity', 'store #'],
        confidenceThreshold: 0.7,
        priority: 'low',
        requiredFields: [
          { id: 'f-9', name: 'Merchant Name', key: 'merchant_name', type: 'string', description: 'Store or service provider name', required: true },
          { id: 'f-10', name: 'Transaction Date', key: 'transaction_date', type: 'date', description: 'Date expense occurred', required: true },
          { id: 'f-11', name: 'Amount Paid', key: 'amount_paid', type: 'number', description: 'Final charged amount', required: true },
          { id: 'f-12', name: 'Expense Category', key: 'expense_category', type: 'string', description: 'Meals, Travel, Software, Lodging', required: false },
        ],
      },
      {
        id: 'cat-tax',
        name: 'Tax & Compliance Form',
        code: 'TAX',
        description: 'Official tax filings, W-9, W-8BEN, 1099, VAT reports, regulatory withholding forms, and audit certifications.',
        color: '#f59e0b', // Amber
        iconName: 'ShieldAlert',
        keywords: ['w-9', 'w-8ben', 'irs', 'taxpayer identification', 'withholding', 'vat return', 'form 1099'],
        confidenceThreshold: 0.85,
        priority: 'critical',
        requiredFields: [
          { id: 'f-13', name: 'Form Type', key: 'form_type', type: 'string', description: 'Official tax code e.g. W-9, 1099-NEC', required: true },
          { id: 'f-14', name: 'Tax Entity Name', key: 'tax_entity_name', type: 'string', description: 'Legal entity or individual named', required: true },
          { id: 'f-15', name: 'Tax Identification Number', key: 'tin_masked', type: 'string', description: 'Masked EIN or SSN', required: true },
        ],
      },
      {
        id: 'cat-stmt',
        name: 'Bank & Treasury Statement',
        code: 'STMT',
        description: 'Monthly ledger statements, reconciliations, account balance certificates, and wire confirmations.',
        color: '#8b5cf6', // Violet
        iconName: 'Landmark',
        keywords: ['account statement', 'opening balance', 'closing balance', 'debits', 'credits', 'iban', 'swift code'],
        confidenceThreshold: 0.8,
        priority: 'medium',
        requiredFields: [
          { id: 'f-16', name: 'Bank Name', key: 'bank_name', type: 'string', description: 'Financial institution name', required: true },
          { id: 'f-17', name: 'Statement Period', key: 'statement_period', type: 'string', description: 'Billing cycle range', required: true },
          { id: 'f-18', name: 'Ending Balance', key: 'ending_balance', type: 'number', description: 'Closing ledger balance', required: true },
        ],
      }
    ]
  },
  {
    id: 'legal-tax',
    name: 'Legal & Contract Intelligence',
    description: 'Master service agreements, non-disclosure agreements, IP assignments, regulatory filings, and amendments.',
    industry: 'Legal & Corporate Governance',
    version: '1.8.0',
    defaultThreshold: 0.8,
    strictMode: true,
    enableSecondaryClassification: true,
    systemInstructions: 'Classify contracts and highlight governing laws, liability caps, termination clauses, and non-standard risk riders.',
    categories: [
      {
        id: 'cat-nda',
        name: 'Non-Disclosure Agreement',
        code: 'NDA',
        description: 'Confidentiality contracts governing mutual or unilateral proprietary information exchange.',
        color: '#ec4899', // Pink
        iconName: 'Lock',
        keywords: ['non-disclosure', 'confidentiality agreement', 'disclosing party', 'receiving party', 'trade secrets', 'term of confidentiality'],
        confidenceThreshold: 0.85,
        priority: 'medium',
        requiredFields: [
          { id: 'l-1', name: 'Parties Involved', key: 'parties', type: 'array', description: 'Names of agreeing entities', required: true },
          { id: 'l-2', name: 'Agreement Type', key: 'nda_type', type: 'string', description: 'Mutual vs Unilateral', required: true },
          { id: 'l-3', name: 'Effective Date', key: 'effective_date', type: 'date', description: 'Start date of NDA', required: true },
          { id: 'l-4', name: 'Term Duration', key: 'term_duration_years', type: 'number', description: 'Duration in years', required: true }
        ]
      },
      {
        id: 'cat-msa',
        name: 'Master Services Agreement',
        code: 'MSA',
        description: 'Overarching framework governing service engagements, deliverables, indemnification, and liability caps.',
        color: '#3b82f6', // Blue
        iconName: 'FileSignature',
        keywords: ['master services agreement', 'msa', 'statement of work', 'indemnification', 'limitation of liability', 'warranties'],
        confidenceThreshold: 0.8,
        priority: 'critical',
        requiredFields: [
          { id: 'l-5', name: 'Client Name', key: 'client_name', type: 'string', description: 'Customer company name', required: true },
          { id: 'l-6', name: 'Provider Name', key: 'provider_name', type: 'string', description: 'Service provider company name', required: true },
          { id: 'l-7', name: 'Liability Cap', key: 'liability_cap', type: 'string', description: 'Cap amount e.g. 12 months fees', required: true },
          { id: 'l-8', name: 'Governing Law', key: 'governing_law', type: 'string', description: 'Jurisdiction state/country', required: true }
        ]
      },
      {
        id: 'cat-sow',
        name: 'Statement of Work',
        code: 'SOW',
        description: 'Specific project schedules, milestone deliverables, acceptance criteria, and project billing schedules.',
        color: '#14b8a6', // Teal
        iconName: 'CheckSquare',
        keywords: ['statement of work', 'sow', 'deliverables', 'milestone', 'acceptance criteria', 'hourly rate', 'scope of services'],
        confidenceThreshold: 0.78,
        priority: 'medium',
        requiredFields: [
          { id: 'l-9', name: 'Project Title', key: 'project_title', type: 'string', description: 'Name of the engagement', required: true },
          { id: 'l-10', name: 'Total Budget', key: 'project_budget', type: 'number', description: 'Fixed fee or capped amount', required: true },
          { id: 'l-11', name: 'Delivery Deadline', key: 'delivery_deadline', type: 'date', description: 'Final milestone date', required: true }
        ]
      },
      {
        id: 'cat-policy',
        name: 'Corporate Privacy & Terms Policy',
        code: 'POL',
        description: 'Data protection policies, GDPR notices, user terms of service, and cookie consent disclosures.',
        color: '#f97316', // Orange
        iconName: 'Shield',
        keywords: ['privacy policy', 'terms of service', 'gdpr', 'data controller', 'personal data', 'cookies', 'opt-out'],
        confidenceThreshold: 0.8,
        priority: 'high',
        requiredFields: [
          { id: 'l-12', name: 'Policy Version', key: 'policy_version', type: 'string', description: 'Version or revision date', required: true },
          { id: 'l-13', name: 'Data Protection Officer Contact', key: 'dpo_contact', type: 'string', description: 'Email/address of DPO', required: false }
        ]
      }
    ]
  },
  {
    id: 'hr-talent',
    name: 'HR & Talent Acquisition',
    description: 'Resumes, employment offer letters, candidate interview evaluations, performance reviews, and certificates.',
    industry: 'Human Resources',
    version: '1.4.0',
    defaultThreshold: 0.72,
    strictMode: false,
    enableSecondaryClassification: true,
    categories: [
      {
        id: 'cat-resume',
        name: 'Candidate Resume / CV',
        code: 'CV',
        description: 'Curriculum vitae detailing candidate work history, education, skills, certifications, and portfolio.',
        color: '#38bdf8',
        iconName: 'UserCheck',
        keywords: ['curriculum vitae', 'experience', 'education', 'skills', 'github', 'bachelor', 'master', 'employment history'],
        confidenceThreshold: 0.8,
        priority: 'medium',
        requiredFields: [
          { id: 'h-1', name: 'Candidate Name', key: 'candidate_name', type: 'string', description: 'Full name of applicant', required: true },
          { id: 'h-2', name: 'Email Address', key: 'candidate_email', type: 'string', description: 'Contact email', required: true },
          { id: 'h-3', name: 'Primary Role / Title', key: 'primary_role', type: 'string', description: 'Target job title', required: true },
          { id: 'h-4', name: 'Years of Experience', key: 'years_experience', type: 'number', description: 'Total relevant years', required: true },
          { id: 'h-5', name: 'Top Technical Skills', key: 'skills_list', type: 'array', description: 'Key tools and languages', required: true }
        ]
      },
      {
        id: 'cat-offer',
        name: 'Employment Offer Letter',
        code: 'OFFER',
        description: 'Formal job offer stating base salary, equity compensation, start date, benefits, and reporting manager.',
        color: '#10b981',
        iconName: 'Briefcase',
        keywords: ['offer of employment', 'base salary', 'equity grant', 'start date', 'reporting to', 'at-will employment', 'benefits package'],
        confidenceThreshold: 0.85,
        priority: 'high',
        requiredFields: [
          { id: 'h-6', name: 'Offered Title', key: 'offered_title', type: 'string', description: 'Job position offered', required: true },
          { id: 'h-7', name: 'Annual Salary', key: 'annual_salary', type: 'number', description: 'Base compensation', required: true },
          { id: 'h-8', name: 'Start Date', key: 'start_date', type: 'date', description: 'First day of employment', required: true }
        ]
      },
      {
        id: 'cat-review',
        name: 'Performance Review',
        code: 'REV',
        description: 'Quarterly or annual employee performance feedback, OKR evaluations, and manager assessments.',
        color: '#a855f7',
        iconName: 'Award',
        keywords: ['performance appraisal', 'okr attainment', 'strengths', 'areas for growth', 'overall rating', 'competency review'],
        confidenceThreshold: 0.75,
        priority: 'medium',
        requiredFields: [
          { id: 'h-9', name: 'Employee Name', key: 'employee_name', type: 'string', description: 'Name of reviewed person', required: true },
          { id: 'h-10', name: 'Review Period', key: 'review_period', type: 'string', description: 'e.g. Q3 2025 or 2025 Annual', required: true },
          { id: 'h-11', name: 'Overall Rating', key: 'overall_rating', type: 'string', description: 'Exceeds / Meets / Below', required: true }
        ]
      }
    ]
  },
  {
    id: 'it-support',
    name: 'IT Support & Security Incident',
    description: 'System audit logs, incident triage reports, user access requests, hardware provisioning tickets, and CVE alerts.',
    industry: 'Information Technology',
    version: '1.2.0',
    defaultThreshold: 0.78,
    strictMode: true,
    enableSecondaryClassification: true,
    categories: [
      {
        id: 'cat-sec-inc',
        name: 'Security Incident Alert',
        code: 'SEC',
        description: 'Critical alerts regarding unauthorized access, phishing campaigns, malware detection, or vulnerability exploits.',
        color: '#ef4444',
        iconName: 'AlertTriangle',
        keywords: ['cve-', 'malware', 'unauthorized login', 'brute force', 'phishing attempt', 'firewall drop', 'ioc indicator'],
        confidenceThreshold: 0.85,
        priority: 'critical',
        requiredFields: [
          { id: 'it-1', name: 'Incident Severity', key: 'severity_level', type: 'string', description: 'P1-Critical to P4-Low', required: true },
          { id: 'it-2', name: 'Affected Host/IP', key: 'affected_host', type: 'string', description: 'Target endpoint or server', required: true },
          { id: 'it-3', name: 'Threat Actor/Vector', key: 'threat_vector', type: 'string', description: 'Attack vector classification', required: false }
        ]
      },
      {
        id: 'cat-access-req',
        name: 'User Access & Privilege Request',
        code: 'IAM',
        description: 'Identity management tickets requesting database, cloud IAM, VPN, or SSO application role permissions.',
        color: '#3b82f6',
        iconName: 'Key',
        keywords: ['iam role', 'access request', 'vpn permission', 'admin privilege', 'okta group', 'single sign-on'],
        confidenceThreshold: 0.8,
        priority: 'medium',
        requiredFields: [
          { id: 'it-4', name: 'User Identity', key: 'user_identity', type: 'string', description: 'Requesting username or email', required: true },
          { id: 'it-5', name: 'Target Resource', key: 'target_resource', type: 'string', description: 'AWS, Prod DB, Salesforce', required: true },
          { id: 'it-6', name: 'Approval Status', key: 'approval_status', type: 'string', description: 'Approved / Pending Manager', required: true }
        ]
      },
      {
        id: 'cat-sys-log',
        name: 'Server & Application Telemetry Log',
        code: 'LOG',
        description: 'Nginx, Kubernetes, container syslog dumps, stacktraces, and 500 error tracebacks.',
        color: '#64748b',
        iconName: 'Terminal',
        keywords: ['traceback', 'exception in thread', 'stack trace', 'fatal error', 'http 500', 'stdout', 'panic'],
        confidenceThreshold: 0.75,
        priority: 'low',
        requiredFields: [
          { id: 'it-7', name: 'Service Name', key: 'service_name', type: 'string', description: 'Originating microservice', required: true },
          { id: 'it-8', name: 'Error Code', key: 'error_code', type: 'string', description: 'HTTP 502, NullPointer, etc', required: true }
        ]
      }
    ]
  }
];

export const INITIAL_SAMPLE_FILES: FileItem[] = [
  {
    id: 'file-001',
    name: 'Acme_Corp_Cloud_Compute_Invoice_INV-8842.pdf',
    size: 245800,
    type: 'application/pdf',
    uploadedAt: '2026-08-28T18:32:00Z',
    contentSnippet: 'ACME CLOUD SOLUTIONS INC. \nINVOICE #INV-8842 \nBill To: Global Tech Enterprise Corp \nIssue Date: 2026-08-15 \nDue Date: 2026-09-14 \nDescription: Monthly Enterprise Kubernetes Cluster & Object Storage (US-East-1) \nSubtotal: $14,250.00 \nTax (8.25%): $1,175.63 \nTOTAL DUE: $15,425.63 USD \nPayment Terms: Net 30. Wire Transfer to Silicon Valley Bank IBAN US89SVB00293849102.',
    status: 'classified',
    tags: ['Cloud Hosting', 'Approved Vendor', 'Q3 Expenditure'],
    source: 'sample',
    result: {
      categoryId: 'cat-inv',
      categoryName: 'Vendor Invoice',
      confidence: 98.4,
      secondaryMatches: [
        { categoryName: 'Purchase Order', confidence: 24.1, reason: 'Contains itemized compute items and Net 30 terms.' }
      ],
      summary: 'Monthly cloud infrastructure invoice from Acme Cloud Solutions for Kubernetes cluster and storage amounting to $15,425.63 due on Sept 14, 2026.',
      keyEntities: [
        { name: 'Acme Cloud Solutions Inc.', type: 'Vendor' },
        { name: 'Global Tech Enterprise Corp', type: 'Client' },
        { name: '$15,425.63 USD', type: 'Currency / Total' },
        { name: 'Silicon Valley Bank', type: 'Financial Institution' }
      ],
      extractedFields: {
        invoice_number: 'INV-8842',
        vendor_name: 'Acme Cloud Solutions Inc.',
        total_amount: 15425.63,
        due_date: '2026-09-14',
        currency: 'USD',
        line_items_count: 2,
        payment_terms: 'Net 30'
      },
      riskScore: 2,
      urgency: 'high',
      suggestedAction: 'Route to Accounts Payable queue for automated match against PO-2026-0881.',
      reasoning: [
        'Direct presence of "INVOICE #INV-8842", line items with pricing, and Net 30 payment instructions.',
        'Total payable amount clearly specified with tax calculation.',
        'Valid vendor company header with wire details.'
      ],
      clusterCoordinates: { x: -68.4, y: 42.1 },
      processingTimeMs: 412,
      modelUsed: 'gemini-3.7-flash'
    }
  },
  {
    id: 'file-002',
    name: 'Hardware_Procurement_Authorization_PO-9912.pdf',
    size: 182400,
    type: 'application/pdf',
    uploadedAt: '2026-08-28T19:10:00Z',
    contentSnippet: 'OFFICIAL PURCHASE ORDER \nPO NUMBER: PO-9912 \nRequester: IT Infrastructure Dept (David Chen) \nAuthorized Total: $48,500.00 USD \nVendor: Dell Technologies Direct \nItems: 25x Dell Precision 5690 Workstations, 32GB RAM, 1TB SSD \nDelivery Deadline: 2026-09-30 \nApproved by: CFO Office / Capital Equipment Budget 2026',
    status: 'classified',
    tags: ['Hardware', 'IT Asset', 'Capex'],
    source: 'sample',
    result: {
      categoryId: 'cat-po',
      categoryName: 'Purchase Order',
      confidence: 96.8,
      secondaryMatches: [
        { categoryName: 'Vendor Invoice', confidence: 18.5, reason: 'Includes itemized dollar values and Dell hardware specs.' }
      ],
      summary: 'Purchase order authorizing $48,500 for 25 developer workstations from Dell Technologies, approved by CFO Office.',
      keyEntities: [
        { name: 'Dell Technologies Direct', type: 'Vendor' },
        { name: 'David Chen', type: 'Requester' },
        { name: '$48,500.00 USD', type: 'Authorized Cap' }
      ],
      extractedFields: {
        po_number: 'PO-9912',
        requester: 'David Chen (IT Infrastructure)',
        authorized_total: 48500.00,
        delivery_deadline: '2026-09-30',
        approved_by: 'CFO Office'
      },
      riskScore: 3,
      urgency: 'medium',
      suggestedAction: 'Send procurement authorization to Dell Sales Rep and log inventory tracking ticket.',
      reasoning: [
        'Document title is explicitly "OFFICIAL PURCHASE ORDER" with "PO NUMBER: PO-9912".',
        'Includes budget authorization, itemized unit quantities, and delivery timeframe.'
      ],
      clusterCoordinates: { x: -44.2, y: 65.7 },
      processingTimeMs: 388,
      modelUsed: 'gemini-3.7-flash'
    }
  },
  {
    id: 'file-003',
    name: 'Uber_Executive_Travel_Receipt_SF_Meeting.jpg',
    size: 112000,
    type: 'image/jpeg',
    uploadedAt: '2026-08-28T19:45:00Z',
    contentSnippet: 'Uber Technologies, Inc. \nTrip Date: Aug 27, 2026 8:45 PM \nRider: Sarah Jenkins \nPickup: SFO International Airport Terminal 2 \nDropoff: Hyatt Regency San Francisco \nTrip Fare: $54.20 \nTip: $10.00 \nTolls: $7.00 \nTOTAL CHARGED: $71.20 USD \nPayment Method: Visa ending in 4921',
    status: 'classified',
    tags: ['Travel', 'Rideshare', 'Executive'],
    source: 'sample',
    result: {
      categoryId: 'cat-rcpt',
      categoryName: 'Expense Receipt',
      confidence: 99.1,
      secondaryMatches: [],
      summary: 'Uber rideshare receipt for executive Sarah Jenkins from SFO airport to Hyatt Regency totaling $71.20.',
      keyEntities: [
        { name: 'Uber Technologies, Inc.', type: 'Merchant' },
        { name: 'Sarah Jenkins', type: 'Rider / Employee' },
        { name: '$71.20 USD', type: 'Total Charged' },
        { name: 'SFO Airport', type: 'Location' }
      ],
      extractedFields: {
        merchant_name: 'Uber Technologies, Inc.',
        transaction_date: '2026-08-27',
        amount_paid: 71.20,
        expense_category: 'Travel & Ground Transportation',
        payment_method: 'Corporate Visa ****4921'
      },
      riskScore: 1,
      urgency: 'low',
      suggestedAction: 'Auto-approve and export to Expensify / Concur reimbursement ledger.',
      reasoning: [
        'Single transaction receipt from Uber showing origin, destination, tip, and credit card charge.',
        'Low amount below $100 threshold with valid corporate card.'
      ],
      clusterCoordinates: { x: 35.8, y: 72.4 },
      processingTimeMs: 295,
      modelUsed: 'gemini-3.7-flash'
    }
  },
  {
    id: 'file-004',
    name: 'Form_W9_Federal_Tax_Certification_Apex_Consulting.pdf',
    size: 310500,
    type: 'application/pdf',
    uploadedAt: '2026-08-28T20:00:00Z',
    contentSnippet: 'Form W-9 (Rev. March 2024) Department of the Treasury Internal Revenue Service \nRequest for Taxpayer Identification Number and Certification \nName: Apex Strategy & Technology Consulting LLC \nBusiness name: Apex Consulting \nFederal Tax Classification: Limited Liability Company (Corporation) \nAddress: 400 Montgomery St, Suite 800, San Francisco, CA 94104 \nEmployer Identification Number (EIN): **-***8492 \nCertification: Under penalties of perjury, I certify that the number shown on this form is my correct taxpayer identification number.',
    status: 'classified',
    tags: ['IRS', 'Compliance', 'Vendor Onboarding'],
    source: 'sample',
    result: {
      categoryId: 'cat-tax',
      categoryName: 'Tax & Compliance Form',
      confidence: 99.5,
      secondaryMatches: [],
      summary: 'IRS Form W-9 Request for Taxpayer Identification Number submitted by Apex Strategy & Technology Consulting LLC.',
      keyEntities: [
        { name: 'Apex Strategy & Technology Consulting LLC', type: 'Legal Entity' },
        { name: 'Internal Revenue Service (IRS)', type: 'Government Agency' },
        { name: 'San Francisco, CA', type: 'Jurisdiction' }
      ],
      extractedFields: {
        form_type: 'W-9',
        tax_entity_name: 'Apex Strategy & Technology Consulting LLC',
        tin_masked: 'XX-XXX8492',
        address: '400 Montgomery St, Suite 800, San Francisco, CA 94104',
        certification_status: 'Certified / Signed'
      },
      riskScore: 1,
      urgency: 'medium',
      suggestedAction: 'Store in Secure Vendor Compliance Vault and link EIN to vendor profile.',
      reasoning: [
        'Matches official IRS W-9 form structure exactly with statutory certification text and masked EIN.',
        'Exempt from 1099 withholding as certified LLC Corp.'
      ],
      clusterCoordinates: { x: 78.3, y: -38.6 },
      processingTimeMs: 440,
      modelUsed: 'gemini-3.7-flash'
    }
  },
  {
    id: 'file-005',
    name: 'JPMorgan_Chase_Treasury_Operating_Statement_Jul2026.pdf',
    size: 420000,
    type: 'application/pdf',
    uploadedAt: '2026-08-28T20:15:00Z',
    contentSnippet: 'JPMorgan Chase Bank, N.A. \nCommercial Banking Operating Account Statement \nAccount Number: *******9012 \nStatement Period: July 1, 2026 through July 31, 2026 \nBeginning Ledger Balance: $2,419,850.40 \nTotal Deposits & Credits (42): $850,210.00 \nTotal Withdrawals & Debits (128): $612,400.15 \nEnding Ledger Balance: $2,657,660.25 USD \nInterest Earned this Period: $8,420.10',
    status: 'classified',
    tags: ['Treasury', 'Banking', 'Monthly Close'],
    source: 'sample',
    result: {
      categoryId: 'cat-stmt',
      categoryName: 'Bank & Treasury Statement',
      confidence: 97.9,
      secondaryMatches: [],
      summary: 'July 2026 corporate commercial banking operating ledger statement from JPMorgan Chase showing ending balance of $2,657,660.25.',
      keyEntities: [
        { name: 'JPMorgan Chase Bank, N.A.', type: 'Financial Institution' },
        { name: '$2,657,660.25 USD', type: 'Ending Balance' },
        { name: 'July 2026', type: 'Period' }
      ],
      extractedFields: {
        bank_name: 'JPMorgan Chase Bank, N.A.',
        statement_period: 'July 1, 2026 - July 31, 2026',
        ending_balance: 2657660.25,
        total_credits: 850210.00,
        total_debits: 612400.15
      },
      riskScore: 2,
      urgency: 'low',
      suggestedAction: 'Sync with General Ledger for July monthly cash reconciliation balance verification.',
      reasoning: [
        'Standard bank statement format with opening balance, closing balance, debit/credit aggregates, and account numbers.'
      ],
      clusterCoordinates: { x: 58.1, y: -74.2 },
      processingTimeMs: 405,
      modelUsed: 'gemini-3.7-flash'
    }
  },
  {
    id: 'file-006',
    name: 'Suspicious_Discrepancy_Vendor_Bill_Hardware_X89.txt',
    size: 45000,
    type: 'text/plain',
    uploadedAt: '2026-08-28T21:00:00Z',
    contentSnippet: 'URGENT INVOICE \nFrom: Apex Global Hardware Supplies LTD (Foreign Entity) \nTo: Accounting Dept \nAmount Due: $184,000.00 USD (Pay immediately to new offshore routing account in Cayman Islands) \nNote: Previous account suspended. Do not call, confirm via email only.',
    status: 'flagged_review',
    tags: ['Suspicious', 'Anomalous Wire', 'Risk Audit'],
    source: 'sample',
    result: {
      categoryId: 'cat-inv',
      categoryName: 'Vendor Invoice',
      confidence: 62.4, // Low confidence / anomalous
      secondaryMatches: [
        { categoryName: 'Bank & Treasury Statement', confidence: 15.0, reason: 'Mentions offshore routing numbers.' }
      ],
      summary: 'High-risk invoice alert: Urgent payment demand of $184,000.00 with suspicious bank routing changes and instructions to bypass voice verification.',
      keyEntities: [
        { name: 'Apex Global Hardware Supplies LTD', type: 'Unknown Entity' },
        { name: '$184,000.00 USD', type: 'High Value Flag' },
        { name: 'Cayman Islands', type: 'Offshore Jurisdiction' }
      ],
      extractedFields: {
        invoice_number: 'UNVERIFIED',
        vendor_name: 'Apex Global Hardware Supplies LTD',
        total_amount: 184000.00,
        currency: 'USD',
        risk_flags: ['Offshore account switch', 'No verbal confirmation request', 'Rush payment language']
      },
      riskScore: 9,
      urgency: 'critical',
      suggestedAction: 'HOLD PAYMENT IMMEDIATELY. Escalate to Chief Information Security Officer and fraud prevention unit.',
      reasoning: [
        'Triggered multiple Business Email Compromise (BEC) fraud heuristics: offshore bank change, urgent pressure, instruction not to call.',
        'Confidence is low (62.4%) because required corporate tax IDs and purchase order links are missing.'
      ],
      clusterCoordinates: { x: -75.8, y: -25.3 }, // Outlier in cluster
      processingTimeMs: 512,
      modelUsed: 'gemini-3.7-flash'
    }
  },
  {
    id: 'file-007',
    name: 'AWS_Annual_Enterprise_Support_Tier_Credit_Memo.pdf',
    size: 198000,
    type: 'application/pdf',
    uploadedAt: '2026-08-28T21:15:00Z',
    contentSnippet: 'AMAZON WEB SERVICES, INC. \nCREDIT MEMORANDUM & BILLING ADJUSTMENT \nCredit Memo #: CM-449102 \nAccount ID: 8812-9930-1120 \nCredit Amount Applied: -$4,200.00 USD \nReason: SLA Uptime Service Credit for US-West-2 Availability Zone outage \nEffective Billing Cycle: August 2026',
    status: 'classified',
    tags: ['Cloud', 'SLA Credit', 'Billing Adjustment'],
    source: 'sample',
    result: {
      categoryId: 'cat-inv',
      categoryName: 'Vendor Invoice',
      confidence: 89.2,
      secondaryMatches: [
        { categoryName: 'Bank & Treasury Statement', confidence: 22.0, reason: 'Shows financial adjustment credit.' }
      ],
      summary: 'AWS SLA uptime service credit memo of $4,200.00 applied to August 2026 invoice for region outage.',
      keyEntities: [
        { name: 'Amazon Web Services, Inc.', type: 'Vendor' },
        { name: '-$4,200.00 USD', type: 'Credit Value' },
        { name: 'CM-449102', type: 'Credit Memo ID' }
      ],
      extractedFields: {
        invoice_number: 'CM-449102',
        vendor_name: 'Amazon Web Services, Inc.',
        total_amount: -4200.00,
        currency: 'USD',
        credit_type: 'SLA Downtime Refund'
      },
      riskScore: 1,
      urgency: 'low',
      suggestedAction: 'Apply credit against outstanding AWS cloud balance in ERP ledger.',
      reasoning: [
        'Document represents vendor billing adjustment / credit memorandum issued by AWS.',
        'Negative credit balance applied to future billing cycles.'
      ],
      clusterCoordinates: { x: -62.1, y: 31.4 },
      processingTimeMs: 340,
      modelUsed: 'gemini-3.7-flash'
    }
  },
  {
    id: 'file-008',
    name: 'Enterprise_Software_License_Requisition_SaaS_PO-1048.pdf',
    size: 215000,
    type: 'application/pdf',
    uploadedAt: '2026-08-28T21:40:00Z',
    contentSnippet: 'PURCHASE REQUISITION & ORDER \nPO#: PO-1048 \nSupplier: Snowflake Computing Inc. \nDepartment: Data Engineering (Lead: Priya Sharma) \nAuthorized Total: $65,000.00 USD \nContract Term: 12-Month Capacity Commitment \nAuthorized by: VP of Engineering \nDate: 2026-08-20',
    status: 'classified',
    tags: ['Data Platform', 'Snowflake', 'SaaS Contract'],
    source: 'sample',
    result: {
      categoryId: 'cat-po',
      categoryName: 'Purchase Order',
      confidence: 97.4,
      secondaryMatches: [],
      summary: '12-month Snowflake data warehouse capacity purchase order for $65,000.00 approved by VP of Engineering.',
      keyEntities: [
        { name: 'Snowflake Computing Inc.', type: 'Vendor' },
        { name: 'Priya Sharma', type: 'Data Engineering Lead' },
        { name: '$65,000.00 USD', type: 'Authorized Total' }
      ],
      extractedFields: {
        po_number: 'PO-1048',
        requester: 'Priya Sharma (Data Engineering)',
        authorized_total: 65000.00,
        currency: 'USD',
        term: '12 Months'
      },
      riskScore: 2,
      urgency: 'medium',
      suggestedAction: 'Execute Snowflake contract agreement and allocate quarterly cloud credits.',
      reasoning: [
        'Clear purchase order structure with PO-1048, vendor authorization, and executive signature.'
      ],
      clusterCoordinates: { x: -38.9, y: 71.0 },
      processingTimeMs: 360,
      modelUsed: 'gemini-3.7-flash'
    }
  }
];

export const defaultTaxonomies = DEFAULT_TAXONOMIES;
export const initialSampleFiles = INITIAL_SAMPLE_FILES;

