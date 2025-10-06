import mongoose from 'mongoose';

const baseOptions = {
  versionKey: false,
  timestamps: true
};

const AdherentSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String },
  telephone: { type: String }
}, baseOptions);

const BibliothecaireSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  poste: { type: String },
  email: { type: String }
}, baseOptions);

const CategorieSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String }
}, baseOptions);

const LivreSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  auteur: { type: String },
  annee: { type: Number },
  genre: { type: String },
  exemplaires: { type: Number, default: 1 }
}, baseOptions);

const UserSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff'], required: true },
  motDePasse: { type: String, required: true }
}, baseOptions);

const EmpruntSchema = new mongoose.Schema({
  id_adherent: { type: mongoose.Schema.Types.ObjectId, ref: 'Adherent', required: true },
  id_livre: { type: mongoose.Schema.Types.ObjectId, ref: 'Livre', required: true },
  date_emprunt: { type: String, required: true },
  date_retour: { type: String },
  statut: { type: String, enum: ['en_cours', 'retourne', 'en_retard'], default: 'en_cours' }
}, baseOptions);

export const Adherent = mongoose.model('Adherent', AdherentSchema);
export const Bibliothecaire = mongoose.model('Bibliothecaire', BibliothecaireSchema);
export const Categorie = mongoose.model('Categorie', CategorieSchema);
export const Livre = mongoose.model('Livre', LivreSchema);
export const User = mongoose.model('User', UserSchema);
export const Emprunt = mongoose.model('Emprunt', EmpruntSchema);


