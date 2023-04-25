// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    // const causes = req.body.causes
    const { 
      payment_intent_id,
      first_name,
      last_name,
      email,
      address,
      suite,
      city,
      state_or_province,
      postal_code,
      country,
      stripe_customer_id,
      fees_covered,
    } = req.body

    let customer_id = stripe_customer_id

    if (customer_id === null) {
        const customer = await stripe.customers.create({
            name: first_name + ' ' + last_name,
            email: email,
            address: {
                line1: address,
                line2: suite,
                city: city,
                state: state_or_province,
                postal_code: postal_code,
                country: country
            }
        });

        customer_id = customer.id
    }


    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.update(payment_intent_id, 
        {
          metadata: { 
            address: address,
            suite: suite,
            city: city,
            state_or_province: state_or_province,
            postal_code: postal_code,
            country: country,
            first_name: first_name,
            last_name: last_name,
            email: email,
            fees_covered: fees_covered,
          },
          customer: customer_id,
        }
    );

    res.send({
      status: "success",
    });
  } catch (error) {
    res.status(500).json({ statusCode: 500, status: "error", error: error.message });
  }
};