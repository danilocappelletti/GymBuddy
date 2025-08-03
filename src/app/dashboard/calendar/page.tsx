'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, User } from 'lucide-react'
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
    type: 'booking' | 'invitation'
    status: string
    activity: any
    class: any
    instructor?: any
    creditsUsed?: number
  }
}

export default function CalendarView() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
      return
    }
    
    if (user) {
      fetchEvents()
    }
  }, [user, loading, router])

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true)
      
      // Fetch bookings
      const bookingsResponse = await fetch('/api/bookings')
      let bookings = []
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        bookings = bookingsData.bookings || []
      }

      // Fetch accepted invitations
      const invitationsResponse = await fetch('/api/invitations?type=received&status=accepted')
      let invitations = []
      if (invitationsResponse.ok) {
        const invitationsData = await invitationsResponse.json()
        invitations = invitationsData.invitations || []
      }

      // Convert to calendar events
      const calendarEvents: CalendarEvent[] = [
        // Bookings
        ...bookings.map((booking: any) => ({
          id: `booking-${booking.id}`,
          title: booking.activity.title,
          start: booking.class ? new Date(booking.class.startTime) : new Date(booking.bookedAt),
          end: booking.class ? new Date(booking.class.endTime) : new Date(new Date(booking.bookedAt).getTime() + 60 * 60 * 1000),
          resource: {
            type: 'booking' as const,
            status: booking.status,
            activity: booking.activity,
            class: booking.class,
            creditsUsed: booking.creditsUsed
          }
        })),
        // Accepted invitations
        ...invitations.map((invitation: any) => ({
          id: `invitation-${invitation.id}`,
          title: invitation.class.activity.title,
          start: new Date(invitation.class.startTime),
          end: new Date(invitation.class.endTime),
          resource: {
            type: 'invitation' as const,
            status: invitation.status,
            activity: invitation.class.activity,
            class: invitation.class,
            instructor: invitation.instructor,
            creditsUsed: invitation.class.activity.creditsRequired
          }
        }))
      ]

      setEvents(calendarEvents)
    } catch (error) {
      console.error('Error fetching calendar events:', error)
    } finally {
      setLoadingEvents(false)
    }
  }

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad'
    let borderColor = '#3174ad'
    
    if (event.resource.type === 'booking') {
      backgroundColor = '#10b981' // green for bookings
      borderColor = '#10b981'
    } else if (event.resource.type === 'invitation') {
      backgroundColor = '#8b5cf6' // purple for invitations
      borderColor = '#8b5cf6'
    }

    if (event.resource.status === 'CANCELLED') {
      backgroundColor = '#ef4444' // red for cancelled
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
              <Link
                href="/dashboard"
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-600"></div>
              <h1 className="text-xl font-semibold text-white flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                My Calendar
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Legend */}
        <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-medium text-white mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="text-sm text-gray-300">My Bookings</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
              <span className="text-sm text-gray-300">Accepted Invitations</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span className="text-sm text-gray-300">Cancelled</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg p-6" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day']}
            defaultView="month"
            popup
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }: { start: Date, end: Date }) => 
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
            }}
          />
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

              {selectedEvent.resource.class?.location && (
                <div className="flex items-center text-sm text-gray-300">
                  <MapPin className="h-4 w-4 mr-2" />
                  {selectedEvent.resource.class.location}
                </div>
              )}

              {selectedEvent.resource.instructor && (
                <div className="flex items-center text-sm text-gray-300">
                  <User className="h-4 w-4 mr-2" />
                  Instructor: {selectedEvent.resource.instructor.name}
                </div>
              )}

              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Type:</span>
                  <span className={`font-medium ${
                    selectedEvent.resource.type === 'booking' ? 'text-green-400' : 'text-purple-400'
                  }`}>
                    {selectedEvent.resource.type === 'booking' ? 'Direct Booking' : 'Instructor Invitation'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-gray-300">Status:</span>
                  <span className={`font-medium ${
                    selectedEvent.resource.status === 'CONFIRMED' ? 'text-green-400' :
                    selectedEvent.resource.status === 'CANCELLED' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {selectedEvent.resource.status}
                  </span>
                </div>
                {selectedEvent.resource.creditsUsed && (
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-gray-300">Credits:</span>
                    <span className="text-blue-400 font-medium">{selectedEvent.resource.creditsUsed}</span>
                  </div>
                )}
              </div>

              {selectedEvent.resource.activity.description && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">Description</h4>
                  <p className="text-sm text-gray-300">{selectedEvent.resource.activity.description}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
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
    </div>
  )
}
