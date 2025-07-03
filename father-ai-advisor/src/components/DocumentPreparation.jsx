import React, { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  RefreshCw
} from 'lucide-react'

const DocumentPreparation = () => {
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDocument, setGeneratedDocument] = useState(null)

  const documentTypes = [
    {
      id: 'custody_petition',
      title: 'Custody Petition',
      description: 'Request custody or modification of existing custody arrangements',
      complexity: 'Medium',
      estimatedTime: '15-20 minutes',
      requiredInfo: ['Personal information', 'Child details', 'Current arrangements', 'Requested changes']
    },
    {
      id: 'visitation_motion',
      title: 'Visitation Motion',
      description: 'Request visitation rights or modification of visitation schedule',
      complexity: 'Low',
      estimatedTime: '10-15 minutes',
      requiredInfo: ['Personal information', 'Child details', 'Current schedule', 'Proposed schedule']
    },
    {
      id: 'child_support_modification',
      title: 'Child Support Modification',
      description: 'Request modification of child support payments',
      complexity: 'Medium',
      estimatedTime: '20-25 minutes',
      requiredInfo: ['Financial information', 'Current order', 'Changed circumstances', 'Supporting documents']
    },
    {
      id: 'contempt_motion',
      title: 'Motion for Contempt',
      description: 'File when the other parent violates court orders',
      complexity: 'High',
      estimatedTime: '25-30 minutes',
      requiredInfo: ['Court order details', 'Violation specifics', 'Evidence', 'Requested relief']
    }
  ]

  const formSteps = {
    custody_petition: [
      {
        title: 'Personal Information',
        fields: [
          { name: 'petitioner_name', label: 'Your Full Name', type: 'text', required: true },
          { name: 'petitioner_address', label: 'Your Address', type: 'textarea', required: true },
          { name: 'petitioner_phone', label: 'Phone Number', type: 'tel', required: true },
          { name: 'respondent_name', label: "Other Parent's Full Name", type: 'text', required: true },
          { name: 'respondent_address', label: "Other Parent's Address", type: 'textarea', required: true }
        ]
      },
      {
        title: 'Child Information',
        fields: [
          { name: 'child_name', label: "Child's Full Name", type: 'text', required: true },
          { name: 'child_dob', label: "Child's Date of Birth", type: 'date', required: true },
          { name: 'child_address', label: "Child's Current Address", type: 'textarea', required: true },
          { name: 'child_school', label: "Child's School", type: 'text', required: false }
        ]
      },
      {
        title: 'Current Arrangements',
        fields: [
          { name: 'current_custody', label: 'Current Custody Arrangement', type: 'select', 
            options: ['Joint custody', 'Sole custody - Mother', 'Sole custody - Father', 'No formal arrangement'], required: true },
          { name: 'current_schedule', label: 'Current Visitation Schedule', type: 'textarea', required: true },
          { name: 'existing_order', label: 'Existing Court Order (Case Number)', type: 'text', required: false }
        ]
      },
      {
        title: 'Requested Changes',
        fields: [
          { name: 'requested_custody', label: 'Requested Custody Arrangement', type: 'select',
            options: ['Joint custody', 'Sole custody', 'Primary custody'], required: true },
          { name: 'requested_schedule', label: 'Proposed Visitation Schedule', type: 'textarea', required: true },
          { name: 'reasons', label: 'Reasons for Request', type: 'textarea', required: true },
          { name: 'best_interest', label: 'How This Serves Child\'s Best Interest', type: 'textarea', required: true }
        ]
      }
    ]
  }

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document)
    setCurrentStep(0)
    setFormData({})
    setGeneratedDocument(null)
  }

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const handleNextStep = () => {
    if (currentStep < formSteps[selectedDocument.id].length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const generateDocument = async () => {
    setIsGenerating(true)
    
    try {
      // Simulate document generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const mockDocument = {
        title: selectedDocument.title,
        content: `This is a generated ${selectedDocument.title} document based on your provided information.`,
        filename: `${selectedDocument.id}_${Date.now()}.pdf`,
        generatedAt: new Date().toISOString()
      }
      
      setGeneratedDocument(mockDocument)
    } catch (error) {
      console.error('Error generating document:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadDocument = () => {
    // In a real implementation, this would download the actual PDF
    const element = document.createElement('a')
    const file = new Blob([generatedDocument.content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = generatedDocument.filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (!selectedDocument) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Document Preparation</h1>
          <p className="text-xl text-gray-600">
            Generate accurate, jurisdiction-specific legal documents with AI assistance
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {documentTypes.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleDocumentSelect(doc)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="h-8 w-8 text-blue-600 mb-2" />
                  <Badge variant={doc.complexity === 'Low' ? 'default' : doc.complexity === 'Medium' ? 'secondary' : 'destructive'}>
                    {doc.complexity}
                  </Badge>
                </div>
                <CardTitle>{doc.title}</CardTitle>
                <CardDescription>{doc.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Estimated time: {doc.estimatedTime}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Required Information:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {doc.requiredInfo.map((info, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                          {info}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button className="w-full mt-4">
                    Start Document
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Important Legal Notice</h3>
              <p className="text-blue-800">
                These documents are generated based on common legal forms and your provided information. 
                While our AI ensures accuracy and completeness, we strongly recommend having any important 
                legal documents reviewed by a qualified attorney before filing with the court.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (generatedDocument) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Generated Successfully!</h1>
          <p className="text-xl text-gray-600">
            Your {selectedDocument.title} has been prepared and is ready for download.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-6 w-6 text-blue-600 mr-2" />
              {generatedDocument.title}
            </CardTitle>
            <CardDescription>
              Generated on {new Date(generatedDocument.generatedAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-700">
                {generatedDocument.content}
              </p>
            </div>
            
            <div className="flex space-x-4">
              <Button onClick={downloadDocument} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" onClick={() => setGeneratedDocument(null)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Another
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="bg-yellow-50 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-yellow-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Next Steps</h3>
              <ul className="text-yellow-800 space-y-2">
                <li>• Review the document carefully for accuracy</li>
                <li>• Consider having it reviewed by an attorney</li>
                <li>• Make copies for your records before filing</li>
                <li>• File with the appropriate court clerk</li>
                <li>• Serve the other party as required by law</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentStepData = formSteps[selectedDocument.id][currentStep]
  const isLastStep = currentStep === formSteps[selectedDocument.id].length - 1

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => setSelectedDocument(null)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documents
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedDocument.title}</h1>
        <p className="text-xl text-gray-600 mb-4">{selectedDocument.description}</p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / formSteps[selectedDocument.id].length) * 100}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 mb-8">
          <span>Step {currentStep + 1} of {formSteps[selectedDocument.id].length}</span>
          <span>{Math.round(((currentStep + 1) / formSteps[selectedDocument.id].length) * 100)}% Complete</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{currentStepData.title}</CardTitle>
          <CardDescription>
            Please provide the following information accurately. All required fields must be completed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {currentStepData.fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    required={field.required}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={field.required}
                  >
                    <option value="">Select an option</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex space-x-4">
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </Button>
              
              {isLastStep ? (
                <Button 
                  onClick={generateDocument}
                  disabled={isGenerating}
                  className="min-w-[140px]"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Document
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleNextStep}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DocumentPreparation

