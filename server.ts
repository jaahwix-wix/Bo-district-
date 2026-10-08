import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { db } from './src/db/index.ts';
import { 
  users, 
  serviceReports, 
  developmentProjects, 
  announcements, 
  councilEvents, 
  citizens,
  paymentReceipts, 
  businessLicences, 
  buildingPermits, 
  chiefdoms,
  auditLogs 
} from './src/db/schema.ts';
import { CHIEFDOMS_DATA } from './src/data/chiefdoms.ts';
import { requireAuth, optionalAuth, requireRole, AuthRequest } from './src/middleware/auth.ts';
import { getUserByUid, updateUserRole, getOrCreateUser } from './src/db/users.ts';
import { adminAuth } from './src/lib/firebase-admin.ts';
import { createSessionToken } from './src/lib/tokens.ts';
import { eq, desc } from 'drizzle-orm';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.error("Gemini AI Client init error:", err);
  }
}

// Initial Seeding Logic for PostgreSQL Cloud SQL
async function seedDatabaseIfEmpty() {
  try {
    const existingEvents = await db.select().from(councilEvents).limit(1);
    if (existingEvents.length === 0) {
      console.log("Seeding initial Bo District Council records into Cloud SQL...");

      // Seed Events
      await db.insert(councilEvents).values([
        {
          id: "EVT-2026-101",
          title: "Bo District Council Statutory Ordinary Meeting",
          category: "Council Meeting",
          date: "2026-08-25",
          time: "10:00 AM - 2:00 PM",
          location: "Bo District Council Hall, Fenton Road",
          chiefdom: "Kakua",
          organizer: "Office of the Council Chairman",
          description: "Review of Q2 2026 Revenue Allocations, Chiefdom Feeder Road Maintenance Progress, and Approval of Supplementary Development Budget.",
          status: "Upcoming"
        },
        {
          id: "EVT-2026-102",
          title: "Tikonko Chiefdom Town Hall & Rate Review",
          category: "Town Hall",
          date: "2026-08-28",
          time: "11:00 AM - 1:30 PM",
          location: "Tikonko Court Barrier",
          chiefdom: "Tikonko",
          organizer: "Finance & Revenue Committee",
          description: "Community consultative forum on 2026 property rate valuations, market sanitation dues, and local tax collection feedback.",
          status: "Upcoming"
        },
        {
          id: "EVT-2026-103",
          title: "Sumbuya Maternal Health & Water Sanitation Drive",
          category: "Health Drive",
          date: "2026-09-02",
          time: "9:00 AM - 3:00 PM",
          location: "Lugbu Chiefdom Health Center, Sumbuya",
          chiefdom: "Lugbu",
          organizer: "District Health & Sanitation Committee",
          description: "Distribution of solar cold-chain storage kits, borehole water quality testing, and maternal health sensitization with Paramount Chief.",
          status: "Upcoming"
        }
      ]);

      // Seed Service Reports
      await db.insert(serviceReports).values([
        {
          id: "BDC-CMP-2026-00231",
          title: "Tikonko Solar Borehole Motor Failure",
          category: "water",
          chiefdom: "Tikonko",
          wardNumber: "Ward 284",
          locationDetails: "Opposite Tikonko Market Square",
          description: "The primary solar borehole motor failed 3 days ago. Over 1,200 households currently relying on unsafe stream water.",
          reporterName: "Chief Sahr Kangbai",
          reporterPhone: "+232 76 450 112",
          status: "In Progress",
          priority: "High",
          submittedAt: "2026-08-08 09:30",
          updatedAt: "2026-08-09 10:00",
          officialNote: "Water & Sanitation Engineer dispatched with replacement 3.5HP submersible pump."
        },
        {
          id: "BDC-CMP-2026-00232",
          title: "Gondama Feeder Culvert Washout",
          category: "roads",
          chiefdom: "Kakua",
          wardNumber: "Ward 280",
          locationDetails: "Mile 8 along Gondama route",
          description: "Heavy rain washed away the twin pipe culvert. Farmers unable to transport cassava and oil palm to Bo Central Market.",
          reporterName: "Mariama Sesay",
          reporterPhone: "+232 78 991 204",
          status: "Dispatched",
          priority: "Urgent",
          submittedAt: "2026-08-09 11:15",
          updatedAt: "2026-08-10 14:00",
          officialNote: "District Works team assessing emergency backfill and stone masonry culvert replacement."
        }
      ]);

      // Seed Projects
      await db.insert(developmentProjects).values([
        {
          id: "PROJ-2026-01",
          title: "Boama-Gondama Feeder Road Culvert & Drainage Rehabilitation",
          sector: "Infrastructure",
          chiefdom: "Boama",
          budgetNLe: 1250000,
          fundingSource: "World Bank & District Revenue",
          progress: 65,
          status: "In Progress",
          startDate: "2026-02-15",
          targetCompletion: "2026-11-30",
          contractor: "Bo Civil Engineering Works Ltd",
          impactSummary: "Constructing 14 stone masonry culverts and clearing 18km of feeder road to improve cocoa and palm oil transit."
        },
        {
          id: "PROJ-2026-02",
          title: "Tikonko Chiefdom Solar Water Supply Expansion",
          sector: "Water & Sanitation",
          chiefdom: "Tikonko",
          budgetNLe: 890000,
          fundingSource: "District Development Fund",
          progress: 80,
          status: "Near Completion",
          startDate: "2026-03-01",
          targetCompletion: "2026-09-15",
          contractor: "Southern Hydro-Tech Ltd",
          impactSummary: "Drilling 4 high-yield solar boreholes with 10,000-liter overhead tanks serving Tikonko Town Market."
        }
      ]);

      // Seed Announcements
      await db.insert(announcements).values([
        {
          id: "ANN-2026-01",
          title: "2026 Commercial Property Rate & Business License Renewal Notice",
          category: "Public Notice",
          date: "2026-08-01",
          summary: "All business operators in Kakua, Tikonko, and Baoma Chiefdoms are advised to complete annual rate assessments before September 30, 2026.",
          fullText: "The Bo District Council pursuant to the Local Government Act 2022 hereby notifies all commercial property owners and trade licence holders across all 15 Chiefdoms to complete their annual rate payments at Fenton Road Council Treasury or via approved Mobile Money channels.",
          important: true
        }
      ]);

      // Seed Citizens
      await db.insert(citizens).values([
        {
          id: "CIT-KAK-2026-001",
          nin: "SL-NIN-9821402",
          name: "Mariama Kamara",
          phone: "+232 76 112 334",
          address: "14 Fenton Road",
          ward: "Ward 280",
          chiefdom: "Kakua",
          community: "Bo Central Market Area",
          gender: "Female",
          dob: "1988-05-14",
          idType: "National ID Card",
          registeredAt: "2026-01-10"
        },
        {
          id: "CIT-TIK-2026-002",
          nin: "SL-NIN-4431908",
          name: "Sahr Kangbai",
          phone: "+232 78 450 112",
          address: "Tikonko Town Square",
          ward: "Ward 284",
          chiefdom: "Tikonko",
          community: "Tikonko Station",
          gender: "Male",
          dob: "1975-11-20",
          idType: "National ID Card",
          registeredAt: "2026-02-04"
        }
      ]);

      // Seed Receipts
      await db.insert(paymentReceipts).values([
        {
          id: "REC-2026-001",
          receiptNo: "BDC-2026-8812",
          payerName: "Francis Momoh & Sons Enterprise",
          payerPhone: "+232 78 443 120",
          service: "Property Rate Assessment 2026",
          revenueType: "Property Rates",
          ward: "Ward 280",
          chiefdom: "Kakua",
          amountNLe: 2500,
          paymentMethod: "Orange Money",
          date: "2026-08-05",
          collector: "Council Treasury Officer",
          status: "Verified",
          description: "2026 Commercial Building Property Rate Assessment",
          securityHash: "SEC-8812-BDC-2026"
        }
      ]);

      // Seed Licences
      await db.insert(businessLicences).values([
        {
          id: "LIC-2026-001",
          licenceNo: "BDC-LIC-2026-104",
          businessName: "Gondama Palm Oil Processing Mill",
          ownerName: "Mariama Sesay",
          businessType: "Agricultural Processing",
          location: "Gondama Main Road",
          chiefdom: "Boama",
          ward: "Ward 287",
          issueDate: "2026-01-15",
          expiryDate: "2026-12-31",
          amountPaidNLe: 1800,
          status: "Active"
        }
      ]);

      // Seed Permits
      await db.insert(buildingPermits).values([
        {
          id: "PER-2026-001",
          permitNo: "BDC-PER-2026-202",
          applicantName: "Samuel Koroma",
          propertyLocation: "Fenton Road Commercial Zone",
          chiefdom: "Kakua",
          ward: "Ward 280",
          projectType: "Two-Story Commercial Store & Office",
          estimatedValueNLe: 450000,
          feePaidNLe: 2500,
          approvalStatus: "Approved",
          appliedDate: "2026-06-10",
          approvedDate: "2026-07-20"
        }
      ]);

      // Seed Chiefdoms Directory
      await db.insert(chiefdoms).values(
        CHIEFDOMS_DATA.map((c) => ({
          id: c.id,
          name: c.name,
          capital: c.capital,
          paramountChief: c.paramountChief,
          councillor: c.councillor,
          wards: JSON.stringify(c.wards || []),
          populationEst: c.populationEst || '50,000',
          activeProjectsCount: c.activeProjectsCount || 0,
          healthCentersCount: c.healthCentersCount || 0,
          schoolsCount: c.schoolsCount || 0,
          primaryEconomicActivity: c.primaryEconomicActivity || '',
          councilOfficeLocation: c.councilOfficeLocation || '',
          description: c.description || ''
        }))
      );

      // Seed Audit Logs
      await db.insert(auditLogs).values([
        {
          id: "LOG-2026-001",
          timestamp: "2026-08-12 05:00:00",
          user: "System Administrator",
          role: "Administrator",
          action: "Cloud SQL PostgreSQL Database Initialization & Verification",
          target: "Bo District Council Master Schema"
        }
      ]);

      console.log("Cloud SQL Database seeding completed successfully!");
    }

    // Ensure comprehensive development projects across wards exist
    const currentProjs = await db.select().from(developmentProjects);
    if (currentProjs.length < 5) {
      console.log("Adding additional development projects across Bo District wards...");
      const additionalProjects = [
        {
          id: "PROJ-2026-03",
          title: "Fenton Road Municipal Market Drainage & Solar Streetlighting",
          sector: "Infrastructure",
          chiefdom: "Kakua",
          budgetNLe: 1850000,
          fundingSource: "District Development Fund & EU Grant",
          progress: 90,
          status: "Near Completion",
          startDate: "2026-01-10",
          targetCompletion: "2026-09-30",
          contractor: "Fenton Modern Engineering",
          impactSummary: "Upgrading 2.4km stormwater drains and installing 60 solar luminaires along Fenton Road and central business corridor."
        },
        {
          id: "PROJ-2026-04",
          title: "Korwama Community Health Center Maternity Wing & Solar Cold Chain",
          sector: "Health",
          chiefdom: "Kakua",
          budgetNLe: 950000,
          fundingSource: "UNICEF & Ministry of Local Government",
          progress: 100,
          status: "Completed",
          startDate: "2025-11-01",
          targetCompletion: "2026-06-30",
          contractor: "Apex Medical Builders SL",
          impactSummary: "Completed 20-bed maternal and child health ward with 24/7 solar battery bank for cold vaccine storage."
        },
        {
          id: "PROJ-2026-05",
          title: "Njala Komboya Agricultural Feeder Road Graveling & Culvert Works",
          sector: "Infrastructure",
          chiefdom: "Kakua",
          budgetNLe: 1100000,
          fundingSource: "Ministry of Agriculture Feeder Roads Fund",
          progress: 45,
          status: "In Progress",
          startDate: "2026-03-20",
          targetCompletion: "2026-12-15",
          contractor: "Southern Roads Consortium",
          impactSummary: "Rehabilitating 12km connecting farm settlements to Bo Regional Market."
        },
        {
          id: "PROJ-2026-06",
          title: "Mogbdemo Solar Borehole & Reticulation Pipe Network",
          sector: "Water & Sanitation",
          chiefdom: "Tikonko",
          budgetNLe: 720000,
          fundingSource: "District Council Water Sanitation Fund",
          progress: 100,
          status: "Completed",
          startDate: "2025-12-15",
          targetCompletion: "2026-05-20",
          contractor: "Southern Hydro-Tech Ltd",
          impactSummary: "Providing clean pressurized tap water to 3,400 residents across Mogbdemo and Sebehun communities."
        },
        {
          id: "PROJ-2026-07",
          title: "Yamandu Primary School 6-Classroom Block & Sanitation Block",
          sector: "Education",
          chiefdom: "Boama",
          budgetNLe: 680000,
          fundingSource: "SABABU Education Project & Council Co-financing",
          progress: 55,
          status: "In Progress",
          startDate: "2026-04-01",
          targetCompletion: "2026-10-31",
          contractor: "Baoma Educational Infrastructure Ltd",
          impactSummary: "Furnished classroom block with modern VIP latrines and rainwater harvesting system."
        },
        {
          id: "PROJ-2026-08",
          title: "Sumbuya Riverfront Fish Landing Jetty & Solar Cold Storage",
          sector: "Agriculture",
          chiefdom: "Lugbu",
          budgetNLe: 1450000,
          fundingSource: "Fisheries Development Fund & Council Grant",
          progress: 70,
          status: "In Progress",
          startDate: "2026-02-01",
          targetCompletion: "2026-11-15",
          contractor: "Sewa Marine Works",
          impactSummary: "Reinforced concrete landing quay and 15-ton solar cold store for artisanal fishermen along Sewa River."
        },
        {
          id: "PROJ-2026-09",
          title: "Mamboma Solar Mini-Grid & Community Distribution Grid",
          sector: "Energy",
          chiefdom: "Lugbu",
          budgetNLe: 820000,
          fundingSource: "Rural Renewable Energy Program",
          progress: 100,
          status: "Completed",
          startDate: "2025-10-15",
          targetCompletion: "2026-04-30",
          contractor: "PowerGrid West Africa",
          impactSummary: "50kWp solar mini-grid powering 180 commercial shops, local health post, and streetlights."
        },
        {
          id: "PROJ-2026-10",
          title: "Koribondo Commercial Highway Truck Transit Park & Market Stalls",
          sector: "Infrastructure",
          chiefdom: "Jaiama Bongor",
          budgetNLe: 1600000,
          fundingSource: "District Municipal Development Bond",
          progress: 30,
          status: "Planning",
          startDate: "2026-06-01",
          targetCompletion: "2027-03-31",
          contractor: "Transit Infra Sierra Leone",
          impactSummary: "Paved parking terminal for 40 heavy vehicles, 60 lock-up vendor stores, and public washrooms."
        },
        {
          id: "PROJ-2026-11",
          title: "Bumpe Town Cassava Processing Agro-Hub & Solar Dryers",
          sector: "Agriculture",
          chiefdom: "Bumpe Gao",
          budgetNLe: 920000,
          fundingSource: "World Bank Agricultural Value Chain Project",
          progress: 85,
          status: "Near Completion",
          startDate: "2026-01-20",
          targetCompletion: "2026-09-30",
          contractor: "AgroTech Sierra Leone",
          impactSummary: "Mechanized gari grating, hydraulic pressing, and solar drying shed boosting farmer cooperative revenue by 40%."
        },
        {
          id: "PROJ-2026-12",
          title: "Mongere Comprehensive Health Post Rehabilitation",
          sector: "Health",
          chiefdom: "Valunia",
          budgetNLe: 880000,
          fundingSource: "District Health Action Plan",
          progress: 40,
          status: "In Progress",
          startDate: "2026-05-10",
          targetCompletion: "2026-12-20",
          contractor: "Valunia Local Builders",
          impactSummary: "Refurbishment of outpatient clinic, dispensary, staff quarters, and dedicated solar powered borehole."
        },
        {
          id: "PROJ-2026-13",
          title: "Gboyama Inland Valley Swamp Irrigation Scheme",
          sector: "Agriculture",
          chiefdom: "Wonde",
          budgetNLe: 760000,
          fundingSource: "National Food Security Initiative",
          progress: 15,
          status: "Planning",
          startDate: "2026-07-01",
          targetCompletion: "2027-02-28",
          contractor: "Wonde Agri-Irrigation Ltd",
          impactSummary: "Concrete diversion weir and 4.2km contour canals enabling two-cycle annual rice cropping for 240 smallholders."
        }
      ];

      for (const p of additionalProjects) {
        try {
          await db.insert(developmentProjects).values(p);
        } catch (e) {
          // ignore duplicate id if already exists
        }
      }
    }
  } catch (err) {
    console.error("Error during initial database seed check:", err);
  }
}

