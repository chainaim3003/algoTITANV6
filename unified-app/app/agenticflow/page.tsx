'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Message {
  text: string
  sender: 'user' | 'agent'
  timestamp: Date
}

interface AgentData {
  id: string
  name: string
  role: string
  credentials: string[]
  vleiVerified: boolean
  delegations: string[]
}

export default function AgenticFlowPage() {
  // Buyer Agent State
  const [buyerMessages, setBuyerMessages] = useState<Message[]>([
    { text: "👋 Hello! I'm your Buyer Agent. Type 'fetch my agent' to get started.", sender: 'agent', timestamp: new Date() }
  ])
  const [buyerInput, setBuyerInput] = useState('')
  const [buyerAgentData, setBuyerAgentData] = useState<AgentData | null>(null)
  const [sellerAgentFromBuyerData, setSellerAgentFromBuyerData] = useState<AgentData | null>(null)

  // Seller Agent State
  const [sellerMessages, setSellerMessages] = useState<Message[]>([
    { text: "👋 Hello! I'm your Seller Agent. Type 'fetch my agent' to get started.", sender: 'agent', timestamp: new Date() }
  ])
  const [sellerInput, setSellerInput] = useState('')
  const [sellerAgentData, setSellerAgentData] = useState<AgentData | null>(null)
  const [buyerAgentFromSellerData, setBuyerAgentFromSellerData] = useState<AgentData | null>(null)

  // Verification State
  const [verificationStatus, setVerificationStatus] = useState<{
    buyerVerified: boolean
    sellerVerified: boolean
    mutualTrustEstablished: boolean
  }>({
    buyerVerified: false,
    sellerVerified: false,
    mutualTrustEstablished: false
  })

  // Check for mutual trust establishment
  useEffect(() => {
    if (verificationStatus.buyerVerified && verificationStatus.sellerVerified) {
      setVerificationStatus(prev => ({ ...prev, mutualTrustEstablished: true }))
    }
  }, [verificationStatus.buyerVerified, verificationStatus.sellerVerified])

  // Buyer Agent Functions
  const addBuyerMessage = (text: string, sender: 'user' | 'agent') => {
    setBuyerMessages(prev => [...prev, { text, sender, timestamp: new Date() }])
  }

  const fetchBuyerAgentChat = () => {
    addBuyerMessage('Fetching buyer agent data...', 'agent')
    
    setTimeout(() => {
      const agentData: AgentData = {
        id: 'BUYER-AGENT-001',
        name: 'AlgoTITAN Buyer Agent',
        role: 'Procurement Specialist',
        credentials: ['vLEI-Verified', 'GoogleA2A-Certified', 'ISO-27001'],
        vleiVerified: true,
        delegations: ['Can negotiate prices', 'Can approve purchases up to $100K', 'Can verify seller credentials']
      }
      setBuyerAgentData(agentData)
      addBuyerMessage('✅ Buyer Agent loaded successfully!', 'agent')
      addBuyerMessage(`Agent ID: ${agentData.id}`, 'agent')
      addBuyerMessage(`Role: ${agentData.role}`, 'agent')
      addBuyerMessage(`vLEI Status: ${agentData.vleiVerified ? '✓ Verified' : '✗ Not Verified'}`, 'agent')
      addBuyerMessage("Type 'fetch seller agent' to retrieve the seller's agent.", 'agent')
    }, 1000)
  }

  const fetchSellerAgentFromBuyer = () => {
    if (!buyerAgentData) {
      addBuyerMessage("⚠️ Please fetch your buyer agent first!", 'agent')
      return
    }

    addBuyerMessage('Fetching seller agent data...', 'agent')
    
    setTimeout(() => {
      const sellerAgent: AgentData = {
        id: 'SELLER-AGENT-002',
        name: 'AlgoTITAN Seller Agent',
        role: 'Sales Representative',
        credentials: ['vLEI-Verified', 'GoogleA2A-Certified', 'PCI-DSS'],
        vleiVerified: true,
        delegations: ['Can offer discounts up to 15%', 'Can process orders', 'Can verify buyer credentials']
      }
      setSellerAgentFromBuyerData(sellerAgent)
      addBuyerMessage('✅ Seller Agent information retrieved!', 'agent')
      addBuyerMessage(`Agent ID: ${sellerAgent.id}`, 'agent')
      addBuyerMessage(`Role: ${sellerAgent.role}`, 'agent')
      addBuyerMessage(`vLEI Status: ${sellerAgent.vleiVerified ? '✓ Verified' : '✗ Not Verified'}`, 'agent')
      addBuyerMessage("Type 'verify seller' to verify the seller agent's credentials.", 'agent')
    }, 1000)
  }

  const verifySellerAgentFromBuyer = () => {
    if (!sellerAgentFromBuyerData) {
      addBuyerMessage("⚠️ Please fetch the seller agent first!", 'agent')
      return
    }

    addBuyerMessage('Verifying seller agent credentials...', 'agent')
    
    setTimeout(() => {
      const isValid = sellerAgentFromBuyerData.vleiVerified && 
                     sellerAgentFromBuyerData.credentials.includes('vLEI-Verified')
      
      if (isValid) {
        addBuyerMessage('✅ Seller Agent verification successful!', 'agent')
        addBuyerMessage('🔐 All credentials validated via vLEI infrastructure', 'agent')
        addBuyerMessage('📋 Delegations confirmed:', 'agent')
        sellerAgentFromBuyerData.delegations.forEach(del => {
          addBuyerMessage(`  • ${del}`, 'agent')
        })
        setVerificationStatus(prev => ({ ...prev, sellerVerified: true }))
      } else {
        addBuyerMessage('❌ Seller Agent verification failed!', 'agent')
        addBuyerMessage('⚠️ Credentials could not be validated', 'agent')
      }
    }, 1500)
  }

  const handleBuyerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!buyerInput.trim()) return

    const message = buyerInput.toLowerCase().trim()
    addBuyerMessage(buyerInput, 'user')
    setBuyerInput('')

    if (message.includes('fetch my agent') || message.includes('fetch buyer agent')) {
      fetchBuyerAgentChat()
    } else if (message.includes('fetch seller agent')) {
      if (buyerAgentData) {
        fetchSellerAgentFromBuyer()
      } else {
        addBuyerMessage("⚠️ Please fetch your buyer agent first!", 'agent')
      }
    } else if (message.includes('verify seller')) {
      if (sellerAgentFromBuyerData) {
        verifySellerAgentFromBuyer()
      } else {
        addBuyerMessage("⚠️ Please fetch the seller agent first!", 'agent')
      }
    } else {
      addBuyerMessage("I can help you with: 'fetch my agent', 'fetch seller agent', 'verify seller'", 'agent')
    }
  }

  // Seller Agent Functions
  const addSellerMessage = (text: string, sender: 'user' | 'agent') => {
    setSellerMessages(prev => [...prev, { text, sender, timestamp: new Date() }])
  }

  const fetchSellerAgentChat = () => {
    addSellerMessage('Fetching seller agent data...', 'agent')
    
    setTimeout(() => {
      const agentData: AgentData = {
        id: 'SELLER-AGENT-002',
        name: 'AlgoTITAN Seller Agent',
        role: 'Sales Representative',
        credentials: ['vLEI-Verified', 'GoogleA2A-Certified', 'PCI-DSS'],
        vleiVerified: true,
        delegations: ['Can offer discounts up to 15%', 'Can process orders', 'Can verify buyer credentials']
      }
      setSellerAgentData(agentData)
      addSellerMessage('✅ Seller Agent loaded successfully!', 'agent')
      addSellerMessage(`Agent ID: ${agentData.id}`, 'agent')
      addSellerMessage(`Role: ${agentData.role}`, 'agent')
      addSellerMessage(`vLEI Status: ${agentData.vleiVerified ? '✓ Verified' : '✗ Not Verified'}`, 'agent')
      addSellerMessage("Type 'fetch buyer agent' to retrieve the buyer's agent.", 'agent')
    }, 1000)
  }

  const fetchBuyerAgentFromSeller = () => {
    if (!sellerAgentData) {
      addSellerMessage("⚠️ Please fetch your seller agent first!", 'agent')
      return
    }

    addSellerMessage('Fetching buyer agent data...', 'agent')
    
    setTimeout(() => {
      const buyerAgent: AgentData = {
        id: 'BUYER-AGENT-001',
        name: 'AlgoTITAN Buyer Agent',
        role: 'Procurement Specialist',
        credentials: ['vLEI-Verified', 'GoogleA2A-Certified', 'ISO-27001'],
        vleiVerified: true,
        delegations: ['Can negotiate prices', 'Can approve purchases up to $100K', 'Can verify seller credentials']
      }
      setBuyerAgentFromSellerData(buyerAgent)
      addSellerMessage('✅ Buyer Agent information retrieved!', 'agent')
      addSellerMessage(`Agent ID: ${buyerAgent.id}`, 'agent')
      addSellerMessage(`Role: ${buyerAgent.role}`, 'agent')
      addSellerMessage(`vLEI Status: ${buyerAgent.vleiVerified ? '✓ Verified' : '✗ Not Verified'}`, 'agent')
      addSellerMessage("Type 'verify buyer' to verify the buyer agent's credentials.", 'agent')
    }, 1000)
  }

  const verifyBuyerAgentFromSeller = () => {
    if (!buyerAgentFromSellerData) {
      addSellerMessage("⚠️ Please fetch the buyer agent first!", 'agent')
      return
    }

    addSellerMessage('Verifying buyer agent credentials...', 'agent')
    
    setTimeout(() => {
      const isValid = buyerAgentFromSellerData.vleiVerified && 
                     buyerAgentFromSellerData.credentials.includes('vLEI-Verified')
      
      if (isValid) {
        addSellerMessage('✅ Buyer Agent verification successful!', 'agent')
        addSellerMessage('🔐 All credentials validated via vLEI infrastructure', 'agent')
        addSellerMessage('📋 Delegations confirmed:', 'agent')
        buyerAgentFromSellerData.delegations.forEach(del => {
          addSellerMessage(`  • ${del}`, 'agent')
        })
        setVerificationStatus(prev => ({ ...prev, buyerVerified: true }))
      } else {
        addSellerMessage('❌ Buyer Agent verification failed!', 'agent')
        addSellerMessage('⚠️ Credentials could not be validated', 'agent')
      }
    }, 1500)
  }

  const handleSellerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sellerInput.trim()) return

    const message = sellerInput.toLowerCase().trim()
    addSellerMessage(sellerInput, 'user')
    setSellerInput('')

    if (message.includes('fetch my agent') || message.includes('fetch seller agent')) {
      fetchSellerAgentChat()
    } else if (message.includes('fetch buyer agent')) {
      if (sellerAgentData) {
        fetchBuyerAgentFromSeller()
      } else {
        addSellerMessage("⚠️ Please fetch your seller agent first!", 'agent')
      }
    } else if (message.includes('verify buyer')) {
      if (buyerAgentFromSellerData) {
        verifyBuyerAgentFromSeller()
      } else {
        addSellerMessage("⚠️ Please fetch the buyer agent first!", 'agent')
      }
    } else {
      addSellerMessage("I can help you with: 'fetch my agent', 'fetch buyer agent', 'verify buyer'", 'agent')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 lg:p-8">
      <div className="max-w-[1900px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <Link href="/" className="inline-block mb-4 text-blue-600 hover:text-blue-700">
            ← Back to Home
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AgenticFlow – vLEI Verified AI Agents
          </h1>
          <p className="text-slate-600 text-sm lg:text-base font-medium">
            Mutual Trust Delegation Verification System
          </p>
          <p className="text-slate-500 text-xs lg:text-sm mt-2">
            Powered by vLEI Infrastructure on GoogleA2A
          </p>
        </div>

        {/* Mutual Trust Status Banner */}
        {verificationStatus.mutualTrustEstablished && (
          <div className="mb-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg animate-pulse">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <h3 className="text-xl font-bold">Mutual Trust Established!</h3>
                <p className="text-sm text-green-100">Both agents have verified each other's credentials via vLEI</p>
              </div>
            </div>
          </div>
        )}

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* LEFT COLUMN - Buyer Agent Chat */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-xl h-[700px] flex flex-col overflow-hidden border-2 border-blue-200">
              {/* Buyer Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 lg:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/20 flex items-center justify-center text-xl lg:text-2xl">
                    🛒
                  </div>
                  <div>
                    <h2 className="text-lg lg:text-xl font-bold">Buyer Agent</h2>
                    <p className="text-xs lg:text-sm text-blue-100">Procurement Specialist</p>
                  </div>
                </div>
                {buyerAgentData && (
                  <div className="mt-3 text-xs bg-white/10 rounded-lg p-2">
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      <span className="font-semibold">
                        {buyerAgentData.vleiVerified ? '✓ vLEI Verified' : '○ Pending'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Buyer Messages */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3 bg-gradient-to-b from-blue-50/30 to-white">
                {buyerMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white border border-blue-100 text-slate-800 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <span className={`text-[10px] mt-1 block ${
                        msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                      }`}>
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Buyer Input */}
              <form onSubmit={handleBuyerSubmit} className="p-4 bg-white border-t-2 border-blue-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={buyerInput}
                    onChange={(e) => setBuyerInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2.5 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>

            {/* Buyer Quick Commands */}
            <div className="mt-4 bg-white rounded-xl p-4 shadow-md border border-blue-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Quick Commands:</h3>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><code className="bg-blue-50 px-1.5 py-0.5 rounded">fetch my agent</code> - Load buyer agent</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><code className="bg-blue-50 px-1.5 py-0.5 rounded">fetch seller agent</code> - Get seller info</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><code className="bg-blue-50 px-1.5 py-0.5 rounded">verify seller</code> - Verify seller credentials</span>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN - Verification Panel */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-xl h-[700px] flex flex-col border-2 border-purple-200">
              {/* Verification Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                    🔐
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Trust Verification</h2>
                    <p className="text-sm text-purple-100">Mutual Delegation Check</p>
                  </div>
                </div>
              </div>

              {/* Verification Content */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                
                {/* Workflow Diagram */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    Verification Workflow
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        buyerAgentData ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        1
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">Buyer Agent Initialization</p>
                        <p className="text-xs text-slate-500">{buyerAgentData ? '✓ Complete' : 'Pending'}</p>
                      </div>
                    </div>

                    <div className="ml-4 border-l-2 border-purple-300 h-6"></div>

                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        sellerAgentData ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        2
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">Seller Agent Initialization</p>
                        <p className="text-xs text-slate-500">{sellerAgentData ? '✓ Complete' : 'Pending'}</p>
                      </div>
                    </div>

                    <div className="ml-4 border-l-2 border-purple-300 h-6"></div>

                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        sellerAgentFromBuyerData ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        3
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">Cross-Agent Discovery</p>
                        <p className="text-xs text-slate-500">{sellerAgentFromBuyerData && buyerAgentFromSellerData ? '✓ Complete' : 'Pending'}</p>
                      </div>
                    </div>

                    <div className="ml-4 border-l-2 border-purple-300 h-6"></div>

                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        verificationStatus.buyerVerified && verificationStatus.sellerVerified ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        4
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">Mutual Verification</p>
                        <p className="text-xs text-slate-500">
                          {verificationStatus.buyerVerified && verificationStatus.sellerVerified ? '✓ Complete' : 'Pending'}
                        </p>
                      </div>
                    </div>

                    <div className="ml-4 border-l-2 border-purple-300 h-6"></div>

                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        verificationStatus.mutualTrustEstablished ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        5
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">Trust Established</p>
                        <p className="text-xs text-slate-500">
                          {verificationStatus.mutualTrustEstablished ? '✓ Ready for Transaction' : 'Not Ready'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="bg-white rounded-xl p-5 border-2 border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    Current Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">Buyer Verified</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        verificationStatus.buyerVerified 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {verificationStatus.buyerVerified ? '✓ Yes' : '○ No'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">Seller Verified</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        verificationStatus.sellerVerified 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {verificationStatus.sellerVerified ? '✓ Yes' : '○ No'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">Mutual Trust</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        verificationStatus.mutualTrustEstablished 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {verificationStatus.mutualTrustEstablished ? '✓ Established' : '○ Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* vLEI Information */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">🔒</span>
                    vLEI Infrastructure
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Verifiable Legal Entity Identifiers (vLEI) provide cryptographic proof of organizational identity and authority delegation.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white rounded-lg p-2 border border-blue-200">
                      <div className="font-semibold text-blue-700">Cryptographic</div>
                      <div className="text-slate-600">Signatures</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-blue-200">
                      <div className="font-semibold text-blue-700">Decentralized</div>
                      <div className="text-slate-600">Verification</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-blue-200">
                      <div className="font-semibold text-blue-700">Immutable</div>
                      <div className="text-slate-600">Records</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-blue-200">
                      <div className="font-semibold text-blue-700">Global</div>
                      <div className="text-slate-600">Standards</div>
                    </div>
                  </div>
                </div>

                {/* Agent Data Display */}
                {(buyerAgentData || sellerAgentData) && (
                  <div className="bg-white rounded-xl p-5 border-2 border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="text-lg">🤖</span>
                      Active Agents
                    </h3>
                    <div className="space-y-4">
                      {buyerAgentData && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-semibold text-blue-900">
                              {buyerAgentData.name}
                            </span>
                            <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                              Buyer
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 space-y-1">
                            <div>ID: {buyerAgentData.id}</div>
                            <div>Role: {buyerAgentData.role}</div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {buyerAgentData.credentials.map((cred, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px]">
                                  {cred}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {sellerAgentData && (
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-semibold text-orange-900">
                              {sellerAgentData.name}
                            </span>
                            <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">
                              Seller
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 space-y-1">
                            <div>ID: {sellerAgentData.id}</div>
                            <div>Role: {sellerAgentData.role}</div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {sellerAgentData.credentials.map((cred, idx) => (
                                <span key={idx} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px]">
                                  {cred}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Seller Agent Chat */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-xl h-[700px] flex flex-col overflow-hidden border-2 border-orange-200">
              {/* Seller Header */}
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-4 lg:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/20 flex items-center justify-center text-xl lg:text-2xl">
                    💼
                  </div>
                  <div>
                    <h2 className="text-lg lg:text-xl font-bold">Seller Agent</h2>
                    <p className="text-xs lg:text-sm text-orange-100">Sales Representative</p>
                  </div>
                </div>
                {sellerAgentData && (
                  <div className="mt-3 text-xs bg-white/10 rounded-lg p-2">
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      <span className="font-semibold">
                        {sellerAgentData.vleiVerified ? '✓ vLEI Verified' : '○ Pending'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Seller Messages */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3 bg-gradient-to-b from-orange-50/30 to-white">
                {sellerMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        msg.sender === 'user'
                          ? 'bg-orange-600 text-white rounded-br-sm'
                          : 'bg-white border border-orange-100 text-slate-800 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <span className={`text-[10px] mt-1 block ${
                        msg.sender === 'user' ? 'text-orange-100' : 'text-slate-400'
                      }`}>
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Seller Input */}
              <form onSubmit={handleSellerSubmit} className="p-4 bg-white border-t-2 border-orange-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sellerInput}
                    onChange={(e) => setSellerInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2.5 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium text-sm"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>

            {/* Seller Quick Commands */}
            <div className="mt-4 bg-white rounded-xl p-4 shadow-md border border-orange-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Quick Commands:</h3>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span><code className="bg-orange-50 px-1.5 py-0.5 rounded">fetch my agent</code> - Load seller agent</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span><code className="bg-orange-50 px-1.5 py-0.5 rounded">fetch buyer agent</code> - Get buyer info</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span><code className="bg-orange-50 px-1.5 py-0.5 rounded">verify buyer</code> - Verify buyer credentials</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Information */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-md border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-xl">💡</span>
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">1. Agent Initialization</h4>
              <p className="text-slate-600">
                Both buyer and seller agents initialize with their vLEI credentials, establishing their identity and authority.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-700 mb-2">2. Cross-Verification</h4>
              <p className="text-slate-600">
                Each agent fetches and verifies the other's credentials through the vLEI infrastructure, ensuring authenticity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-green-700 mb-2">3. Trust Establishment</h4>
              <p className="text-slate-600">
                Once both agents verify each other, mutual trust is established and transaction can proceed securely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
