'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Search, 
  Filter, 
  ArrowLeft,
  CreditCard,
  User,
  Dumbbell,
  Heart,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  UserCheck,
  Bell
} from 'lucide-react'
import Link from 'next/link'

interface Activity {
  id: string
  name: string
  description: string
  category: string
  location: string
  instructor: {
    id: string
    name: string
    email: string
  }
  classes: Array<{
    id: string
    date: string
    startTime: string
    endTime: string
    capacity: number
    bookedSlots: number
    creditCost: number
  }>
}

interface BookingStatus {
  [classId: string]: 'booking' | 'success' | 'error' | undefined
}

interface Instructor {
  id: string
  name: string
  email: string
  bio?: string
  specialties?: string
  activities: Activity[]
  subscriberCount: number
  isSubscribed: boolean
}

const categoryIcons = {
  'Fitness': Dumbbell,
  'Yoga': Heart,
  'HIIT': Zap,
  'Dance': Users,
  'Cardio': Heart,
  'Strength': Dumbbell,
  'default': Calendar
}

export default function ActivitiesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState<'activities' | 'instructors'>('activities')
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [userCredits, setUserCredits] = useState(0)
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>({})
  const [subscriptionStatus, setSubscriptionStatus] = useState<{[instructorId: string]: boolean}>({})
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchActivities()
      fetchInstructors()
      fetchUserCredits()
      fetchNotifications()
    }
  }, [user])

  useEffect(() => {
    filterActivities()
  }, [activities, searchTerm, selectedCategory])

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true)
      const response = await fetch('/api/activities')
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoadingActivities(false)
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

  const fetchInstructors = async () => {
    try {
      const response = await fetch('/api/instructors')
      if (response.ok) {
        const data = await response.json()
        setInstructors(data.instructors)
      }
    } catch (error) {
      console.error('Error fetching instructors:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/invitations?type=received')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.invitations)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const filterActivities = () => {
    let filtered = activities

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(activity => activity.category === selectedCategory)
    }

    setFilteredActivities(filtered)
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
        // Refresh activities to update booking counts
        fetchActivities()
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

  const handleSubscribeToInstructor = async (instructorId: string, isCurrentlySubscribed: boolean) => {
    try {
      setSubscriptionStatus(prev => ({ ...prev, [instructorId]: !isCurrentlySubscribed }))

      const response = await fetch('/api/instructor/subscribe', {
        method: isCurrentlySubscribed ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instructorId }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(isCurrentlySubscribed ? 'Unsubscribed successfully!' : 'Subscribed successfully!')
        fetchInstructors() // Refresh instructors data
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update subscription')
        setSubscriptionStatus(prev => ({ ...prev, [instructorId]: isCurrentlySubscribed }))
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      alert('Error updating subscription. Please try again.')
      setSubscriptionStatus(prev => ({ ...prev, [instructorId]: isCurrentlySubscribed }))
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

  const getAvailableCategories = () => {
    const categories = [...new Set(activities.map(activity => activity.category))]
    return categories.sort()
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

  if (loading || loadingActivities) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading activities...</p>
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
              <h1 className="text-xl font-semibold text-white">Browse Activities</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">Credits: {userCredits}</span>
              </div>
              {notifications.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-yellow-400" />
                  <span className="text-yellow-300">{notifications.length} invitations</span>
                </div>
              )}
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
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Browse & Subscribe</h2>
          <p className="text-xl text-gray-400 mb-6">
            Discover activities and subscribe to your favorite instructors
          </p>
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'activities'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Calendar className="h-4 w-4 mr-2 inline" />
              All Activities
            </button>
            <button
              onClick={() => setActiveTab('instructors')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'instructors'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <User className="h-4 w-4 mr-2 inline" />
              Instructors ({instructors.length})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search activities, instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <div className="relative">
                <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Categories</option>
                  {getAvailableCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        {activeTab === 'activities' && (
          <>
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">No activities found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredActivities.map((activity) => {
                  const CategoryIcon = categoryIcons[activity.category as keyof typeof categoryIcons] || categoryIcons.default

                  return (
                    <div key={activity.id} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                      {/* Activity Header */}
                      <div className="p-6 border-b border-gray-700">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-blue-600/20">
                              <CategoryIcon className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{activity.name}</h3>
                              <span className="text-sm text-blue-400">{activity.category}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-4">{activity.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <Link 
                            href={`/instructor/${activity.instructor.id}`}
                            className="flex items-center hover:text-blue-400 transition-colors"
                          >
                            <User className="h-4 w-4 mr-1" />
                            {activity.instructor.name}
                          </Link>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {activity.location}
                          </div>
                        </div>
                      </div>

                      {/* Classes */}
                      <div className="p-6">
                        <h4 className="text-lg font-medium text-white mb-4">Upcoming Classes</h4>
                        {activity.classes.length === 0 ? (
                          <p className="text-gray-500 text-sm">No upcoming classes scheduled</p>
                        ) : (
                          <div className="space-y-3">
                            {activity.classes.slice(0, 3).map((classData) => (
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
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4 text-sm">
                                    <div className="flex items-center text-gray-400">
                                      <Users className="h-4 w-4 mr-1" />
                                      {classData.bookedSlots}/{classData.capacity}
                                    </div>
                                    <div className="flex items-center text-green-400">
                                      <CreditCard className="h-4 w-4 mr-1" />
                                      {classData.creditCost} credits
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
                            
                            {activity.classes.length > 3 && (
                              <p className="text-sm text-gray-500 text-center">
                                +{activity.classes.length - 3} more classes available
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Instructors Grid */}
        {activeTab === 'instructors' && (
          <>
            {instructors.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">No instructors found</h3>
                <p className="text-gray-500">No instructors are currently available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {instructors.map((instructor) => {
                  const isSubscribed = subscriptionStatus[instructor.id] !== undefined 
                    ? subscriptionStatus[instructor.id] 
                    : instructor.isSubscribed

                  return (
                    <div key={instructor.id} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                      {/* Instructor Header */}
                      <div className="p-6 border-b border-gray-700">
                        <div className="flex items-start justify-between mb-4">
                          <Link 
                            href={`/instructor/${instructor.id}`}
                            className="flex items-center space-x-3 hover:opacity-80 transition-opacity flex-1"
                          >
                            <div className="p-3 rounded-full bg-purple-600/20">
                              <User className="h-8 w-8 text-purple-400" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
                                {instructor.name}
                              </h3>
                              <p className="text-sm text-gray-400">{instructor.email}</p>
                            </div>
                          </Link>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Users className="h-4 w-4" />
                            <span>{instructor.subscriberCount} subscribers</span>
                          </div>
                        </div>
                        
                        {instructor.bio && (
                          <p className="text-gray-400 text-sm mb-4">{instructor.bio}</p>
                        )}
                        
                        {instructor.specialties && (
                          <div className="mb-4">
                            <span className="text-xs text-blue-400 bg-blue-600/20 px-2 py-1 rounded">
                              {instructor.specialties}
                            </span>
                          </div>
                        )}

                        <button
                          onClick={() => handleSubscribeToInstructor(instructor.id, isSubscribed)}
                          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            isSubscribed
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isSubscribed ? (
                            <div className="flex items-center justify-center">
                              <UserCheck className="h-4 w-4 mr-2" />
                              Subscribed
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Subscribe
                            </div>
                          )}
                        </button>
                      </div>

                      {/* Instructor Activities */}
                      <div className="p-6">
                        <h4 className="text-lg font-medium text-white mb-4">
                          Activities ({instructor.activities.length})
                        </h4>
                        {instructor.activities.length === 0 ? (
                          <p className="text-gray-500 text-sm">No activities available</p>
                        ) : (
                          <div className="space-y-3">
                            {instructor.activities.slice(0, 3).map((activity) => (
                              <div key={activity.id} className="bg-gray-700 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="text-white font-medium">{activity.name}</h5>
                                  <span className="text-xs text-blue-400 bg-blue-600/20 px-2 py-1 rounded">
                                    {activity.category}
                                  </span>
                                </div>
                                <p className="text-gray-400 text-sm mb-2">{activity.description}</p>
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center text-green-400">
                                    <CreditCard className="h-4 w-4 mr-1" />
                                    {activity.classes[0]?.creditCost || 1} credits
                                  </div>
                                  {activity.classes && activity.classes.length > 0 && (
                                    <div className="flex items-center text-gray-400">
                                      <Clock className="h-4 w-4 mr-1" />
                                      Next: {formatDate(activity.classes[0].date)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            
                            {instructor.activities.length > 3 && (
                              <p className="text-sm text-gray-500 text-center">
                                +{instructor.activities.length - 3} more activities
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
