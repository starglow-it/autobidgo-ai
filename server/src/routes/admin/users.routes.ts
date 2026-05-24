import { Router } from 'express';
import {
  listUsers,
  createUser,
  getUserById,
  updateUser,
  resetPassword,
  disableUser,
  enableUser
} from '../../controllers/admin/users.controller.js';

export const adminUsersRoutes = Router();

adminUsersRoutes.get('/', listUsers);
adminUsersRoutes.post('/', createUser);
adminUsersRoutes.get('/:id', getUserById);
adminUsersRoutes.put('/:id', updateUser);
adminUsersRoutes.post('/:id/reset-password', resetPassword);
adminUsersRoutes.post('/:id/disable', disableUser);
adminUsersRoutes.post('/:id/enable', enableUser);
