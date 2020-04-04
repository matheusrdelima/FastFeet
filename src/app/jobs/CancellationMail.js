import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { product, deliveryman, recipient } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Encomenda Canceleda',
      template: 'cancellation',
      context: {
        name: deliveryman.name,
        product,
        recipient,
      },
    });
  }
}

export default new CancellationMail();
