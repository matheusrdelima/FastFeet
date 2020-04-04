import { Op } from 'sequelize';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliveryClosedController {
  async index(req, res) {
    const orders = await Order.findAll({
      attributes: ['id', 'product', 'start_date', 'end_date', 'canceled_at'],
      where: {
        deliveryman_id: req.params.id,
        end_date: {
          [Op.ne]: null,
        },
        canceled_at: null,
      },
      include: [
        {
          model: Recipient,
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zip_code',
          ],
        },
        {
          model: File,
          attributes: ['id', 'name', 'path'],
        },
      ],
    });

    return res.json(orders);
  }
}

export default new DeliveryClosedController();
