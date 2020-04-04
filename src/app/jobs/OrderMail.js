import Mail from '../../lib/Mail';

class OrderMail {
  get key() {
    return 'OrderMail';
  }

  async handle({ data }) {
    const { product, deliveryman, recipient } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Novo Produto para retirada',
      template: 'order',
      context: {
        name: deliveryman.name,
        product,
        recipient,
      },
    });
  }
}

export default new OrderMail();
