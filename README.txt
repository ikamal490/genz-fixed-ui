GenZ Shop with Razorpay (test-mode)
----------------------------------
How it works:
- Server serves your frontend from /public
- Clicking any product's cart icon (the round cart button) will create a Razorpay test order
  and open the Razorpay Checkout popup.
- After demo payment, you'll be redirected to /payment/success showing payment details.

Setup:
1. cd genz-shop-razorpay
2. npm install
3. copy .env.example to .env and add your Razorpay test keys:
   RAZORPAY_KEY_ID=rzp_test_XXXX
   RAZORPAY_KEY_SECRET=XXXX
4. npm run dev
5. Open http://localhost:5000

Notes:
- The frontend JS uses a placeholder '<YOUR_RAZORPAY_KEY_ID>' in public/js/razorpay.js.
  After setting .env, edit public/js/razorpay.js and replace '<YOUR_RAZORPAY_KEY_ID>' with your test key id,
  or serve a templated page to inject it dynamically (I kept it simple for now).
