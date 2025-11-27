"use client"

import { useState, useEffect, useRef } from "react"
import {
  Shield,
  CheckCircle,
  Building2,
  Package,
  Lock,
  Building,
  User,
  Check,
  Loader2,
  Send,
  MessageSquare,
  XCircle,
  Search,
  UserCheck,
  ShieldCheck,
  BadgeCheck,
  ArrowRight,
  Bot,
  FileText,
  DollarSign,
  CheckCircle2,
  XOctagon,
  Paperclip,
  Download,
  AlertCircle,
  Receipt,
  Warehouse,
  ExternalLink,
  CreditCard,
  Wallet,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react"

// ============================================
// API CONFIGURATION
// ============================================
const USE_MOCK_VERIFICATION = true // Set to false for real API calls
const API_BASE_URL = 'http://localhost:4000'

// Get marketplace fee from environment (percentage like 0.25) and convert to decimal (0.0025)
const MARKETPLACE_FEE = parseFloat(process.env.NEXT_PUBLIC_MARKETPLACE_FEE || '0.25')
const PLATFORM_FEE_PERCENTAGE = MARKETPLACE_FEE / 100 // Convert 0.25% to 0.0025

// Get tax rate from environment (percentage like 18)
const TAX_RATE = parseFloat(process.env.NEXT_PUBLIC_TAX_RATE || '18')
const TAX_RATE_DECIMAL = TAX_RATE / 100 // Convert 18% to 0.18

// Algorand Network Configuration
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || 'testnet-v1.0'
const ALGORAND_NETWORK = process.env.NEXT_PUBLIC_ALGORAND_NETWORK || 'testnet'
const ALGORAND_API_URL = process.env.NEXT_PUBLIC_ALGORAND_API_URL || 'https://testnet-api.algonode.cloud'

// Payment Configuration
const PAYMENT_CURRENCY = process.env.NEXT_PUBLIC_PAYMENT_CURRENCY || 'ALGO'
const USDC_ALGO_TESTNET_ASSET_ID = parseInt(process.env.NEXT_PUBLIC_USDC_ALGO_TESTNET_ASSET_ID || '10458941')

// Get wallet addresses from environment or use defaults for demo
const BUYER_WALLET = process.env.NEXT_PUBLIC_BUYER_WALLET || 'GBUYERWALLETADDRESSEXAMPLE123456789'
const SELLER_WALLET = process.env.NEXT_PUBLIC_SELLER_WALLET || 'GSELLERWALLETADDRESSEXAMPLE123456789'
const MARKETPLACE_WALLET = process.env.NEXT_PUBLIC_MARKETPLACE_WALLET || 'GMARKETPLACEWALLETADDRESSEXAMPLE123456789'

// Get secret keys from environment (for transaction signing)
const BUYER_SECRET_KEY = process.env.NEXT_PUBLIC_BUYER_SECRET_KEY || ''
const SELLER_SECRET_KEY = process.env.NEXT_PUBLIC_SELLER_SECRET_KEY || ''

// Unique ID generator
let messageIdCounter = 0
const generateUniqueId = () => `msg-${Date.now()}-${messageIdCounter++}`

// ============================================
// INTERFACES
// ============================================
interface AgentCard {
  alias: string
  engagementContextRole: string
  agentType: string
  verified?: boolean
  timestamp?: string
  name?: string
  agentAID?: string
  oorRole?: string
}

interface ChatMessage {
  id: string
  text: string
  type: 'user' | 'agent'
  timestamp: Date
}

interface BusinessMessage {
  id: string
  from: 'buyer' | 'seller'
  to: 'buyer' | 'seller'
  type: 'po' | 'po_response' | 'payment' | 'invoice' | 'invoice_payment' | 'warehouse_receipt' | 'receipt_payment'
  content: string
  attachment?: POData | PaymentData | InvoiceData | WarehouseReceiptData
  timestamp: Date
  verified: boolean
  status: 'pending' | 'verified' | 'rejected'
}

interface POData {
  poNumber: string
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    total: number
  }>
  totalAmount: number
  deliveryTerms: string
  paymentTerms: string
  deliveryDate: string
}

interface PaymentData {
  amount: number
  platformFee: number
  totalPaid: number
  currency: string
  transactionHash: string
  peraExplorerLink: string
  status: 'pending' | 'completed' | 'failed'
  paymentType: 'po_acceptance' | 'invoice' | 'warehouse_receipt'
}

interface InvoiceData {
  invoiceNumber: string
  poNumber: string
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax: number
  totalAmount: number
  dueDate: string
  notes: string
}

interface WarehouseReceiptData {
  receiptNumber: string
  poNumber: string
  invoiceNumber: string
  items: Array<{
    name: string
    quantity: number
    warehouseLocation: string
  }>
  receivedDate: string
  inspector: string
  notes: string
}

type AgenticStep =
  | 'idle'
  | 'fetching-buyer-agent'
  | 'buyer-agent-fetched'
  | 'fetching-seller-agent'
  | 'seller-agent-fetched'
  | 'verifying-seller-agent'
  | 'seller-agent-verified'
  | 'business-ready'

type SellerAgenticStep =
  | 'idle'
  | 'fetching-seller-agent'
  | 'seller-agent-fetched'
  | 'fetching-buyer-agent'
  | 'buyer-agent-fetched'
  | 'verifying-buyer-agent'
  | 'buyer-agent-verified'
  | 'business-ready'

// ============================================
// MOCK DATA
// ============================================
const LEI_DATA = {
  tommy: {
    name: "TOMMY HILFIGER EUROPE B.V.",
    lei: "54930012QJWZMYHNJW95",
    address: "Danzigerkade 165, 1013 AP Amsterdam, Netherlands",
  },
  jupiter: {
    name: "JUPITER KNITTING COMPANY",
    lei: "3358004DXAMRWRUIYJ05",
    address: "5/22, Textile Park, Tiruppur, Tamil Nadu, India",
  },
}

