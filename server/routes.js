import express from 'express';
import { Adherent, Bibliothecaire, Categorie, Livre, User, Emprunt } from './models.js';

const router = express.Router();

function crud(Model) {
  const r = express.Router();
  r.get('/', async (req, res, next) => {
    try {
      const items = await Model.find({}).lean();
      res.json(items);
    } catch (e) { next(e); }
  });
  r.get('/:id', async (req, res, next) => {
    try {
      const item = await Model.findById(req.params.id).lean();
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (e) { next(e); }
  });
  r.post('/', async (req, res, next) => {
    try {
      const created = await Model.create(req.body);
      res.status(201).json(created);
    } catch (e) { next(e); }
  });
  r.put('/:id', async (req, res, next) => {
    try {
      const updated = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
      if (!updated) return res.status(404).json({ error: 'Not found' });
      res.json(updated);
    } catch (e) { next(e); }
  });
  r.delete('/:id', async (req, res, next) => {
    try {
      const deleted = await Model.findByIdAndDelete(req.params.id).lean();
      if (!deleted) return res.status(404).json({ error: 'Not found' });
      res.json({ ok: true });
    } catch (e) { next(e); }
  });
  return r;
}

router.use('/adherents', crud(Adherent));
router.use('/bibliothecaires', crud(Bibliothecaire));
router.use('/categories', crud(Categorie));
router.use('/livres', crud(Livre));
router.use('/users', crud(User));
router.use('/emprunts', crud(Emprunt));

export default router;


