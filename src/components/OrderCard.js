// components/OrderCard.js (For both user/vendor)
const OrderCard = ({ order }) => (
  <div className="bg-white p-4 m-2 rounded shadow">
    <h3>Order #{order._id.slice(-6)}</h3>
    <p>Total: ₹{order.total}</p>
    <p>Status: {order.status}</p>
    <p>Pickup: {new Date(order.pickupTime).toLocaleTimeString()}</p>
  </div>
);

export default OrderCard;