export default function AgenticFlow() {
  // ============================================
  // WALLET STATE
  // ============================================
  const [showBuyerWallet, setShowBuyerWallet] = useState(false)
  const [showSellerWallet, setShowSellerWallet] = useState(false)
  const [showPlatformWallet, setShowPlatformWallet] = useState(false)
  const [buyerBalance, setBuyerBalance] = useState<string | null>(null)
  const [sellerBalance, setSellerBalance] = useState<string | null>(null)
  const [platformBalance, setPlatformBalance] = useState<string | null>(null)
  const [loadingBuyerBalance, setLoadingBuyerBalance] = useState(false)
  const [loadingSellerBalance, setLoadingSellerBalance] = useState(false)
  const [loadingPlatformBalance, setLoadingPlatformBalance] = useState(false)

  // ============================================
  // BUYER SIDE STATE
  // ============================================
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [agenticStep, setAgenticStep] = useState<AgenticStep>('idle')
  const [showBuyerCardDetails, setShowBuyerCardDetails] = useState(false)
  const [showSellerCardDetails, setShowSellerCardDetails] = useState(false)
  const [buyerAgentData, setBuyerAgentData] = useState<AgentCard | null>(null)
  const [sellerAgentFromBuyerData, setSellerAgentFromBuyerData] = useState<AgentCard | null>(null)
  const [sellerAgentVerified, setSellerAgentVerified] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // ============================================
  // SELLER SIDE STATE
  // ============================================
  const [sellerChatMessages, setSellerChatMessages] = useState<ChatMessage[]>([])
  const [sellerInputMessage, setSellerInputMessage] = useState("")
  const [sellerAgenticStep, setSellerAgenticStep] = useState<SellerAgenticStep>('idle')
  const [showSellerAgentCardDetails, setShowSellerAgentCardDetails] = useState(false)
  const [showBuyerAgentCardDetails, setShowBuyerAgentCardDetails] = useState(false)
  const [sellerAgentData, setSellerAgentData] = useState<AgentCard | null>(null)
  const [buyerAgentFromSellerData, setBuyerAgentFromSellerData] = useState<AgentCard | null>(null)
  const [buyerAgentVerified, setBuyerAgentVerified] = useState(false)
  const chatEndRefSeller = useRef<HTMLDivElement>(null)

  // ============================================
  // BUSINESS MESSAGING STATE
  // ============================================
  const [businessMessages, setBusinessMessages] = useState<BusinessMessage[]>([])
  const [showPOForm, setShowPOForm] = useState(false)
  const [poData, setPOData] = useState<POData>({
    poNumber: `PO-${Date.now()}`,
    items: [{ name: 'Organic Cotton T-Shirts', quantity: 1000, unitPrice: 100, total: 100000 }],
    totalAmount: 100000,
    deliveryTerms: 'FOB Mumbai Port',
    paymentTerms: '20% upfront, balance on milestones',
    deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })
  const [pendingPO, setPendingPO] = useState<POData | null>(null)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [poResponseStatus, setPOResponseStatus] = useState<'accept' | 'reject' | null>(null)
  const [currentPOData, setCurrentPOData] = useState<POData | null>(null)
  const [pendingInvoice, setPendingInvoice] = useState<InvoiceData | null>(null)
  const [pendingReceipt, setPendingReceipt] = useState<WarehouseReceiptData | null>(null)

  // ============================================
  // WALLET BALANCE FUNCTIONS
  // ============================================
  const fetchWalletBalance = async (walletAddress: string): Promise<string> => {
    try {
      console.log(`🔍 Fetching balance for: ${walletAddress}`)
      
      // Import algosdk
      const algosdk = await import('algosdk')
      
      console.log('✅ algosdk imported successfully')
      
      // Algorand TestNet API client
      const algodToken = ''
      const algodServer = ALGORAND_API_URL
      const algodPort = 443
      const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort)
      
      console.log(`🌐 API Client created: ${algodServer}`)
      
      // Get account info
      console.log('📊 Calling accountInformation...')
      const accountInfo = await algodClient.accountInformation(walletAddress).do()
      
      console.log('✅ Account info received:', accountInfo)
      
      // Convert microAlgos to ALGO (1 ALGO = 1,000,000 microAlgos)
      // accountInfo.amount is a BigInt in algosdk v3, convert to Number first
      const balanceInAlgo = Number(accountInfo.amount) / 1_000_000
      
      console.log(`✅ Balance for ${walletAddress}: ${balanceInAlgo} ALGO`)
      
      return balanceInAlgo.toFixed(4)
    } catch (error) {
      console.error('❌ Error fetching wallet balance:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }

  const refreshBuyerBalance = async () => {
    setLoadingBuyerBalance(true)
    try {
      const balance = await fetchWalletBalance(BUYER_WALLET)
      setBuyerBalance(balance)
    } catch (error) {
      setBuyerBalance('Error')
    } finally {
      setLoadingBuyerBalance(false)
    }
  }

  const refreshSellerBalance = async () => {
    setLoadingSellerBalance(true)
    try {
      const balance = await fetchWalletBalance(SELLER_WALLET)
      setSellerBalance(balance)
    } catch (error) {
      setSellerBalance('Error')
    } finally {
      setLoadingSellerBalance(false)
    }
  }

  const refreshPlatformBalance = async () => {
    setLoadingPlatformBalance(true)
    try {
      const balance = await fetchWalletBalance(MARKETPLACE_WALLET)
      setPlatformBalance(balance)
    } catch (error) {
      setPlatformBalance('Error')
    } finally {
      setLoadingPlatformBalance(false)
    }
  }

  // Fetch balance when wallet is expanded
  useEffect(() => {
    if (showBuyerWallet && !buyerBalance) {
      refreshBuyerBalance()
    }
  }, [showBuyerWallet])

  useEffect(() => {
    if (showSellerWallet && !sellerBalance) {
      refreshSellerBalance()
    }
  }, [showSellerWallet])

  useEffect(() => {
    if (showPlatformWallet && !platformBalance) {
      refreshPlatformBalance()
    }
  }, [showPlatformWallet])

  // ============================================
  // SCROLL EFFECTS
  // ============================================
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  useEffect(() => {
    chatEndRefSeller.current?.scrollIntoView({ behavior: "smooth" })
  }, [sellerChatMessages])

  // ============================================
  // AUTO-VERIFY EFFECTS
  // ============================================
  useEffect(() => {
    if (agenticStep === 'seller-agent-fetched' && sellerAgentFromBuyerData && !sellerAgentVerified) {
      setTimeout(() => verifySellerAgent(), 1000)
    }
  }, [agenticStep, sellerAgentFromBuyerData])

  useEffect(() => {
    if (sellerAgenticStep === 'buyer-agent-fetched' && buyerAgentFromSellerData && !buyerAgentVerified) {
      setTimeout(() => verifyBuyerAgentFromSeller(), 1000)
    }
  }, [sellerAgenticStep, buyerAgentFromSellerData])

  useEffect(() => {
    if (sellerAgentVerified && agenticStep === 'seller-agent-verified') {
      setAgenticStep('business-ready')
      addMessage("✅ Ready for business! Type 'send po' to create a Purchase Order.", 'agent')
    }
  }, [sellerAgentVerified])

  useEffect(() => {
    if (buyerAgentVerified && sellerAgenticStep === 'buyer-agent-verified') {
      setSellerAgenticStep('business-ready')
      addSellerMessage("✅ Ready for business! Waiting for buyer's messages.", 'agent')
    }
  }, [buyerAgentVerified])

  // ============================================
  // CORE VERIFICATION FUNCTION
  // ============================================
  const fetchAndVerifyAgent = async (
    agentType: 'buyer' | 'seller',
    agentUrl: string
  ): Promise<{ success: boolean; agentCard?: AgentCard; error?: string }> => {
    try {
      console.log(`🔄 Fetching ${agentType} agent card from: ${agentUrl}`)
      
      const response = await fetch(agentUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch agent card: ${response.status}`)
      }

      const agentCardData = await response.json()
      
      const agentCard: AgentCard = {
        alias: agentCardData.name || "Unknown Agent",
        engagementContextRole: agentCardData.extensions?.gleifIdentity?.engagementRole || "Unknown Role",
        agentType: "AI",
        verified: false,
        timestamp: new Date().toLocaleTimeString(),
        name: agentCardData.name,
        agentAID: agentCardData.extensions?.keriIdentifiers?.agentAID,
        oorRole: agentCardData.extensions?.gleifIdentity?.officialRole
      }

      console.log(`✅ Agent card fetched:`, {
        name: agentCard.name,
        agentAID: agentCard.agentAID,
        oorRole: agentCard.oorRole
      })

      if (USE_MOCK_VERIFICATION) {
        console.log(`🔐 [MOCK] Verifying ${agentType}...`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        agentCard.verified = true
        return { success: true, agentCard }
      }

      const verifyEndpoint = agentType === 'buyer' 
        ? `${API_BASE_URL}/api/verify/buyer`
        : `${API_BASE_URL}/api/verify/seller`

      console.log(`🔐 Calling verification: ${verifyEndpoint}`)
      
      const verifyResponse = await fetch(verifyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentCard.name,
          agentAID: agentCard.agentAID,
          oorRole: agentCard.oorRole,
        }),
      })

      const verifyResult = await verifyResponse.json()
      
      if (verifyResult.success && verifyResult.verified) {
        console.log(`✅ ${agentType} verification passed`)
        agentCard.verified = true
        return { success: true, agentCard }
      } else {
        console.log(`❌ ${agentType} verification failed:`, verifyResult.error)
        return { success: false, error: verifyResult.error || 'Verification failed' }
      }

    } catch (error: any) {
      console.error(`❌ Error fetching/verifying ${agentType}:`, error)
      return { success: false, error: error.message }
    }
  }

  // ============================================
  // MESSAGE VERIFICATION ON RECEIPT
  // ============================================
  const verifyReceivedMessage = async (
    senderType: 'buyer' | 'seller',
    messageId: string
  ): Promise<boolean> => {
    console.log(`\n📨 Message received from ${senderType}. Starting verification...`)
    
    const agentUrl = senderType === 'buyer'
      ? 'http://localhost:9090/.well-known/agent-card.json'
      : 'http://localhost:8080/.well-known/agent-card.json'

    const result = await fetchAndVerifyAgent(senderType, agentUrl)

    if (result.success && result.agentCard?.verified) {
      console.log(`✅ Message ${messageId} verified from ${senderType}`)
      
      setBusinessMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, verified: true, status: 'verified' }
          : msg
      ))
      
      return true
    } else {
      console.log(`❌ Message ${messageId} rejected - verification failed`)
      
      setBusinessMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, verified: false, status: 'rejected' }
          : msg
      ))
      
      return false
    }
  }

  // ============================================
  // REAL ATOMIC PAYMENT FUNCTION WITH MARKETPLACE FEE
  // ============================================
  const executeAtomicPayment = async (
    amount: number,
    paymentType: 'po_acceptance' | 'invoice' | 'warehouse_receipt'
  ): Promise<PaymentData> => {
    const platformFee = amount * PLATFORM_FEE_PERCENTAGE
    const totalPaid = amount + platformFee

    console.log(`💰 Executing Algorand atomic payment:`)
    console.log(`   Amount to seller: ${amount} ALGO`)
    console.log(`   Marketplace fee (${MARKETPLACE_FEE}%): ${platformFee.toFixed(4)} ALGO`)
    console.log(`   Total: ${totalPaid.toFixed(4)} ALGO`)

    try {
      // Check if buyer secret key is available
      if (!BUYER_SECRET_KEY) {
        throw new Error('Buyer secret key not configured. Please set NEXT_PUBLIC_BUYER_SECRET_KEY in environment.')
      }

      // Import algosdk
      const algosdk = await import('algosdk')
      
      // Algorand Network configuration
      const algodToken = ''
      const algodServer = ALGORAND_API_URL
      const algodPort = 443
      const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort)
      
      console.log(`🌐 Network: ${ALGORAND_NETWORK} (${CHAIN_ID})`)
      console.log(`🔗 API Endpoint: ${algodServer}`)
      console.log(`💵 Payment Currency: ${PAYMENT_CURRENCY}`)

      // Get suggested parameters from the network
      const suggestedParams = await algodClient.getTransactionParams().do()

      // Convert ALGO to microAlgos (1 ALGO = 1,000,000 microAlgos)
      const amountMicroAlgos = Math.round(amount * 1_000_000)
      const feeMicroAlgos = Math.round(platformFee * 1_000_000)

      console.log(`📝 Creating atomic transaction group:`)
      console.log(`   Transaction 1: ${amountMicroAlgos} microAlgos (${amount} ALGO) → Seller`)
      console.log(`   Transaction 2: ${feeMicroAlgos} microAlgos (${platformFee.toFixed(4)} ALGO) → Marketplace`)

      // Create transaction 1: Buyer → Seller (main payment)
      const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: BUYER_WALLET,
        receiver: SELLER_WALLET,
        amount: amountMicroAlgos,
        suggestedParams,
        note: new Uint8Array(new TextEncoder().encode(`Payment: ${paymentType}`)),
      })

      // Create transaction 2: Buyer → Marketplace (fee)
      const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: BUYER_WALLET,
        receiver: MARKETPLACE_WALLET,
        amount: feeMicroAlgos,
        suggestedParams,
        note: new Uint8Array(new TextEncoder().encode(`Marketplace fee: ${paymentType}`)),
      })

      // Group the transactions atomically
      const txnGroup = [txn1, txn2]
      algosdk.assignGroupID(txnGroup)
      
      console.log(`✅ Atomic group created`)
      console.log(`🔐 Signing transactions with buyer's key...`)

      // Decode the buyer's secret key
      const buyerAccount = algosdk.mnemonicToSecretKey(BUYER_SECRET_KEY)
      
      // Sign both transactions
      const signedTxn1 = txn1.signTxn(buyerAccount.sk)
      const signedTxn2 = txn2.signTxn(buyerAccount.sk)

      console.log(`✅ Transactions signed`)
      console.log(`📤 Submitting atomic group to Algorand TestNet...`)

      // Submit the grouped transactions
      const response = await algodClient.sendRawTransaction([signedTxn1, signedTxn2]).do()
      
      // In algosdk v3, the field is 'txid' (lowercase)
      const txId = response.txid

      console.log(`✅ Transaction submitted!`)
      console.log(`   TX ID: ${txId}`)
      console.log(`⏳ Waiting for confirmation...`)

      // Wait for confirmation
      const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4)

      console.log(`✅ Transaction confirmed in round ${confirmedTxn['confirmed-round']}`)
      console.log(`🔗 View on Pera Explorer: https://testnet.explorer.perawallet.app/tx/${txId}`)

      return {
        amount,
        platformFee,
        totalPaid,
        currency: 'ALGO',
        transactionHash: txId,
        peraExplorerLink: `https://testnet.explorer.perawallet.app/tx/${txId}`,
        status: 'completed',
        paymentType,
      }

    } catch (error: any) {
      console.error('💥 Payment error:', error)
      throw new Error(`Payment failed: ${error.message}`)
    }
  }

  // ============================================
  // BUYER: FETCH AGENTS
  // ============================================
  const addMessage = (text: string, type: 'user' | 'agent') => {
    setChatMessages(prev => [...prev, {
      id: generateUniqueId(),
      text,
      type,
      timestamp: new Date(),
    }])
  }

  const fetchBuyerAgent = async () => {
    setAgenticStep('fetching-buyer-agent')
    addMessage("🔄 Fetching buyer agent...", 'agent')

    const result = await fetchAndVerifyAgent('buyer', 'http://localhost:9090/.well-known/agent-card.json')
    
    if (result.success && result.agentCard) {
      setBuyerAgentData(result.agentCard)
      setAgenticStep('buyer-agent-fetched')
      addMessage("✅ Buyer agent fetched successfully!", 'agent')
    } else {
      addMessage(`❌ Failed to fetch buyer agent: ${result.error}`, 'agent')
      setAgenticStep('idle')
    }
  }

  const fetchSellerAgent = async () => {
    setAgenticStep('fetching-seller-agent')
    addMessage("🔄 Fetching seller agent...", 'agent')

    const result = await fetchAndVerifyAgent('seller', 'http://localhost:8080/.well-known/agent-card.json')
    
    if (result.success && result.agentCard) {
      setSellerAgentFromBuyerData(result.agentCard)
      setAgenticStep('seller-agent-fetched')
      addMessage("✅ Seller agent fetched!", 'agent')
    } else {
      addMessage(`❌ Failed to fetch seller agent: ${result.error}`, 'agent')
      setAgenticStep('buyer-agent-fetched')
    }
  }

  const verifySellerAgent = async () => {
    setAgenticStep('verifying-seller-agent')
    addMessage("🔐 Verifying seller agent...", 'agent')

    const result = await fetchAndVerifyAgent('seller', 'http://localhost:8080/.well-known/agent-card.json')
    
    if (result.success && result.agentCard?.verified) {
      setSellerAgentVerified(true)
      setAgenticStep('seller-agent-verified')
      addMessage("✅ Seller agent verified!", 'agent')
    } else {
      addMessage(`❌ Verification failed: ${result.error}`, 'agent')
    }
  }

  // ============================================
  // SELLER: FETCH AGENTS
  // ============================================
  const addSellerMessage = (text: string, type: 'user' | 'agent') => {
    setSellerChatMessages(prev => [...prev, {
      id: generateUniqueId(),
      text,
      type,
      timestamp: new Date(),
    }])
  }

  const fetchSellerAgentChat = async () => {
    setSellerAgenticStep('fetching-seller-agent')
    addSellerMessage("🔄 Fetching my agent...", 'agent')

    const result = await fetchAndVerifyAgent('seller', 'http://localhost:8080/.well-known/agent-card.json')
    
    if (result.success && result.agentCard) {
      setSellerAgentData(result.agentCard)
      setSellerAgenticStep('seller-agent-fetched')
      addSellerMessage("✅ My agent fetched!", 'agent')
    } else {
      addSellerMessage(`❌ Failed: ${result.error}`, 'agent')
      setSellerAgenticStep('idle')
    }
  }

  const fetchBuyerAgentChat = async () => {
    setSellerAgenticStep('fetching-buyer-agent')
    addSellerMessage("🔄 Fetching buyer agent...", 'agent')

    const result = await fetchAndVerifyAgent('buyer', 'http://localhost:9090/.well-known/agent-card.json')
    
    if (result.success && result.agentCard) {
      setBuyerAgentFromSellerData(result.agentCard)
      setSellerAgenticStep('buyer-agent-fetched')
      addSellerMessage("✅ Buyer agent fetched!", 'agent')
    } else {
      addSellerMessage(`❌ Failed: ${result.error}`, 'agent')
      setSellerAgenticStep('seller-agent-fetched')
    }
  }

  const verifyBuyerAgentFromSeller = async () => {
    setSellerAgenticStep('verifying-buyer-agent')
    addSellerMessage("🔐 Verifying buyer agent...", 'agent')

    const result = await fetchAndVerifyAgent('buyer', 'http://localhost:9090/.well-known/agent-card.json')
    
    if (result.success && result.agentCard?.verified) {
      setBuyerAgentVerified(true)
      setSellerAgenticStep('buyer-agent-verified')
      addSellerMessage("✅ Buyer agent verified!", 'agent')
    } else {
      addSellerMessage(`❌ Verification failed: ${result.error}`, 'agent')
    }
  }

  // ============================================
  // CHAT HANDLERS
  // ============================================
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const message = inputMessage.trim().toLowerCase()
    addMessage(inputMessage, 'user')
    setInputMessage("")

    if (message.includes('fetch my agent') || message.includes('fetch buyer agent')) {
      fetchBuyerAgent()
    } else if (message.includes('fetch seller agent')) {
      if (buyerAgentData) {
        fetchSellerAgent()
      } else {
        addMessage("⚠️ Please fetch your buyer agent first!", 'agent')
      }
    } else if (message.includes('send po') || message.includes('send purchase order') || message.includes('create po')) {
      if (agenticStep === 'business-ready') {
        addMessage("📝 Creating and sending Purchase Order...", 'agent')
        sendPO()
      } else {
        addMessage("⚠️ Please complete agent verification first!", 'agent')
      }
    } else {
      addMessage("I can help you with: 'fetch my agent', 'fetch seller agent', 'send po'", 'agent')
    }
  }

  const handleSellerSendMessage = () => {
    if (!sellerInputMessage.trim()) return

    const message = sellerInputMessage.trim().toLowerCase()
    addSellerMessage(sellerInputMessage, 'user')
    setSellerInputMessage("")

    if (message.includes('fetch my agent') || message.includes('fetch seller agent')) {
      fetchSellerAgentChat()
    } else if (message.includes('fetch buyer agent')) {
      if (sellerAgentData) {
        fetchBuyerAgentChat()
      } else {
        addSellerMessage("⚠️ Please fetch your seller agent first!", 'agent')
      }
    } else {
      addSellerMessage("I can help you with: 'fetch my agent', 'fetch buyer agent'", 'agent')
    }
  }

  // ============================================
  // PO HANDLING
  // ============================================
  const calculatePOTotal = () => {
    const total = poData.items.reduce((sum, item) => sum + item.total, 0)
    setPOData(prev => ({ ...prev, totalAmount: total }))
    return total
  }

  const updatePOItem = (index: number, field: string, value: any) => {
    const newItems = [...poData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice
    }
    
    setPOData(prev => ({ ...prev, items: newItems }))
  }

  const addPOItem = () => {
    setPOData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 0, unitPrice: 0, total: 0 }]
    }))
  }

  const sendPO = async () => {
    if (!buyerAgentData || !sellerAgentFromBuyerData) return

    const finalTotal = calculatePOTotal()
    const updatedPO = { ...poData, totalAmount: finalTotal }

    addMessage("📤 Sending Purchase Order to seller...", 'agent')
    
    const businessMsg: BusinessMessage = {
      id: generateUniqueId(),
      from: 'buyer',
      to: 'seller',
      type: 'po',
      content: `Purchase Order ${updatedPO.poNumber} - Total: ${updatedPO.totalAmount.toLocaleString()} units (${(updatedPO.totalAmount / 100000).toFixed(2)} ALGO)`,
      attachment: updatedPO,
      timestamp: new Date(),
      verified: false,
      status: 'pending',
    }

    setBusinessMessages(prev => [...prev, businessMsg])
    addMessage("✅ PO sent! Waiting for seller verification...", 'agent')
    setShowPOForm(false)
    setCurrentPOData(updatedPO)
    
    addSellerMessage("📦 New Purchase Order received from buyer!", 'agent')
    addSellerMessage("🔐 Verifying buyer's credentials...", 'agent')
    
    setTimeout(async () => {
      const verified = await verifyReceivedMessage('buyer', businessMsg.id)
      
      if (verified) {
        addSellerMessage("✅ Buyer verified! PO is legitimate.", 'agent')
        addSellerMessage("✅ Auto-accepting PO...", 'agent')
        
        // Auto-accept the PO
        setPendingPO(updatedPO)
        setPOResponseStatus('accept')
        
        // Send acceptance response immediately
        setTimeout(() => {
          sendPOAcceptanceAndTriggerPayment(updatedPO)
        }, 1000)
      } else {
        addSellerMessage("❌ Verification failed! PO rejected.", 'agent')
      }
    }, 2000)
  }

  const sendPOAcceptanceAndTriggerPayment = async (po: POData) => {
    addSellerMessage(`📤 Sending ACCEPT response to buyer...`, 'agent')

    const responseMsg: BusinessMessage = {
      id: generateUniqueId(),
      from: 'seller',
      to: 'buyer',
      type: 'po_response',
      content: `PO ${po.poNumber} ACCEPTED`,
      timestamp: new Date(),
      verified: false,
      status: 'pending',
    }

    setBusinessMessages(prev => [...prev, responseMsg])
    addSellerMessage(`✅ ACCEPT response sent!`, 'agent')

    addMessage(`📨 PO Response received: ACCEPT`, 'agent')
    addMessage("🔐 Verifying seller's credentials...", 'agent')

    setTimeout(async () => {
      const verified = await verifyReceivedMessage('seller', responseMsg.id)
      
      if (verified) {
        addMessage("✅ Seller verified! PO accepted.", 'agent')
        addMessage("💰 Initiating 20% upfront payment...", 'agent')
        
        // Automatically trigger payment
        setTimeout(() => initiatePOPayment(po), 1500)
      } else {
        addMessage("❌ Seller verification failed! Response rejected.", 'agent')
      }
    }, 2000)
  }

  const handlePOResponse = async (response: 'accept' | 'reject') => {
    if (!pendingPO) return

    setPOResponseStatus(response)
    addSellerMessage(`📤 Sending ${response.toUpperCase()} response to buyer...`, 'agent')

    const responseMsg: BusinessMessage = {
      id: generateUniqueId(),
      from: 'seller',
      to: 'buyer',
      type: 'po_response',
      content: response === 'accept' 
        ? `PO ${pendingPO.poNumber} ACCEPTED`
        : `PO ${pendingPO.poNumber} REJECTED`,
      timestamp: new Date(),
      verified: false,
      status: 'pending',
    }

    setBusinessMessages(prev => [...prev, responseMsg])
    addSellerMessage(`✅ ${response.toUpperCase()} response sent!`, 'agent')

    addMessage(`📨 PO Response received: ${response.toUpperCase()}`, 'agent')
    addMessage("🔐 Verifying seller's credentials...", 'agent')

    setTimeout(async () => {
      const verified = await verifyReceivedMessage('seller', responseMsg.id)
      
      if (verified && response === 'accept') {
        addMessage("✅ Seller verified! PO accepted.", 'agent')
        addMessage("💰 Initiating 20% upfront payment...", 'agent')
        
        setTimeout(() => initiatePOPayment(pendingPO!), 1500)
      } else if (verified && response === 'reject') {
        addMessage("❌ PO was rejected by seller.", 'agent')
      } else {
        addMessage("❌ Seller verification failed! Response rejected.", 'agent')
      }
    }, 2000)
  }

  // ============================================
  // PAYMENT FUNCTIONS
  // ============================================
  const initiatePOPayment = async (po: POData) => {
    setIsPaymentProcessing(true)
    // Convert PO units to ALGO (divide by 100,000) then calculate 20%
    const paymentAmount = (po.totalAmount / 100000) * 0.20

    addMessage(`💸 Processing 20% upfront payment...`, 'agent')
    addMessage(`   PO Value: ${po.totalAmount.toLocaleString()} units`, 'agent')
    addMessage(`   Payment Amount: ${paymentAmount} ALGO`, 'agent')
    addMessage(`   Marketplace fee (${MARKETPLACE_FEE}%): ${(paymentAmount * PLATFORM_FEE_PERCENTAGE).toFixed(4)} ALGO`, 'agent')

    try {
      const paymentData = await executeAtomicPayment(paymentAmount, 'po_acceptance')

      const paymentMsg: BusinessMessage = {
        id: generateUniqueId(),
        from: 'buyer',
        to: 'seller',
        type: 'payment',
        content: `PO Acceptance Payment: ${paymentAmount} ALGO`,
        attachment: paymentData,
        timestamp: new Date(),
        verified: true,
        status: 'verified',
      }

      setBusinessMessages(prev => [...prev, paymentMsg])
      addMessage("✅ Payment completed successfully!", 'agent')
      addMessage(`Transaction: ${paymentData.transactionHash}`, 'agent')
      
      // Notify seller with payment details and link
      addSellerMessage(`💰 Payment received: ${paymentAmount} ALGO`, 'agent')
      addSellerMessage(`✅ PO payment confirmed!`, 'agent')
      addSellerMessage(`🔗 View transaction: ${paymentData.peraExplorerLink}`, 'agent')
      
      setIsPaymentProcessing(false)

      // Refresh wallet balances
      refreshBuyerBalance()
      refreshSellerBalance()
      refreshPlatformBalance()

      addSellerMessage("⏳ Processing order... Invoice will be sent in 5 seconds.", 'agent')
      setTimeout(() => sendInvoice(po), 5000)
    } catch (error: any) {
      addMessage(`❌ Payment failed: ${error.message}`, 'agent')
      setIsPaymentProcessing(false)
    }
  }

  const sendInvoice = async (po: POData) => {
    addSellerMessage("📄 Generating invoice...", 'agent')

    // Convert PO units to ALGO and calculate 50% remaining (after 20% PO payment)
    const algoAmount = po.totalAmount / 100000
    const invoiceAlgoAmount = algoAmount * 0.50

    const invoice: InvoiceData = {
      invoiceNumber: `INV-${Date.now()}`,
      poNumber: po.poNumber,
      items: po.items,
      subtotal: invoiceAlgoAmount,
      tax: invoiceAlgoAmount * TAX_RATE_DECIMAL,
      totalAmount: invoiceAlgoAmount * (1 + TAX_RATE_DECIMAL),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Order processed and ready for shipment'
    }

    const invoiceMsg: BusinessMessage = {
      id: generateUniqueId(),
      from: 'seller',
      to: 'buyer',
      type: 'invoice',
      content: `Invoice ${invoice.invoiceNumber} - Amount Due: ${invoice.totalAmount.toFixed(2)} ALGO`,
      attachment: invoice,
      timestamp: new Date(),
      verified: false,
      status: 'pending',
    }

    setBusinessMessages(prev => [...prev, invoiceMsg])
    addSellerMessage("✅ Invoice sent to buyer!", 'agent')

    addMessage("📨 Invoice received from seller!", 'agent')
    addMessage("🔐 Verifying seller's credentials...", 'agent')

    setTimeout(async () => {
      const verified = await verifyReceivedMessage('seller', invoiceMsg.id)
      
      if (verified) {
        addMessage("✅ Seller verified! Invoice is legitimate.", 'agent')
        setPendingInvoice(invoice)
        addMessage("💰 Processing invoice payment...", 'agent')
        
        setTimeout(() => processInvoicePayment(invoice), 2000)
      } else {
        addMessage("❌ Seller verification failed! Invoice rejected.", 'agent')
      }
    }, 2000)
  }

  const processInvoicePayment = async (invoice: InvoiceData) => {
    setIsPaymentProcessing(true)
    
    addMessage(`💸 Processing invoice payment...`, 'agent')
    addMessage(`   Amount: ${invoice.totalAmount.toFixed(2)} ALGO`, 'agent')
    addMessage(`   Marketplace fee (${MARKETPLACE_FEE}%): ${(invoice.totalAmount * PLATFORM_FEE_PERCENTAGE).toFixed(4)} ALGO`, 'agent')

    try {
      const paymentData = await executeAtomicPayment(invoice.totalAmount, 'invoice')

      const paymentMsg: BusinessMessage = {
        id: generateUniqueId(),
        from: 'buyer',
        to: 'seller',
        type: 'invoice_payment',
        content: `Invoice ${invoice.invoiceNumber} paid: ${invoice.totalAmount.toFixed(2)} ALGO`,
        attachment: paymentData,
        timestamp: new Date(),
        verified: true,
        status: 'verified',
      }

      setBusinessMessages(prev => [...prev, paymentMsg])
      addMessage("✅ Invoice payment completed!", 'agent')
      addMessage(`Transaction: ${paymentData.transactionHash}`, 'agent')
      addMessage(`🔗 Pera Explorer: ${paymentData.peraExplorerLink}`, 'agent')
      
      addSellerMessage(`💰 Invoice payment received: ${invoice.totalAmount.toFixed(2)} ALGO`, 'agent')
      addSellerMessage(`✅ Payment confirmed! Preparing shipment...`, 'agent')
      addSellerMessage(`🔗 View transaction: ${paymentData.peraExplorerLink}`, 'agent')
      
      setIsPaymentProcessing(false)
      setPendingInvoice(null)

      // Refresh wallet balances
      refreshBuyerBalance()
      refreshSellerBalance()
      refreshPlatformBalance()

      addSellerMessage("⏳ Warehouse processing... Receipt will be sent in 5 seconds.", 'agent')
      setTimeout(() => sendWarehouseReceipt(invoice), 5000)
    } catch (error: any) {
      addMessage(`❌ Invoice payment failed: ${error.message}`, 'agent')
      setIsPaymentProcessing(false)
    }
  }

  const sendWarehouseReceipt = async (invoice: InvoiceData) => {
    addSellerMessage("📦 Generating warehouse receipt...", 'agent')

    const receipt: WarehouseReceiptData = {
      receiptNumber: `WR-${Date.now()}`,
      poNumber: invoice.poNumber,
      invoiceNumber: invoice.invoiceNumber,
      items: invoice.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        warehouseLocation: 'Warehouse A - Bay 12'
      })),
      receivedDate: new Date().toISOString().split('T')[0],
      inspector: 'Raj Kumar - Quality Inspector',
      notes: 'All items inspected and ready for dispatch'
    }

    const receiptMsg: BusinessMessage = {
      id: generateUniqueId(),
      from: 'seller',
      to: 'buyer',
      type: 'warehouse_receipt',
      content: `Warehouse Receipt ${receipt.receiptNumber} - Order Ready for Dispatch`,
      attachment: receipt,
      timestamp: new Date(),
      verified: false,
      status: 'pending',
    }

    setBusinessMessages(prev => [...prev, receiptMsg])
    addSellerMessage("✅ Warehouse receipt sent to buyer!", 'agent')

    addMessage("📨 Warehouse receipt received from seller!", 'agent')
    addMessage("🔐 Verifying seller's credentials...", 'agent')

    setTimeout(async () => {
      const verified = await verifyReceivedMessage('seller', receiptMsg.id)
      
      if (verified) {
        addMessage("✅ Seller verified! Warehouse receipt is legitimate.", 'agent')
        setPendingReceipt(receipt)
        addMessage("💰 Processing receipt confirmation payment...", 'agent')
        
        setTimeout(() => processReceiptPayment(receipt), 2000)
      } else {
        addMessage("❌ Seller verification failed! Receipt rejected.", 'agent')
      }
    }, 2000)
  }

  const processReceiptPayment = async (receipt: WarehouseReceiptData) => {
    setIsPaymentProcessing(true)
    
    // Calculate 30% of original PO amount (converted to ALGO)
    const receiptAmount = currentPOData ? (currentPOData.totalAmount / 100000) * 0.30 : 0.3
    
    addMessage(`💸 Processing receipt confirmation payment...`, 'agent')
    addMessage(`   Amount: ${receiptAmount} ALGO`, 'agent')
    addMessage(`   Marketplace fee (${MARKETPLACE_FEE}%): ${(receiptAmount * PLATFORM_FEE_PERCENTAGE).toFixed(4)} ALGO`, 'agent')

    try {
      const paymentData = await executeAtomicPayment(receiptAmount, 'warehouse_receipt')

      const paymentMsg: BusinessMessage = {
        id: generateUniqueId(),
        from: 'buyer',
        to: 'seller',
        type: 'receipt_payment',
        content: `Receipt ${receipt.receiptNumber} confirmed: ${receiptAmount} ALGO`,
        attachment: paymentData,
        timestamp: new Date(),
        verified: true,
        status: 'verified',
      }

      setBusinessMessages(prev => [...prev, paymentMsg])
      addMessage("✅ Receipt payment completed!", 'agent')
      addMessage(`Transaction: ${paymentData.transactionHash}`, 'agent')
      addMessage(`🔗 Pera Explorer: ${paymentData.peraExplorerLink}`, 'agent')
      addMessage("🎉 Transaction sequence complete!", 'agent')
      
      addSellerMessage(`💰 Receipt payment received: ${receiptAmount} ALGO`, 'agent')
      addSellerMessage(`✅ All payments confirmed!`, 'agent')
      addSellerMessage(`🔗 View transaction: ${paymentData.peraExplorerLink}`, 'agent')
      addSellerMessage("🎉 Order complete! Ready for dispatch.", 'agent')
      
      setIsPaymentProcessing(false)
      setPendingReceipt(null)

      // Refresh wallet balances
      refreshBuyerBalance()
      refreshSellerBalance()
      refreshPlatformBalance()
    } catch (error: any) {
      addMessage(`❌ Receipt payment failed: ${error.message}`, 'agent')
      setIsPaymentProcessing(false)
    }
  }

  // ============================================
  // WALLET DISPLAY COMPONENT
  // ============================================
  const WalletDisplay = ({ 
    label, 
    address, 
    balance, 
    loading, 
    isOpen, 
    onToggle, 
    onRefresh, 
    color 
  }: { 
    label: string
    address: string
    balance: string | null
    loading: boolean
    isOpen: boolean
    onToggle: () => void
    onRefresh: () => void
    color: string
  }) => (
    <div className={`border-2 rounded-lg overflow-hidden ${color}`}>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-opacity-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Wallet className="w-5 h-5" />
          <span className="font-semibold text-sm">{label}</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      
      {isOpen && (
        <div className="p-4 border-t-2 bg-white bg-opacity-50 space-y-3 animate-fade-in">
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Address:</p>
            <p className="text-xs font-mono break-all bg-white p-2 rounded border">{address}</p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-slate-600">Balance:</p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRefresh()
                }}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                disabled={loading}
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : balance ? (
              <p className="text-lg font-bold">{balance} ALGO</p>
            ) : (
              <p className="text-sm text-slate-500">Click refresh to load</p>
            )}
          </div>
        </div>
      )}
    </div>
  )

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 lg:p-8">
      <div className="max-w-[1900px] mx-auto">
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            LEGENT – vLEI Verified AI Agents
          </h1>
          <p className="text-slate-600 text-sm lg:text-base font-medium">
            Complete Business Transaction Flow with Real Atomic Payments
          </p>
        </div>

        <div className="grid gap-4 lg:gap-6 xl:grid-cols-[1fr_450px_1fr] lg:grid-cols-1">

          {/* BUYER ORGANIZATION */}
          <div className="border border-slate-300 rounded-xl shadow-sm overflow-hidden bg-white flex flex-col">
            <div className="bg-white p-6 lg:p-8 border-b border-slate-300">
              <div className="flex items-start gap-3 lg:gap-4">
                <div className="bg-blue-100 p-2.5 lg:p-3 rounded-lg flex-shrink-0">
                  <Building2 className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base lg:text-lg font-semibold text-slate-900 mb-2 lg:mb-3">
                    Buyer Organization
                  </h2>
                  <p className="text-sm lg:text-base text-slate-700 font-medium mb-2 break-words">
                    {LEI_DATA.tommy.name}
                  </p>
                  <div className="space-y-2 lg:space-y-3 text-xs lg:text-sm text-slate-600 mb-4">
                    <p>
                      <strong className="font-semibold">LEI:</strong>{" "}
                      <span className="break-all">{LEI_DATA.tommy.lei}</span>
                    </p>
                  </div>
                  
                  {/* Buyer Wallet */}
                  <WalletDisplay
                    label="Buyer Wallet"
                    address={BUYER_WALLET}
                    balance={buyerBalance}
                    loading={loadingBuyerBalance}
                    isOpen={showBuyerWallet}
                    onToggle={() => setShowBuyerWallet(!showBuyerWallet)}
                    onRefresh={refreshBuyerBalance}
                    color="border-blue-300 bg-blue-50"
                  />
                </div>
              </div>
            </div>

            {agenticStep === 'business-ready' && (
              <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 p-6 lg:p-8 border-b border-slate-300 overflow-y-auto">
                <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Business Messages
                  </h3>

                  {showPOForm && (
                    <div className="bg-white p-6 rounded-xl border-2 border-blue-300 shadow-lg animate-fade-in">
                      <h4 className="text-lg font-bold text-blue-900 mb-4">Create Purchase Order</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-slate-700 block mb-1">PO Number</label>
                          <input
                            type="text"
                            value={poData.poNumber}
                            onChange={(e) => setPOData(prev => ({ ...prev, poNumber: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          />
                        </div>

                        {poData.items.map((item, index) => (
                          <div key={index} className="border border-slate-200 p-4 rounded-lg space-y-2">
                            <input
                              type="text"
                              placeholder="Item name"
                              value={item.name}
                              onChange={(e) => updatePOItem(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="number"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={(e) => updatePOItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                              />
                              <input
                                type="number"
                                placeholder="Unit $"
                                value={item.unitPrice}
                                onChange={(e) => updatePOItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                              />
                              <input
                                type="number"
                                value={item.total}
                                readOnly
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={addPOItem}
                          className="text-blue-600 text-sm font-semibold hover:text-blue-700"
                        >
                          + Add Item
                        </button>

                        <div className="pt-4 border-t border-slate-200">
                          <p className="text-lg font-bold text-slate-900">
                            Total: {calculatePOTotal().toLocaleString()} units
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            Payment: {(calculatePOTotal() / 100000).toFixed(2)} ALGO
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={sendPO}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                          >
                            Send PO
                          </button>
                          <button
                            onClick={() => setShowPOForm(false)}
                            className="px-6 bg-slate-200 text-slate-700 py-3 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {businessMessages.length > 0 && (
                    <div className="space-y-3">
                      {businessMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-xl border-2 ${
                            msg.from === 'buyer'
                              ? 'bg-blue-50 border-blue-200 ml-8'
                              : 'bg-green-50 border-green-200 mr-8'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {msg.from === 'buyer' ? (
                                <User className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Building className="w-5 h-5 text-green-600" />
                              )}
                              <span className="font-bold text-sm">
                                {msg.from === 'buyer' ? 'Buyer' : 'Seller'}
                              </span>
                            </div>
                            {msg.status === 'pending' && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Verifying
                              </span>
                            )}
                            {msg.status === 'verified' && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm font-semibold text-slate-900 mb-1">{msg.content}</p>
                          <p className="text-xs text-slate-500">{msg.timestamp.toLocaleString()}</p>

                          {(msg.type === 'payment' || msg.type === 'invoice_payment' || msg.type === 'receipt_payment') && msg.attachment && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <p className="text-xs font-semibold text-slate-700 mb-2">💰 Payment Details</p>
                              <div className="text-xs text-slate-600 space-y-1">
                                <p>Amount: {(msg.attachment as PaymentData).amount} ALGO</p>
                                <p>Platform Fee: {(msg.attachment as PaymentData).platformFee.toFixed(4)} ALGO</p>
                                <p>Total Paid: {(msg.attachment as PaymentData).totalPaid.toFixed(4)} ALGO</p>
                                <p>TX: {(msg.attachment as PaymentData).transactionHash}</p>
                                <a
                                  href={(msg.attachment as PaymentData).peraExplorerLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2"
                                >
                                  View on Pera Explorer <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          )}

                          {msg.type === 'invoice' && msg.attachment && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <p className="text-xs font-semibold text-slate-700 mb-2">📄 Invoice Attached</p>
                              <div className="text-xs text-slate-600 space-y-1">
                                <p>Invoice #: {(msg.attachment as InvoiceData).invoiceNumber}</p>
                                <p>Amount: {(msg.attachment as InvoiceData).totalAmount.toFixed(2)} ALGO</p>
                              </div>
                            </div>
                          )}

                          {msg.type === 'warehouse_receipt' && msg.attachment && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <p className="text-xs font-semibold text-slate-700 mb-2">📦 Warehouse Receipt</p>
                              <div className="text-xs text-slate-600 space-y-1">
                                <p>Receipt #: {(msg.attachment as WarehouseReceiptData).receiptNumber}</p>
                                <p>Items: {(msg.attachment as WarehouseReceiptData).items.length}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {agenticStep !== 'business-ready' && (
              <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 p-6 lg:p-8 border-b border-slate-300 overflow-y-auto">
                <div className="w-full text-center py-16 text-slate-400">
                  <Bot className="w-20 h-20 mx-auto mb-4 opacity-20" />
                  <p className="text-base font-medium">Complete agent verification</p>
                  <p className="text-sm mt-2">Type "fetch my agent" to start</p>
                  <p className="text-xs mt-1 text-slate-300">Then: fetch seller agent → send po</p>
                </div>
              </div>
            )}

            <div className="bg-slate-50 border-t border-slate-300">
              <div className="h-48 overflow-y-auto p-4 space-y-2" style={{scrollbarWidth: 'thin', scrollbarColor: '#94a3b8 #f1f5f9'}}>
                {chatMessages.length === 0 && (
                  <div className="text-center text-sm text-slate-500 py-8">
                    <p>Type a command to start:</p>
                    <p className="text-xs mt-1">• fetch my agent</p>
                    <p className="text-xs">• fetch seller agent</p>
                    <p className="text-xs">• send po</p>
                  </div>
                )}
                {chatMessages.map((msg) => {
                  // Check if message contains a URL
                  const urlRegex = /(https?:\/\/[^\s]+)/g
                  const parts = msg.text.split(urlRegex)
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                          msg.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-800'
                        }`}
                      >
                        {parts.map((part, index) => {
                          if (part.match(urlRegex)) {
                            return (
                              <a
                                key={index}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline break-all"
                              >
                                {part}
                              </a>
                            )
                          }
                          return <span key={index}>{part}</span>
                        })}
                      </div>
                    </div>
                  )
                })}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-slate-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a command..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE SECTION: VERIFICATION PROGRESS + PLATFORM WALLET */}
          <div className="border border-indigo-200 rounded-xl p-6 lg:p-10 shadow-sm bg-white xl:sticky xl:top-8 h-fit space-y-6">
            {/* Marketplace Wallet */}
            <WalletDisplay
              label={`Marketplace Wallet (Fee: ${MARKETPLACE_FEE}%)`}
              address={MARKETPLACE_WALLET}
              balance={platformBalance}
              loading={loadingPlatformBalance}
              isOpen={showPlatformWallet}
              onToggle={() => setShowPlatformWallet(!showPlatformWallet)}
              onRefresh={refreshPlatformBalance}
              color="border-purple-300 bg-purple-50"
            />

            <h3 className="text-base lg:text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600" />
              Transaction Progress
            </h3>

            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2" style={{scrollbarWidth: 'thin', scrollbarColor: '#94a3b8 #f1f5f9'}}>
              <div className={`p-4 rounded-lg border-2 ${buyerAgentData ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-sm font-semibold">1. Agents Verified</p>
                {buyerAgentData && sellerAgentVerified && <Check className="w-5 h-5 text-blue-600 mt-2" />}
              </div>

              <div className={`p-4 rounded-lg border-2 ${poResponseStatus === 'accept' ? 'bg-green-50 border-green-300' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-sm font-semibold">2. PO Accepted</p>
                {poResponseStatus === 'accept' && <Check className="w-5 h-5 text-green-600 mt-2" />}
              </div>

              <div className={`p-4 rounded-lg border-2 ${businessMessages.some(m => m.type === 'payment') ? 'bg-purple-50 border-purple-300' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-sm font-semibold">3. 20% Payment</p>
                {businessMessages.some(m => m.type === 'payment') && <Check className="w-5 h-5 text-purple-600 mt-2" />}
              </div>

              <div className={`p-4 rounded-lg border-2 ${businessMessages.some(m => m.type === 'invoice') ? 'bg-orange-50 border-orange-300' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-sm font-semibold">4. Invoice Received</p>
                {businessMessages.some(m => m.type === 'invoice') && <Check className="w-5 h-5 text-orange-600 mt-2" />}
              </div>

              <div className={`p-4 rounded-lg border-2 ${businessMessages.some(m => m.type === 'invoice_payment') ? 'bg-pink-50 border-pink-300' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-sm font-semibold">5. Invoice Paid</p>
                {businessMessages.some(m => m.type === 'invoice_payment') && <Check className="w-5 h-5 text-pink-600 mt-2" />}
              </div>

              <div className={`p-4 rounded-lg border-2 ${businessMessages.some(m => m.type === 'warehouse_receipt') ? 'bg-teal-50 border-teal-300' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-sm font-semibold">6. Receipt Received</p>
                {businessMessages.some(m => m.type === 'warehouse_receipt') && <Check className="w-5 h-5 text-teal-600 mt-2" />}
              </div>

              <div className={`p-4 rounded-lg border-2 ${businessMessages.some(m => m.type === 'receipt_payment') ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-sm font-semibold">7. Receipt Paid</p>
                {businessMessages.some(m => m.type === 'receipt_payment') && (
                  <div className="mt-2">
                    <Check className="w-5 h-5 text-indigo-600" />
                    <p className="text-xs text-indigo-700 mt-1 font-semibold">Complete!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SELLER ORGANIZATION */}
          <div className="border border-slate-300 rounded-xl shadow-sm overflow-hidden bg-white flex flex-col">
            <div className="bg-white p-6 lg:p-8 border-b border-slate-300">
              <div className="flex items-start gap-3 lg:gap-4">
                <div className="bg-green-100 p-2.5 lg:p-3 rounded-lg flex-shrink-0">
                  <Building className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base lg:text-lg font-semibold text-slate-900 mb-2 lg:mb-3">
                    Seller Organization
                  </h2>
                  <p className="text-sm lg:text-base text-slate-700 font-medium mb-2 break-words">
                    {LEI_DATA.jupiter.name}
                  </p>
                  <div className="space-y-2 lg:space-y-3 text-xs lg:text-sm text-slate-600 mb-4">
                    <p>
                      <strong className="font-semibold">LEI:</strong>{" "}
                      <span className="break-all">{LEI_DATA.jupiter.lei}</span>
                    </p>
                  </div>
                  
                  {/* Seller Wallet */}
                  <WalletDisplay
                    label="Seller Wallet"
                    address={SELLER_WALLET}
                    balance={sellerBalance}
                    loading={loadingSellerBalance}
                    isOpen={showSellerWallet}
                    onToggle={() => setShowSellerWallet(!showSellerWallet)}
                    onRefresh={refreshSellerBalance}
                    color="border-green-300 bg-green-50"
                  />
                </div>
              </div>
            </div>

            {sellerAgenticStep === 'business-ready' && (
              <div className="flex-1 bg-gradient-to-br from-slate-50 to-green-50 p-6 lg:p-8 border-b border-slate-300 overflow-y-auto">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    Incoming Messages
                  </h3>

                  {pendingPO && !poResponseStatus && (
                    <div className="bg-white p-6 rounded-xl border-2 border-green-300 shadow-lg">
                      <h4 className="text-lg font-bold text-green-900 mb-4">Purchase Order Processing</h4>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-semibold text-slate-700">PO Number:</span>
                          <span className="text-sm text-slate-900">{pendingPO.poNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-semibold text-slate-700">Total Amount:</span>
                          <span className="text-lg font-bold text-green-700">
                            {pendingPO.totalAmount.toLocaleString()} units
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-600">Payment:</span>
                          <span className="text-sm font-semibold text-green-600">
                            {(pendingPO.totalAmount / 100000).toFixed(2)} ALGO
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-green-600 mt-4">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-sm font-semibold">Auto-accepting...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {poResponseStatus && (
                    <div className={`p-4 rounded-lg border-2 ${
                      poResponseStatus === 'accept' 
                        ? 'bg-green-50 border-green-300'
                        : 'bg-red-50 border-red-300'
                    }`}>
                      <p className="text-sm font-semibold">
                        {poResponseStatus === 'accept' 
                          ? '✅ PO Accepted! Processing order...'
                          : '❌ PO Rejected.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {sellerAgenticStep !== 'business-ready' && (
              <div className="flex-1 bg-gradient-to-br from-slate-50 to-green-50 p-6 lg:p-8 border-b border-slate-300 overflow-y-auto">
                <div className="w-full text-center py-16 text-slate-400">
                  <Bot className="w-20 h-20 mx-auto mb-4 opacity-20" />
                  <p className="text-base font-medium">Complete agent verification</p>
                  <p className="text-sm mt-2">Type "fetch my agent" to start</p>
                </div>
              </div>
            )}

            <div className="bg-slate-50 border-t border-slate-300">
              <div className="h-48 overflow-y-auto p-4 space-y-2" style={{scrollbarWidth: 'thin', scrollbarColor: '#94a3b8 #f1f5f9'}}>
                {sellerChatMessages.length === 0 && (
                  <div className="text-center text-sm text-slate-500 py-8">
                    <p>Type a command to start:</p>
                    <p className="text-xs mt-1">• fetch my agent</p>
                    <p className="text-xs">• fetch buyer agent</p>
                  </div>
                )}
                {sellerChatMessages.map((msg) => {
                  // Check if message contains a URL
                  const urlRegex = /(https?:\/\/[^\s]+)/g
                  const parts = msg.text.split(urlRegex)
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                          msg.type === 'user'
                            ? 'bg-green-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-800'
                        }`}
                      >
                        {parts.map((part, index) => {
                          if (part.match(urlRegex)) {
                            return (
                              <a
                                key={index}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline break-all"
                              >
                                {part}
                              </a>
                            )
                          }
                          return <span key={index}>{part}</span>
                        })}
                      </div>
                    </div>
                  )
                })}
                <div ref={chatEndRefSeller} />
              </div>

              <div className="p-4 border-t border-slate-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sellerInputMessage}
                    onChange={(e) => setSellerInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSellerSendMessage()}
                    placeholder="Type a command..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={handleSellerSendMessage}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
