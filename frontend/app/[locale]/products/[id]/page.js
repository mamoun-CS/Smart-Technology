'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, Heart, ShoppingCart, Star, Shield, Truck, 
  RotateCcw, Minus, Plus, Check, AlertCircle
} from 'lucide-react';
import { productsAPI, cartAPI } from '../../../../lib/api';
import { getDictionary } from '../../../../i18n';
import { formatPrice, cn } from '../../../../lib/utils';
import { useCartStore } from '../../../../store/cartStore';
import { useAuthStore } from '../../../../store/authStore';
import { toast } from 'sonner';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/ui/Footer';
import Button from '../../../../components/ui/Button';
import Loading from '../../../../components/ui/Loading';

export default function ProductDetail({ params: { locale = 'en' } }) {
  const { id } = useParams();
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict?.common || {};
  const productT = dict?.products || {};
  
  const { addItem: addToCartStore } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedPricingTier, setSelectedPricingTier] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await productsAPI.getOne(id);
      setProduct(response.data.product);
      
      // Set default pricing tier if available
      if (response.data.product?.pricing?.length > 0) {
        setSelectedPricingTier(response.data.product.pricing[0]);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product');
      toast.error('Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }

    try {
      setIsAddingToCart(true);
      
      // Calculate price based on selected tier
      const price = selectedPricingTier?.price || product?.price;
      
      await cartAPI.addItem({
        product_id: product.id,
        quantity: quantity,
        price: price
      });
      
      addToCartStore(product.id, quantity);
      
      toast.success(t.addedToCart || 'Added to cart');
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push(`/${locale}/cart`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Navbar locale={locale} dict={dict} />
        <div className="pt-24 pb-12">
          <div className="container-custom">
            <Loading />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Navbar locale={locale} dict={dict} />
        <div className="pt-24 pb-12">
          <div className="container-custom">
            <div className="card p-12 bg-dark-800 border-dark-600 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                {t.productNotFound || 'Product Not Found'}
              </h2>
              <p className="text-gray-400 mb-6">{error || 'The product you are looking for does not exist.'}</p>
              <Link href={`/${locale}/products`}>
                <Button>{t.browseProducts || 'Browse Products'}</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = selectedPricingTier?.price || product.price;
  const hasDiscount = product.original_price && product.original_price > currentPrice;
  const discountPercent = hasDiscount ? Math.round(((product.original_price - currentPrice) / product.original_price) * 100) : 0;

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar locale={locale} dict={dict} />
      
      {/* Breadcrumb */}
      <div className="pt-20 bg-dark-900">
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">
              {t.home || 'Home'}
            </Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <Link href={`/${locale}/products`} className="hover:text-white transition-colors">
              {t.products || 'Products'}
            </Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span className="text-white truncate max-w-[200px]">
              {locale === 'ar' ? product.name_ar : product.name_en}
            </span>
          </div>
        </div>
      </div>

      <div className="pb-12">
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-dark-800 border border-dark-600">
                {product.images?.[selectedImage] ? (
                  <img 
                    src={product.images[selectedImage]} 
                    alt={locale === 'ar' ? product.name_ar : product.name_en}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <span className="text-4xl">📦</span>
                  </div>
                )}
              </div>
              
              {product.images?.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                        selectedImage === index 
                          ? "border-brand-red" 
                          : "border-transparent hover:border-dark-500"
                      )}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                {product.category_name && (
                  <span className="inline-block px-3 py-1 bg-brand-red/10 text-brand-red text-sm rounded-full mb-3">
                    {locale === 'ar' ? product.category_name_ar : product.category_name}
                  </span>
                )}
                <h1 className="text-3xl font-bold text-white">
                  {locale === 'ar' ? product.name_ar : product.name_en}
                </h1>
              </div>

              {/* Rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "w-5 h-5",
                          i < Math.round(product.rating) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-gray-600"
                        )} 
                      />
                    ))}
                  </div>
                  <span className="text-gray-400">
                    ({product.review_count || 0} {t.reviews || 'reviews'})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-white">
                    {formatPrice(currentPrice, locale)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        {formatPrice(product.original_price, locale)}
                      </span>
                      <span className="px-2 py-1 bg-brand-red text-white text-sm font-medium rounded-lg">
                        -{discountPercent}%
                      </span>
                    </>
                  )}
                </div>
                
                {/* Wholesale Pricing Info */}
                {product.wholesale_price && product.min_order_quantity && (
                  <div className="bg-dark-700/50 rounded-lg p-4 border border-dark-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">{locale === 'ar' ? 'سعر التجزئة' : 'Retail Price'}</span>
                      <span className="text-white font-medium">{formatPrice(product.unit_price || product.price, locale)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">{locale === 'ar' ? 'سعر الجملة' : 'Wholesale Price'}</span>
                      <span className="text-green-400 font-bold">{formatPrice(product.wholesale_price, locale)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{locale === 'ar' ? 'الحد الأدنى للخصم' : 'Min Qty for Discount'}</span>
                      <span className="text-white font-medium">{product.min_order_quantity} {locale === 'ar' ? 'قطعة' : 'units'}</span>
                    </div>
                    {quantity >= product.min_order_quantity ? (
                      <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                        <Check className="w-4 h-4" />
                        <span>{locale === 'ar' ? 'لقد حصلت على سعر الجملة' : 'You received the wholesale price'}</span>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{locale === 'ar' ? 'اشترِ المزيد للحصول على الخصم' : 'Buy more to get a discount'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pricing Tiers */}
              {product.pricing?.length > 1 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-400">
                    {t.selectQuantity || 'Select Quantity'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.pricing.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedPricingTier(tier)}
                        className={cn(
                          "px-4 py-2 rounded-lg border transition-all",
                          selectedPricingTier?.id === tier.id
                            ? "border-brand-red bg-brand-red/10 text-brand-red"
                            : "border-dark-600 text-gray-400 hover:border-dark-500"
                        )}
                      >
                        <span className="font-medium">{tier.min_quantity}+</span>
                        <span className="mx-2">-</span>
                        <span className="font-bold">{formatPrice(tier.price, locale)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-green-400">
                      {t.inStock || 'In Stock'} ({product.stock} {t.available || 'available'})
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-red-400">{t.outOfStock || 'Out of Stock'}</span>
                  </>
                )}
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">{t.quantity || 'Quantity'}:</span>
                  <div className="flex items-center border border-dark-600 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 text-gray-400 hover:text-white transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="px-4 text-white font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-3 text-gray-400 hover:text-white transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAddingToCart}
                  className="flex-1 flex items-center justify-center gap-2"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isAddingToCart ? t.adding : (t.addToCart || 'Add to Cart')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="px-4"
                  size="lg"
                >
                  <Heart className={cn("w-5 h-5", isWishlisted && "fill-brand-red text-brand-red")} />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-dark-700">
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto text-brand-red mb-2" />
                  <span className="text-sm text-gray-400">{t.securePayment || 'Secure Payment'}</span>
                </div>
                <div className="text-center">
                  <Truck className="w-6 h-6 mx-auto text-brand-red mb-2" />
                  <span className="text-sm text-gray-400">{t.fastDelivery || 'Fast Delivery'}</span>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 mx-auto text-brand-red mb-2" />
                  <span className="text-sm text-gray-400">{t.easyReturns || 'Easy Returns'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-12 card p-6 bg-dark-800 border-dark-600">
            <h2 className="text-xl font-semibold text-white mb-4">
              {t.description || 'Description'}
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-wrap">
                {locale === 'ar' ? product.description_ar : product.description_en}
              </p>
            </div>
          </div>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mt-6 card p-6 bg-dark-800 border-dark-600">
              <h2 className="text-xl font-semibold text-white mb-4">
                {t.specifications || 'Specifications'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-dark-700">
                    <span className="text-gray-400">{key}</span>
                    <span className="text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer locale={locale} dict={dict} />
    </div>
  );
}