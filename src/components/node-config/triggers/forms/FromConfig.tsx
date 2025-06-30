import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select'
import { AlertCircle, ShoppingCart, ChevronDown, Check } from 'lucide-react'
import React, { useState } from 'react'
import { Label } from 'recharts'

const ProductEnquiredConfig = ({ config, setConfig }) => {
  const [products, setProducts] = useState([]);
  const [selectedForm, setSelectedForm] = useState('');

  // Here we are immitating the fetching of the product forms from the api
  const fetchProductFroms = async() => {
    try {
      // Simulating API call for demo purposes
      setProducts(['Product Enquiry Form 1', 'Product Enquiry Form 2', 'Product Enquiry Form 3']);
    } catch (error) {
      alert('Failed to fetch product forms');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-orange-100 rounded-lg">
          <ShoppingCart className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Product Enquiry Trigger</h3>
          <p className="text-sm text-gray-500">Configure which form to monitor for product enquiries</p>
        </div>
      </div>

      {/* Form Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Select Product Enquiry Form
        </Label>
        <div className="relative">
          <Select value={selectedForm} onValueChange={setSelectedForm}>
            <SelectTrigger className="w-full h-12 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 transition-all duration-200 flex items-center justify-between">
              <SelectValue placeholder="Choose a form to monitor..." />
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
              <SelectItem value="product-form-1">
                <div className="flex items-center justify-between w-full px-2 py-1">
                  <span className="text-gray-700">Product Enquiry Form 1</span>
                  {selectedForm === 'product-form-1' && <Check className="w-4 h-4 text-orange-600 ml-2" />}
                </div>
              </SelectItem>
              <SelectItem value="product-form-2">
                <div className="flex items-center justify-between w-full px-2 py-1">
                  <span className="text-gray-700">Product Enquiry Form 2</span>
                  {selectedForm === 'product-form-2' && <Check className="w-4 h-4 text-orange-600 ml-2" />}
                </div>
              </SelectItem>
              <SelectItem value="product-form-3">
                <div className="flex items-center justify-between w-full px-2 py-1">
                  <span className="text-gray-700">Product Enquiry Form 3</span>
                  {selectedForm === 'product-form-3' && <Check className="w-4 h-4 text-orange-600 ml-2" />}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>


      {/* Debug info - remove in production */}
      {selectedForm && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">Selected: {selectedForm}</p>
        </div>
      )}
      
    </div>
  )
}

export default ProductEnquiredConfig