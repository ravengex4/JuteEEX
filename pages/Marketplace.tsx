import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_MARKETPLACE_ITEMS } from '../constants';
import { MarketIcon } from '../components/Icons';
import { MarketplaceItem } from '../types';
import { useApp } from '../App';

const Marketplace: React.FC = () => {
  const { addToCart, cart } = useApp();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const touchEndX = useRef(0);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const getCategoryStyles = (category: string) => {
    switch(category) {
      case 'SEED':
        return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400';
      case 'PESTICIDE':
        return 'bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400';
      case 'TOOL':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'JUTE_SALE':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category === 'SEED') return '🌱';
    if (category === 'PESTICIDE') return '🧪';
    if (category === 'TOOL') return '🔧';
    if (category === 'JUTE_SALE') return '🧺';
    return '📦';
  };

  const handleItemClick = (item: MarketplaceItem) => {
    setSelectedItem(item);
  };

  const handleQuickAdd = (e: React.MouseEvent, item: MarketplaceItem) => {
    e.stopPropagation();
    addToCart(item);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  useEffect(() => {
    if (selectedItem) {
      setCurrentImageIndex(0);
    }
  }, [selectedItem]);

  const nextImage = () => {
    if (selectedItem) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % selectedItem.images.length);
    }
  };

  const prevImage = () => {
    if (selectedItem) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + selectedItem.images.length) % selectedItem.images.length);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX - touchEndX.current > 50) {
      nextImage();
    }

    if (touchStartX - touchEndX.current < -50) {
      prevImage();
    }
  };

  const MOCK_REVIEWS = [
    { id: 1, user: 'Ramesh K.', rating: 5, comment: 'Excellent quality. Highly recommended.' },
    { id: 2, user: 'Suresh P.', rating: 4, comment: 'Good product, fast delivery.' },
    { id: 3, user: 'Anita D.', rating: 5, comment: 'Perfect for my requirements.' },
  ];

  return (
    <div className="animate-fade-in pb-20 pt-4 md:pt-8 relative">
       {/* Toast Notification */}
       <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[110] transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <div className="bg-jute-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-sm">
             <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
             Item added to cart
          </div>
       </div>

       {/* Header */}
       <div className="flex items-center justify-between gap-4 mb-8">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-jute-darkBlue text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <MarketIcon size={24} />
            </div>
            <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Jute Market</h1>
            <p className="text-gray-500 text-xs md:text-sm max-w-[200px] md:max-w-none">Buy supplies & sell at gov regulated prices.</p>
            </div>
         </div>
         
         <div className="flex gap-2">
             <button 
                onClick={() => navigate('/cart')}
                className="relative bg-white dark:bg-white/10 text-black dark:text-white w-12 h-12 rounded-xl font-bold shadow-sm active:scale-95 transition-transform flex items-center justify-center"
             >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-black">
                        {cartCount}
                    </span>
                )}
             </button>
             <button className="bg-jute-black dark:bg-white dark:text-black text-white px-5 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform text-sm whitespace-nowrap">
                + Sell Item
             </button>
         </div>
       </div>

       {/* Grid */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
         {MOCK_MARKETPLACE_ITEMS.map((item) => (
           <div 
             key={item.id} 
             onClick={() => handleItemClick(item)}
             className="bg-jute-paper dark:bg-jute-darkPaper rounded-3xl overflow-hidden shadow-soft hover:shadow-xl transition-all group border border-transparent dark:border-white/5 flex flex-col cursor-pointer active:scale-95 duration-200"
           >
             <div className="h-32 md:h-40 relative overflow-hidden flex items-center justify-center p-6 bg-cover bg-center" style={{backgroundImage: `url(${item.images[0]})`}}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
               {!item.isGovPriceCompliant && (
                 <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-20">
                   NON-COMPLIANT
                 </div>
               )}
               {item.isGovPriceCompliant && (
                 <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-20">
                   {item.category === 'PESTICIDE' ? 'DPPQ&S APPROVED' : 'GOV APPROVED'}
                 </div>
               )}
             </div>
             
             <div className="p-4 flex flex-col grow">
               <div className="text-[10px] font-bold text-jute-lightBlue mb-1 tracking-wider">{item.category.replace('_', ' ')}</div>
               <h3 className="font-bold text-sm md:text-lg leading-tight mb-2 line-clamp-2">{item.name}</h3>
               <div className="flex items-center justify-between mt-auto pt-2">
                 <span className="font-mono text-base md:text-lg font-bold">₹{item.price}</span>
                 <button 
                    onClick={(e) => handleQuickAdd(e, item)}
                    className="bg-gray-100 dark:bg-white/10 text-black dark:text-white p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors active:bg-gray-300"
                 >
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M12 5v14M5 12h14" />
                   </svg>
                 </button>
               </div>
             </div>
           </div>
         ))}
       </div>

       {/* Item Details Popup */}
       {selectedItem && (
         <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6" onClick={closeModal}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
            
            <div 
              className="bg-white dark:bg-jute-darkPaper w-full max-w-lg rounded-t-[2rem] md:rounded-[2.5rem] overflow-hidden relative z-10 animate-slide-up md:animate-fade-in shadow-2xl flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                  onClick={closeModal}
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-black dark:text-white backdrop-blur-md"
                >
                  ✕
                </button>

                {/* Image Carousel */}
                <div 
                  className="relative h-64 md:h-72 shrink-0 bg-gray-100 dark:bg-black/20 overflow-hidden"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="absolute inset-0 flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
                    {selectedItem.images.map((image, index) => (
                      <img key={index} src={image} alt={`${selectedItem.name} ${index + 1}`} className="w-full h-full object-cover shrink-0" />
                    ))}
                  </div>
                  
                  {/* Navigation Buttons */}
                  <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/50 transition-colors">
                    &#x276E;
                  </button>
                  <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/50 transition-colors">
                    &#x276F;
                  </button>
                    
                  {/* Carousel Indicators */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {selectedItem.images.map((_, index) => (
                      <button 
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === index ? 'bg-white scale-125' : 'bg-white/50'}`} 
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 flex flex-col overflow-y-auto">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <div className="text-xs font-bold text-jute-darkBlue mb-1 tracking-wider uppercase">{selectedItem.category.replace('_', ' ')}</div>
                            <h2 className="text-2xl md:text-3xl font-bold leading-tight text-gray-900 dark:text-white">{selectedItem.name}</h2>
                        </div>
                        <div className="text-xl md:text-2xl font-mono font-bold text-gray-900 dark:text-white">₹{selectedItem.price}</div>
                    </div>

                    <div className="flex gap-2 mb-6">
                        {selectedItem.isGovPriceCompliant ? (
                           <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold flex items-center gap-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                             {selectedItem.category === 'PESTICIDE' ? 'DPPQ&S Approved' : 'Gov Approved'}
                           </span>
                        ) : (
                           <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-bold flex items-center gap-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                             Market Rate
                           </span>
                        )}
                        <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-xs font-bold">
                            In Stock
                        </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base mb-8">
                       Premium quality {selectedItem.name.toLowerCase()} sourced directly from verified suppliers. 
                       Suitable for all standard jute farming requirements. Validated for high efficiency and compliance with regional agricultural standards.
                    </p>

                    {/* Reviews Section */}
                    <div className="mb-8">
                        <h3 className="font-bold text-lg mb-3">Customer Reviews</h3>
                        <div className="space-y-3">
                            {MOCK_REVIEWS.map(review => (
                                <div key={review.id} className="bg-gray-50 dark:bg-black/20 p-3 rounded-xl">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-sm">{review.user}</span>
                                        <div className="flex text-amber-400 text-xs">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <button 
                            onClick={() => { if(selectedItem) {addToCart(selectedItem);} closeModal(); setShowToast(true); setTimeout(() => setShowToast(false), 2000); }}
                            className="w-full py-4 bg-jute-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Add to Cart • ₹{selectedItem.price}
                        </button>
                    </div>
                </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default Marketplace;