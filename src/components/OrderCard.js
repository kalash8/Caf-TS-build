const OrderCard = ({ order }) => (
  <div className="bg-white p-4 m-2">
    <h3>Order #{order._id.slice(-6)}</h3>
    <p>Total: ₹{order.total}</p>
    <p>Status: {order.status}</p>
    <div className="mt-2">
        <h4 className="font-semibold">Items:</h4>
        {order.items.map((it) => (
          <p key={it._id}>
            {it.menuItemId
              ? `${it.menuItemId.name} (x${it.quantity})`
              : `Item removed (x${it.quantity})`}
          </p>
        ))}
      </div>
    <p  className="font-semibold">Pickup: {new Date(order.pickupTime).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })}</p>
  </div>
);

export default OrderCard;