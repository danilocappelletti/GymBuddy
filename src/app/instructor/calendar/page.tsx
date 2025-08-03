'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, momentLocalizer, View } from 'react-big-calendar'
import moment from 'moment'
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Users, User, Eye } from 'lucide-react'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '@/styles/calendar.css'

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment)

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    type: 'class'
    classData: any
    activity: any
    enrolledCount: number
    maxCapacity: number
  }
}

export default function InstructorCalendarView() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showAttendeesModal, setShowAttendeesModal] = useState(false)
  const [classAttendees, setClassAttendees] = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<View>('week')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
      return
    }
    
    if (user && user.role === 'INSTRUCTOR') {
      fetchEvents()
    } else if (user && user.role !== 'INSTRUCTOR') {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true)
      
      // Fetch instructor's classes
      const classesResponse = await fetch('/api/instructor/classes')
      let classes = []
      if (classesResponse.ok) {
        const classesData = await classesResponse.json()
        classes = classesData.classes || []
        console.log('Fetched classes for calendar:', classes)
      } else {
        console.error('Failed to fetch classes:', classesResponse.status)
      }

      // Convert to calendar events
      const calendarEvents: CalendarEvent[] = classes.map((classItem: any) => ({
        id: `class-${classItem.id}`,
        title: classItem.activity.title,
        start: new Date(classItem.startTime),
        end: new Date(classItem.endTime),
        resource: {
          type: 'class' as const,
          classData: classItem,
          activity: classItem.activity,
          enrolledCount: classItem.enrolled || 0,
          maxCapacity: classItem.maxCapacity || classItem.activity.maxCapacity
        }
      }))

      console.log('Converted calendar events:', calendarEvents)
      setEvents(calendarEvents)
    } catch (error) {
      console.error('Error fetching calendar events:', error)
    } finally {
      setLoadingEvents(false)
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

  const eventStyleGetter = (event: CalendarEvent) => {
    const { enrolledCount, maxCapacity } = event.resource
    let backgroundColor = '#3174ad'
    let borderColor = '#3174ad'
    
    // Color based on enrollment
    if (enrolledCount === 0) {
      backgroundColor = '#6b7280' // gray for no enrollments
      borderColor = '#6b7280'
    } else if (enrolledCount < maxCapacity * 0.5) {
      backgroundColor = '#f59e0b' // yellow for low enrollment
      borderColor = '#f59e0b'
    } else if (enrolledCount < maxCapacity) {
      backgroundColor = '#10b981' // green for good enrollment
      borderColor = '#10b981'
    } else {
      backgroundColor = '#ef4444' // red for full/overbooked
      borderColor = '#ef4444'
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: 'none',
        borderRadius: '4px'
      }
    }
  }

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  const handleNavigate = (newDate: Date) => {
    console.log('Calendar navigating to:', newDate)
    setCurrentDate(newDate)
  }

  const handleViewChange = (view: View) => {
    console.log('Calendar view changing to:', view)
    setCurrentView(view)
  }

  const handleViewAttendees = (classId: string) => {
    fetchClassAttendees(classId)
    setShowAttendeesModal(true)
  }

  if (loading || loadingEvents) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading calendar...</p>
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
            <div className="flex items-center space-x-4">
              <Link
                href="/instructor"
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-600"></div>
              <h1 className="text-xl font-semibold text-white flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                My Teaching Calendar
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Legend */}
        <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-medium text-white mb-3">Enrollment Status</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
              <span className="text-sm text-gray-300">No Enrollments</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
              <span className="text-sm text-gray-300">Low Enrollment (&lt;50%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="text-sm text-gray-300">Good Enrollment</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span className="text-sm text-gray-300">Full/Overbooked</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg p-6 shadow-lg" style={{ height: '700px' }}>
          {events.length === 0 && !loadingEvents ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No classes scheduled</h3>
                <p className="text-gray-500">
                  Schedule some classes from your instructor dashboard to see them here.
                </p>
                <Link
                  href="/instructor"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%', minHeight: '600px' }}
              onSelectEvent={handleSelectEvent}
              onNavigate={handleNavigate}
              onView={handleViewChange}
              date={currentDate}
              view={currentView}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day']}
              popup
              selectable
              step={30}
              timeslots={2}
              min={new Date(0, 0, 0, 6, 0, 0)} // 6 AM
              max={new Date(0, 0, 0, 23, 0, 0)} // 11 PM
              formats={{
                timeGutterFormat: 'HH:mm',
                eventTimeRangeFormat: ({ start, end }: { start: Date, end: Date }) => 
                  `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
              }}
              messages={{
                next: "Next",
                previous: "Previous",
                today: "Today",
                month: "Month",
                week: "Week",
                day: "Day",
                showMore: (total: number) => `+${total} more`
              }}
              components={{
                event: ({ event }: { event: CalendarEvent }) => (
                  <div className="text-xs cursor-pointer hover:opacity-90 transition-opacity">
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-xs opacity-90">
                      {event.resource.enrolledCount}/{event.resource.maxCapacity} enrolled
                    </div>
                  </div>
                )
              }}
            />
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">
                {selectedEvent.title}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-300">
                <Clock className="h-4 w-4 mr-2" />
                {moment(selectedEvent.start).format('MMMM Do, YYYY [at] HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}
              </div>

              {selectedEvent.resource.classData.location && (
                <div className="flex items-center text-sm text-gray-300">
                  <MapPin className="h-4 w-4 mr-2" />
                  {selectedEvent.resource.classData.location}
                </div>
              )}

              <div className="flex items-center text-sm text-gray-300">
                <Users className="h-4 w-4 mr-2" />
                {selectedEvent.resource.enrolledCount} of {selectedEvent.resource.maxCapacity} enrolled
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-300">Duration:</span>
                  <span className="text-white">{selectedEvent.resource.activity.duration} minutes</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-300">Credits Required:</span>
                  <span className="text-blue-400">{selectedEvent.resource.activity.creditsRequired}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Category:</span>
                  <span className="text-white">{selectedEvent.resource.activity.category}</span>
                </div>
              </div>

              {selectedEvent.resource.activity.description && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">Description</h4>
                  <p className="text-sm text-gray-300">{selectedEvent.resource.activity.description}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => handleViewAttendees(selectedEvent.resource.classData.id)}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Attendees
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendees Modal */}
      {showAttendeesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                Class Attendees ({classAttendees.length})
              </h3>
              <button
                onClick={() => {
                  setShowAttendeesModal(false)
                  setClassAttendees([])
                }}
                className="text-gray-400 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {classAttendees.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <p>No attendees registered yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {classAttendees.map((attendee, index) => (
                    <div key={attendee.id} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {attendee.name ? attendee.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white">
                              {attendee.name || 'Unknown User'}
                            </h4>
                            <p className="text-xs text-gray-400">{attendee.email}</p>
                            {attendee.phone && (
                              <p className="text-xs text-gray-500">{attendee.phone}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            attendee.type === 'booking' 
                              ? 'bg-green-900/50 text-green-300' 
                              : 'bg-purple-900/50 text-purple-300'
                          }`}>
                            {attendee.type === 'booking' ? 'Booked' : 'Invited'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowAttendeesModal(false)
                  setClassAttendees([])
                }}
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
