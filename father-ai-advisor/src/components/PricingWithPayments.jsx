import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Check, CreditCard, Loader2 } from 'lucide-react';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_...');  // Replace with your actual publishable key

const PaymentComponent = ({ plan, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call your backend to create a checkout session
      const response = await fetch('https://xlhyimcjjx61.manus.space/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_type: plan.type,
          email: '', // You can collect this from a form or user context
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      window.location.href = data.checkout_url;

    } catch (err) {
      setError('Payment processing failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {plan.name}
          {plan.popular && <Badge variant="secondary">Most Popular</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold">${plan.price}</div>
          <div className="text-sm text-gray-600">per month</div>
        </div>
        
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {error && (
          <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        <Button 
          onClick={handlePayment} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Subscribe Now
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          Secure payment powered by Stripe. Cancel anytime.
        </div>
      </CardContent>
    </Card>
  );
};

const PricingWithPayments = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      type: 'basic',
      name: 'Basic Plan',
      price: 19.99,
      popular: false,
      features: [
        'AI Legal Assistant Chat',
        'Basic Document Templates',
        'Email Support',
        'Access to Legal Resources'
      ]
    },
    {
      type: 'professional',
      name: 'Professional Plan',
      price: 49.99,
      popular: true,
      features: [
        'Everything in Basic',
        'Advanced Document Generation',
        'Priority Support',
        'Case Management Tools',
        'Court Filing Assistance'
      ]
    },
    {
      type: 'premium',
      name: 'Premium Plan',
      price: 99.99,
      popular: false,
      features: [
        'Everything in Professional',
        'One-on-One Consultation',
        'Custom Document Review',
        'Phone Support',
        'Legal Strategy Planning'
      ]
    }
  ];

  if (selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Subscription</h2>
            <p className="text-gray-600">You're one step away from accessing our AI legal assistant</p>
          </div>
          
          <div className="flex justify-center">
            <PaymentComponent 
              plan={selectedPlan}
              onSuccess={() => {
                // Handle successful payment
                console.log('Payment successful!');
              }}
              onCancel={() => setSelectedPlan(null)}
            />
          </div>

          <div className="text-center mt-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedPlan(null)}
            >
              ← Back to Plans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the plan that best fits your needs. All plans include our AI legal assistant 
            and access to document preparation tools.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.type} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-center">{plan.name}</CardTitle>
                <div className="text-center">
                  <div className="text-4xl font-bold">${plan.price}</div>
                  <div className="text-sm text-gray-600">per month</div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  onClick={() => setSelectedPlan(plan)}
                  variant={plan.popular ? "default" : "outline"}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include a 7-day free trial. No credit card required to start.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <span>✓ Cancel anytime</span>
            <span>✓ Secure payments</span>
            <span>✓ 24/7 support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingWithPayments;

