'use client';

import { useState } from 'react';
import { ArrowLeft, Upload, Info, AlertCircle, Plus, Minus } from 'lucide-react';
import Link from 'next/link';

export default function PublishStrategy() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    timeframe: '',
    assetClass: [],
    price: '',
    features: [''],
    requirements: {
      platform: '',
      broker: '',
      minCapital: ''
    }
  });
  
  const assetClasses = [
    'Stocks', 'Forex', 'Crypto', 'Options', 'Futures', 'ETFs', 'Commodities', 'Indices'
  ];
  
  const timeframes = [
    '1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W', '1M'
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleAssetClassToggle = (asset) => {
    if (formData.assetClass.includes(asset)) {
      setFormData({
        ...formData,
        assetClass: formData.assetClass.filter(a => a !== asset)
      });
    } else {
      setFormData({
        ...formData,
        assetClass: [...formData.assetClass, asset]
      });
    }
  };
  
  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };
  
  const removeFeature = (index) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData({
      ...formData,
      features: newFeatures
    });
  };
  
  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures
    });
  };
  
  const nextStep = () => {
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic would go here
    
    // For demo purposes, just log the data
    console.log('Publishing strategy:', formData);
    
    // In a real app, you'd send this to your backend
    // Then redirect to the published strategy or confirmation page
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link 
        href="/dashboard/marketplace" 
        className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Marketplace
      </Link>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-3xl font-bold mb-2">Publish Your Strategy</h1>
        <p className="text-zinc-400 mb-8">Share your trading expertise with the AlgoZ community</p>
        
        {/* Progress steps */}
        <div className="flex items-center mb-10">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 1 ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${
            step >= 2 ? 'bg-purple-600' : 'bg-zinc-800'
          }`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 2 ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'
          }`}>
            2
          </div>
          <div className={`flex-1 h-1 mx-2 ${
            step >= 3 ? 'bg-purple-600' : 'bg-zinc-800'
          }`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 3 ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'
          }`}>
            3
          </div>
        </div>
        
        {/* Form container */}
        <div className="bg-zinc-800 rounded-xl p-6 md:p-8 shadow-xl">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-white text-xl font-bold mb-4">Basic Information</h2>
                
                <div>
                  <label htmlFor="name" className="block text-white mb-2">Strategy Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Golden Cross Strategy"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-white mb-2">Short Description</label>
                  <input
                    id="description"
                    name="description"
                    type="text"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="A brief one-sentence description of your strategy"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="longDescription" className="block text-white mb-2">Detailed Description</label>
                  <textarea
                    id="longDescription"
                    name="longDescription"
                    value={formData.longDescription}
                    onChange={handleChange}
                    placeholder="Provide a comprehensive explanation of how your strategy works..."
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[150px]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white mb-2">Asset Classes</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {assetClasses.map((asset) => (
                      <button
                        key={asset}
                        type="button"
                        onClick={() => handleAssetClassToggle(asset)}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          formData.assetClass.includes(asset)
                            ? 'bg-purple-600 text-white'
                            : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        {asset}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="timeframe" className="block text-white mb-2">Primary Timeframe</label>
                  <select
                    id="timeframe"
                    name="timeframe"
                    value={formData.timeframe}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                    required
                  >
                    <option value="">Select a timeframe</option>
                    {timeframes.map((timeframe) => (
                      <option key={timeframe} value={timeframe}>{timeframe}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-end mt-8">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 2: Features and Requirements */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-white text-xl font-bold mb-4">Features & Requirements</h2>
                
                <div>
                  <label className="block text-white mb-2">Key Features</label>
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="e.g., Automatic trade signals"
                        className="flex-grow px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-3 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors"
                        disabled={formData.features.length <= 1}
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="flex items-center text-purple-400 hover:text-purple-300 mt-2"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Another Feature
                  </button>
                </div>
                
                <div>
                  <h3 className="text-white font-medium mb-3">System Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="requirements.platform" className="block text-zinc-400 text-sm mb-1">Platform</label>
                      <input
                        id="requirements.platform"
                        name="requirements.platform"
                        type="text"
                        value={formData.requirements.platform}
                        onChange={handleChange}
                        placeholder="e.g., MetaTrader 5"
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="requirements.broker" className="block text-zinc-400 text-sm mb-1">Broker</label>
                      <input
                        id="requirements.broker"
                        name="requirements.broker"
                        type="text"
                        value={formData.requirements.broker}
                        onChange={handleChange}
                        placeholder="e.g., Any supporting webhook"
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="requirements.minCapital" className="block text-zinc-400 text-sm mb-1">Recommended Capital</label>
                      <input
                        id="requirements.minCapital"
                        name="requirements.minCapital"
                        type="text"
                        value={formData.requirements.minCapital}
                        onChange={handleChange}
                        placeholder="e.g., $1,000"
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="border border-zinc-600 text-zinc-300 hover:bg-zinc-700 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 3: Pricing and Files */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-white text-xl font-bold mb-4">Pricing & Upload</h2>
                
                <div>
                  <label htmlFor="price" className="block text-white mb-2">Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-white">$</span>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="99.99"
                      className="w-full px-4 py-3 pl-8 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <p className="text-zinc-400 text-sm mt-1">You will receive 70% of the sale price.</p>
                </div>
                
                <div>
                  <label className="block text-white mb-2">Strategy Files</label>
                  <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center">
                    <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-4" />
                    <p className="text-zinc-300 mb-4">Drag and drop your strategy files here</p>
                    <p className="text-zinc-500 text-sm mb-6">Supported formats: .ex4, .ex5, .pine, .py, .js (Max 10MB)</p>
                    <button
                      type="button"
                      className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Browse Files
                    </button>
                  </div>
                </div>
                
                <div className="bg-zinc-900 p-4 rounded-lg flex items-start">
                  <Info className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-zinc-300 text-sm">
                      Your strategy will be reviewed by our team before being published to ensure it meets our quality standards. This typically takes 1-2 business days.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start mt-6">
                  <input
                    type="checkbox"
                    id="termsCheck"
                    className="mt-1 mr-3"
                    required
                  />
                  <label htmlFor="termsCheck" className="text-zinc-300 text-sm">
                    I confirm that this strategy is my original work and I have the right to sell it. I have read and agree to the <a href="#" className="text-purple-400 hover:text-purple-300">Strategy Seller Terms</a>.
                  </label>
                </div>
                
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="border border-zinc-600 text-zinc-300 hover:bg-zinc-700 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                  >
                    Submit for Review
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 