from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import json
import random
import time

chat_bp = Blueprint('chat', __name__)

# AI Agent responses database
AGENT_RESPONSES = {
    'FatherBot': {
        'greetings': [
            "Hi! I'm FatherBot, your AI legal assistant. I'm here to help you navigate family court proceedings with confidence and support.",
            "Hello! I understand this is a challenging time. I'm here to provide guidance and emotional support throughout your family court journey.",
            "Welcome! As your AI assistant, I'm dedicated to helping fathers like you understand your rights and navigate the legal system effectively."
        ],
        'legal_questions': [
            "I understand this is a difficult situation. Let me help you understand your rights as a father in family court proceedings.",
            "Family court can be overwhelming, but you're taking the right steps by seeking guidance. Let's work through this together.",
            "Remember, the court's primary concern is the best interest of your child. I can help you present your case in the most effective way.",
            "Your parental rights are important. Let me guide you through the legal process and help you understand what to expect.",
            "I'm here to support you through this challenging time. What specific aspect of your case would you like to discuss?"
        ],
        'emotional_support': [
            "I know this process can be emotionally draining. Remember that seeking help shows your commitment to your children.",
            "You're not alone in this journey. Many fathers have successfully navigated family court with proper preparation and support.",
            "It's natural to feel overwhelmed. Take things one step at a time, and remember that I'm here to help you through each stage.",
            "Your dedication to fighting for your children is admirable. Let's focus on building a strong case together."
        ]
    },
    'DocuBot': {
        'greetings': [
            "Hello! I'm DocuBot, your document preparation specialist. I can help you create accurate, jurisdiction-specific legal documents.",
            "Hi there! I'm here to assist with all your document preparation needs for family court proceedings.",
            "Welcome! I specialize in helping fathers prepare the necessary paperwork for family court cases."
        ],
        'document_help': [
            "I can help you prepare the necessary documents for your case. What type of filing do you need assistance with?",
            "Let's make sure your paperwork is complete and accurate. Which jurisdiction are you filing in?",
            "Document preparation is crucial for your case success. I'll guide you through each form step by step.",
            "I can generate customized legal documents based on your specific situation and local court requirements.",
            "Proper documentation can make or break your case. Let me help you get it right the first time."
        ],
        'form_assistance': [
            "I'll walk you through each section of the form to ensure accuracy and completeness.",
            "Don't worry about the legal terminology - I'll explain everything in plain English as we go.",
            "I can help you gather all the required information before we start filling out the forms.",
            "Each jurisdiction has specific requirements. I'll make sure your documents meet all local standards."
        ]
    },
    'StrategyBot': {
        'greetings': [
            "Hello! I'm StrategyBot, your case strategy advisor. I can help you develop a winning approach for your family court case.",
            "Hi! I specialize in legal strategy and case analysis. Let's work together to build a strong case.",
            "Welcome! I'm here to help you think strategically about your family court proceedings."
        ],
        'strategy_advice': [
            "Let's analyze your case strategy. What are your primary goals in this proceeding?",
            "Based on your situation, here are some strategic considerations to keep in mind for your case.",
            "I can help you organize your evidence and build a compelling case presentation that highlights your strengths.",
            "Strategic planning is key to success in family court. Let's develop a comprehensive timeline for your case.",
            "Understanding the judge's perspective is crucial. I can help you frame your arguments effectively."
        ],
        'case_analysis': [
            "Let's break down the key elements of your case and identify your strongest arguments.",
            "I can help you anticipate potential challenges and prepare responses in advance.",
            "Evidence organization is critical. Let me help you structure your documentation for maximum impact.",
            "We need to focus on what matters most to the court - the best interests of your children."
        ]
    },
    'CourtBot': {
        'greetings': [
            "Hello! I'm CourtBot, your court preparation specialist. I'll help you feel confident and prepared for your hearings.",
            "Hi there! I'm here to help you prepare for court appearances and understand courtroom procedures.",
            "Welcome! I specialize in court preparation and can help you practice for your upcoming hearings."
        ],
        'court_prep': [
            "Court preparation is essential for a successful outcome. When is your hearing scheduled?",
            "Let me walk you through what to expect during your court appearance, step by step.",
            "I can help you practice answering common questions and prepare for different scenarios you might face.",
            "Proper court etiquette and preparation can significantly impact how the judge perceives your case.",
            "Confidence in court comes from preparation. Let's make sure you're ready for anything."
        ],
        'procedure_help': [
            "Understanding courtroom procedures will help you feel more confident during your hearing.",
            "I can explain the typical flow of a family court hearing and what role you'll play.",
            "Let's practice some common questions you might be asked and how to answer them effectively.",
            "Knowing what to expect can reduce anxiety and help you present your best self in court."
        ]
    }
}