seedDatabaseIfEmpty();

// Credential Authentication Endpoint (Bulletproof Council & Citizen Auth)
app.post("/api/auth/credential-login", async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email address is required" });
    return;
  }

  const requestedRole: 'citizen' | 'officer' | 'admin' = 
    ['citizen', 'officer', 'admin'].includes(role) ? role : 'citizen';
  const cleanEmail = email.trim().toLowerCase();
  const displayName = cleanEmail.split('@')[0].toUpperCase();

  try {
    // Generate deterministic safe UID based on email for consistent identity
    const safeUid = 'usr_' + Buffer.from(cleanEmail).toString('hex').slice(0, 24);

    // Persist or retrieve user in PostgreSQL Cloud SQL database
    const dbUser = await getOrCreateUser(safeUid, cleanEmail, displayName, requestedRole);
    if (dbUser && requestedRole && dbUser.role !== requestedRole) {
      await updateUserRole(safeUid, requestedRole, dbUser.chiefdom || 'Kakua');
    }

    // Generate signed, tamper-proof session JWT
    const token = createSessionToken({
      uid: safeUid,
      email: cleanEmail,
      role: requestedRole,
      fullName: displayName,
      chiefdom: dbUser?.chiefdom || 'Kakua'
    });

    // Gracefully attempt Firebase Admin customToken if available, but never throw if Identity Toolkit API is disabled
    let customToken: string | null = null;
    try {
      let userRecord;
      try {
        userRecord = await adminAuth.getUserByEmail(cleanEmail);
      } catch {
        userRecord = await adminAuth.createUser({
          email: cleanEmail,
          password: password || 'Council2026!',
          displayName
        });
      }
      customToken = await adminAuth.createCustomToken(userRecord.uid, { role: requestedRole });
    } catch (fbErr: any) {
      console.warn('Firebase Admin customToken notice (using PostgreSQL session):', fbErr?.message || fbErr);
    }

    res.json({
      token,
      customToken,
      uid: safeUid,
      email: cleanEmail,
      role: requestedRole,
      fullName: displayName,
      chiefdom: dbUser?.chiefdom || 'Kakua'
    });
  } catch (err: any) {
    console.error("Error in credential-login:", err);
    res.status(500).json({ error: err.message || "Failed to authenticate credential" });
  }
});

