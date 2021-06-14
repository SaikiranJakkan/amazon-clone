import { buffer } from "micro";
import * as admin from "firebase-admin";

// Secure a connection to FIREBASE from the backend
const serviceAccount = require("../../../permissions.json");
serviceAccount.type = process.env.FIREBASE_ADMIN_TYPE;
serviceAccount.project_id = process.env.FIREBASE_ADMIN_PROJECT_ID;
serviceAccount.private_key_id = process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID;
serviceAccount.private_key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
serviceAccount.client_email = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
serviceAccount.client_id = process.env.FIREBASE_ADMIN_CLIENT_ID;
serviceAccount.auth_uri = process.env.FIREBASE_AUTH_URI;
serviceAccount.token_uri = process.env.FIREBASE_ADMIN_TOKEN_URI;
serviceAccount.auth_provider_x509_cert_url = process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL;
serviceAccount.client_x509_cert_url = process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL;

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

//Establish connection to Stripe
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_SIGNING_SECRET;

const fulfillOrder = async (session) => {
  console.log("Fulfilling order", session);

  return app
    .firestore()
    .collection("users")
    .doc(session.metadata.email)
    .collection("orders")
    .doc(session.id)
    .set({
      amount: session.amount_total / 100,
      amount_shipping: session.total_details.amount_shipping / 100,
      images: JSON.parse(session.metadata.images),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      console.log(`SUCCESS: Order ${session.id} had been added to the DB`);
    });
};

export default async (req, res) => {
  if (req.method === "POST") {
    const requestBuffer = await buffer(req);

    const payload = requestBuffer.toString();
    const sig = req.headers["stripe-signature"];

    let event;

    //Verify that the EVENT posted came from stripe
    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      console.log("ERROR", err.message);
      return res.status(400).send(`Webhook error: ${error.message}`);
    }

    //If it gets past the above phase,then the evnt is legit.
    //Handle the checkout
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      //Fulfill the order
      return fulfillOrder(session)
        .then(() => res.status(200))
        .catch((err) => res.status(400).send(`Webhook Error: ${err.message}`));
    }
  }
};

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    }
}
