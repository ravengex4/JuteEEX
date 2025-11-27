import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { TrashIcon, HeartIcon, MinusIcon, PlusIcon, CreditCardIcon, MapPinIcon, CheckCircleIcon } from '../components/Icons';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, addToWishlist } = useApp();
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  const handleMoveToWishlist = (item: any) => {
    addToWishlist(item);
    removeFromCart(item.id);
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
        setIsCheckingOut(false);
        setShowSuccess(true);
        setTimeout(() => {
            navigate('/');
        }, 3000);
    }, 2000);
  };

  const handleAddAddress = () => {
      // Mock functionality for MVP
      alert("This would open a modal to add a new delivery address.");
  };

  const addresses = [
    { id: 1, label: 'Home', text: '12/B, Jute Mill Road, Kolkata, WB - 700001' },
    { id: 2, label: 'Farm', text: 'Plot 45, Green Valley Sector, Bardhaman, WB - 713101' }
  ];

  const getCategoryIcon = (category: string) => {
    if (category === 'SEED') return '🌱';
    if (category === 'PESTICIDE') return '🧪';
    if (category === 'TOOL') return '🔧';
    if (category === 'JUTE_SALE') return '🧺';
    return '📦';
  };

  const getCategoryStyles = (category: string) => {
    switch(category) {
      case 'SEED': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400';
      case 'PESTICIDE': return 'bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400';
      case 'TOOL': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'JUTE_SALE': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-500';
    }
  };

  if (showSuccess) {
      return (
          <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-fade-in">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-500 mb-6">
                  <CheckCircleIcon size={64} />
              </div>
              <h2 className="text-3xl font-bold mb-2">Order Placed!</h2>
              <p className="text-gray-500 text-center max-w-xs mb-8">Your order has been confirmed and will be shipped within 24 hours.</p>
              <div className="bg-gray-100 dark:bg-white/10 px-6 py-3 rounded-xl font-mono font-bold text-lg tracking-widest">
                  ORD-{Math.floor(Math.random() * 1000000)}
              </div>
          </div>
      );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-20 h-20 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center text-gray-400 mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8">Add some items from the marketplace to get started.</p>
        <button onClick={() => navigate('/market')} className="bg-jute-black dark:bg-white dark:text-black text-white px-8 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform">
            Go to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-32 pt-4 md:pt-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/market')} className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/20 transition-colors">
          ←
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Shopping Cart <span className="text-gray-400 ml-2 text-lg font-normal">({cart.length} items)</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-jute-paper dark:bg-jute-darkPaper p-4 rounded-3xl shadow-sm border border-black/5 dark:border-white/5 flex gap-4 items-start group">
              <div className={`w-24 h-24 rounded-2xl shrink-0 flex items-center justify-center text-3xl ${getCategoryStyles(item.category)}`}>
                 {getCategoryIcon(item.category)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg leading-tight mb-1">{item.name}</h3>
                        <div className="text-xs text-gray-500 uppercase tracking-widest">{item.category}</div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 p-2 -mr-2 transition-colors">
                        <TrashIcon size={20} />
                    </button>
                </div>

                <div className="flex items-end justify-between mt-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-gray-100 dark:bg-black/20 rounded-xl p-1">
                            <button 
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <MinusIcon size={16} />
                            </button>
                            <span className="w-8 text-center font-bold font-mono">{item.quantity}</span>
                            <button 
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <PlusIcon size={16} />
                            </button>
                        </div>
                        <button onClick={() => handleMoveToWishlist(item)} className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                            <HeartIcon size={14} /> Move to Wishlist
                        </button>
                    </div>
                    <div className="font-mono font-bold text-xl">₹{item.price * item.quantity}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Sidebar */}
        <div className="space-y-6">
            {/* Address Selection */}
            <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-white/5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <MapPinIcon size={20} /> Delivery Address
                </h3>
                <div className="space-y-3">
                    {addresses.map(addr => (
                        <div 
                            key={addr.id}
                            onClick={() => setSelectedAddress(addr.id)}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddress === addr.id ? 'border-jute-darkBlue bg-blue-50 dark:bg-blue-900/10' : 'border-transparent bg-gray-50 dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-sm uppercase tracking-wider">{addr.label}</span>
                                {selectedAddress === addr.id && <div className="w-4 h-4 bg-jute-darkBlue rounded-full" />}
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{addr.text}</p>
                        </div>
                    ))}
                    <button 
                        onClick={handleAddAddress}
                        className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10 text-gray-400 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                    >
                        <PlusIcon size={14} /> Add New Address
                    </button>
                </div>
            </div>

            {/* Payment Selection */}
            <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-white/5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <CreditCardIcon size={20} /> Payment Method
                </h3>
                <div className="space-y-2">
                    {['card', 'upi', 'cod'].map(method => (
                        <button
                            key={method}
                            onClick={() => setSelectedPayment(method)}
                            className={`w-full p-3 rounded-xl text-left text-sm font-bold capitalize flex items-center justify-between transition-all ${selectedPayment === method ? 'bg-jute-black text-white dark:bg-white dark:text-black shadow-md' : 'bg-gray-100 dark:bg-black/20 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                        >
                            {method === 'card' ? 'Credit/Debit Card' : method === 'upi' ? 'UPI / GPay' : 'Cash on Delivery'}
                            {selectedPayment === method && <CheckCircleIcon size={16} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Order Summary */}
            <div className="bg-jute-paper dark:bg-jute-darkPaper rounded-3xl p-6 shadow-soft border border-black/5 dark:border-white/5">
                <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm mb-6">
                    <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span className="font-mono">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                        <span>Tax (5%)</span>
                        <span className="font-mono">₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-jute-darkBlue dark:text-jute-lightBlue font-bold py-2">
                        <span>Estimated Delivery</span>
                        <span>3-5 Business Days</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-white/10 my-2 pt-2 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="font-mono">₹{total.toFixed(2)}</span>
                    </div>
                </div>
                
                <button 
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-4 bg-jute-darkBlue text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {isCheckingOut ? (
                        <>
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                           Processing...
                        </>
                    ) : (
                        'Buy Now'
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;