"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import NavbarUser from "../../components/NavbarUser";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function CartPopup({ items, selected, addToOrder, removeFromOrder, calculateTotal, onClose, onProceed }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl mb-2 rounded-t-lg max-h-[80vh] overflow-y-auto transition-transform duration-300 transform translate-y-0 z-50">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Final Check</h2>
          <button onClick={onClose} className="text-gray-600 font-bold">×</button>
        </div>
        {selected.length === 0 ? (
          <p className="text-gray-600">Empty cart looks lonely</p>
        ) : (
          selected.map(sel => {
            const item = items.find(i => i._id === sel.menuItemId);
            if (!item) return null;
            return (
              <div key={sel.menuItemId} className="flex justify-between items-center border-b py-2">
                <span>{item.name} x {sel.quantity}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => removeFromOrder(sel.menuItemId)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >−</button>
                  <button
                    onClick={() => addToOrder(item)}
                    className="px-2 py-1 bg-blue-500 text-white rounded"
                  >+</button>
                  <span className="ml-2">₹{(item.price * sel.quantity).toFixed(2)}</span>
                </div>
              </div>
            );
          })
        )}
        {selected.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold">Total: ₹{calculateTotal().toFixed(2)}</p>
            <button
              onClick={onProceed}
              className="w-full bg-green-600 text-white p-2 mt-2 rounded"
            >
              Proceed to Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserMenu() {
  const [items, setItems] = useState([]);
  const [groupedItems, setGroupedItems] = useState({});
  const [vendors, setVendors] = useState([]);
  const [openVendors, setOpenVendors] = useState(new Set());
  const [selected, setSelected] = useState([]);
  const [pickupTime, setPickupTime] = useState(new Date());
  const [showCart, setShowCart] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(true);

  const router = useRouter();

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/user/login");
      return;
    }
    const decoded = jwtDecode(token);
    if (decoded.role !== "user") {
      alert("Access denied. Login as user.");
      localStorage.removeItem("token");
      router.push("/user/login");
      return;
    }

    try {
      const vendorsRes = await axios.get("/api/vendors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(vendorsRes.data);

      const today = new Date().toISOString().split("T")[0];
      const menuRes = await axios.get(`/api/menu?date=${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems(menuRes.data);
      const grouped = menuRes.data.reduce((acc, item) => {
        const vid = item.vendorId._id;
        if (!acc[vid]) acc[vid] = [];
        acc[vid].push(item);
        return acc;
      }, {});
      setGroupedItems(grouped);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const toggleVendor = (id) => {
    setOpenVendors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const addToOrder = (item) => {
    const existing = selected.find((s) => s.menuItemId === item._id);
    if (existing) {
      existing.quantity += 1;
      setSelected([...selected]);
    } else {
      setSelected([...selected, { menuItemId: item._id, quantity: 1 }]);
    }
  };

  const removeFromOrder = (menuItemId) => {
    const existingIndex = selected.findIndex((s) => s.menuItemId === menuItemId);
    if (existingIndex === -1) return;
    const newSelected = [...selected];
    if (newSelected[existingIndex].quantity > 1) {
      newSelected[existingIndex].quantity -= 1;
    } else {
      newSelected.splice(existingIndex, 1);
    }
    setSelected(newSelected);
  };

  const calculateTotal = () => {
    return selected.reduce((sum, sel) => {
      const item = items.find((i) => i._id === sel.menuItemId);
      return sum + (item ? item.price * sel.quantity : 0);
    }, 0);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const token = localStorage.getItem("token");
    const total = calculateTotal();
    if (total === 0 || selected.length === 0) return alert("Select items");

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) return alert("Razorpay SDK failed to load");

      const { data: { key } } = await axios.get("/api/payment/key", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { data: { orderId, amount } } = await axios.post(
        "/api/payment/create-order",
        { amount: total },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key,
        amount,
        currency: "INR",
        name: "Cafeteria App",
        description: "Pre-order payment",
        order_id: orderId,
        handler: async (response) => {
          try {
            await axios.post(
              "/api/payment/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                items: selected,
                pickupTime,
                total,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Payment successful! Order created.");
            setSelected([]);
            setShowCart(false);
            setShowOrderSummary(true);
            router.push("/user/track");
          } catch (err) {
            alert("Payment verification failed");
            setShowOrderSummary(true);
          }
        },
        prefill: {
          name: "User",
          email: localStorage.getItem("email") || "user@cafeteria.com",
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment initiation failed");
      setShowOrderSummary(true);
    }
  };

  return (
    <div>
      <NavbarUser />
      <div className="p-4 pt-24">
        <h1 className="text-2xl font-bold text-center mb-4">What's Cooking</h1>

        {/* Pickup Time */}
        <div className="mt-6">
          <label className="block mb-2 text-lg text-center font-semibold text-gray-700">
            Pick Your Time to Grab Your Food! 🍽️
          </label>
          <div className="relative">
            <DatePicker
              selected={pickupTime}
              onChange={(date) => setPickupTime(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 bg-white text-gray-800"
              placeholderText="Select pickup time"
              minDate={new Date()}
              popperClassName="custom-datepicker-popper"
              wrapperClassName="w-full"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600">📅</span>
          </div>
        </div>

        {/* Vendor Items */}
        {vendors.map((vendor) => (
          <div key={vendor._id} className="mt-4">
            <button
              className="p-2 w-full flex rounded-2xl shadow-lg h-25 font-bold text-white border-1 border-[#000000]"
              onClick={() => toggleVendor(vendor._id)}
              style={{
                backgroundImage: `url('/Assets/cardbg.jpg')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {vendor.name} {openVendors.has(vendor._id)}
            </button>
            {openVendors.has(vendor._id) && (
              <div className="mt-2">
                {(groupedItems[vendor._id] || []).length > 0 ? (
                  groupedItems[vendor._id].map((item) => {
                    const selectedItem = selected.find((s) => s.menuItemId === item._id);
                    const quantity = selectedItem ? selectedItem.quantity : 0;
                    return (
                      <div
                        key={item._id}
                        className="bg-white p-4 m-2 rounded flex justify-between items-center"
                      >
                        <div>
                          <h3 className="font-bold">{item.name}</h3>
                          <p>{item.description}</p>
                          <p className="text-green-600">₹{item.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => removeFromOrder(item._id)}
                            className="px-2 py-1 bg-red-500 text-white rounded"
                            disabled={quantity === 0}
                          >−</button>
                          <span>{quantity}</span>
                          <button
                            onClick={() => addToOrder(item)}
                            className="px-2 py-1 bg-blue-500 text-white rounded"
                          >+</button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-600">No items available today from this stall.</p>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Order Summary */}
        {selected.length > 0 && showOrderSummary && (
          <div className="bg-white p-4 rounded shadow mt-4">
            <h2 className="text-lg font-bold mb-2">Order Summary</h2>
            {selected.map((sel) => {
              const item = items.find((i) => i._id === sel.menuItemId);
              if (!item) return null;
              return (
                <div
                  key={sel.menuItemId}
                  className="flex justify-between items-center border-b py-2"
                >
                  <span>
                    {item.name} x {sel.quantity}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => removeFromOrder(sel.menuItemId)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      −
                    </button>
                    <button
                      onClick={() => addToOrder(item)}
                      className="px-2 py-1 bg-blue-500 text-white rounded"
                    >
                      +
                    </button>
                    <span className="ml-2">
                      ₹{(item.price * sel.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
            <p className="font-semibold mt-4">
              Total: ₹{calculateTotal().toFixed(2)} ({selected.length} items)
            </p>
            <button
              onClick={() => {
                setShowCart(true);
                setShowOrderSummary(false);
              }}
              className="w-full bg-green-600 text-white p-2 mt-2 rounded"
            >
              Pay & Order
            </button>
          </div>
        )}

        {/* Cart Popup */}
        {showCart && (
          <CartPopup
            items={items}
            selected={selected}
            addToOrder={addToOrder}
            removeFromOrder={removeFromOrder}
            calculateTotal={calculateTotal}
            onClose={() => {
              setShowCart(false);
              setShowOrderSummary(true);
            }}
            onProceed={handlePayment}
          />
        )}
      </div>
    </div>
  );
}
