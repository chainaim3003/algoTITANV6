'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Building2,
  MapPin,
  CheckCircle,
  Loader2,
  ArrowRight,
  ShoppingBag,
  Factory,
  Sparkles,
  TrendingUp,
  Users,
  Globe,
} from 'lucide-react'

interface Buyer {
  id: string
  name: string
  lei: string
  location: string
  industry: string
  lookingFor: string
}

interface Seller {
  id: string
  name: string
  lei: string
  location: string
  industry: string
  specialty: string
  rating: number
}

const BUYERS: Buyer[] = [
  {
    id: 'buyer-1',
    name: 'TOMMY HILFIGER EUROPE B.V.',
    lei: '54930012QJWZMYHNJW95',
    location: 'Amsterdam, Netherlands',
    industry: 'Fashion & Apparel',
    lookingFor: 'High-quality textile manufacturers',
  },
]

const SELLERS: Seller[] = [
  {
    id: 'seller-1',
    name: 'JUPITER KNITTING COMPANY',
    lei: '3358004DXAMRWRUIYJ05',
    location: 'Tiruppur, Tamil Nadu, India',
    industry: 'Textile Manufacturing',
    specialty: 'Premium cotton knitwear',
    rating: 4.8,
  },
  {
    id: 'seller-2',
    name: 'STAR FABRICS LTD',
    lei: '8849302JKWN8374NDKF94',
    location: 'Mumbai, Maharashtra, India',
    industry: 'Textile Manufacturing',
    specialty: 'Synthetic blends & polyester',
    rating: 4.5,
  },
  {
    id: 'seller-3',
    name: 'GOLDEN THREAD TEXTILES',
    lei: '7739201MKLP9482HGJF83',
    location: 'Surat, Gujarat, India',
    industry: 'Textile Manufacturing',
    specialty: 'Silk & luxury fabrics',
    rating: 4.7,
  },
]

type DiscoveryStep = 'idle' | 'searching' | 'analyzing' | 'results' | 'selected'

