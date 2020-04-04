import DeliveryProblems from '../models/DeliveryProblems';
import Order from '../models/Order';
import DeliveryMan from '../models/Deliverer';
import Recipient from '../models/Recipient';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class DeliveryProblemsController {
  async index(req, res) {
    const problems = await DeliveryProblems.findAll({
      attributes: ['id', 'description'],
      include: [
        {
          attributes: [
            'id',
            'product',
            'start_date',
            'end_date',
            'canceled_at',
          ],
          model: Order,
        },
      ],
    });

    return res.json(problems);
  }

  async show(req, res) {
    const problems = await DeliveryProblems.findAll({
      delivery_id: req.params.id,
      attributes: ['id', 'description'],
      include: [
        {
          attributes: [
            'id',
            'product',
            'start_date',
            'end_date',
            'canceled_at',
          ],
          model: Order,
        },
      ],
    });

    if (!problems) {
      return res.status(400).json({ error: 'Problem not found.' });
    }

    return res.json(problems);
  }

  async store(req, res) {
    const { id: delivery_id } = req.params;
    const order = await Order.findByPk(delivery_id);

    if (!order) {
      return res.status(400).json({ error: 'Order not found.' });
    }

    const { description } = req.body;

    const newProblem = await DeliveryProblems.create({
      description,
      delivery_id,
    });

    return res.json(newProblem);
  }

  async delete(req, res) {
    const order = await Order.findOne({
      attributes: ['id', 'product'],
      where: {
        id: req.params.id,
        end_date: null,
        canceled_at: null,
      },
      include: [
        {
          model: DeliveryMan,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Recipient,
          attributes: [
            'name',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zip_code',
          ],
        },
      ],
    });

    if (!order) {
      return res.status(400).json({ error: 'Order not found.' });
    }

    order.canceled_at = new Date();

    order.save();

    await Queue.add(CancellationMail.key, {
      product: order.product,
      deliveryman: order.Deliverer,
      recipient: order.Recipient,
    });

    return res.json(order);
  }
}

export default new DeliveryProblemsController();
