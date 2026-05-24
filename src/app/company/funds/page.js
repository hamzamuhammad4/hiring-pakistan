// Update the Payment Modal component in funds/page.js

const PaymentModal = () => {
  const selectedItem = selectedPlan || selectedPack;
  if (!selectedItem) return null;

  const method = PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod?.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Manual Payment</h2>
          <button 
            onClick={() => {
              setShowPaymentModal(false);
              setPaymentStep(1);
              setSelectedPaymentMethod(null);
              setScreenshot(null);
              setScreenshotPreview(null);
            }} 
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Step 1: Select Payment Method */}
          {paymentStep === 1 && (
            <>
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 rounded-lg">
                <p className="font-semibold mb-2">Payment Summary</p>
                <p className="text-3xl font-bold">Rs {selectedItem.price?.toLocaleString() || 0}</p>
                <p className="text-sm opacity-90">{selectedItem.credits} credits will be added</p>
                {selectedPlan && <p className="text-sm opacity-90 mt-1">Plan: {selectedPlan.name}</p>}
              </div>

              <div>
                <label className="block font-semibold mb-3">Select Payment Method</label>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${
                        selectedPaymentMethod?.id === method.id 
                          ? 'border-cyan-500 bg-cyan-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={selectedPaymentMethod?.id === method.id}
                        onChange={() => setSelectedPaymentMethod(method)}
                        className="mr-3"
                      />
                      <method.icon className="h-5 w-5 mr-2 text-gray-600" />
                      <span className="font-medium">{method.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setPaymentStep(2)}
                disabled={!selectedPaymentMethod}
                className="w-full bg-cyan-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </>
          )}

          {/* Step 2: Show Account Details */}
          {paymentStep === 2 && method && (
            <>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-600 text-xl">⚠️</span>
                  <p className="font-semibold text-yellow-800">Send payment to:</p>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Account Title</p>
                    <p className="font-mono font-semibold">{method.accountTitle}</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Account Number</p>
                    <div className="flex justify-between items-center">
                      <p className="font-mono font-semibold">{method.accountNumber}</p>
                      <button 
                        onClick={() => copyToClipboard(method.accountNumber, 'Account Number')}
                        className="text-cyan-600 hover:text-cyan-800"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-500">IBAN</p>
                    <div className="flex justify-between items-center">
                      <p className="font-mono text-sm">{method.iban}</p>
                      <button 
                        onClick={() => copyToClipboard(method.iban, 'IBAN')}
                        className="text-cyan-600 hover:text-cyan-800"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ Screenshot Upload - Fixed */}
              <div>
                <label className="block font-semibold mb-2">Upload Payment Screenshot</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-cyan-500 transition">
                  {screenshotPreview ? (
                    <div>
                      <img src={screenshotPreview} alt="Screenshot" className="max-h-48 mx-auto mb-2 rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setScreenshot(null);
                          setScreenshotPreview(null);
                        }}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <span className="text-4xl">📸</span>
                        <p className="text-gray-500 mt-2">Click to upload screenshot</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF (Max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleScreenshotChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPaymentStep(1);
                    setSelectedPaymentMethod(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitPaymentRequest}
                  disabled={!screenshot || submitting}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Payment Request'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};