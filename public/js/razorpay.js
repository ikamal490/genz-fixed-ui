// razorpay.js - attach to cart buttons. Expects each product card to have a .pro element with a .des h4 price
document.addEventListener('DOMContentLoaded', function(){
  // helper to parse price like "₹2300" or "2300"
  function parsePrice(text){
    return parseInt(text.replace(/[^0-9]/g, '')) || 0;
  }

  document.querySelectorAll('.pro .cart').forEach(btn => {
    btn.addEventListener('click', async function(e){
      e.preventDefault();
      // find the parent .pro card
      const card = this.closest('.pro');
      if(!card) return;
      const priceEl = card.querySelector('.des h4');
      const titleEl = card.querySelector('.des h5');
      const amount = priceEl ? parsePrice(priceEl.textContent) : 100;
      const title = titleEl ? titleEl.textContent : 'GenZ Purchase';

      // create order on server
      const res = await fetch('/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amount, currency: 'INR', receipt: 'rcpt_' + Date.now() })
      });
      if(!res.ok){ alert('Unable to create order'); return; }
      const order = await res.json();

      // open razorpay checkout
      const options = {
        key: '<YOUR_RAZORPAY_KEY_ID>', // replace on server or set in HTML via templating
        amount: order.amount,
        currency: order.currency,
        name: 'GenZ Shop',
        description: title,
        order_id: order.id,
        handler: function (response){
          // Redirect to success page with payment details (for demo)
          const params = new URLSearchParams({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            amount: amount
          });
          window.location.href = '/payment/success?' + params.toString();
        },
        modal: { escape: true }
      };
      const rzp = new Razorpay(options);
      rzp.open();
    });
  });
});
