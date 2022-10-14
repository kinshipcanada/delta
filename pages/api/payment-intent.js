// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

function parseCauses(causes) {
  let parsedCauses = [];

  causes.forEach((cause) => {
    parsedCauses.push({
      id: cause.id,
      name: cause.name,
    })
  });

  return parsedCauses;
}
export default async function handler(req, res) {
  try {
    // const causes = req.body.causes
    const { amount, causes } = req.body

    const parsedCauses = parseCauses(causes);

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount),
      metadata: { 
        causes: JSON.stringify(parsedCauses)
      },
      currency: "cad",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message });
  }
};