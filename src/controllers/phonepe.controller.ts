import axios from "axios";
import { Request, Response } from "express";

// Replace with your PhonePe sandbox/prod creds
const CLIENT_ID = process.env.PHONEPE_CLIENT_ID || "YOUR_CLIENT_ID";
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || "YOUR_CLIENT_SECRET";
const CLIENT_VERSION =
  process.env.PHONEPE_CLIENT_VERSION || "YOUR_CLIENT_VERSION";

// Get Auth Token
async function getAuthToken() {
  const resp = await axios.post(
    "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token",
    new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      client_version: CLIENT_VERSION,
      grant_type: "client_credentials",
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  return resp.data.access_token;
}

// Create Order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount, orderId } = req.body;
    const authToken = await getAuthToken();

    const redirectUrlBase =
      process.env.PHONEPE_REDIRECT_URL ||
      "https://yourdomain.com/payment-callback";
    // Always append orderId as query param
    const redirectUrl = `${redirectUrlBase}?orderId=${orderId}`;

    const resp = await axios.post(
      "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay",
      {
        merchantOrderId: orderId,
        amount: amount, // in paisa
        paymentFlow: {
          type: "PG_CHECKOUT",
          merchantUrls: {
            redirectUrl,
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${authToken}`,
        },
      }
    );
    res.json({ redirectUrl: resp.data.redirectUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// Webhook endpoint
export const phonepeWebhook = (req: Request, res: Response) => {
  console.log("PhonePe Webhook received:", req.body);
  // No DB logic yet
  res.sendStatus(200);
};

// Verify Order Status with PhonePe (using correct endpoint and headers)
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "YOUR_MERCHANT_ID";
async function verifyOrderStatus(orderId: string) {
  const authToken = await getAuthToken();
  const url = `https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/${orderId}/status?details=true&errorContext=true`;
  const resp = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `O-Bearer ${authToken}`,
      "X-MERCHANT-ID": MERCHANT_ID,
    },
  });
  return resp.data;
}

// Payment Callback Endpoint
export const paymentCallback = async (req: Request, res: Response) => {
  // Get orderId from query or body (PhonePe may append it as a query param)
  const orderId = req.query.orderId || req.body.orderId;
  if (!orderId) {
    return res.status(400).send("Missing orderId");
  }

  try {
    const statusResp = await verifyOrderStatus(orderId as string);

    // You can customize this HTML as needed
    if (statusResp.success && statusResp.data.status === "PAYMENT_SUCCESS") {
      res.send(`
        <html>
          <body>
            <h2>Payment Successful!</h2>
            <script>
              // If loaded in WebView, you can postMessage to React Native here
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage('PAYMENT_SUCCESS');
            </script>
          </body>
        </html>
      `);
    } else {
      res.send(`
        <html>
          <body>
            <h2>Payment Failed or Pending.</h2>
            <script>
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage('PAYMENT_FAILED');
            </script>
          </body>
        </html>
      `);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};
