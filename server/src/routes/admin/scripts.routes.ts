import { Router } from 'express';
import { listScripts, createScript, getScript, updateScript, deactivateScript } from '../../controllers/admin/scripts.controller.js';

export const adminScriptsRoutes = Router();

adminScriptsRoutes.get('/', listScripts);
adminScriptsRoutes.post('/', createScript);
adminScriptsRoutes.get('/:id', getScript);
adminScriptsRoutes.put('/:id', updateScript);
adminScriptsRoutes.delete('/:id', deactivateScript);
