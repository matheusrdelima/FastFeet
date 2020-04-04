import { Op } from 'sequelize';
import {
  startOfDay,
  endOfDay,
  parseISO,
  isBefore,
  isAfter,
  getHours,
} from 'date-fns';
import * as Yup from 'yup';
import Order from '../models/Order';

class DeliveryWithdrawController {
  async update(req, res) {
    const schema = Yup.object().shape({
      deliveryman_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;
    const { deliveryman_id, date } = req.body;

    const startHour = getHours(parseISO(date));

    if (
      isBefore(startHour, getHours(new Date().setHours(8))) ||
      isAfter(startHour, getHours(new Date().setHours(18)))
    ) {
      return res.status(401).json({ error: 'Hour not permited' });
    }

    const parsedDate = parseISO(date);

    const orders = await Order.findAll({
      where: {
        deliveryman_id,
        start_date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
    });

    if (orders.length >= 5) {
      return res
        .status(400)
        .json({ error: 'You have reached the withdrawal limit.' });
    }

    const order = await Order.findOne({
      where: {
        id,
        deliveryman_id,
        start_date: null,
        end_date: null,
        canceled_at: null,
      },
    });

    if (!order) {
      return res.json({
        error: 'Order not found or Deliveryman does not permission.',
      });
    }

    order.start_date = date;

    await order.save();

    return res.json(order);
  }
}

export default new DeliveryWithdrawController();
