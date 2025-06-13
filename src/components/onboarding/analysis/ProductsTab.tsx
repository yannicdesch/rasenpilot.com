
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Product {
  name: string;
  price: string;
  category: string;
}

interface ProductsTabProps {
  products: Product[];
}

const ProductsTab: React.FC<ProductsTabProps> = ({ products }) => {
  return (
    <div className="space-y-4 mt-4">
      <div className="grid gap-4">
        {products.map((product, index) => (
          <div key={index} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <h4 className="font-semibold text-gray-800">{product.name}</h4>
              <Badge variant="secondary" className="mt-1">
                {product.category}
              </Badge>
            </div>
            <div className="text-right">
              <span className="text-lg font-semibold text-green-600">
                {product.price}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsTab;
