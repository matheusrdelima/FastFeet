import * as Yup from 'yup';
import Deliverer from '../models/Deliverer';
import File from '../models/File';

class DelivererController {
  async index(req, res) {
    const deliverers = await Deliverer.findAll({
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path'],
        },
      ],
    });

    return res.json(deliverers);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const deliverer = await Deliverer.findOne({
      where: { email: req.body.email },
    });

    if (deliverer) {
      return res.status(400).json({ error: 'Deliverer already exists.' });
    }

    const { name, email } = await Deliverer.create(req.body);

    return res.json({
      name,
      email,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { email } = req.body;

    const deliverer = await Deliverer.findByPk(req.params.id);

    if (!deliverer) {
      return res.status(400).json({ error: 'Deliverer not found.' });
    }

    if (email && email !== deliverer.email) {
      const delivererExists = await Deliverer.findOne({
        where: { email: req.body.email },
      });

      if (delivererExists) {
        return res.status(400).json({ error: 'Deliverer already exists.' });
      }
    }

    const newDeliverer = await deliverer.update(req.body);

    return res.json(newDeliverer);
  }

  async delete(req, res) {
    const deliverer = await Deliverer.findByPk(req.params.id);

    if (!deliverer) {
      return res.status(400).json({ error: 'Deliverer not found.' });
    }

    await deliverer.destroy();

    return res.json();
  }
}

export default new DelivererController();
