import { useContext,useState } from 'react';
import './CartSummary.css';
import { AppContext } from '../../context/AppContext';
import { deleteOrder,createOrder,latestOrders } from "/Users/shreeshailmiragi/Desktop/Billing-software/Fronted/src/Service/OrderService.js"; 
import toast from 'react-hot-toast';
import { createRazorpayOrder, verifyPayment } from '../../Service/PaymentService';
import { AppConstants } from '../../Util/constants';
import ReceiptPopup from "/Users/shreeshailmiragi/Desktop/Billing-software/Fronted/src/Components/ReceiptPopup/ReceiptPopup.jsx";



const CartSummary = ({customerName,mobileNumber,setMobileNumber,setCustomerName}) => {
    const { cartItems,clearCart} = useContext(AppContext);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const totalAmount = cartItems.reduce((total,item)=> total + item.price * item.quantity,0);
    const tax = totalAmount * 0.01;
    const grandTotal = totalAmount + tax;

    const clearAll = () => {

        setCustomerName("");
        setMobileNumber("");
        clearCart();
    }

    const placeOrder = () =>{
        setShowPopup(true);
        clearAll();
    }

    const handlePrintReceipt = () => {
        window.print();
    }
    const loadRazorpayScript = () => {
        return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    })
    }

    const deleteOrderOnFailure = async (orderId) => {
        try {
            await deleteOrder(orderId);
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong")
        }
    }

    const completePayment = async (paymentMode) => {
        if (!customerName || !mobileNumber) {
            toast.error("Please enter customer details");
            return;
        }

        if (cartItems.lenght === 0) {
            toast.error("Your cart is empty");
            return;
        }
        const orderData = {
                customerName,
                phoneNumber: mobileNumber,
                cartItems,
                subtotal: totalAmount,
                tax,
                grandTotal,
                paymentMethod: paymentMode.toUpperCase()
        }

        setIsProcessing(true);
        try {
            const response = await createOrder(orderData);
            const savedData = response.data;
            if (response.status === 201 && paymentMode === "cash") {
                toast.success("Cash received");
                setOrderDetails(savedData)
            } else if (response.status === 201 && paymentMode === "upi") {
                const razorpayLoaded = await loadRazorpayScript();
                if (!razorpayLoaded) {
                    toast.error("unable to load razorpay");
                    await deleteOrderOnFailure(savedData.orderId);
                    return;
                }
                //creatte razorpay order
                const razorpayResponse = await createRazorpayOrder({ amount: grandTotal, currency: 'INR' });
                const options = {
                    key: AppConstants.RAZORPAY_KEY_ID,
                    amount: razorpayResponse.data.amount,
                    currency: razorpayResponse.data.currency,
                    order_id: razorpayResponse.data.id,
                    name: "MY Retail Shop",
                    description: "Order payment",
                    handler: async function (response) {
                       await verifyPaymentHandler(response, savedData);
                    },
                    prefill: {
                        name: customerName,
                        contact: mobileNumber
                    },
                    theme: {
                        color: "#3399cc"
                    },
                    modal: {
                        ondismis: async () => {
                            await deleteOrderOnFailure(savedData.orderId);
                            toast.error("Payment cancelled");
                        }
                    },
                }; 
                const rzp = new window.Razorpay(options);
                rzp.on("Payment.failed", async (response) => {
                    await deleteOrderOnFailure(savedData.orderId);
                    toast.error("Payment failed");
                    console.error(response.error.description);
                });
                rzp.open();
            }
        } catch (error) {
            console.error(error);
            toast.error("Payment processing failed");
        } finally {
            setIsProcessing(false);
        }

    }
    const verifyPaymentHandler = async (response, savedOrder) => {
        const paymentData = {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId: savedOrder.orderId
        };
        try {
            const paymentResponse = await verifyPayment(paymentData);
            if (paymentResponse.status === 200) {
                toast.success("Payment successful");
                setOrderDetails({
                    ...savedOrder,
                    paymentDetails: {
                        razorpayOrderId: response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature
                    },

                });
            } else {
                toast.error("Payment processing failed");
            }

        } catch (error) {
            console.error(error);
            toast.error("Payment failed");
        }
    };

    return(
        <div className="mt-2">
            <div className="cart-summary-details">
                <div className="d-flex justify-content-between mb-2">
                    <span className="text-light">Item: </span>
                    <span className="text-light">&#x20B9;{totalAmount.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                    <span className="text-light">Tax (1%):</span>
                    <span className="text-light">&#x20B9;{tax.toFixed(2)} </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                    <span className="text-light">Total:</span>
                    <span className="text-light">&#x20B9;{grandTotal.toFixed(2)} </span>
                </div>
            </div>
  
             <div className="d-flex gap-3">
                <button className="btn btn-success flex-grow-1" onClick={() => completePayment("cash")} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Cash"}
                </button>
                 <button className="btn btn-primary flex-grow-1" onClick={() => completePayment("upi")} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "UPI"}
                </button>
            </div>
            <div className="d-flex gap-3 mt-3">
                <button className="btn btn-warning flex-grow-1" onClick={placeOrder} disabled={isProcessing || !orderDetails}>
                    Place Order
                </button>
            </div>
            {
                showPopup && (
                    <ReceiptPopup
                        orderDetails={{
                            ...orderDetails,
                            razorpayOrderId: orderDetails.paymentDetails?.razorpayOrderId,
                            razorpayPaymentId:orderDetails.paymentDetails?.razorpayPaymentId,
                        }}
                        onClose={() => setShowPopup(false)}
                        onPrint={handlePrintReceipt}
                    />
                )
             }
        </div>
    )
}


export default CartSummary;
