import * as Yup from 'yup';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliverer from '../models/Deliverer';
import File from '../models/File';

import OrderMail from '../jobs/OrderMail';
import Queue from '../../lib/Queue';

class OrdersController {
  async index(req, res) {
    const orders = await Order.findAll({
      attributes: [
        'id',
        'product',
        'start_date',
        'end_date',
        'canceled_at',
        'deliveryman_id',
        'recipient_id',
        'signature_id',
      ],
      include: [
        {
          model: Deliverer,
          attributes: ['name', 'email'],
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
        {
          model: File,
          attributes: ['name', 'path'],
        },
      ],
    });

    return res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.json(401).json({ error: 'Recipient not found.' });
    }

    const deliveryman = await Deliverer.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.json(401).json({ error: 'Delivery man not found.' });
    }

    const newOrder = await Order.create({
      recipient_id,
      deliveryman_id,
      product,
    });

    await Queue.add(OrderMail.key, {
      product,
      deliveryman,
      recipient,
    });

    return res.json(newOrder);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      product: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(400).json({ error: 'Order not found.' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const updatedOrder = await order.update({
      recipient_id,
      deliveryman_id,
      product,
    });

    return res.json(updatedOrder);
  }

  async delete(req, res) {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(400).json({ error: 'Order not found.' });
    }

    await order.destroy();

    return res.json();
  }
}

export default new OrdersController();
