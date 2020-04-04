import { Op } from 'sequelize';
import * as Yup from 'yup';
import Order from '../models/Order';
import File from '../models/File';

class DeliveryFinishController {
  async update(req, res) {
    const schema = Yup.object().shape({
      deliveryman_id: Yup.number().required(),
      date: Yup.date().required(),
      signature_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;
    const { deliveryman_id, date, signature_id } = req.body;

    const order = await Order.findOne({
      where: {
        id,
        deliveryman_id,
        start_date: {
          [Op.ne]: null,
        },
        end_date: null,
        canceled_at: null,
      },
    });

    if (!order) {
      return res.json({
        error: 'Order not found or Deliveryman does not permission.',
      });
    }

    order.end_date = date;

    const file = await File.findOne({
      where: {
        id: signature_id,
      },
    });

    if (file) {
      order.signature_id = file.id;
    }

    await order.save();

    return res.json(order);
  }
}

export default new DeliveryFinishController();
