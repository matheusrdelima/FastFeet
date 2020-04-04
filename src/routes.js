import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DelivererController from './app/controllers/DelivererController';
import OrdersController from './app/controllers/OrdersController';
import DeliveryClosedController from './app/controllers/DeliveryClosedController';
import DeliveryPendingController from './app/controllers/DeliveryPendingController';
import DeliveryWithdrawController from './app/controllers/DeliveryWithdrawController';
import DeliveryFinishController from './app/controllers/DeliveryFinishController';
import DeliveryProblemsController from './app/controllers/DeliveryProblemsController';

import FileController from './app/controllers/FileController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

routes.get('/deliverers', DelivererController.index);
routes.post('/deliverers', DelivererController.store);
routes.put('/deliverers/:id', DelivererController.update);
routes.delete('/deliverers/:id', DelivererController.delete);

routes.get('/orders', OrdersController.index);
routes.post('/orders', OrdersController.store);
routes.put('/orders/:id', OrdersController.update);
routes.delete('/orders/:id', OrdersController.delete);

routes.get('/delivery/:id/pending', DeliveryPendingController.index);
routes.get('/delivery/:id/closed', DeliveryClosedController.index);
routes.put('/delivery/:id/withdraw', DeliveryWithdrawController.update);
routes.put('/delivery/:id/finish', DeliveryFinishController.update);

routes.get('/delivery/problems', DeliveryProblemsController.index);
routes.get('/delivery/:id/problems', DeliveryProblemsController.show);
routes.post('/delivery/:id/problems', DeliveryProblemsController.store);
routes.delete(
  '/problem/:id/cancel-delivery',
  DeliveryProblemsController.delete
);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
