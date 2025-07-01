const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PORT = 8080;
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/payment-sheet", async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { amount } = req.body;

    const customer = await stripe.customers.create();

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },

      { apiVersion: "2025-05-28.basil" }
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "ngn",
      customer: customer.id,
      payment_method_types: ["card"],
    });

    res.status(200).json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log("server is running at port", PORT);
});
