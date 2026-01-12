import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true }, // Ej: "Madrid, ES" o "Remoto"
  type: { type: String, default: 'Full-time' }, // Ej: Full-time, Contract, Freelance
  logoUrl: { type: String }, // URL del logo de la empresa
  salaryMin: { type: Number },
  salaryMax: { type: Number },
  period: { type: String, default: 'Anual' }, // Mensual, Anual, Hora
  description: { type: String },
  tags: [String], // Ej: ["React", "Node", "Senior"]
  category: { type: String }, // Ej: "Desarrollo", "Diseño"
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Job || mongoose.model('Job', JobSchema);