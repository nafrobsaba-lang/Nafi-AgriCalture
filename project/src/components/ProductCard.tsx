import { Link } from 'react-router-dom';
import { MapPin, Clock, Zap, Star } from 'lucide-react';
import { Product } from '../lib/supabase';

const CATEGORY_COLORS: Record<string, string> = {
  vegetables: 'bg-emerald-100 text-emerald-700',
  fruits: 'bg-orange-100 text-orange-700',
  grains: 'bg-amber-100 text-amber-700',
  livestock: 'bg-red-100 text-red-700',
  dairy: 'bg-blue-100 text-blue-700',
  other: 'bg-gray-100 text-gray-600',
};

const CATEGORY_IMAGES: Record<string, string> = {
  vegetables: 'https://images.pexels.com/photos/1458694/pexels-photo-1458694.jpeg?w=400&h=300&fit=crop',
  fruits: 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?w=400&h=300&fit=crop',
  grains: 'https://images.pexels.com/photos/326082/pexels-photo-326082.jpeg?w=400&h=300&fit=crop',
  livestock: 'https://images.pexels.com/photos/422220/pexels-photo-422220.jpeg?w=400&h=300&fit=crop',
  dairy: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?w=400&h=300&fit=crop',
  other: 'https://images.pexels.com/photos/1447537/pexels-photo-1447537.jpeg?w=400&h=300&fit=crop',
};

interface Props {
  product: Product;
  onOrder?: (product: Product) => void;
  showActions?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export default function ProductCard({ product, onOrder, showActions, onEdit, onDelete }: Props) {
  const image = product.images?.[0] || CATEGORY_IMAGES[product.category];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      <Link to={`/products/${product.id}`} className="block relative">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        {product.urgent_sale && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            <Zap className="h-3 w-3" /> Urgent
          </div>
        )}
        <div className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[product.category]}`}>
          {product.category}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-gray-900 font-semibold text-base mb-1 hover:text-green-700 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-green-700 font-bold text-lg">
              ETB {product.price.toLocaleString()}
            </span>
            <span className="text-gray-400 text-sm">/{product.unit}</span>
          </div>
          <span className="text-gray-500 text-sm">{product.quantity} {product.unit} avail.</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {product.region || 'Unknown'}
          </span>
          {product.harvest_date && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(product.harvest_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {product.profiles && (
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-50">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs flex-shrink-0">
              {product.profiles.full_name?.charAt(0)}
            </div>
            <span className="text-xs text-gray-500 truncate">{product.profiles.full_name}</span>
            <div className="ml-auto flex items-center gap-0.5 text-amber-500">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-xs text-gray-500">4.8</span>
            </div>
          </div>
        )}

        {onOrder && (
          <button
            onClick={() => onOrder(product)}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
          >
            Place Order
          </button>
        )}

        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit?.(product)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl transition-all"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(product)}
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium py-2.5 rounded-xl transition-all"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