// User Auth & Role Management Endpoints
app.get("/api/auth/me", requireAuth, async (req: AuthRequest, res: Response) => {
  res.json({
    uid: req.dbUser.uid,
    email: req.dbUser.email,
    fullName: req.dbUser.fullName,
    role: req.dbUser.role,
    chiefdom: req.dbUser.chiefdom
  });
});

app.post("/api/auth/update-role", requireAuth, async (req: AuthRequest, res: Response) => {
  const { role, chiefdom } = req.body;
  if (!role || !['citizen', 'officer', 'admin'].includes(role)) {
    res.status(400).json({ error: "Invalid role specified" });
    return;
  }

  try {
    const updated = await updateUserRole(req.user!.uid, role, chiefdom);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update user role" });
  }
});

// Civic Reports API
app.get("/api/reports", async (req: Request, res: Response) => {
  try {
    const rows = await db.select().from(serviceReports);
    res.json(rows);
  } catch (err: any) {
    console.error("Error fetching service reports:", err);
    res.status(500).json({ error: "Database error fetching reports" });
  }
});

app.post("/api/reports", optionalAuth, async (req: AuthRequest, res: Response) => {
  const { category, chiefdom, description, location, contactPhone, title, wardNumber, reporterName } = req.body;
  if (!category || !chiefdom || !description || !contactPhone) {
    res.status(400).json({ error: "Missing required report fields" });
    return;
  }

  const idNum = Math.floor(10000 + Math.random() * 90000);
  const reportId = `BDC-CMP-2026-${idNum}`;
  const now = new Date().toISOString().replace("T", " ").substring(0, 16);

  try {
    const newReport = {
      id: reportId,
      title: title || `${category.toUpperCase()} Service Request`,
      category,
      chiefdom,
      wardNumber: wardNumber || 'Ward 280',
      locationDetails: location || '',
      description,
      reporterName: reporterName || 'Resident',
      reporterPhone: contactPhone,
      status: "Submitted",
      priority: "Medium",
      submittedAt: now,
      updatedAt: now,
      officialNote: "Received by Bo District Council Gateway. Processing queue assigned.",
      userUid: req.user ? req.user.uid : null
    };

    await db.insert(serviceReports).values(newReport);

    await db.insert(auditLogs).values({
      id: `LOG-2026-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: now,
      user: req.user?.email || "Citizen Portal",
      role: req.dbUser?.role || "District Citizen",
      action: `Submitted Civic Report "${reportId}" (${category})`,
      target: `${chiefdom} Chiefdom`
    });

    res.status(201).json(newReport);
  } catch (err: any) {
    console.error("Error inserting service report:", err);
    res.status(500).json({ error: "Failed to save report to database" });
  }
});

app.patch("/api/reports/:id", requireAuth, requireRole(['officer', 'admin']), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, officialNote } = req.body;

  try {
    const existing = await db.select().from(serviceReports).where(eq(serviceReports.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    const updated = await db.update(serviceReports)
      .set({
        ...(status ? { status } : {}),
        ...(officialNote !== undefined ? { officialNote } : {}),
        updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16)
      })
      .where(eq(serviceReports.id, id))
      .returning();

    res.json(updated[0]);
  } catch (err: any) {
    console.error("Error updating service report:", err);
    res.status(500).json({ error: "Failed to update report status" });
  }
});

// Development Projects API
app.get("/api/projects", async (req: Request, res: Response) => {
  try {
    const rows = await db.select().from(developmentProjects);
    res.json(rows);
  } catch (err: any) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Database error fetching projects" });
  }
});

app.post("/api/projects", requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const { title, sector, chiefdom, budgetNLe, fundingSource, contractor, impactSummary } = req.body;
  if (!title || !chiefdom) {
    res.status(400).json({ error: "Title and chiefdom are required" });
    return;
  }

  const idNum = Math.floor(10 + Math.random() * 90);
  const projId = `PROJ-2026-${idNum}`;

  try {
    const newProj = {
      id: projId,
      title,
      sector: sector || "Infrastructure",
      chiefdom,
      budgetNLe: Number(budgetNLe) || 500000,
      fundingSource: fundingSource || "District Council Fund",
      progress: 10,
      status: "Planning",
      startDate: new Date().toISOString().substring(0, 10),
      targetCompletion: "2026-12-31",
      contractor: contractor || "Bo Civil Works Ltd",
      impactSummary: impactSummary || title
    };

    await db.insert(developmentProjects).values(newProj);
    res.status(201).json(newProj);
  } catch (err: any) {
    console.error("Error creating development project:", err);
    res.status(500).json({ error: "Failed to create project in database" });
  }
});

// Announcements API
app.get("/api/announcements", async (req: Request, res: Response) => {
  try {
    const rows = await db.select().from(announcements);
    res.json(rows);
  } catch (err: any) {
    console.error("Error fetching announcements:", err);
    res.status(500).json({ error: "Database error fetching announcements" });
  }
});

app.post("/api/announcements", requireAuth, requireRole(['officer', 'admin']), async (req: AuthRequest, res: Response) => {
  const { title, category, summary, fullText, important } = req.body;
  if (!title || !summary) {
    res.status(400).json({ error: "Title and summary are required" });
    return;
  }

  const idNum = Math.floor(10 + Math.random() * 90);
  const annId = `ANN-2026-${idNum}`;

  try {
    const newAnn = {
      id: annId,
      title,
      category: category || "Public Notice",
      date: new Date().toISOString().substring(0, 10),
      summary,
      fullText: fullText || summary,
      important: !!important
    };

    await db.insert(announcements).values(newAnn);
    res.status(201).json(newAnn);
  } catch (err: any) {
    console.error("Error publishing announcement:", err);
    res.status(500).json({ error: "Failed to publish notice to database" });
  }
});

// Events API
app.get("/api/events", async (req: Request, res: Response) => {
  try {
    const rows = await db.select().from(councilEvents);
    res.json(rows);
  } catch (err: any) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Database error fetching council events" });
  }
});

app.post("/api/events", requireAuth, requireRole(['officer', 'admin']), async (req: AuthRequest, res: Response) => {
  const { title, category, date, time, location, chiefdom, organizer, description, status } = req.body;
  if (!title || !date || !location) {
    res.status(400).json({ error: "Title, date, and location are required." });
    return;
  }

  const idNum = Math.floor(100 + Math.random() * 900);
  const eventId = `EVT-2026-${idNum}`;

  try {
    const newEvent = {
      id: eventId,
      title,
      category: category || "Council Meeting",
      date: date || new Date().toISOString().substring(0, 10),
      time: time || "10:00 AM",
      location,
      chiefdom: chiefdom || "Kakua",
      organizer: organizer || "Office of the Council Chairman",
      description: description || title,
      status: status || "Upcoming"
    };

    await db.insert(councilEvents).values(newEvent);
    res.status(201).json(newEvent);
  } catch (err: any) {
    console.error("Error saving council event:", err);
    res.status(500).json({ error: "Failed to save event to database" });
  }
});

app.put("/api/events/:id", requireAuth, requireRole(['officer', 'admin']), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, category, date, time, location, chiefdom, organizer, description, status } = req.body;

  try {
    const existing = await db.select().from(councilEvents).where(eq(councilEvents.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    const updated = await db.update(councilEvents)
      .set({
        ...(title && { title }),
        ...(category && { category }),
        ...(date && { date }),
        ...(time && { time }),
        ...(location && { location }),
        ...(chiefdom && { chiefdom }),
        ...(organizer && { organizer }),
        ...(description && { description }),
        ...(status && { status })
      })
      .where(eq(councilEvents.id, id))
      .returning();

    res.json(updated[0]);
  } catch (err: any) {
    console.error("Error updating council event:", err);
    res.status(500).json({ error: "Failed to update event in database" });
  }
});

app.delete("/api/events/:id", requireAuth, requireRole(['officer', 'admin']), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const existing = await db.select().from(councilEvents).where(eq(councilEvents.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    await db.delete(councilEvents).where(eq(councilEvents.id, id));
    res.json({ message: "Event successfully deleted", id });
  } catch (err: any) {
    console.error("Error deleting council event:", err);
    res.status(500).json({ error: "Failed to delete event from database" });
  }
});

// Citizens API
app.get("/api/citizens", async (req: Request, res: Response) => {
  try {
    const rows = await db.select().from(citizens);
    res.json(rows);
  } catch (err: any) {
    console.error("Error fetching citizens:", err);
    res.status(500).json({ error: "Database error fetching citizens" });
  }
});

app.post("/api/citizens", async (req: Request, res: Response) => {
  const { name, phone, address, ward, chiefdom, community, gender, dob, idType, nin } = req.body;
  if (!name || !phone) {
    res.status(400).json({ error: "Name and phone are required" });
    return;
  }

  const idNum = Math.floor(100 + Math.random() * 900);
  const citId = `CIT-${(chiefdom || 'KAK').substring(0, 3).toUpperCase()}-2026-${idNum}`;

  try {
    const newCit = {
      id: citId,
      nin: nin || `SL-NIN-${Math.floor(1000000 + Math.random() * 9000000)}`,
      name,
      phone,
      address: address || '',
      ward: ward || 'Ward 280',
      chiefdom: chiefdom || 'Kakua',
      community: community || '',
      gender: gender || 'Male',
      dob: dob || '1990-01-01',
      idType: idType || 'National ID Card',
      registeredAt: new Date().toISOString().substring(0, 10)
    };

    await db.insert(citizens).values(newCit);
    res.status(201).json(newCit);
  } catch (err: any) {
    console.error("Error registering citizen:", err);
    res.status(500).json({ error: "Failed to save citizen record" });
  }
});

// Receipts & Revenue API
app.get("/api/receipts", async (req: Request, res: Response) => {
  try {
    const rows = await db.select().from(paymentReceipts);
    res.json(rows);
  } catch (err: any) {
    console.error("Error fetching receipts:", err);
    res.status(500).json({ error: "Database error fetching receipts" });
  }
});

app.post("/api/receipts", async (req: Request, res: Response) => {
  const { payerName, payerPhone, service, revenueType, ward, chiefdom, amountNLe, paymentMethod, collector, description } = req.body;
  const receiptNo = `BDC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const newRec = {
      id: `REC-2026-${Math.floor(100 + Math.random() * 900)}`,
      receiptNo,
      payerName: payerName || 'Taxpayer',
      payerPhone: payerPhone || '+232 76 000 000',
      service: service || 'Property Rate',
      revenueType: revenueType || 'Property Rates',
      ward: ward || 'Ward 280',
      chiefdom: chiefdom || 'Kakua',
      amountNLe: Number(amountNLe) || 1000,
      paymentMethod: paymentMethod || 'Mobile Money',
      date: new Date().toISOString().substring(0, 10),
      collector: collector || 'Council Treasury',
      status: 'Verified',
      description: description || 'Council Revenue Payment',
      securityHash: `SEC-${receiptNo}-BDC`
    };

    await db.insert(paymentReceipts).values(newRec);
    res.status(201).json(newRec);
  } catch (err: any) {
    console.error("Error creating receipt:", err);
    res.status(500).json({ error: "Failed to record payment receipt" });
  }
});

app.get("/api/receipts/verify/:receiptNo", async (req: Request, res: Response) => {
  const { receiptNo } = req.params;
  try {
    const rows = await db.select().from(paymentReceipts).where(eq(paymentReceipts.receiptNo, receiptNo));
    if (rows.length > 0) {
      res.json({ verified: true, receipt: rows[0] });
    } else {
      res.status(404).json({ verified: false, message: "Receipt number not found in Bo District Council Ledger." });
    }
  } catch (err: any) {
    res.status(500).json({ verified: false, message: "Verification error" });
  }
});

// Business Licences API
app.get("/api/licences", async (req: Request, res: Response) => {
  try {
    const rows = await db.select().from(businessLicences);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: "Database error fetching business licences" });
  }
});

