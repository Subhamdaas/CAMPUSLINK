/**
 * CAMPUSLINK - Master Data Layer & Store
 * Clean, realistic baseline dataset for Students, Recruiters, and Placement Officers.
 * Integrated with MySQL backend authentication & JWT session management.
 */

const CAMPUSLINK_DATA = {
  // Active Logged-in Profile (Synchronized with MySQL)
  currentUser: {
    id: "std_001",
    name: "Aarav Sharma",
    email: "student@campuslink.edu",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    branch: "Computer Science & Engineering",
    batch: "2022-2026",
    cgpa: 8.92,
    usn: "1CL22CS042",
    phone: "+91 98765 43210",
    location: "Bangalore, India",
    readinessScore: 88,
    profileCompletion: 92,
    targetRole: "Full Stack Engineer"
  },

  // Role Metadata
  roles: {
    student: {
      name: "Aarav Sharma",
      title: "B.Tech CSE, 8th Sem",
      roleLabel: "Student",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    recruiter: {
      name: "Rohit Deshmukh",
      title: "University Talent Lead",
      roleLabel: "Recruiter",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      company: "Google India Pvt Ltd"
    },
    officer: {
      name: "Dr. Sunita Ramanathan",
      title: "Dean of Placements & Corporate Relations",
      roleLabel: "Placement Officer",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      institution: "National Institute of Technology"
    }
  },

  // Student Profile Dossier
  studentProfile: {
    personal: {
      fullName: "Aarav Sharma",
      dob: "2003-04-14",
      gender: "Male",
      email: "student@campuslink.edu",
      alternateEmail: "aarav.dev@gmail.com",
      phone: "+91 98765 43210",
      address: "Silicon Enclave, Electronic City",
      city: "Bangalore",
      state: "Karnataka",
      linkedin: "linkedin.com/in/aaravsharma-dev",
      github: "github.com/aaravsharma-code",
      portfolio: "https://aaravsharma.dev"
    },
    academic: {
      degree: "Bachelor of Technology (B.Tech)",
      branch: "Computer Science & Engineering",
      currentSemester: "8th Semester",
      cgpa: 8.92,
      standingBacklogs: 0,
      historyOfBacklogs: 0,
      tenthPercentage: "96.4%",
      twelfthPercentage: "94.8%",
      collegeRollNo: "22CSE042",
      universityRegNo: "1CL22CS042"
    },
    skills: [
      { id: "sk1", name: "React.js & Next.js", category: "Frontend", level: "Advanced", score: 92, verified: true },
      { id: "sk2", name: "Node.js & Express", category: "Backend", level: "Advanced", score: 88, verified: true },
      { id: "sk3", name: "Python & FastAPI", category: "Backend", level: "Intermediate", score: 84, verified: true },
      { id: "sk4", name: "Data Structures & Algorithms", category: "Core CS", level: "Advanced", score: 90, verified: true },
      { id: "sk5", name: "PostgreSQL & MySQL", category: "Database", level: "Intermediate", score: 85, verified: true },
      { id: "sk6", name: "Docker & CI/CD", category: "DevOps", level: "Intermediate", score: 76, verified: false }
    ],
    projects: [
      {
        id: "proj1",
        title: "CampusLink Automated Placement & Accreditation System",
        domain: "Enterprise SaaS & AI",
        duration: "Jan 2026 - Present",
        description: "Full-stack institutional placement platform featuring AI candidate ranking, conflict-free scheduler, and MySQL persistence.",
        techStack: ["React", "Node.js", "Express", "MySQL", "JWT"],
        liveUrl: "http://localhost:5000",
        githubUrl: "https://github.com/aaravsharma-code/campuslink",
        featured: true
      },
      {
        id: "proj2",
        title: "Distributed Order Processing Core",
        domain: "Backend Systems",
        duration: "Aug 2025 - Nov 2025",
        description: "High-throughput microservices pipeline handling 10k requests/second using Kafka streams and Redis distributed caching.",
        techStack: ["Node.js", "Kafka", "Redis", "Docker", "PostgreSQL"],
        liveUrl: "",
        githubUrl: "https://github.com/aaravsharma-code/order-stream",
        featured: true
      }
    ],
    certifications: [
      { id: "c1", title: "AWS Certified Developer – Associate", issuer: "Amazon Web Services", date: "Nov 2025", credentialId: "AWS-DEV-98421", verifyUrl: "https://aws.amazon.com/verify" },
      { id: "c2", title: "Problem Solving (Advanced) Certificate", issuer: "HackerRank", date: "Jan 2025", credentialId: "HR-PSA-4410", verifyUrl: "https://hackerrank.com/certificates" }
    ],
    resumeDetails: {
      fileName: "Aarav_Sharma_SDE_Resume_2026.pdf",
      fileSize: "2.1 MB",
      lastUpdated: "Recently updated",
      atsScore: 94,
      aiAnalysis: {
        summary: "High-impact resume with strong quantifiable metrics in full-stack architecture and algorithmic problem solving.",
        strengths: [
          "Demonstrates strong DSA proficiency and hands-on Node.js/MySQL scale.",
          "Clear quantifiable achievements and standard single-page ATS format."
        ],
        improvements: [
          "Highlight cloud deployment URLs directly in the header.",
          "Include AWS Associate credential verification link in the certifications block."
        ]
      }
    }
  },

  // Student Readiness Matrix
  readinessData: {
    overallScore: 88,
    status: "Highly Employable",
    breakdown: [
      { category: "Academic Rigor (CGPA)", score: 92, weight: "20%", benchmark: 80, status: "Excellent" },
      { category: "Technical & Coding", score: 90, weight: "30%", benchmark: 75, status: "Excellent" },
      { category: "System Design & Architecture", score: 82, weight: "20%", benchmark: 70, status: "Proficient" },
      { category: "Mock Interview Performance", score: 86, weight: "15%", benchmark: 70, status: "Very Good" },
      { category: "Communication & Leadership", score: 85, weight: "15%", benchmark: 75, status: "Very Good" }
    ],
    recommendations: [
      {
        title: "Deepen System Design Fundamentals",
        type: "Architecture",
        priority: "High",
        timeEstimate: "8 Hours",
        description: "Focus on Rate Limiters, Distributed Caching, and Message Queue topologies."
      },
      {
        title: "Dynamic Programming Sprint",
        type: "DSA",
        priority: "Medium",
        timeEstimate: "6 Hours",
        description: "Complete curated practice sets on Grid DP and Tree Combinations."
      }
    ]
  },

  // Student Skill Gap Matrix
  skillGapProfiles: {
    "Full Stack Engineer": {
      matchScore: 89,
      skills: [
        { name: "React / Next.js", current: 92, required: 85, status: "surplus" },
        { name: "Data Structures & Algorithms", current: 90, required: 85, status: "surplus" },
        { name: "Node.js & Express", current: 88, required: 80, status: "surplus" },
        { name: "PostgreSQL & MySQL", current: 85, required: 80, status: "met" },
        { name: "System Design", current: 78, required: 80, status: "minor_gap" },
        { name: "Docker & CI/CD", current: 76, required: 80, status: "minor_gap" },
        { name: "AWS Cloud Infrastructure", current: 65, required: 75, status: "critical_gap" }
      ],
      aiRoadmap: [
        { step: 1, title: "AWS Core Services", duration: "1 Week", module: "EC2, S3, RDS, IAM Policies" },
        { step: 2, title: "Container Orchestration", duration: "1 Week", module: "Docker Compose & ECS Fargate" }
      ]
    },
    "Data Scientist / AI Engineer": {
      matchScore: 75,
      skills: [
        { name: "Python Core", current: 85, required: 85, status: "met" },
        { name: "Data Structures", current: 90, required: 80, status: "surplus" },
        { name: "SQL & Data Modeling", current: 82, required: 85, status: "minor_gap" },
        { name: "PyTorch & Deep Learning", current: 62, required: 85, status: "critical_gap" }
      ],
      aiRoadmap: [
        { step: 1, title: "Transformer Architectures", duration: "2 Weeks", module: "Attention mechanisms & Fine-Tuning" }
      ]
    },
    "DevOps & Cloud Engineer": {
      matchScore: 70,
      skills: [
        { name: "Linux Systems", current: 80, required: 85, status: "minor_gap" },
        { name: "Docker", current: 76, required: 85, status: "minor_gap" },
        { name: "Terraform (IaC)", current: 45, required: 80, status: "critical_gap" }
      ],
      aiRoadmap: [
        { step: 1, title: "Terraform Infrastructure as Code", duration: "1 Week", module: "Declarative AWS modules" }
      ]
    }
  },

  // Curated Assessments
  assessments: [
    {
      id: "as_1",
      title: "Campus Aptitude & Quantitative Benchmark",
      category: "Aptitude",
      duration: "45 Mins",
      questionsCount: 30,
      lastAttempt: "18 Sep 2026",
      score: 91,
      percentile: "96th Percentile",
      status: "Completed",
      difficulty: "Hard",
      syllabus: "Permutations, Probability, Time & Work, Logical Deductions"
    },
    {
      id: "as_2",
      title: "Core Data Structures & Algorithmic Design",
      category: "Technical",
      duration: "60 Mins",
      questionsCount: 4,
      lastAttempt: "15 Sep 2026",
      score: 94,
      percentile: "98th Percentile",
      status: "Completed",
      difficulty: "Advanced",
      syllabus: "Dynamic Programming, Graph Traversal, Hash Indexes, Bitwise Operations"
    },
    {
      id: "as_3",
      title: "Mock Technical Interview (Tier-1 SDE)",
      category: "Mock Interview",
      duration: "30 Mins",
      questionsCount: 8,
      lastAttempt: "10 Sep 2026",
      score: 86,
      percentile: "90th Percentile",
      status: "Completed",
      difficulty: "Advanced",
      syllabus: "System Design, Concurrency, Database Scalability, Trade-off analysis"
    }
  ],

  // Real Active Job Drives
  jobs: [
    {
      id: "job_001",
      title: "Software Development Engineer - I (SDE 1)",
      company: "Google India",
      companyLogo: "https://www.google.com/favicon.ico",
      location: "Bangalore / Hyderabad",
      type: "Full-Time",
      ctc: "₹34.50 LPA",
      ctcBreakdown: "Base: ₹22.0L + Stocks: ₹8.5L + Joining Bonus: ₹4.0L",
      minCgpa: 8.0,
      allowedBranches: ["CSE", "IT", "ECE", "AI & DS"],
      openings: 18,
      deadline: "30 Sep 2026",
      status: "Active",
      aiMatchScore: 94,
      description: "Design and build high-performance software systems across Google Cloud, Search, and Android platforms.",
      requiredSkills: ["Data Structures & Algorithms", "Python / C++ / Java", "System Design Basics", "Relational Databases"],
      preferredSkills: ["Distributed Systems", "gRPC", "Docker"],
      matchedSkills: ["Data Structures & Algorithms", "Python", "Relational Databases"],
      missingSkills: ["gRPC"],
      applied: true,
      applicationStatus: "Interview Scheduled",
      driveDate: "05 Oct 2026"
    },
    {
      id: "job_002",
      title: "Software Engineer (Backend Cloud Core)",
      company: "Microsoft IDC",
      companyLogo: "https://www.microsoft.com/favicon.ico",
      location: "Bangalore / Noida",
      type: "Full-Time",
      ctc: "₹31.00 LPA",
      ctcBreakdown: "Base: ₹19.5L + Stocks: ₹7.5L + Performance Bonus: ₹4.0L",
      minCgpa: 7.5,
      allowedBranches: ["CSE", "IT", "ECE", "EEE"],
      openings: 24,
      deadline: "02 Oct 2026",
      status: "Active",
      aiMatchScore: 91,
      description: "Join the Azure Core team building distributed cloud computing primitives and high-availability backend services.",
      requiredSkills: ["Data Structures & Algorithms", "Go / Java / C#", "REST APIs", "SQL"],
      preferredSkills: ["Azure Services", "Kafka", "Docker"],
      matchedSkills: ["Data Structures & Algorithms", "REST APIs", "SQL", "Docker"],
      missingSkills: ["Azure Services"],
      applied: true,
      applicationStatus: "OA Scheduled",
      driveDate: "08 Oct 2026"
    },
    {
      id: "job_003",
      title: "Frontend Platform Engineer",
      company: "Amazon Development Center",
      companyLogo: "https://www.amazon.com/favicon.ico",
      location: "Bangalore / Chennai",
      type: "Full-Time",
      ctc: "₹28.75 LPA",
      ctcBreakdown: "Base: ₹18.0L + RSUs: ₹6.75L + Relocation & Bonus: ₹4.0L",
      minCgpa: 7.0,
      allowedBranches: ["All Engineering Branches"],
      openings: 30,
      deadline: "04 Oct 2026",
      status: "Active",
      aiMatchScore: 96,
      description: "Build accessible, performant, and responsive customer-facing web applications at massive scale.",
      requiredSkills: ["React.js", "TypeScript", "JavaScript (ES6+)", "Web Performance"],
      preferredSkills: ["Next.js", "Automated Testing", "Accessibility (WCAG)"],
      matchedSkills: ["React.js", "TypeScript", "JavaScript (ES6+)", "Next.js"],
      missingSkills: [],
      applied: false,
      applicationStatus: "Not Applied",
      driveDate: "12 Oct 2026"
    },
    {
      id: "job_004",
      title: "Technology Analyst (FinTech Platforms)",
      company: "Goldman Sachs",
      companyLogo: "https://www.goldmansachs.com/favicon.ico",
      location: "Bangalore",
      type: "Full-Time",
      ctc: "₹26.50 LPA",
      ctcBreakdown: "Base: ₹18.5L + Annual Discretionary Bonus: ₹8.0L",
      minCgpa: 8.0,
      allowedBranches: ["CSE", "IT", "ECE"],
      openings: 15,
      deadline: "06 Oct 2026",
      status: "Active",
      aiMatchScore: 87,
      description: "Develop secure, low-latency financial systems and asset management analytics platforms.",
      requiredSkills: ["Python / Java", "Data Structures", "Relational Databases", "Concurrency"],
      preferredSkills: ["Spring Boot", "Kafka", "Redis"],
      matchedSkills: ["Python", "Data Structures", "Relational Databases"],
      missingSkills: ["Spring Boot"],
      applied: false,
      applicationStatus: "Not Applied",
      driveDate: "15 Oct 2026"
    }
  ],

  // Student Applications
  applications: [
    {
      id: "app_101",
      jobId: "job_001",
      company: "Google India",
      role: "Software Development Engineer - I (SDE 1)",
      ctc: "₹34.50 LPA",
      appliedDate: "12 Sep 2026",
      aiMatchScore: 94,
      status: "Interview Scheduled",
      statusType: "success",
      timeline: [
        { stage: "Applied Online", date: "12 Sep 2026", status: "completed", note: "Resume verified (94% ATS match)." },
        { stage: "AI Profile Screening", date: "14 Sep 2026", status: "completed", note: "Shortlisted for Online Assessment." },
        { stage: "Online Coding Round", date: "18 Sep 2026", status: "completed", note: "Cleared 100% test cases." },
        { stage: "Technical Interview Round 1", date: "Tomorrow, 10:30 AM", status: "upcoming", note: "Google Meet link dispatched." },
        { stage: "Final Round & Leadership", date: "TBD", status: "pending", note: "Scheduled after Round 1 completion." }
      ]
    },
    {
      id: "app_102",
      jobId: "job_002",
      company: "Microsoft IDC",
      role: "Software Engineer (Backend Cloud Core)",
      ctc: "₹31.00 LPA",
      appliedDate: "10 Sep 2026",
      aiMatchScore: 91,
      status: "OA Scheduled",
      statusType: "info",
      timeline: [
        { stage: "Applied Online", date: "10 Sep 2026", status: "completed", note: "Application verified via CampusLink." },
        { stage: "Eligibility Verified", date: "12 Sep 2026", status: "completed", note: "CGPA 8.92 meets requirements." },
        { stage: "Online Assessment (Codility)", date: "26 Sep 2026, 02:00 PM", status: "upcoming", note: "90 min algorithmic challenge." },
        { stage: "Technical Interview Loop", date: "TBD", status: "pending", note: "Pending OA evaluation." }
      ]
    }
  ],

  // Upcoming Interviews
  interviews: [
    {
      id: "int_001",
      company: "Google India",
      companyLogo: "https://www.google.com/favicon.ico",
      role: "Software Development Engineer - I",
      round: "Round 1: Advanced Algorithms & Data Structures",
      date: "Tomorrow, 24 Sep 2026",
      time: "10:30 AM - 11:30 AM (IST)",
      type: "Virtual (Google Meet)",
      meetUrl: "https://meet.google.com/cmp-link-tech",
      panel: "Siddharth Verma (Staff Software Engineer, Google Cloud)",
      status: "Confirmed",
      preparationTips: [
        "Expect Graph algorithms (BFS/DFS, Dijkstra) and Tree Dynamic Programming.",
        "Communicate problem-solving trade-offs and complexity clearly."
      ]
    },
    {
      id: "int_002",
      company: "Microsoft IDC",
      companyLogo: "https://www.microsoft.com/favicon.ico",
      role: "Software Engineer (Backend Cloud Core)",
      round: "Online Assessment (Codility Hackathon)",
      date: "Saturday, 26 Sep 2026",
      time: "02:00 PM - 03:30 PM (IST)",
      type: "Proctored Exam",
      meetUrl: "https://codility.com/c/campuslink-msft-2026",
      panel: "Automated Campus Proctoring Unit",
      status: "Confirmed",
      preparationTips: [
        "Review edge cases for large inputs and sliding window techniques."
      ]
    }
  ],

  // Verified Documents
  documents: [
    {
      id: "doc_1",
      name: "B.Tech Complete Consolidated Grade Card (Sem 1-7)",
      category: "Academic Transcript",
      uploadDate: "10 Sep 2026",
      size: "3.2 MB",
      status: "Verified",
      verifiedBy: "Dr. Sunita Ramanathan (Placement Officer)",
      verifiedOn: "12 Sep 2026",
      fileUrl: "#"
    },
    {
      id: "doc_2",
      name: "Official Institutional Bonafide & No-Objection Certificate",
      category: "College Approval",
      uploadDate: "10 Sep 2026",
      size: "1.1 MB",
      status: "Verified",
      verifiedBy: "Deanery of Student Affairs",
      verifiedOn: "11 Sep 2026",
      fileUrl: "#"
    },
    {
      id: "doc_3",
      name: "Aarav_Sharma_Official_Resume_v4.2.pdf",
      category: "Resume",
      uploadDate: "Recently updated",
      size: "2.1 MB",
      status: "Verified",
      verifiedBy: "AI Automated Scanner (94% Score)",
      verifiedOn: "Yesterday",
      fileUrl: "#"
    },
    {
      id: "doc_4",
      name: "AWS Developer Associate Certification Transcript",
      category: "Professional Certificate",
      uploadDate: "20 Sep 2026",
      size: "850 KB",
      status: "Pending Verification",
      verifiedBy: "In Queue for Officer Review",
      verifiedOn: null,
      fileUrl: "#"
    }
  ],

  // Offers Deck
  offers: [
    {
      id: "off_01",
      company: "Tata Consultancy Services (Digital Wing)",
      companyLogo: "https://www.tcs.com/favicon.ico",
      role: "Systems Engineer (Digital Prime)",
      ctc: "₹9.00 LPA",
      location: "Bangalore / Pune",
      offerDate: "15 Aug 2026",
      joiningDate: "July 2027",
      acceptanceDeadline: "15 Oct 2026",
      status: "Deferred (Holding Tier-1 Privilege)",
      letterUrl: "#",
      details: {
        baseSalary: "₹8,20,000 / Annum",
        joiningBonus: "₹80,000 (One-time)",
        medicalInsurance: "Comprehensive Cover",
        bondPeriod: "None"
      }
    }
  ],

  // Notifications
  notifications: [
    {
      id: "nt_1",
      title: "Google Technical Round 1 Confirmed",
      message: "Your interview with Google Cloud team is scheduled for tomorrow at 10:30 AM IST.",
      time: "2 Hours ago",
      type: "interview",
      unread: true,
      actionUrl: "#student/interviews"
    },
    {
      id: "nt_2",
      title: "New Tier-1 Drive: Amazon Development Center",
      message: "Amazon is hiring Frontend Platform Engineers (₹28.75 LPA). Applications close 04 Oct.",
      time: "5 Hours ago",
      type: "job",
      unread: true,
      actionUrl: "#student/jobs"
    }
  ],

  // Students Directory for Officer & Recruiter
  studentsDirectory: [
    {
      id: "std_001",
      name: "Aarav Sharma",
      usn: "1CL22CS042",
      branch: "Computer Science & Engineering",
      cgpa: 8.92,
      skills: ["React", "TypeScript", "Node.js", "Python", "DSA", "MySQL"],
      readinessScore: 88,
      status: "Shortlisted",
      riskLevel: "Low",
      applicationsCount: 2,
      offersCount: 1,
      topSkill: "Full Stack & MySQL Architecture",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "std_002",
      name: "Ananya Iyer",
      usn: "1CL22CS015",
      branch: "Computer Science & Engineering",
      cgpa: 9.45,
      skills: ["C++", "DSA", "System Design", "Python", "PyTorch"],
      readinessScore: 96,
      status: "Interviewed",
      riskLevel: "Low",
      applicationsCount: 3,
      offersCount: 2,
      topSkill: "Competitive Programming (CF 1950+)",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "std_003",
      name: "Rohan Kulkarni",
      usn: "1CL22IS088",
      branch: "Information Science & Engineering",
      cgpa: 8.74,
      skills: ["Java", "Spring Boot", "PostgreSQL", "Docker", "AWS"],
      readinessScore: 85,
      status: "Shortlisted",
      riskLevel: "Low",
      applicationsCount: 2,
      offersCount: 1,
      topSkill: "Backend Cloud Systems",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "std_004",
      name: "Sneha Mukherjee",
      usn: "1CL22EC061",
      branch: "Electronics & Communication",
      cgpa: 8.31,
      skills: ["Embedded C", "Python", "IoT", "MATLAB", "DSA"],
      readinessScore: 78,
      status: "Eligible",
      riskLevel: "Medium",
      applicationsCount: 1,
      offersCount: 0,
      topSkill: "Hardware-Software Interfacing",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "std_005",
      name: "Tanvi Saxena",
      usn: "1CL22CS110",
      branch: "Computer Science & Engineering",
      cgpa: 7.15,
      skills: ["HTML/CSS", "JavaScript Basics", "MySQL"],
      readinessScore: 58,
      status: "At-Risk",
      riskLevel: "High",
      applicationsCount: 4,
      offersCount: 0,
      topSkill: "Web Fundamentals",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80"
    }
  ],

  // AI Matching Pool for Recruiter
  aiMatchingPool: [
    {
      candidateId: "std_002",
      name: "Ananya Iyer",
      branch: "CSE",
      cgpa: 9.45,
      aiMatchScore: 98,
      ranking: 1,
      skillMatch: 99,
      academicFit: 98,
      projectRelevance: 96,
      interviewScore: 97,
      matchedSkills: ["Data Structures & Algorithms", "C++", "System Design", "Python"],
      missingSkills: ["gRPC"],
      explanation: "Top percentile competitive programmer with 9.45 CGPA and national hackathon winner.",
      shortlisted: true,
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
    },
    {
      candidateId: "std_001",
      name: "Aarav Sharma",
      branch: "CSE",
      cgpa: 8.92,
      aiMatchScore: 94,
      ranking: 2,
      skillMatch: 95,
      academicFit: 92,
      projectRelevance: 96,
      interviewScore: 90,
      matchedSkills: ["React", "TypeScript", "Node.js", "Python", "DSA", "MySQL"],
      missingSkills: ["gRPC"],
      explanation: "Hands-on experience building distributed full-stack applications with clean MySQL database models.",
      shortlisted: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
      candidateId: "std_005",
      name: "Tanvi Saxena",
      branch: "CSE",
      cgpa: 7.15,
      aiMatchScore: 54,
      ranking: 3,
      skillMatch: 52,
      academicFit: 60,
      projectRelevance: 55,
      interviewScore: 48,
      matchedSkills: ["JavaScript Basics", "MySQL"],
      missingSkills: ["Data Structures & Algorithms", "System Design", "Python"],
      explanation: "Candidate falls below the minimum required 8.0 CGPA threshold and has skill gaps in algorithmic problem solving.",
      shortlisted: false,
      whyNotShortlisted: {
        eligibilityStatus: "Ineligible (CGPA 7.15 < Min 8.00 Cutoff)",
        skillGaps: ["Advanced DSA", "System Design"],
        assessmentIssues: "Aptitude benchmark score (58%) below 75% threshold.",
        mainReason: "Academic CGPA below corporate criterion and incomplete technical assessments.",
        aiIntervention: "Enroll in the Campus Algorithmic Remedial Bootcamp."
      },
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80"
    }
  ],

  // Master Placement Drives
  drives: [
    {
      id: "drv_101",
      company: "Google India",
      role: "Software Development Engineer - I (SDE 1)",
      ctc: "₹34.50 LPA",
      date: "05 Oct 2026",
      startTime: "09:00 AM",
      endTime: "06:00 PM",
      venue: "Auditorium Block A & Virtual Lab 3",
      status: "Active",
      registeredCount: 142,
      shortlistedCount: 28,
      rounds: ["Online Assessment", "Technical Round 1", "Technical Round 2", "Googliness & Leadership"]
    },
    {
      id: "drv_102",
      company: "Microsoft IDC",
      role: "Software Engineer (Backend Cloud Core)",
      ctc: "₹31.00 LPA",
      date: "08 Oct 2026",
      startTime: "09:30 AM",
      endTime: "05:30 PM",
      venue: "CS Seminar Hall 201 & Lab 4",
      status: "Active",
      registeredCount: 185,
      shortlistedCount: 35,
      rounds: ["Codility Assessment", "Technical Screening", "System Design Loop", "AA Round"]
    },
    {
      id: "drv_103",
      company: "Amazon Development Center",
      role: "Frontend Platform Engineer",
      ctc: "₹28.75 LPA",
      date: "12 Oct 2026",
      startTime: "10:00 AM",
      endTime: "06:00 PM",
      venue: "Virtual Placement Suite (Amazon Chime)",
      status: "Upcoming",
      registeredCount: 210,
      shortlistedCount: 45,
      rounds: ["Online Assessment", "Technical 1", "Technical 2", "Bar Raiser Interview"]
    }
  ],

  // Conflict Scheduler State
  schedulerState: {
    hasConflict: true,
    conflicts: [
      {
        id: "conf_01",
        type: "Student Double Booking Collision",
        severity: "Critical",
        title: "Amazon Round 2 & Microsoft Interview Slot Conflict",
        description: "Top CSE candidates are simultaneously scheduled for Microsoft IDC Technical Loop and Amazon Live Coding on Oct 08 between 11:00 AM – 01:00 PM.",
        conflictingDrives: ["Microsoft IDC", "Amazon Dev Center"],
        conflictingStudents: ["Aarav Sharma (1CL22CS042)", "Ananya Iyer (1CL22CS015)"],
        conflictingVenue: "Virtual Interview Suite Lab 3",
        aiSuggestedResolution: "Shift Amazon Round 2 cohort to 02:30 PM – 04:30 PM slot, freeing morning slots exclusively for Microsoft IDC."
      }
    ],
    slots: [
      { id: "s1", time: "09:00 AM - 10:30 AM", event: "Google SDE-1 PPT & Keynote", venue: "Auditorium A", company: "Google", conflict: false },
      { id: "s2", time: "11:00 AM - 01:00 PM", event: "Microsoft Technical Loop 1", venue: "Lab 3", company: "Microsoft", conflict: true },
      { id: "s3", time: "11:00 AM - 01:00 PM", event: "Amazon Frontend Technical 1", venue: "Lab 3", company: "Amazon", conflict: true },
      { id: "s4", time: "02:00 PM - 03:30 PM", event: "Google Technical Round 1", venue: "Virtual Rooms", company: "Google", conflict: false }
    ]
  },

  // Placement Officer Command Center Analytics
  officerDashboardStats: {
    totalEligibleStudents: 680,
    placementReadyStudents: 588,
    placedStudents: 412,
    unplacedStudents: 268,
    placementRate: 60.58,
    activeDrives: 14,
    totalOffers: 524,
    highestPackage: "₹54.00 LPA (Atlassian)",
    averagePackage: "₹14.85 LPA",
    medianPackage: "₹12.20 LPA",
    atRiskStudentsCount: 48,
    totalRecruitersPartnered: 84
  },

  branchAnalytics: [
    { branch: "Computer Science (CSE)", total: 220, placed: 188, rate: "85.4%", avgCtc: "₹18.4 LPA", topOffer: "₹54.0 LPA" },
    { branch: "Information Science (ISE)", total: 140, placed: 114, rate: "81.4%", avgCtc: "₹16.2 LPA", topOffer: "₹42.0 LPA" },
    { branch: "AI & Data Science (AI/DS)", total: 80, placed: 62, rate: "77.5%", avgCtc: "₹15.8 LPA", topOffer: "₹38.5 LPA" },
    { branch: "Electronics & Comm (ECE)", total: 120, placed: 84, rate: "70.0%", avgCtc: "₹11.5 LPA", topOffer: "₹28.0 LPA" },
    { branch: "Mechanical Engineering (ME)", total: 80, placed: 32, rate: "40.0%", avgCtc: "₹7.8 LPA", topOffer: "₹14.0 LPA" }
  ],

  packageTrends: [
    { range: "< ₹6 LPA", count: 74, percentage: "14.1%", badge: "Standard" },
    { range: "₹6 - ₹10 LPA", count: 182, percentage: "34.7%", badge: "Dream" },
    { range: "₹10 - ₹20 LPA", count: 178, percentage: "33.9%", badge: "Super Dream" },
    { range: "₹20 - ₹35 LPA", count: 72, percentage: "13.7%", badge: "Marquee" },
    { range: "> ₹35 LPA", count: 18, percentage: "3.4%", badge: "Pinnacle" }
  ],

  riskPrediction: {
    highRisk: [
      {
        id: "std_005",
        name: "Tanvi Saxena",
        usn: "1CL22CS110",
        branch: "CSE",
        cgpa: 7.15,
        readiness: 58,
        factors: ["Low Aptitude Benchmark (58%)", "Missing Core DSA Mastery", "Zero Verified Projects"],
        aiExplanation: "Risk model predicts 82% likelihood of remaining unplaced without intervention. Satisfactory academics but fails technical screening thresholds.",
        recommendedIntervention: "Enroll in 3-week Accelerated DSA Sprint + Weekly Mentorship."
      }
    ],
    mediumRisk: [
      {
        id: "std_004",
        name: "Sneha Mukherjee",
        usn: "1CL22EC061",
        branch: "ECE",
        cgpa: 8.31,
        readiness: 78,
        factors: ["High Academic CGPA but underperforming in Mock Interview communication rounds"],
        aiExplanation: "Solid technical knowledge, but interview stress inhibits effective articulation of problem solving.",
        recommendedIntervention: "Schedule 2 1-on-1 AI Mock Interviews with video analysis."
      }
    ]
  },

  // Recruiter Directory for Officer
  recruitersDirectory: [
    { id: "rec_1", name: "Google India", industry: "Big Tech / Internet", tier: "Tier-1 (Super Dream)", activeJobs: 2, totalOffers: 18, status: "Active Drive", avgPkg: "₹34.5 LPA", contact: "university-in@google.com" },
    { id: "rec_2", name: "Microsoft IDC", industry: "Cloud & Enterprise Software", tier: "Tier-1 (Super Dream)", activeJobs: 3, totalOffers: 24, status: "Active Drive", avgPkg: "₹31.0 LPA", contact: "campus-talent@microsoft.com" },
    { id: "rec_3", name: "Amazon Dev Center", industry: "E-Commerce & Cloud (AWS)", tier: "Tier-1 (Super Dream)", activeJobs: 2, totalOffers: 30, status: "Scheduled", avgPkg: "₹28.7 LPA", contact: "campus-hiring@amazon.com" },
    { id: "rec_4", name: "Goldman Sachs", industry: "Investment Banking / FinTech", tier: "Tier-1 (Super Dream)", activeJobs: 1, totalOffers: 15, status: "Scheduled", avgPkg: "₹26.5 LPA", contact: "india-careers@gs.com" }
  ],

  // Document Verification Queue
  documentVerificationQueue: [
    { id: "dv_1", studentName: "Aarav Sharma", usn: "1CL22CS042", branch: "CSE", docType: "Consolidated Grade Card", uploadDate: "10 Sep 2026", status: "Verified", file: "GradeCard_Aarav.pdf" },
    { id: "dv_2", studentName: "Sneha Mukherjee", usn: "1CL22EC061", branch: "ECE", docType: "Institutional Bonafide", uploadDate: "18 Sep 2026", status: "Pending", file: "Bonafide_Sneha.pdf" },
    { id: "dv_3", studentName: "Tanvi Saxena", usn: "1CL22CS110", branch: "CSE", docType: "12th Marks Transcript", uploadDate: "19 Sep 2026", status: "Changes Requested", file: "12thMarks_Tanvi.pdf", reason: "Scanned copy is blurred. Please re-upload 300 DPI color scan." }
  ],

  // Institutional Audit Logs for Placement Officer
  auditLogs: [
    { id: "log_101", action: "DRIVE_SCHEDULED", actor: "Rohit Deshmukh (Google)", timestamp: "21 Sep 2026, 14:30 IST", target: "Google Cloud SDE-1 Drive (08 Oct 2026)", status: "SUCCESS", ip: "192.168.1.42" },
    { id: "log_102", action: "OFFER_EXTENDED", actor: "Rohit Deshmukh (Google)", timestamp: "20 Sep 2026, 18:15 IST", target: "Aarav Sharma (1CL22CS042) - ₹34.5 LPA", status: "SUCCESS", ip: "192.168.1.42" },
    { id: "log_103", action: "DOCUMENT_VERIFIED", actor: "Dr. Sunita Ramanathan (Dean)", timestamp: "20 Sep 2026, 11:20 IST", target: "Consolidated Grade Card (Aarav Sharma)", status: "SUCCESS", ip: "10.0.4.1" },
    { id: "log_104", action: "CONFLICT_DETECTED", actor: "AI Scheduler Engine", timestamp: "19 Sep 2026, 09:45 IST", target: "Microsoft IDC vs Amazon Slot Collision", status: "WARNING", ip: "Internal Service" },
    { id: "log_105", action: "MENTOR_ASSIGNED", actor: "Dr. Sunita Ramanathan (Dean)", timestamp: "18 Sep 2026, 16:10 IST", target: "Tanvi Saxena (At-Risk Intervention)", status: "SUCCESS", ip: "10.0.4.1" },
    { id: "log_106", action: "STUDENT_AUTHENTICATED", actor: "Aarav Sharma (Student)", timestamp: "18 Sep 2026, 09:00 IST", target: "Student Portal Session Started", status: "SUCCESS", ip: "172.16.20.15" }
  ]
};

// Global Store & Reactive Management
const CampusLinkStore = {
  get: () => {
    // If a MySQL user is authenticated in localStorage, sync with active role
    const authUser = CampusLinkStore.getCurrentUser();
    if (authUser && authUser.role) {
      CAMPUSLINK_DATA.currentUser.id = authUser.id;
      CAMPUSLINK_DATA.currentUser.name = authUser.name;
      CAMPUSLINK_DATA.currentUser.email = authUser.email;
      CAMPUSLINK_DATA.currentUser.role = authUser.role;
      if (authUser.title) CAMPUSLINK_DATA.currentUser.title = authUser.title;
      if (authUser.avatar) CAMPUSLINK_DATA.currentUser.avatar = authUser.avatar;
    }
    return CAMPUSLINK_DATA;
  },
  
  setRole: (role) => {
    if (CAMPUSLINK_DATA.roles[role]) {
      CAMPUSLINK_DATA.currentUser.role = role;
      CAMPUSLINK_DATA.currentUser.name = CAMPUSLINK_DATA.roles[role].name;
      CAMPUSLINK_DATA.currentUser.avatar = CAMPUSLINK_DATA.roles[role].avatar;
      localStorage.setItem('campuslink_active_role', role);
      return true;
    }
    return false;
  },

  applyForJob: (jobId) => {
    const job = CAMPUSLINK_DATA.jobs.find(j => j.id === jobId);
    if (job && !job.applied) {
      job.applied = true;
      job.applicationStatus = "Application Submitted";
      
      CAMPUSLINK_DATA.applications.unshift({
        id: "app_" + Date.now(),
        jobId: job.id,
        company: job.company,
        role: job.title,
        ctc: job.ctc,
        appliedDate: "Just now",
        aiMatchScore: job.aiMatchScore,
        status: "Application Submitted",
        statusType: "info",
        timeline: [
          { stage: "Applied Online", date: "Just now", status: "completed", note: "Application registered in CampusLink." },
          { stage: "AI Profile Screening", date: "In Progress", status: "in_progress", note: "Evaluating skill compatibility and requirements." },
          { stage: "Assessment / Interview", date: "TBD", status: "pending", note: "Pending recruiter review." }
        ]
      });

      CAMPUSLINK_DATA.notifications.unshift({
        id: "nt_" + Date.now(),
        title: `Applied to ${job.company}`,
        message: `Your application for ${job.title} (${job.ctc}) has been successfully submitted.`,
        time: "Just now",
        type: "job",
        unread: true,
        actionUrl: "#student/applications"
      });

      return true;
    }
    return false;
  },

  resolveConflict: (conflictId) => {
    const idx = CAMPUSLINK_DATA.schedulerState.conflicts.findIndex(c => c.id === conflictId);
    if (idx !== -1) {
      CAMPUSLINK_DATA.schedulerState.conflicts.splice(idx, 1);
      if (CAMPUSLINK_DATA.schedulerState.conflicts.length === 0) {
        CAMPUSLINK_DATA.schedulerState.hasConflict = false;
      }
      return true;
    }
    return false;
  },

  shortlistCandidate: (candidateId, shortlist = true) => {
    const cand = CAMPUSLINK_DATA.aiMatchingPool.find(c => c.candidateId === candidateId);
    if (cand) {
      cand.shortlisted = shortlist;
      return true;
    }
    return false;
  },

  updateDocumentStatus: (docId, newStatus, remarks = "") => {
    const doc = CAMPUSLINK_DATA.documentVerificationQueue.find(d => d.id === docId);
    if (doc) {
      doc.status = newStatus;
      if (remarks) doc.reason = remarks;
      return true;
    }
    return false;
  },

  // Fallback demo users for quick evaluations
  mockUsers: [
    {
      id: "std_001",
      name: "Aarav Sharma",
      email: "student@campuslink.edu",
      password: "password123",
      role: "student",
      title: "B.Tech CSE '26",
      branch: "Computer Science & Engineering",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "rec_001",
      name: "Rohit Deshmukh",
      email: "rohit@google.com",
      password: "password123",
      role: "recruiter",
      title: "University Talent Lead",
      company: "Google India Pvt Ltd",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "off_001",
      name: "Dr. Sunita Ramanathan",
      email: "officer@campuslink.edu",
      password: "password123",
      role: "officer",
      title: "Dean of Placements",
      institution: "National Institute of Technology",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    }
  ],

  authenticate: async (email, password, selectedRole) => {
    // 1. Primary: Authenticate with MySQL Backend API
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('campuslink_jwt_token', data.token);
        localStorage.setItem('campuslink_auth_user', JSON.stringify(data.user));
        CampusLinkStore.setRole(data.user.role);
        return { success: true, user: data.user, source: 'mysql' };
      } else if (response.status === 400 || response.status === 401 || response.status === 403) {
        return { success: false, message: data.message || "Invalid credentials" };
      }
    } catch (e) {
      // Backend not running on current origin, proceed to fallback
    }

    // 2. Client-side Local Storage & Demo Fallback
    let user = CampusLinkStore.mockUsers.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!user && selectedRole) {
      user = CampusLinkStore.mockUsers.find(u => u.role === selectedRole);
    }
    if (!user) {
      user = CampusLinkStore.mockUsers.find(u => u.role === (selectedRole || 'student'));
    }

    if (user) {
      const authPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        avatar: user.avatar,
        token: "jwt_token_" + Date.now()
      };
      localStorage.setItem('campuslink_auth_user', JSON.stringify(authPayload));
      CampusLinkStore.setRole(user.role);
      return { success: true, user: authPayload, source: 'local' };
    }
    return { success: false, message: "Invalid credentials" };
  },

  registerUser: async (userData) => {
    // 1. Primary: Register in MySQL Database
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('campuslink_jwt_token', data.token);
        localStorage.setItem('campuslink_auth_user', JSON.stringify(data.user));
        CampusLinkStore.setRole(data.user.role);
        return { success: true, user: data.user, source: 'mysql' };
      } else if (response.status === 400 || response.status === 409) {
        return { success: false, message: data.message || "Registration failed" };
      }
    } catch (e) {
      // Backend not reachable
    }

    // 2. Client-side Fallback
    const newUser = {
      id: "usr_" + Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password || "password123",
      role: userData.role || "student",
      title: userData.role === 'student' ? "B.Tech Student '26" : userData.role === 'recruiter' ? "Talent Partner" : "Placement Officer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    };
    CampusLinkStore.mockUsers.push(newUser);
    return await CampusLinkStore.authenticate(newUser.email, newUser.password, newUser.role);
  },

  getCurrentUser: () => {
    try {
      const saved = localStorage.getItem('campuslink_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch(e) {
      return null;
    }
  },

  getAuthToken: () => {
    try {
      return localStorage.getItem('campuslink_jwt_token') || null;
    } catch(e) {
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('campuslink_auth_user');
    localStorage.removeItem('campuslink_jwt_token');
  }
};

// Auto-restore saved user if present
if (typeof localStorage !== 'undefined') {
  const existingUser = CampusLinkStore.getCurrentUser();
  if (existingUser && existingUser.role) {
    CampusLinkStore.setRole(existingUser.role);
  }
}