export default function NewMarket() {
  const router = useRouter()
  const [discoveryStep, setDiscoveryStep] = useState<DiscoveryStep>('idle')
  const [discoveredSellers, setDiscoveredSellers] = useState<Seller[]>([])
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const startDiscovery = () => {
    setDiscoveryStep('searching')
    setSearchQuery('cotton textile manufacturers India')

    // Step 1: Searching
    setTimeout(() => {
      setDiscoveryStep('analyzing')
    }, 2000)

    // Step 2: Analyzing
    setTimeout(() => {
      setDiscoveredSellers([SELLERS[0]]) // First show Jupiter
    }, 3500)

    setTimeout(() => {
      setDiscoveredSellers([SELLERS[0], SELLERS[1]]) // Add Star Fabrics
    }, 4500)

    setTimeout(() => {
      setDiscoveredSellers(SELLERS) // Show all 3
      setDiscoveryStep('results')
    }, 5500)
  }

  const handleSelectSeller = (seller: Seller) => {
    setSelectedSeller(seller)
    setDiscoveryStep('selected')

    // Navigate to AgentExchange after a brief moment
    setTimeout(() => {
      router.push('/agentexchange')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            New Market Discovery
          </h1>
          <p className="text-slate-600 text-sm lg:text-base font-medium">
            AI-Powered Buyer-Seller Matching with vLEI Verification
          </p>
        </div>

        <div className="grid lg:grid-cols-[400px_1fr] gap-6">
          {/* LEFT COLUMN: BUYER PROFILE */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Buyer Profile</h2>
                  <p className="text-xs text-slate-500">Active Procurement</p>
                </div>
              </div>

              {BUYERS.map((buyer) => (
                <div key={buyer.id} className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{buyer.name}</h3>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-start gap-2">
                        <Globe className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs break-all">LEI: {buyer.lei}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>{buyer.location}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Factory className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>{buyer.industry}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Looking For:</p>
                    <p className="text-sm text-slate-600 bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                      {buyer.lookingFor}
                    </p>
                  </div>

                  {discoveryStep === 'idle' && (
                    <button
                      onClick={startDiscovery}
                      className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Start AI Discovery
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: DISCOVERY & RESULTS */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-6 lg:p-8">
            {/* IDLE STATE */}
            {discoveryStep === 'idle' && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-indigo-100 p-6 rounded-full mb-6">
                  <Search className="w-16 h-16 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  Ready to Find Suppliers
                </h3>
                <p className="text-slate-600 max-w-md">
                  Our AI will search the verified marketplace to find the best textile manufacturers
                  matching your requirements
                </p>
              </div>
            )}

            {/* SEARCHING STATE */}
            {discoveryStep === 'searching' && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                  <h3 className="text-xl font-bold text-slate-900">Searching Marketplace...</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-indigo-900 mb-2">Search Query:</p>
                    <p className="text-indigo-700">{searchQuery}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                      Scanning vLEI-verified manufacturers...
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                      Analyzing capabilities and certifications...
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                      Matching with buyer requirements...
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ANALYZING STATE */}
            {discoveryStep === 'analyzing' && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                  <h3 className="text-xl font-bold text-slate-900">Analyzing Results...</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-900">
                      Found <strong>12 verified suppliers</strong> in the textile manufacturing sector
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Quality metrics evaluated
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Capacity verification complete
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      Ranking by match score...
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RESULTS STATE */}
            {(discoveryStep === 'results' || discoveryStep === 'selected') && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-bold text-slate-900">
                      Top Matches Found ({discoveredSellers.length})
                    </h3>
                  </div>
                  {discoveryStep === 'results' && (
                    <div className="text-xs text-slate-500 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                      vLEI Verified
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {discoveredSellers.map((seller, index) => (
                    <div
                      key={seller.id}
                      className={`border-2 rounded-xl p-5 transition-all animate-fade-in ${
                        selectedSeller?.id === seller.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
                      }`}
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-slate-900">{seller.name}</h4>
                            {index === 0 && discoveryStep === 'results' && (
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                                Best Match
                              </span>
                            )}
                          </div>
                          <div className="space-y-1.5 text-sm text-slate-600 mb-3">
                            <div className="flex items-center gap-2">
                              <Globe className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-xs">LEI: {seller.lei}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{seller.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Factory className="w-3.5 h-3.5 text-slate-400" />
                              <span>{seller.specialty}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < Math.floor(seller.rating)
                                        ? 'text-yellow-400'
                                        : 'text-slate-300'
                                    }`}
                                  >
                                    ★
                                  </div>
                                ))}
                              </div>
                              <span className="text-xs font-semibold text-slate-700">
                                {seller.rating}
                              </span>
                            </div>
                            <div className="text-xs text-green-600 font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              vLEI Verified
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedSeller?.id === seller.id ? (
                        <div className="mt-4 bg-green-100 border border-green-300 rounded-lg p-3 flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-green-900">Selected!</p>
                            <p className="text-xs text-green-700">
                              Initiating mutual delegation verification...
                            </p>
                          </div>
                        </div>
                      ) : (
                        discoveryStep === 'results' && (
                          <button
                            onClick={() => handleSelectSeller(seller)}
                            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 group"
                          >
                            Select Supplier
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        )
                      )}
                    </div>
                  ))}
                </div>

                {discoveryStep === 'selected' && (
                  <div className="mt-6 bg-indigo-50 border-2 border-indigo-300 rounded-xl p-5 animate-fade-in">
                    <div className="flex items-center gap-3 mb-3">
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      <h4 className="font-bold text-indigo-900">Proceeding to Agent Exchange</h4>
                    </div>
                    <p className="text-sm text-indigo-700">
                      Redirecting to mutual delegation verification between Tommy Hilfiger and{' '}
                      {selectedSeller?.name}...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
