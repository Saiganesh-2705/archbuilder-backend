import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Residential", "Commercial", "Landscape", "Renovation", "Interior"],
    },
    description: { type: String, required: true },
    coverImage: { type: String, required: true },
    gallery: [{ type: String }],
    year: { type: Number },
    area: { type: String },
    client: { type: String },
    featured: { type: Boolean, default: false },
    // Drives the tab filter on the Projects page (Ongoing / Completed / For Sale / Interior)
    stage: {
      type: String,
      enum: ["Ongoing", "Completed", "For Sale", "Interior"],
      default: "Completed",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