def get_agent_response(message, agent_type, conversation_context=None):
    """Generate an AI response based on the agent type and message content"""
    
    # Convert message to lowercase for keyword matching
    message_lower = message.lower()
    
    # Determine response category based on keywords
    if any(word in message_lower for word in ['hello', 'hi', 'hey', 'start', 'begin']):
        category = 'greetings'
    elif agent_type == 'FatherBot':
        if any(word in message_lower for word in ['sad', 'depressed', 'overwhelmed', 'scared', 'worried', 'anxious']):
            category = 'emotional_support'
        else:
            category = 'legal_questions'
    elif agent_type == 'DocuBot':
        if any(word in message_lower for word in ['form', 'fill', 'complete', 'section']):
            category = 'form_assistance'
        else:
            category = 'document_help'
    elif agent_type == 'StrategyBot':
        if any(word in message_lower for word in ['evidence', 'analyze', 'case', 'strengths']):
            category = 'case_analysis'
        else:
            category = 'strategy_advice'
    elif agent_type == 'CourtBot':
        if any(word in message_lower for word in ['procedure', 'process', 'what happens', 'expect']):
            category = 'procedure_help'
        else:
            category = 'court_prep'
    else:
        category = 'greetings'
    
    # Get responses for the agent and category
    agent_responses = AGENT_RESPONSES.get(agent_type, AGENT_RESPONSES['FatherBot'])
    responses = agent_responses.get(category, agent_responses['greetings'])
    
    # Select a random response
    response = random.choice(responses)
    
    # Add contextual information based on the message
    if 'custody' in message_lower:
        response += " Custody arrangements should always prioritize the best interests of your children."
    elif 'visitation' in message_lower:
        response += " Visitation rights are important for maintaining your relationship with your children."
    elif 'support' in message_lower and 'child' in message_lower:
        response += " Child support calculations are typically based on state guidelines and both parents' incomes."
    elif 'divorce' in message_lower:
        response += " Divorce proceedings can be complex, but proper preparation will help protect your interests."
    
    return response

@chat_bp.route('/chat', methods=['POST'])
@cross_origin()
def handle_chat():
    """Handle chat messages and return AI responses"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        message = data.get('message', '').strip()
        agent_type = data.get('agent', 'FatherBot')
        conversation_id = data.get('conversation_id')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Simulate processing time
        time.sleep(0.5 + random.random() * 1.5)
        
        # Generate AI response
        response = get_agent_response(message, agent_type)
        
        # Return the response
        return jsonify({
            'response': response,
            'agent': agent_type,
            'timestamp': time.time(),
            'conversation_id': conversation_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/agents', methods=['GET'])
@cross_origin()
def get_agents():
    """Get list of available AI agents"""
    agents = [
        {
            'id': 'FatherBot',
            'name': 'FatherBot',
            'description': 'General guidance and emotional support',
            'specialties': ['Legal guidance', 'Emotional support', 'Process explanation']
        },
        {
            'id': 'DocuBot',
            'name': 'DocuBot',
            'description': 'Document preparation assistance',
            'specialties': ['Form completion', 'Document generation', 'Filing assistance']
        },
        {
            'id': 'StrategyBot',
            'name': 'StrategyBot',
            'description': 'Legal strategy and case analysis',
            'specialties': ['Case strategy', 'Evidence organization', 'Timeline planning']
        },
        {
            'id': 'CourtBot',
            'name': 'CourtBot',
            'description': 'Court preparation and procedures',
            'specialties': ['Court preparation', 'Procedure explanation', 'Practice sessions']
        }
    ]
    
    return jsonify({'agents': agents})

@chat_bp.route('/health', methods=['GET'])
@cross_origin()
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'AI Chat Service'})