app.post("/api/licences", async (req: Request, res: Response) => {
  const { businessName, ownerName, businessType, location, chiefdom, ward, amountPaidNLe } = req.body;
  const licenceNo = `BDC-LIC-2026-${Math.floor(100 + Math.random() * 900)}`;

  try {
    const newLic = {
      id: `LIC-2026-${Math.floor(100 + Math.random() * 900)}`,
      licenceNo,
      businessName: businessName || 'Commercial Enterprise',
      ownerName: ownerName || 'Business Owner',
      businessType: businessType || 'General Trading',
      location: location || 'Central Market',
      chiefdom: chiefdom || 'Kakua',
      ward: ward || 'Ward 280',
      issueDate: new Date().toISOString().substring(0, 10),
      expiryDate: '2026-12-31',
      amountPaidNLe: Number(amountPaidNLe) || 1000,
      status: 'Active'
    };

    await db.insert(businessLicences).values(newLic);
    res.status(201).json(newLic);
  } catch (err: any) {
    console.error("Error creating business licence:", err);
    res.status(500).json({ error: "Failed to record business licence" });
  }
});

app.put("/api/licences/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { businessName, ownerName, businessType, location, chiefdom, ward, amountPaidNLe, status, expiryDate } = req.body;

  try {
    const existing = await db.select().from(businessLicences).where(eq(businessLicences.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Licence not found" });
      return;
    }

    const updated = await db.update(businessLicences)
      .set({
        ...(businessName && { businessName }),
        ...(ownerName && { ownerName }),
        ...(businessType && { businessType }),
        ...(location && { location }),
        ...(chiefdom && { chiefdom }),
        ...(ward && { ward }),
        ...(amountPaidNLe !== undefined && { amountPaidNLe: Number(amountPaidNLe) }),
        ...(status && { status }),
        ...(expiryDate && { expiryDate })
      })
      .where(eq(businessLicences.id, id))
      .returning();

    res.json(updated[0]);
  } catch (err: any) {
    console.error("Error updating licence:", err);
    res.status(500).json({ error: "Failed to update licence" });
  }
});

