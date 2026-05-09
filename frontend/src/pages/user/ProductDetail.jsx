import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI, reviewAPI, wishlistAPI } from '../../api';
import { useCartStore, useAuthStore } from '../../store';
import toast from 'react-hot-toast';
import { FiStar, FiShoppingCart, FiHeart, FiMinus, FiPlus, FiTruck, FiShield } from 'react-icons/fi';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, reviewRes] = await Promise.all([
          productAPI.getById(id),
          reviewAPI.getByProduct(id),
        ]);
        setProduct(prodRes.data.data.product);
        setRelated(prodRes.data.data.related || []);
        setReviews(reviewRes.data.data.reviews || []);
      } catch (_) { }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login to add to cart'); return; }
    const result = await addToCart(product._id, quantity);
    if (result.success) toast.success(`${quantity} item(s) added to cart!`);
    else toast.error(result.message);
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login'); return; }
    try {
      await wishlistAPI.toggle(product._id);
      setInWishlist(!inWishlist);
      toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (_) { }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Login to submit review'); return; }
    setSubmittingReview(true);
    try {
      const res = await reviewAPI.create({ ...reviewForm, productId: product._id });
      setReviews(prev => [res.data.data.review, ...prev]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmittingReview(false);
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
      <div className="bg-gray-200 rounded-2xl h-96" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => <div key={i} className="bg-gray-200 rounded-lg h-8" />)}
      </div>
    </div>
  );
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>;

  return (
    <div className="space-y-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">Home</Link> /
        <Link to="/products" className="hover:text-primary">Products</Link> /
        <span className="text-gray-800 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="bg-gray-100 rounded-2xl overflow-hidden mb-3">
            <img
              src={product.images?.[activeImage]?.url || '/placeholder.png'} alt={product.name}
              className="w-full h-96 object-contain"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {product.images?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === i ? 'border-primary' : 'border-gray-200'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">{product.category?.name}</p>
            <h1 className="font-display text-2xl font-bold text-gray-900 mt-1">{product.name}</h1>
            <p className="text-sm text-primary mt-1">by {product.vendorId?.storeName}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} size={16} className={i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
              ))}
            </div>
            <span className="text-sm text-gray-500">{product.rating?.toFixed(1)} ({product.totalReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="font-display text-3xl font-bold text-primary">₹{product.discountedPrice?.toLocaleString()}</span>
            {product.discountPercentage > 0 && (
              <>
                <span className="text-gray-400 line-through text-lg">₹{product.price?.toLocaleString()}</span>
                <span className="bg-green-100 text-green-700 text-sm font-medium px-2 py-0.5 rounded-full">{product.discountPercentage}% off</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div>
            {product.stock > 0 ? (
              <span className="text-green-600 text-sm font-medium">✓ In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-500 text-sm font-medium">✗ Out of Stock</span>
            )}
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100"><FiMinus size={14} /></button>
                <span className="px-4 py-2 font-medium text-sm">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-100"><FiPlus size={14} /></button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <FiShoppingCart size={18} /> Add to Cart
            </button>
            <button onClick={handleWishlist} className={`p-3 rounded-lg border-2 transition-colors ${inWishlist ? 'bg-red-50 border-red-300 text-red-500' : 'border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-500'}`}>
              <FiHeart size={20} className={inWishlist ? 'fill-red-500' : ''} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiTruck className="text-primary" /> Free delivery over ₹500
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiShield className="text-primary" /> Secure payment
            </div>
          </div>

          {/* Description */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Specs */}
          {product.specifications?.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Specifications</h3>
              <div className="space-y-2">
                {product.specifications.map((spec, i) => (
                  <div key={i} className="flex gap-4 text-sm">
                    <span className="text-gray-500 w-32 shrink-0">{spec.key}</span>
                    <span className="text-gray-800 font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Review list */}
        <div>
          <h2 className="font-display text-xl font-bold text-gray-800 mb-4">Customer Reviews ({reviews?.length || 0})</h2>
          {!reviews?.length ? (
            <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r._id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                        {r.userId?.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-sm">{r.userId?.name}</span>
                      {r.isVerifiedPurchase && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} size={12} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                      ))}
                    </div>
                  </div>
                  {r.title && <p className="font-semibold text-sm text-gray-800 mb-1">{r.title}</p>}
                  <p className="text-sm text-gray-600">{r.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Write review */}
        {user && (
          <div>
            <h2 className="font-display text-xl font-bold text-gray-800 mb-4">Write a Review</h2>
            <form onSubmit={handleReviewSubmit} className="card space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button type="button" key={r} onClick={() => setReviewForm(p => ({ ...p, rating: r }))}>
                      <FiStar size={24} className={r <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
                <input type="text" className="input" value={reviewForm.title} onChange={e => setReviewForm(p => ({ ...p, title: e.target.value }))} placeholder="Summary of your experience" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                <textarea rows={4} className="input resize-none" value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} placeholder="Share your experience..." required />
              </div>
              <button type="submit" disabled={submittingReview} className="btn-primary w-full">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Related */}
      {related?.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-bold text-gray-800 mb-4">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map(p => (
              <Link key={p._id} to={`/products/${p._id}`} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <img src={p.images?.[0]?.url || '/placeholder.png'} alt={p.name} className="w-full h-40 object-cover" />
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">{p.name}</p>
                  <p className="text-primary font-bold mt-1 text-sm">₹{p.discountedPrice?.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
