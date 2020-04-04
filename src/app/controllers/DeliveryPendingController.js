import Order from '../models/Order';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliveryPendingController {
  async index(req, res) {
    const orders = await Order.findAll({
      attributes: ['id', 'product'],
      where: {
        deliveryman_id: req.params.id,
        end_date: null,
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

export default new DeliveryPendingController();
