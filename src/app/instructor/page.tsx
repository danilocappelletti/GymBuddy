'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, Clock, MapPin, Plus, Edit, Trash2, BarChart3, Star, User, Send, UserPlus } from 'lucide-react'

interface Activity {
  id: string
  title: string
  description: string
  category: string
  duration: number
  maxCapacity: number
  price: number
  creditsRequired: number
  isActive: boolean
}

interface Class {
  id: string
  activity: Activity
  startTime: string
  endTime: string
  location: string
  maxCapacity: number
  enrolled: number
  isActive: boolean
}

export default function InstructorDashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [showCreateActivity, setShowCreateActivity] = useState(false)
  const [showCreateClass, setShowCreateClass] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showAttendeesModal, setShowAttendeesModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [classAttendees, setClassAttendees] = useState<any[]>([])
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
      return
    }
    
    if (!loading && user && user.role !== 'INSTRUCTOR') {
      router.push('/dashboard')
      return
    }

    if (user && user.role === 'INSTRUCTOR') {
      fetchActivities()
      fetchClasses()
    }
  }, [user, loading, router])

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/instructor/activities')
      if (response.ok) {
        const text = await response.text()
        if (text) {
          const data = JSON.parse(text)
          setActivities(data)
        } else {
          console.log('Empty response from activities API')
          setActivities([])
        }
      } else {
        console.error('Failed to fetch activities, status:', response.status)
        const errorText = await response.text()
        console.error('Error response:', errorText)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/instructor/classes')
      if (response.ok) {
        const text = await response.text()
        if (text) {
          const data = JSON.parse(text)
          // API returns { success: true, classes: [...] }
          setClasses(data.classes || [])
        } else {
          console.log('Empty response from classes API')
          setClasses([])
        }
      } else {
        console.error('Failed to fetch classes, status:', response.status)
        const errorText = await response.text()
        console.error('Error response:', errorText)
        setClasses([])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      setClasses([])
    }
  }

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/instructor/subscribers')
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data.subscribers)
      } else {
        console.error('Failed to fetch subscribers')
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error)
    }
  }

  const fetchClassAttendees = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}/attendees`)
      if (response.ok) {
        const data = await response.json()
        setClassAttendees(data.attendees || [])
      } else {
        console.error('Failed to fetch class attendees')
        setClassAttendees([])
      }
    } catch (error) {
      console.error('Error fetching class attendees:', error)
      setClassAttendees([])
    }
  }

  const handleSignOut = async () => {
    await logout()
    router.push('/')
  }

  const CreateActivityModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      category: '',
      duration: 60,
      maxCapacity: 20,
      price: 2000, // in cents
      creditsRequired: 1
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      try {
        const response = await fetch('/api/instructor/activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          const newActivity = await response.json()
          setActivities(prev => [...prev, newActivity])
          setShowCreateActivity(false)
          
          // Reset form
          setFormData({
            title: '',
            description: '',
            category: '',
            duration: 60,
            maxCapacity: 20,
            price: 2000,
            creditsRequired: 1
          })
        } else {
          console.error('Failed to create activity')
          alert('Failed to create activity. Please try again.')
        }
      } catch (error) {
        console.error('Error creating activity:', error)
        alert('Error creating activity. Please try again.')
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Activity</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Activity Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Morning Yoga Flow"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe your activity..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Category
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Yoga">Yoga</option>
                <option value="Pilates">Pilates</option>
                <option value="Fitness">Fitness</option>
                <option value="Dance">Dance</option>
                <option value="Meditation">Meditation</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Duration (min)
                </label>
                <input
                  type="number"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="15"
                  max="180"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Max Capacity
                </label>
                <input
                  type="number"
                  required
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="100"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  required
                  value={formData.price / 100}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) * 100 }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="5"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Credits Required
                </label>
                <input
                  type="number"
                  required
                  value={formData.creditsRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, creditsRequired: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Create Activity
              </button>
              <button
                type="button"
                onClick={() => setShowCreateActivity(false)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const CreateClassModal = () => {
    const [formData, setFormData] = useState({
      startDate: '',
      startTime: '',
      endTime: '',
      location: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      if (!selectedActivity) {
        alert('No activity selected')
        return
      }

      try {
        // Combine date and time
        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
        const endDateTime = new Date(`${formData.startDate}T${formData.endTime}`)

        const response = await fetch('/api/instructor/classes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            activityId: selectedActivity.id,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            location: formData.location || 'TBD'
          }),
        })

        if (response.ok) {
          const newClass = await response.json()
          // Add the new class to the state with consistent formatting
          const formattedClass = {
            id: newClass.id,
            activity: newClass.activity,
            startTime: newClass.startTime, // Keep as ISO string for consistency
            endTime: newClass.endTime,     // Keep as ISO string for consistency
            location: newClass.location || 'TBD',
            maxCapacity: newClass.maxCapacity,
            enrolled: 0, // New class starts with 0 enrolled
            isActive: newClass.isActive !== false // Default to true if not specified
          }
          setClasses(prev => [...prev, formattedClass])
          setShowCreateClass(false)
          setSelectedActivity(null)
          
          // Reset form
          setFormData({
            startDate: '',
            startTime: '',
            endTime: '',
            location: ''
          })
        } else {
          console.error('Failed to create class')
          alert('Failed to create class. Please try again.')
        }
      } catch (error) {
        console.error('Error creating class:', error)
        alert('Error creating class. Please try again.')
      }
    }

    const today = new Date().toISOString().split('T')[0]

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Schedule Class: {selectedActivity?.title}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                min={today}
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Location (optional)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Studio A, Online, etc."
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Schedule Class
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateClass(false)
                  setSelectedActivity(null)
                }}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const InviteSubscribersModal = () => {
    const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([])
    const [message, setMessage] = useState('')
    const [sendingInvites, setSendingInvites] = useState(false)

    useEffect(() => {
      if (showInviteModal && subscribers.length === 0) {
        fetchSubscribers()
      }
    }, [showInviteModal])

    const handleSubscriberToggle = (subscriberId: string) => {
      setSelectedSubscribers(prev => 
        prev.includes(subscriberId) 
          ? prev.filter(id => id !== subscriberId)
          : [...prev, subscriberId]
      )
    }

    const handleSendInvites = async () => {
      if (selectedSubscribers.length === 0 || !selectedClass) {
        alert('Please select at least one subscriber')
        return
      }

      setSendingInvites(true)
      
      try {
        const promises = selectedSubscribers.map(customerId =>
          fetch('/api/invitations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerId,
              classId: selectedClass.id,
              message: message || `You're invited to join ${selectedClass.activity.title}!`
            }),
          })
        )

        const results = await Promise.all(promises)
        const successCount = results.filter(r => r.ok).length
        const failCount = results.length - successCount

        if (successCount > 0) {
          alert(`Successfully sent ${successCount} invitation(s)${failCount > 0 ? ` (${failCount} failed)` : ''}`)
        } else {
          alert('Failed to send invitations')
        }

        // Reset and close modal
        setSelectedSubscribers([])
        setMessage('')
        setShowInviteModal(false)
        setSelectedClass(null)

      } catch (error) {
        console.error('Error sending invites:', error)
        alert('Error sending invitations')
      } finally {
        setSendingInvites(false)
      }
    }

    if (!selectedClass) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 border border-gray-700 max-h-[80vh] overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">
            Invite Subscribers to: {selectedClass.activity.title}
          </h3>
          
          <div className="text-sm text-gray-400 mb-4">
            Class: {new Date(selectedClass.startTime).toLocaleDateString()} at {new Date(selectedClass.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Custom Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`You're invited to join ${selectedClass.activity.title}!`}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-200">Select Subscribers</h4>
              <span className="text-xs text-gray-400">
                {selectedSubscribers.length} selected
              </span>
            </div>
            
            <div className="max-h-60 overflow-y-auto border border-gray-600 rounded-md bg-gray-700">
              {subscribers.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  <UserPlus className="h-8 w-8 mx-auto mb-2" />
                  <p>No subscribers found</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {subscribers.map((subscription) => (
                    <div
                      key={subscription.customer.id}
                      className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                        selectedSubscribers.includes(subscription.customer.id)
                          ? 'bg-blue-600/20 border border-blue-500'
                          : 'hover:bg-gray-600'
                      }`}
                      onClick={() => handleSubscriberToggle(subscription.customer.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.includes(subscription.customer.id)}
                        onChange={() => {}}
                        className="mr-3 rounded border-gray-500 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium">{subscription.customer.name}</div>
                        <div className="text-sm text-gray-400">{subscription.customer.email}</div>
                        <div className="text-xs text-gray-500">
                          Credits: {subscription.customer.credits} | 
                          Bookings: {subscription.customer.confirmedBookings}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleSendInvites}
              disabled={sendingInvites || selectedSubscribers.length === 0}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {sendingInvites ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {sendingInvites ? 'Sending...' : `Send Invites (${selectedSubscribers.length})`}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowInviteModal(false)
                setSelectedClass(null)
                setSelectedSubscribers([])
                setMessage('')
              }}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  const AttendeeModal = () => {
    if (!selectedClass) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl mx-4 border border-gray-700 max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Class Attendees: {selectedClass.activity.title}
              </h3>
              <div className="text-sm text-gray-400">
                {new Date(selectedClass.startTime).toLocaleDateString()} at{' '}
                {new Date(selectedClass.startTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
            <button
              onClick={() => {
                setShowAttendeesModal(false)
                setSelectedClass(null)
                setClassAttendees([])
              }}
              className="text-gray-400 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4 bg-gray-700 p-3 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">Total Attendees: <span className="text-white font-medium">{classAttendees.length}</span></span>
              <span className="text-gray-300">Max Capacity: <span className="text-white font-medium">{selectedClass.maxCapacity}</span></span>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="max-h-96 overflow-y-auto border border-gray-600 rounded-md bg-gray-700">
              {classAttendees.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No attendees yet</p>
                  <p className="text-sm">Students will appear here once they book or accept invitations to this class.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-600">
                  {classAttendees.map((attendee, index) => (
                    <div key={attendee.id} className="p-4 hover:bg-gray-600/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {attendee.name ? attendee.name.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-white">
                              {attendee.name || 'Unknown User'}
                            </h4>
                            <p className="text-sm text-gray-400">{attendee.email}</p>
                            {attendee.phone && (
                              <p className="text-xs text-gray-500">{attendee.phone}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            attendee.type === 'booking' 
                              ? 'bg-green-900/50 text-green-300' 
                              : 'bg-blue-900/50 text-blue-300'
                          }`}>
                            {attendee.type === 'booking' ? 'Booked' : 'Invited'}
                          </span>
                          <div className="text-xs text-gray-400">
                            {attendee.creditsUsed} credit{attendee.creditsUsed !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-gray-500">
                            {attendee.type === 'booking' 
                              ? new Date(attendee.bookedAt).toLocaleDateString()
                              : new Date(attendee.acceptedAt).toLocaleDateString()
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                setShowAttendeesModal(false)
                setSelectedClass(null)
                setClassAttendees([])
              }}
              className="bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'INSTRUCTOR') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">Sbookyway Instructor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user.name || user.email}</span>
              <button 
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Instructor Dashboard</h2>
            <p className="text-gray-400">Manage your activities and classes</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/instructor/calendar"
              className="bg-indigo-700 text-white px-4 py-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar View
            </Link>
            <Link
              href="/dashboard/settings/profile"
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center"
            >
              <User className="h-4 w-4 mr-2" />
              Profile Settings
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-600/20">
                <Star className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Activities</p>
                <p className="text-2xl font-semibold text-white">{activities.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-600/20">
                <Calendar className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Scheduled Classes</p>
                <p className="text-2xl font-semibold text-white">{classes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-600/20">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Students</p>
                <p className="text-2xl font-semibold text-white">0</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-600/20">
                <BarChart3 className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Monthly Revenue</p>
                <p className="text-2xl font-semibold text-white">$0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activities Section */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Your Activities</h3>
                <button
                  onClick={() => setShowCreateActivity(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Activity
                </button>
              </div>
            </div>
            <div className="p-6">
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-300 mb-2">No activities yet</h4>
                  <p className="text-gray-500 mb-4">Create your first activity to start teaching!</p>
                  <button
                    onClick={() => setShowCreateActivity(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Activity
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="border border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white">{activity.title}</h4>
                          <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                          <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {activity.duration}min
                            </span>
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              Max {activity.maxCapacity}
                            </span>
                            <span>${(activity.price / 100).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedActivity(activity)
                              setShowCreateClass(true)
                            }}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center"
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Schedule
                          </button>
                          <button className="text-blue-400 hover:text-blue-300">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-400 hover:text-red-300">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Classes Section */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">Upcoming Classes</h3>
            </div>
            <div className="p-6">
              {classes.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-300 mb-2">No scheduled classes</h4>
                  <p className="text-gray-500">
                    {activities.length === 0 
                      ? "Create activities first, then schedule classes for your students."
                      : "Schedule classes for your activities to start teaching."
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(classes) && classes.map((classItem) => (
                    <div key={classItem.id} className="border border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-white">{classItem.activity?.title || 'Unknown Activity'}</h4>
                          <p className="text-sm text-gray-400">{new Date(classItem.startTime).toLocaleString()}</p>
                          <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {classItem.location || 'TBD'}
                            </span>
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {classItem.enrolled || 0}/{classItem.maxCapacity || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300">
                            Confirmed
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedClass(classItem)
                                fetchClassAttendees(classItem.id)
                                setShowAttendeesModal(true)
                              }}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center"
                            >
                              <Users className="h-3 w-3 mr-1" />
                              Attendees
                            </button>
                            <button
                              onClick={() => {
                                setSelectedClass(classItem)
                                setShowInviteModal(true)
                              }}
                              className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors flex items-center"
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Invite
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Activity Modal */}
      {showCreateActivity && <CreateActivityModal />}
      
      {/* Create Class Modal */}
      {showCreateClass && <CreateClassModal />}
      
      {/* Invite Subscribers Modal */}
      {showInviteModal && <InviteSubscribersModal />}
      
      {/* Attendee Modal */}
      {showAttendeesModal && <AttendeeModal />}
    </div>
  )
}
