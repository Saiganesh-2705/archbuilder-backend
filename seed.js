import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Project from "./models/Project.js";
import Testimonial from "./models/Testimonial.js";

dotenv.config();
await connectDB();

const run = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@buildworks.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: "Site Admin",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
      });
      console.log(`Admin user created: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log("Admin user already exists, skipping.");
    }

    await Project.deleteMany({});
    await Project.insertMany([
      {
        title: "Cascade Ridge Villa",
        location: "Aspen, Colorado",
        category: "Residential",
        description:
          "A glass-and-timber mountain home designed to frame the surrounding peaks while staying rooted to its site. Four bedrooms, a double-height living room, and a heated motor court.",
        coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80",
        ],
        year: 2024,
        area: "4,200 sq ft",
        client: "Private Client",
        featured: true,
        stage: "For Sale",
      },
      {
        title: "Willow Creek Pavilion",
        location: "Austin, Texas",
        category: "Landscape",
        description:
          "An outdoor entertaining pavilion built around native limestone and drought-tolerant planting, with a wood-fired kitchen and sunken fire pit.",
        coverImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
        gallery: [],
        year: 2023,
        area: "1,800 sq ft",
        client: "Private Client",
        featured: true,
        stage: "Completed",
      },
      {
        title: "Harborline Offices",
        location: "Seattle, Washington",
        category: "Commercial",
        description:
          "A low-carbon office renovation that opens the workplace to daylight and the waterfront beyond, with cross-laminated timber ceilings throughout.",
        coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
        gallery: [],
        year: 2022,
        area: "12,000 sq ft",
        client: "Harborline Co.",
        featured: false,
        stage: "Completed",
      },
      {
        title: "Brindha Nagar Duplex",
        location: "Chengalpattu, Tamil Nadu",
        category: "Residential",
        description:
          "A 2BHK independent duplex with premium finishes, dedicated car parking, and a landscaped front yard — foundation work is complete and framing is underway.",
        coverImage: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1000&q=80",
        gallery: [],
        year: 2026,
        area: "1,650 sq ft",
        client: "Private Client",
        featured: true,
        stage: "Ongoing",
      },
      {
        title: "Vallam New Colony Rooftop",
        location: "Chengalpattu, Tamil Nadu",
        category: "Renovation",
        description:
          "Roof-level slab work and terrace finishing for an existing two-storey home, adding a rooftop lounge and solar-ready wiring.",
        coverImage: "https://images.unsplash.com/photo-1541976590-713941681591?auto=format&fit=crop&w=1000&q=80",
        gallery: [],
        year: 2026,
        area: "900 sq ft",
        client: "Private Client",
        featured: false,
        stage: "Ongoing",
      },
      {
        title: "Timberline Loft Interiors",
        location: "Denver, Colorado",
        category: "Interior",
        description:
          "Full interior fit-out: modular kitchen, false ceiling with cove lighting, and custom wardrobes across a three-bedroom loft conversion.",
        coverImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80",
        gallery: [],
        year: 2025,
        area: "2,100 sq ft",
        client: "Private Client",
        featured: false,
        stage: "Interior",
      },
      {
        title: "Sunrise Meadows Plots",
        location: "Chengalpattu, Tamil Nadu",
        category: "Landscape",
        description:
          "A highly anticipated upcoming residential plot development with planned roads, drainage, and landscaped common areas.",
        coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
        gallery: [],
        year: 2027,
        area: "8 acres",
        client: "BuildWorks Developments",
        featured: false,
        stage: "For Sale",
      },
    ]);
    console.log("Sample projects inserted.");

    await Testimonial.deleteMany({});
    await Testimonial.insertMany([
      {
        name: "Sarah Mitchell",
        role: "Homeowner, Aspen CO",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
        quote: "They shaped our home around the land instead of against it. Every room finds the view.",
        rating: 5,
      },
      {
        name: "David Chen",
        role: "Homeowner, Austin TX",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        quote: "Precise, on schedule, and honest about trade-offs the whole way through.",
        rating: 5,
      },
      {
        name: "Priya Nair",
        role: "Operations Lead, Harborline Co.",
        avatar: "https://randomuser.me/api/portraits/women/45.jpg",
        quote: "Our team's energy changed the moment we moved into the renovated space.",
        rating: 5,
      },
      {
        name: "Arun Kumar",
        role: "Homeowner, Chengalpattu",
        avatar: "https://randomuser.me/api/portraits/men/54.jpg",
        quote: "Clear updates every week and the site was always tidy. Handover was on the date they promised.",
        rating: 5,
      },
    ]);
    console.log("Sample testimonials inserted.");

    console.log("Seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

run();
