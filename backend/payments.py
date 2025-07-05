from flask import Blueprint, request, jsonify
import stripe
import os

# Initialize Stripe with your secret key
# In production, set this as an environment variable
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_...')  # Replace with your actual test key

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        data = request.get_json()
        plan_type = data.get('plan_type', 'basic')
        
        # Define pricing for different plans
        price_mapping = {
            'basic': {
                'price_id': 'price_basic_monthly',  # Replace with your actual Stripe price ID
                'amount': 2900,  # $29.00 in cents
                'name': 'Basic Plan'
            },
            'professional': {
                'price_id': 'price_professional_monthly',  # Replace with your actual Stripe price ID
                'amount': 4900,  # $49.00 in cents
                'name': 'Professional Plan'
            },
            'premium': {
                'price_id': 'price_premium_monthly',  # Replace with your actual Stripe price ID
                'amount': 9900,  # $99.00 in cents
                'name': 'Premium Plan'
            }
        }
        
        if plan_type not in price_mapping:
            return jsonify({'error': 'Invalid plan type'}), 400
        
        plan_info = price_mapping[plan_type]
        
        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': plan_info['name'],
                        'description': f'Monthly subscription to {plan_info["name"]} - AI Legal Assistant for Fathers',
                    },
                    'unit_amount': plan_info['amount'],
                    'recurring': {
                        'interval': 'month',
                    },
                },
                'quantity': 1,
            }],
            mode='subscription',
            success_url=request.host_url + 'success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=request.host_url + 'cancel',
            metadata={
                'plan_type': plan_type,
                'user_email': data.get('email', ''),
            }
        )
        
        return jsonify({
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/webhook', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhooks for payment events"""
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')
    endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET', 'whsec_...')  # Replace with your webhook secret
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError:
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError:
        return jsonify({'error': 'Invalid signature'}), 400
    
    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_successful_payment(session)
    elif event['type'] == 'invoice.payment_succeeded':
        invoice = event['data']['object']
        handle_subscription_renewal(invoice)
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        handle_subscription_cancellation(subscription)
    
    return jsonify({'status': 'success'})

def handle_successful_payment(session):
    """Handle successful payment completion"""
    # Here you would typically:
    # 1. Create user account or update existing account
    # 2. Grant access to premium features
    # 3. Send welcome email
    # 4. Log the transaction
    
    customer_email = session.get('customer_details', {}).get('email')
    plan_type = session.get('metadata', {}).get('plan_type')
    
    print(f"Payment successful for {customer_email}, plan: {plan_type}")
    
    # Add your business logic here
    return True

def handle_subscription_renewal(invoice):
    """Handle subscription renewal payments"""
    customer_id = invoice['customer']
    subscription_id = invoice['subscription']
    
    print(f"Subscription renewed for customer {customer_id}")
    
    # Add your business logic here
    return True

def handle_subscription_cancellation(subscription):
    """Handle subscription cancellations"""
    customer_id = subscription['customer']
    
    print(f"Subscription cancelled for customer {customer_id}")
    
    # Add your business logic here
    return True

@payments_bp.route('/customer-portal', methods=['POST'])
def create_customer_portal():
    """Create a customer portal session for managing subscriptions"""
    try:
        data = request.get_json()
        customer_id = data.get('customer_id')
        
        if not customer_id:
            return jsonify({'error': 'Customer ID required'}), 400
        
        portal_session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=request.host_url + 'dashboard',
        )
        
        return jsonify({
            'portal_url': portal_session.url
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/subscription-status/<customer_id>', methods=['GET'])
def get_subscription_status(customer_id):
    """Get current subscription status for a customer"""
    try:
        subscriptions = stripe.Subscription.list(
            customer=customer_id,
            status='active',
            limit=1
        )
        
        if subscriptions.data:
            subscription = subscriptions.data[0]
            return jsonify({
                'status': 'active',
                'plan': subscription.items.data[0].price.nickname or 'Unknown',
                'current_period_end': subscription.current_period_end,
                'cancel_at_period_end': subscription.cancel_at_period_end
            })
        else:
            return jsonify({
                'status': 'inactive'
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
