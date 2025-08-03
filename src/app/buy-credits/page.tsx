'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CreditCard, Package, ArrowLeft, Check } from 'lucide-react'

interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  description: string
  popular?: boolean
}

const creditPackages: CreditPackage[] = [
  {
    id: '1',
    name: 'Starter Pack',
    credits: 10,
    price: 25,
    description: 'Perfect for trying out a few classes'
  },
  {
    id: '2',
    name: 'Popular Pack',
    credits: 25,
    price: 60,
    description: 'Great value for regular attendees',
    popular: true
  },
  {
    id: '3',
    name: 'Premium Pack',
    credits: 50,
    price: 100,
    description: 'Best value for fitness enthusiasts'
  },
  {
    id: '4',
    name: 'Mega Pack',
    credits: 100,
    price: 150,
    description: 'Maximum credits for unlimited access'
  }
]

export default function BuyCredits() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [purchasing, setPurchasing] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [userCredits, setUserCredits] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchUserCredits()
    }
  }, [user])

  const fetchUserCredits = async () => {
    try {
      const response = await fetch('/api/user/credits')
      if (response.ok) {
        const data = await response.json()
        setUserCredits(data.credits)
      }
    } catch (error) {
      console.error('Error fetching user credits:', error)
    }
  }

  const handlePurchase = async (packageData: CreditPackage) => {
    setPurchasing(true)
    setSelectedPackage(packageData.id)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creditPackageId: parseInt(packageData.id)
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Successfully purchased ${packageData.credits} credits! Your new balance: ${result.newBalance} credits`)
        setUserCredits(result.newBalance)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to purchase credits')
      }
    } catch (error) {
      console.error('Error purchasing credits:', error)
      alert('Error purchasing credits. Please try again.')
    } finally {
      setPurchasing(false)
      setSelectedPackage(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-white">Buy Credits</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">Current Credits: {userCredits}</span>
              </div>
              <span className="text-gray-300">Welcome, {user.name || user.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Choose Your Credit Package</h2>
          <p className="text-xl text-gray-400 mb-8">
            Purchase credits to book classes and activities. Credits never expire!
          </p>
          <div className="bg-gray-800 rounded-lg p-6 inline-block border border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-green-600/20">
                <CreditCard className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{userCredits}</h3>
                <p className="text-gray-400">Current Credits</p>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-gray-800 rounded-lg shadow-lg border-2 transition-all duration-300 hover:scale-105 ${
                pkg.popular 
                  ? 'border-blue-500 ring-2 ring-blue-500/20' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="p-4 rounded-full bg-blue-600/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Package className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                  <p className="text-gray-400 text-sm">{pkg.description}</p>
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">{pkg.credits}</span>
                    <span className="text-lg text-gray-400 ml-2">credits</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-green-400">${pkg.price}</span>
                    <span className="text-gray-400 ml-1">
                      (${(pkg.price / pkg.credits).toFixed(2)} per credit)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={purchasing}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    purchasing && selectedPackage === pkg.id
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : pkg.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {purchasing && selectedPackage === pkg.id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Purchase Credits
                    </div>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Why Choose Our Credits?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-3 rounded-full bg-green-600/20 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-400" />
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Never Expire</h4>
              <p className="text-gray-400">Your credits never expire, use them whenever you want</p>
            </div>
            <div className="text-center">
              <div className="p-3 rounded-full bg-blue-600/20 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-400" />
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Flexible Usage</h4>
              <p className="text-gray-400">Use credits for any class or activity on our platform</p>
            </div>
            <div className="text-center">
              <div className="p-3 rounded-full bg-purple-600/20 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-400" />
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Great Value</h4>
              <p className="text-gray-400">Better prices when you buy in bulk</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