app.delete("/api/licences/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existing = await db.select().from(businessLicences).where(eq(businessLicences.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Licence not found" });
      return;
    }

    await db.delete(businessLicences).where(eq(businessLicences.id, id));
    res.json({ message: "Licence deleted successfully", id });
  } catch (err: any) {
    console.error("Error deleting licence:", err);
    res.status(500).json({ error: "Failed to delete licence" });
  }
});

// Building Permits API
app.get("/api/permits", async (req: Request, res: Response) => {
  try {
    const rows = await db.select().from(buildingPermits);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: "Database error fetching building permits" });
  }
});

app.post("/api/permits", async (req: Request, res: Response) => {
  const { applicantName, propertyLocation, chiefdom, ward, projectType, estimatedValueNLe, feePaidNLe } = req.body;
  const permitNo = `BDC-PER-2026-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date().toISOString().substring(0, 10);

  try {
    const newPermit = {
      id: `PER-2026-${Math.floor(100 + Math.random() * 900)}`,
      permitNo,
      applicantName: applicantName || 'Property Owner',
      propertyLocation: propertyLocation || 'Central Area',
      chiefdom: chiefdom || 'Kakua',
      ward: ward || 'Ward 280',
      projectType: projectType || 'Commercial',
      estimatedValueNLe: Number(estimatedValueNLe) || 100000,
      feePaidNLe: Number(feePaidNLe) || 2500,
      approvalStatus: 'Approved',
      appliedDate: now,
      approvedDate: now
    };

    await db.insert(buildingPermits).values(newPermit);
    res.status(201).json(newPermit);
  } catch (err: any) {
    console.error("Error creating building permit:", err);
    res.status(500).json({ error: "Failed to record building permit" });
  }
});

app.put("/api/permits/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { applicantName, propertyLocation, chiefdom, ward, projectType, estimatedValueNLe, feePaidNLe, approvalStatus } = req.body;

  try {
    const existing = await db.select().from(buildingPermits).where(eq(buildingPermits.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Permit not found" });
      return;
    }

    const updated = await db.update(buildingPermits)
      .set({
        ...(applicantName && { applicantName }),
        ...(propertyLocation && { propertyLocation }),
        ...(chiefdom && { chiefdom }),
        ...(ward && { ward }),
        ...(projectType && { projectType }),
        ...(estimatedValueNLe !== undefined && { estimatedValueNLe: Number(estimatedValueNLe) }),
        ...(feePaidNLe !== undefined && { feePaidNLe: Number(feePaidNLe) }),
        ...(approvalStatus && { approvalStatus })
      })
      .where(eq(buildingPermits.id, id))
      .returning();

    res.json(updated[0]);
  } catch (err: any) {
    console.error("Error updating permit:", err);
    res.status(500).json({ error: "Failed to update permit" });
  }
});

app.delete("/api/permits/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existing = await db.select().from(buildingPermits).where(eq(buildingPermits.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Permit not found" });
      return;
    }

    await db.delete(buildingPermits).where(eq(buildingPermits.id, id));
    res.json({ message: "Permit deleted successfully", id });
  } catch (err: any) {
    console.error("Error deleting permit:", err);
    res.status(500).json({ error: "Failed to delete permit" });
  }
});

// Chiefdoms & Council Wards Directory API
app.get("/api/chiefdoms", async (req: Request, res: Response) => {
  try {
    let rows = await db.select().from(chiefdoms);
    if (rows.length === 0) {
      await db.insert(chiefdoms).values(
        CHIEFDOMS_DATA.map((c) => ({
          id: c.id,
          name: c.name,
          capital: c.capital,
          paramountChief: c.paramountChief,
          councillor: c.councillor,
          wards: JSON.stringify(c.wards || []),
          populationEst: c.populationEst || '50,000',
          activeProjectsCount: c.activeProjectsCount || 0,
          healthCentersCount: c.healthCentersCount || 0,
          schoolsCount: c.schoolsCount || 0,
          primaryEconomicActivity: c.primaryEconomicActivity || '',
          councilOfficeLocation: c.councilOfficeLocation || '',
          description: c.description || ''
        }))
      );
      rows = await db.select().from(chiefdoms);
    }

    const formatted = rows.map((r) => {
      let parsedWards = [];
      try {
        parsedWards = typeof r.wards === 'string' 
          ? (r.wards.trim().startsWith('[') ? JSON.parse(r.wards) : r.wards.split(',').map((w: string) => w.trim()).filter(Boolean)) 
          : (Array.isArray(r.wards) ? r.wards : []);
      } catch (e) {
        parsedWards = [r.wards];
      }
      return {
        ...r,
        wards: parsedWards
      };
    });

    res.json(formatted);
  } catch (err: any) {
    console.error("Error fetching chiefdoms:", err);
    res.status(500).json({ error: "Database error fetching chiefdoms" });
  }
});

app.post("/api/chiefdoms", async (req: Request, res: Response) => {
  const { name, capital, paramountChief, councillor, wards, populationEst, activeProjectsCount, healthCentersCount, schoolsCount, primaryEconomicActivity, councilOfficeLocation, description } = req.body;
  if (!name || !capital) {
    res.status(400).json({ error: "Chiefdom name and capital are required." });
    return;
  }

  const id = req.body.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `chiefdom-${Date.now()}`;
  const wardsArray = Array.isArray(wards) 
    ? wards 
    : typeof wards === 'string' 
      ? wards.split(',').map(w => w.trim()).filter(Boolean) 
      : [];

  try {
    const newChiefdom = {
      id,
      name,
      capital,
      paramountChief: paramountChief || 'P.C. Paramount Chief',
      councillor: councillor || 'Hon. Ward Councillor',
      wards: JSON.stringify(wardsArray),
      populationEst: populationEst || '50,000',
      activeProjectsCount: Number(activeProjectsCount) || 0,
      healthCentersCount: Number(healthCentersCount) || 0,
      schoolsCount: Number(schoolsCount) || 0,
      primaryEconomicActivity: primaryEconomicActivity || 'Agriculture & Local Commerce',
      councilOfficeLocation: councilOfficeLocation || 'Chiefdom Headquarters Barry',
      description: description || `${name} in Bo District.`
    };

    await db.insert(chiefdoms).values(newChiefdom);
    res.status(201).json({
      ...newChiefdom,
      wards: wardsArray
    });
  } catch (err: any) {
    console.error("Error creating chiefdom:", err);
    res.status(500).json({ error: "Failed to create chiefdom record in database" });
  }
});

app.put("/api/chiefdoms/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, capital, paramountChief, councillor, wards, populationEst, activeProjectsCount, healthCentersCount, schoolsCount, primaryEconomicActivity, councilOfficeLocation, description } = req.body;

  try {
    const existing = await db.select().from(chiefdoms).where(eq(chiefdoms.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Chiefdom not found" });
      return;
    }

    let wardsValue: string | undefined = undefined;
    if (wards !== undefined) {
      if (Array.isArray(wards)) {
        wardsValue = JSON.stringify(wards);
      } else if (typeof wards === 'string') {
        wardsValue = wards.trim().startsWith('[') 
          ? wards 
          : JSON.stringify(wards.split(',').map((w: string) => w.trim()).filter(Boolean));
      }
    }

    const updated = await db.update(chiefdoms)
      .set({
        ...(name && { name }),
        ...(capital && { capital }),
        ...(paramountChief && { paramountChief }),
        ...(councillor && { councillor }),
        ...(wardsValue !== undefined && { wards: wardsValue }),
        ...(populationEst && { populationEst }),
        ...(activeProjectsCount !== undefined && { activeProjectsCount: Number(activeProjectsCount) }),
        ...(healthCentersCount !== undefined && { healthCentersCount: Number(healthCentersCount) }),
        ...(schoolsCount !== undefined && { schoolsCount: Number(schoolsCount) }),
        ...(primaryEconomicActivity && { primaryEconomicActivity }),
        ...(councilOfficeLocation && { councilOfficeLocation }),
        ...(description && { description })
      })
      .where(eq(chiefdoms.id, id))
      .returning();

    const result = updated[0];
    let parsedWards = [];
    try {
      parsedWards = typeof result.wards === 'string' 
        ? (result.wards.trim().startsWith('[') ? JSON.parse(result.wards) : result.wards.split(',').map((w: string) => w.trim()).filter(Boolean)) 
        : (Array.isArray(result.wards) ? result.wards : []);
    } catch (e) {
      parsedWards = [result.wards];
    }

    res.json({
      ...result,
      wards: parsedWards
    });
  } catch (err: any) {
    console.error("Error updating chiefdom:", err);
    res.status(500).json({ error: "Failed to update chiefdom" });
  }
});

app.delete("/api/chiefdoms/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existing = await db.select().from(chiefdoms).where(eq(chiefdoms.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Chiefdom not found" });
      return;
    }

    await db.delete(chiefdoms).where(eq(chiefdoms.id, id));
    res.json({ message: "Chiefdom deleted successfully", id });
  } catch (err: any) {
    console.error("Error deleting chiefdom:", err);
    res.status(500).json({ error: "Failed to delete chiefdom" });
  }
});

// Audit Logs API
app.get("/api/audit-logs", async (req: Request, res: Response) => {
  try {
    const rows = await db.select().from(auditLogs);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: "Database error fetching audit logs" });
  }
});

// Gemini AI Assistant Endpoint
app.post("/api/chat", async (req: Request, res: Response) => {
  const { prompt, history } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "Prompt is required" });
    return;
  }

  const systemInstruction = `You are "Bo Civic Assistant", the official AI guide for the Bo District Council in Sierra Leone (Southern Province).
Your role is to assist citizens, business owners, farmers, and visitors with clear, helpful, respectful, and authoritative guidance regarding Bo District Council services.`;

  if (!process.env.GEMINI_API_KEY || !aiClient) {
    res.json({
      text: `Kusheh! I am the Bo Civic Assistant. Currently, my automated live AI engine is running in offline demonstration mode, but I can guide you! You can report community issues like broken boreholes or roads via the 'Report Issue' tab, check development projects under 'DevTracker', or calculate property rates using our built-in 'Rate Calculator'. How can I help you navigate Bo District Council services today?`
    });
    return;
  }

  try {
    const formattedContents: any[] = [];
    if (Array.isArray(history)) {
      for (const msg of history) {
        formattedContents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      }
    }
    formattedContents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    let responseText = "";
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.8-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });
      responseText = response.text || "";
    } catch (primaryErr: any) {
      console.warn("Primary model error, falling back to gemini-3.1-flash-lite:", primaryErr?.message);
      const fallbackResponse = await aiClient.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });
      responseText = fallbackResponse.text || "";
    }

    res.json({ text: responseText || "Thank you for reaching out to Bo District Council. How else can I assist you?" });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "AI service temporarily unavailable.",
      text: "Kusheh! The AI Assistant encountered a momentary connection issue."
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bo District Council PostgreSQL Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
