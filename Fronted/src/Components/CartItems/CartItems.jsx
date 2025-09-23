import { useContext } from 'react';
import './CartItems.css';
import { AppContext } from '../../context/AppContext';


const CartItems = () => {
   const {cartItems,removeFromCart,updateQuantity} = useContext(AppContext);
   console.log("from cart items component", cartItems);
   return(
     <div className="p-3 h-100 overflow-y-auto">
      {cartItems.length === 0 ? (
         <p className="text-light">
            your cart is empty.
         </p>
      ):(
         <div className="cart-items-list">
            {cartItems.map((item,index)=> (
            <div key={index} className="cart-item mb-3 p-3 bg-dark rounded">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0 text-light">{item.name}</h6>
                  <p className="mb-0 text-light">
                     &#x20B9;{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="d-flex justify-content-between align-item-center">
                  <div className="d-flex align-items-center gap-2">
                     <button className="btn btn-danger btn-sm" disabled={item.quantity === 1} onClick={()=> updateQuantity(item.itemId,item.quantity-1)}>
                        <i className="bi bi-dash"></i>
                     </button>
                     <span className="text-light">{item.quantity}</span>
                     <button className='btn btn-primary btn-sm' onClick={()=> updateQuantity(item.itemId,item.quantity + 1)}>
                        <i className="bi bi-plus"></i>
                     </button>
                  </div>
                  <button className="btn btn-danger btn-sm" style={{width:"auto"}} onClick={()=> removeFromCart(item.itemId)} >
                     <i className="bi bi-trash"></i>
                  </button>
                </div>
            </div>
            ))}
         </div>
      )}
     </div>
   )
}

export default CartItems;