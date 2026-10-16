import Contact from "../models/Contact.js";
import notifyAdmin from "../utils/notifyAdmin.js";

// @desc    Submit contact / project-inquiry form
// @route   POST /api/contact
export const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, projectType, message } = req.body;

    // Name plus at least a phone number or an email is enough to follow up
    // (the quote popup only asks for name + mobile; email is optional).
    if (!name || (!phone && !email)) {
      return res.status(400).json({ message: "Name and a mobile number or email are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const contact = await Contact.create({ name, email, phone, projectType, message });

    // Instant alert to the admin's phone (runs in background; never blocks the visitor)
    notifyAdmin(contact).catch((err) => console.error("[notify] error:", err.message));

    res.status(201).json({ message: "Thanks! We received your message and will be in touch soon.", contact });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact submissions
// @route   GET /api/contact
// @access  Private/Admin
export const getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id
// @access  Private/Admin
export const updateContactStatus = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!contact) return res.status(404).json({ message: "Submission not found" });
    res.json(contact);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a contact submission
// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: "Submission not found" });
    res.json({ message: "Submission deleted" });
  } catch (error) {
    next(error);
  }
};
