'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  ArrowLeft,
  User,
  MapPin,
  Clock,
  Calendar,
  CreditCard,
  Users,
  Star,
  UserPlus,
  UserCheck,
  Award,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface InstructorProfile {
  id: string
  name: string
  email: string
  bio?: string
  specialties?: string
  activities: Array<{
    id: string
    name: string
    description: string
    category: string
    creditsRequired: number
    maxCapacity: number
    classes: Array<{
      id: string
      date: string
      startTime: string
      endTime: string
      location?: string
      capacity: number
      bookedSlots: number
      creditCost: number
    }>
  }>
  subscriberCount: number
  isSubscribed: boolean
}

interface BookingStatus {
  [classId: string]: 'booking' | 'success' | 'error' | undefined
}

export default function InstructorProfilePage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [instructor, setInstructor] = useState<InstructorProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [userCredits, setUserCredits] = useState(0)
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>({})
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && params.id) {
      fetchInstructorProfile()
      fetchUserCredits()
    }
  }, [user, params.id])

  const fetchInstructorProfile = async () => {
    try {
      setLoadingProfile(true)
      const response = await fetch(`/api/instructor/${params.id}/profile`)
      if (response.ok) {
        const data = await response.json()
        setInstructor(data.instructor)
      } else {
        console.error('Failed to fetch instructor profile')
      }
    } catch (error) {
      console.error('Error fetching instructor profile:', error)
    } finally {
      setLoadingProfile(false)
    }
  }

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

  const handleSubscribeToggle = async () => {
    if (!instructor) return

    try {
      setSubscriptionLoading(true)
      const response = await fetch('/api/instructor/subscribe', {
        method: instructor.isSubscribed ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instructorId: instructor.id }),
      })

      if (response.ok) {
        setInstructor(prev => prev ? {
          ...prev,
          isSubscribed: !prev.isSubscribed,
          subscriberCount: prev.subscriberCount + (prev.isSubscribed ? -1 : 1)
        } : null)
        
        const action = instructor.isSubscribed ? 'Unsubscribed from' : 'Subscribed to'
        alert(`${action} ${instructor.name} successfully!`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update subscription')
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      alert('Error updating subscription. Please try again.')
    } finally {
      setSubscriptionLoading(false)
    }
  }

  const handleBookClass = async (classId: string, creditCost: number) => {
    if (userCredits < creditCost) {
      alert(`Insufficient credits! You need ${creditCost} credits but only have ${userCredits}.`)
      return
    }

    setBookingStatus(prev => ({ ...prev, [classId]: 'booking' }))

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classId }),
      })

      if (response.ok) {
        const result = await response.json()
        setBookingStatus(prev => ({ ...prev, [classId]: 'success' }))
        setUserCredits(result.remainingCredits)
        fetchInstructorProfile() // Refresh to update booking counts
        setTimeout(() => {
          setBookingStatus(prev => ({ ...prev, [classId]: undefined }))
        }, 3000)
      } else {
        const error = await response.json()
        setBookingStatus(prev => ({ ...prev, [classId]: 'error' }))
        alert(error.error || 'Failed to book class')
        setTimeout(() => {
          setBookingStatus(prev => ({ ...prev, [classId]: undefined }))
        }, 3000)
      }
    } catch (error) {
      console.error('Error booking class:', error)
      setBookingStatus(prev => ({ ...prev, [classId]: 'error' }))
      alert('Error booking class. Please try again.')
      setTimeout(() => {
        setBookingStatus(prev => ({ ...prev, [classId]: undefined }))
      }, 3000)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getBookingButtonContent = (classData: any) => {
    const status = bookingStatus[classData.id]
    const isFullyBooked = classData.bookedSlots >= classData.capacity
    const hasInsufficientCredits = userCredits < classData.creditCost

    if (status === 'booking') {
      return (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Booking...
        </div>
      )
    }

    if (status === 'success') {
      return (
        <div className="flex items-center justify-center">
          <CheckCircle className="h-4 w-4 mr-2" />
          Booked!
        </div>
      )
    }

    if (status === 'error') {
      return (
        <div className="flex items-center justify-center">
          <XCircle className="h-4 w-4 mr-2" />
          Failed
        </div>
      )
    }

    if (isFullyBooked) {
      return (
        <div className="flex items-center justify-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          Full
        </div>
      )
    }

    if (hasInsufficientCredits) {
      return (
        <div className="flex items-center justify-center">
          <CreditCard className="h-4 w-4 mr-2" />
          Need {classData.creditCost - userCredits} more
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center">
        <Calendar className="h-4 w-4 mr-2" />
        Book ({classData.creditCost} credits)
      </div>
    )
  }

  const getBookingButtonStyle = (classData: any) => {
    const status = bookingStatus[classData.id]
    const isFullyBooked = classData.bookedSlots >= classData.capacity
    const hasInsufficientCredits = userCredits < classData.creditCost

    if (status === 'success') {
      return 'bg-green-600 text-white cursor-not-allowed'
    }

    if (status === 'error') {
      return 'bg-red-600 text-white cursor-not-allowed'
    }

    if (isFullyBooked || hasInsufficientCredits) {
      return 'bg-gray-600 text-gray-400 cursor-not-allowed'
    }

    if (status === 'booking') {
      return 'bg-blue-500 text-white cursor-not-allowed'
    }

    return 'bg-blue-600 text-white hover:bg-blue-700'
  }

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading instructor profile...</p>
        </div>
      </div>
    )
  }

  if (!user || !instructor) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Instructor Not Found</h2>
          <p className="text-gray-400 mb-6">The instructor profile you're looking for doesn't exist.</p>
          <Link
            href="/activities"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Activities
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-white">Instructor Profile</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">Credits: {userCredits}</span>
              </div>
              <Link
                href="/buy-credits"
                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                Buy Credits
              </Link>
              <span className="text-gray-300">Welcome, {user.name || user.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructor Header */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-8">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="p-4 rounded-full bg-blue-600/20">
                  <User className="h-16 w-16 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{instructor.name}</h1>
                  <div className="flex items-center space-x-4 text-gray-400 mb-3">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {instructor.email}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {instructor.subscriberCount} subscribers
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {instructor.activities.length} activities
                    </div>
                  </div>
                  {instructor.specialties && (
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-2 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">{instructor.specialties}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleSubscribeToggle}
                disabled={subscriptionLoading}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  instructor.isSubscribed
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } ${subscriptionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {subscriptionLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : instructor.isSubscribed ? (
                  <div className="flex items-center">
                    <UserCheck className="h-5 w-5 mr-2" />
                    Subscribed
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Subscribe
                  </div>
                )}
              </button>
            </div>

            {instructor.bio && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">About</h3>
                <p className="text-gray-300">{instructor.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Activities */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Activities & Classes</h2>
            {instructor.activities.length === 0 ? (
              <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">No Activities Available</h3>
                <p className="text-gray-500">This instructor hasn't created any activities yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {instructor.activities.map((activity) => (
                  <div key={activity.id} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                    {/* Activity Header */}
                    <div className="p-6 border-b border-gray-700">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{activity.name}</h3>
                          <span className="text-sm text-blue-400 bg-blue-600/20 px-2 py-1 rounded">
                            {activity.category}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-green-400 mb-1">
                            <CreditCard className="h-4 w-4 mr-1" />
                            <span className="font-medium">{activity.creditsRequired} credits</span>
                          </div>
                          <div className="flex items-center text-gray-400 text-sm">
                            <Users className="h-4 w-4 mr-1" />
                            <span>Max {activity.maxCapacity} people</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm">{activity.description}</p>
                    </div>

                    {/* Classes */}
                    <div className="p-6">
                      <h4 className="text-lg font-medium text-white mb-4">Upcoming Classes</h4>
                      {activity.classes.length === 0 ? (
                        <p className="text-gray-500 text-sm">No upcoming classes scheduled</p>
                      ) : (
                        <div className="space-y-3">
                          {activity.classes.map((classData) => (
                            <div key={classData.id} className="bg-gray-700 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-4 text-sm text-gray-300">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {formatDate(classData.date)}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {formatTime(classData.startTime)} - {formatTime(classData.endTime)}
                                  </div>
                                  {classData.location && (
                                    <div className="flex items-center">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      {classData.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm">
                                  <div className="flex items-center text-gray-400">
                                    <Users className="h-4 w-4 mr-1" />
                                    {classData.bookedSlots}/{classData.capacity} booked
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => handleBookClass(classData.id, classData.creditCost)}
                                  disabled={
                                    bookingStatus[classData.id] !== undefined ||
                                    classData.bookedSlots >= classData.capacity ||
                                    userCredits < classData.creditCost
                                  }
                                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${getBookingButtonStyle(classData)}`}
                                >
                                  {getBookingButtonContent(classData)}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
