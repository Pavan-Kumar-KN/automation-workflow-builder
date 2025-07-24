import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import BranchShift from '@/components/node-config/config-components/BranchShift';

const ProductFromEvalConfig = ({ config, setConfig }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [bulkAction, setBulkAction] = useState('');
    const [productOptions, setProductOptions] = useState([]);

    // Fetch product data
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Sample product data
            const productData = [
                { value: 'product_1', label: 'Premium Software Suite' },
                { value: 'product_2', label: 'Basic Plan Subscription' },
                { value: 'product_3', label: 'Enterprise Solution' },
                { value: 'product_4', label: 'Professional Services' },
                { value: 'product_5', label: 'Cloud Storage Package' },
                { value: 'product_6', label: 'Security Add-on' },
                { value: 'product_7', label: 'Analytics Dashboard' },
                { value: 'product_8', label: 'Mobile App License' },
                { value: 'product_9', label: 'Training Program' },
                { value: 'product_10', label: 'Support Package' }
            ];
            
            setProductOptions(productData);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            alert('Failed to load product data');
        } finally {
            setIsLoading(false);
        }
    };

    // Load product data on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // Handle bulk action
    const handleBulkAction = (action) => {
        setBulkAction(action);
    };

    // Handle form submission
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Validate selection
            if (!selectedProduct) {
                alert('Please select a product from the list');
                return;
            }

            if (!bulkAction) {
                alert('Please select a bulk action');
                return;
            }

            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            const newConfig = {
                ...config,
                selectedProduct: selectedProduct,
                bulkAction: bulkAction
            };
            
            setConfig(newConfig);
            alert('Configuration saved successfully!');
        } catch (error) {
            alert('Failed to save configuration');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h3 className="font-semibold text-gray-900">Product From</h3>
                <p className="text-sm text-gray-500">
                    Select a product from the list and configure bulk action settings.
                </p>
            </div>

            {/* Product Selection */}
            <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                    Product List <span className="text-red-500">*</span>
                </Label>
                
                <Select
                    value={selectedProduct}
                    onValueChange={setSelectedProduct}
                    disabled={isLoading}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Loading products..." : "Select a Product from list"} />
                    </SelectTrigger>
                    <SelectContent>
                        {productOptions.map(product => (
                            <SelectItem key={product.value} value={product.value}>
                                {product.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                {selectedProduct && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">
                            Selected: {productOptions.find(p => p.value === selectedProduct)?.label}
                        </span>
                        <button
                            onClick={() => setSelectedProduct('')}
                            className="text-red-600 hover:text-red-800 p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Bulk Actions */}
         <BranchShift nodeid={config.graphNodeId}/>
          

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isLoading}
                className="w-full"
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default ProductFromEvalConfig;