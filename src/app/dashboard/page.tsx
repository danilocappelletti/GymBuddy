'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Users, CreditCard, BarChart3, Clock, Star, User, MapPin, Bell, CheckCircle, XCircle } from 'lucide-react'

interface Activity {
    id: string
    title: string
    description: string
    category: string
    creditsRequired: number
    maxCapacity: number
    location?: string
    instructor: {
        id: string
        name: string
        email: string
    } | null
    classes: {
        id: string
        startTime: string
        endTime: string
        isActive: boolean
        location?: string
    }[]
}

export default function Dashboard() {
    const { user, loading, logout } = useAuth()
    const router = useRouter()
    const [activities, setActivities] = useState<Activity[]>([])
    const [bookings, setBookings] = useState<any[]>([])
    const [notifications, setNotifications] = useState<any[]>([])
    const [loadingActivities, setLoadingActivities] = useState(true)
    const [userCredits, setUserCredits] = useState(0)

    console.log('Dashboard - loading:', loading, 'user:', user)

    useEffect(() => {
        console.log('Dashboard useEffect - loading:', loading, 'user:', user)
        if (!loading && !user) {
            console.log('Redirecting to signin')
            router.push('/auth/signin')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (user) {
            fetchActivities()
            fetchBookings()
            fetchUserCredits()
            fetchNotifications()
        }
    }, [user])

    // Refresh credits when user returns to this page (e.g., from buy-credits page)
    useEffect(() => {
        const handleFocus = () => {
            if (user) {
                fetchUserCredits()
            }
        }

        window.addEventListener('focus', handleFocus)
        return () => window.removeEventListener('focus', handleFocus)
    }, [user])

    const fetchUserCredits = async () => {
        try {
            const response = await fetch('/api/user/credits')
            if (response.ok) {
                const data = await response.json()
                setUserCredits(data.credits)
            } else {
                console.error('Failed to fetch user credits')
            }
        } catch (error) {
            console.error('Error fetching user credits:', error)
        }
    }

    const fetchActivities = async () => {
        try {
            const response = await fetch('/api/activities')
            if (response.ok) {
                const data = await response.json()
                setActivities(data)
            } else {
                console.error('Failed to fetch activities')
            }
        } catch (error) {
            console.error('Error fetching activities:', error)
        } finally {
            setLoadingActivities(false)
        }
    }

    const fetchBookings = async () => {
        try {
            const response = await fetch('/api/bookings')
            if (response.ok) {
                const data = await response.json()
                // API returns { success: true, bookings: [...] }
                setBookings(data.bookings || [])
            } else {
                console.error('Failed to fetch bookings')
                setBookings([])
            }
        } catch (error) {
            console.error('Error fetching bookings:', error)
            setBookings([])
        }
    }

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/invitations?type=received')
            if (response.ok) {
                const data = await response.json()
                setNotifications(data.invitations)
            } else {
                console.error('Failed to fetch notifications')
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    const handleInvitationResponse = async (invitationId: string, status: 'ACCEPTED' | 'DECLINED') => {
        try {
            const response = await fetch('/api/invitations', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    invitationId,
                    status
                })
            });

            if (response.ok) {
                // Remove the invitation from notifications
                setNotifications(prev => prev.filter(inv => inv.id !== invitationId));
                
                // If accepted, refresh user data to update credits and bookings
                if (status === 'ACCEPTED') {
                    fetchUserCredits();
                    fetchBookings();
                }
            } else {
                console.error('Failed to respond to invitation');
            }
        } catch (error) {
            console.error('Error responding to invitation:', error);
        }
    };

    const handleBookClass = async (classId: string, creditsRequired: number) => {
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
                alert('Class booked successfully!')
                setUserCredits(result.remainingCredits)
                fetchBookings() // Refresh bookings
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to book class')
            }
        } catch (error) {
            console.error('Error booking class:', error)
            alert('Error booking class. Please try again.')
        }
    }

    const generateCalendarLink = (booking: any) => {
        if (!booking.class?.startTime || !booking.class?.endTime || !booking.activity) {
            return '#'
        }

        const startDate = new Date(booking.class.startTime)
        const endDate = new Date(booking.class.endTime)

        const formatDate = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
        }

        const title = encodeURIComponent(`${booking.activity.title} - ${booking.activity.instructor?.name || 'Instructor'}`)
        const details = encodeURIComponent(`Activity: ${booking.activity.title}\nInstructor: ${booking.activity.instructor?.name || 'TBD'}\nLocation: ${booking.class.location || 'TBD'}`)
        const location = encodeURIComponent(booking.class.location || 'TBD')

        // Google Calendar link
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(startDate)}%2F${formatDate(endDate)}&details=${details}&location=${location}`

        return googleCalendarUrl
    }

    const handleSignOut = async () => {
        await logout()
        router.push('/')
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
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-white">Sbookyway</h1>
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
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                    <p className="text-gray-400">Manage your bookings and activities</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-600/20">
                                <Calendar className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-400">Available Activities</p>
                                <p className="text-2xl font-semibold text-white">{activities.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-600/20">
                                <CreditCard className="h-6 w-6 text-green-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-400">Available Credits</p>
                                <p className="text-2xl font-semibold text-white">{userCredits}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-purple-600/20">
                                <Users className="h-6 w-6 text-purple-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-400">My Bookings</p>
                                <p className="text-2xl font-semibold text-white">{bookings.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-yellow-600/20">
                                <Clock className="h-6 w-6 text-yellow-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-400">Active Instructors</p>
                                <p className="text-2xl font-semibold text-white">
                                    {new Set(activities.filter(activity => activity.instructor?.id).map(activity => activity.instructor!.id)).size}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* My Bookings */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-8">
                            <div className="p-6 border-b border-gray-700">
                                <h3 className="text-lg font-medium text-white">My Bookings</h3>
                                <p className="text-sm text-gray-400">Your upcoming classes</p>
                            </div>
                            <div className="p-6">
                                {bookings.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-400">No Bookings Yet</h3>
                                        <p className="text-gray-500">Book your first class from the activities below!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {Array.isArray(bookings) && bookings.map((booking) => (
                                            <div key={booking.id} className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                                                                <Star className="h-6 w-6 text-green-400" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-lg font-medium text-white">{booking.activity?.title || 'Unknown Activity'}</h4>
                                                                <p className="text-sm text-gray-400">{booking.activity?.description || 'No description'}</p>
                                                                <div className="flex items-center space-x-4 mt-2">
                                                                    <div className="flex items-center text-sm text-gray-500">
                                                                        <User className="h-4 w-4 mr-1" />
                                                                        {booking.activity?.instructor?.name || 'No instructor'}
                                                                    </div>
                                                                    <div className="flex items-center text-sm text-gray-500">
                                                                        <MapPin className="h-4 w-4 mr-1" />
                                                                        {booking.class?.location || 'TBD'}
                                                                    </div>
                                                                    <div className="flex items-center text-sm text-gray-500">
                                                                        <Clock className="h-4 w-4 mr-1" />
                                                                        {booking.class?.startTime ? new Date(booking.class.startTime).toLocaleDateString() : 'TBD'} at{' '}
                                                                        {booking.class?.startTime ? new Date(booking.class.startTime).toLocaleTimeString([], {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        }) : 'TBD'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end space-y-2">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300">
                                                            {booking.status || 'CONFIRMED'}
                                                        </span>
                                                        {booking.class?.startTime && booking.activity && (
                                                            <a
                                                                href={generateCalendarLink(booking)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors flex items-center"
                                                            >
                                                                <Calendar className="h-3 w-3 mr-1" />
                                                                Add to Calendar
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Available Activities */}
                        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                            <div className="p-6 border-b border-gray-700">
                                <h3 className="text-lg font-medium text-white">Available Activities</h3>
                                <p className="text-sm text-gray-400">Browse and book classes from all instructors</p>
                            </div>
                    <div className="p-6">
                        {loadingActivities ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                                <span className="ml-3 text-gray-400">Loading activities...</span>
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="text-center py-8">
                                <Star className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-400">No Activities Available</h3>
                                <p className="text-gray-500">There are no activities available for booking at the moment.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                                        <Star className="h-6 w-6 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-medium text-white">{activity.title}</h4>
                                                        <p className="text-sm text-gray-400">{activity.description}</p>
                                                        <div className="flex items-center space-x-4 mt-2">
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <User className="h-4 w-4 mr-1" />
                                                                {activity.instructor?.name || 'No instructor assigned'}
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <MapPin className="h-4 w-4 mr-1" />
                                                                {activity.location || 'Location TBD'}
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <CreditCard className="h-4 w-4 mr-1" />
                                                                {activity.creditsRequired} credits
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Classes for this activity */}
                                                {activity.classes.length > 0 && (
                                                    <div className="mt-4 pl-15">
                                                        <h5 className="text-sm font-medium text-gray-300 mb-2">Upcoming Classes:</h5>
                                                        <div className="space-y-2">
                                                            {activity.classes.slice(0, 3).map((classItem) => (
                                                                <div key={classItem.id} className="flex items-center justify-between bg-gray-700/50 rounded p-3">
                                                                    <div className="flex items-center space-x-3">
                                                                        <Clock className="h-4 w-4 text-blue-400" />
                                                                        <div>
                                                                            <p className="text-sm text-white">
                                                                                {new Date(classItem.startTime).toLocaleDateString()} at{' '}
                                                                                {new Date(classItem.startTime).toLocaleTimeString([], {
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit'
                                                                                })}
                                                                            </p>
                                                                            <p className="text-xs text-gray-400">
                                                                                Duration: {Math.round((new Date(classItem.endTime).getTime() - new Date(classItem.startTime).getTime()) / (1000 * 60))} minutes
                                                                                {classItem.location && ` • ${classItem.location}`}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleBookClass(classItem.id, activity.creditsRequired)}
                                                                        disabled={userCredits < activity.creditsRequired}
                                                                        className={`px-3 py-1 rounded text-sm transition-colors ${userCredits >= activity.creditsRequired
                                                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                                            }`}
                                                                    >
                                                                        {userCredits >= activity.creditsRequired ? 'Book' : 'Need Credits'}
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            {activity.classes.length > 3 && (
                                                                <p className="text-xs text-gray-500 text-center">
                                                                    +{activity.classes.length - 3} more classes available
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-end space-y-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300">
                                                    {activity.category}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Max: {activity.maxCapacity} people
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    href="/activities"
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center justify-center"
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Browse Activities
                                </Link>
                                <Link
                                    href="/dashboard/calendar"
                                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center justify-center"
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Calendar View
                                </Link>
                                <Link
                                    href="/dashboard/settings/profile"
                                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors flex items-center justify-center"
                                >
                                    <User className="h-4 w-4 mr-2" />
                                    My Profile
                                </Link>
                                <button
                                    onClick={fetchActivities}
                                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors flex items-center justify-center"
                                >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Refresh Activities
                                </button>
                                <Link
                                    href="/buy-credits"
                                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors flex items-center justify-center"
                                >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Buy Credits
                                </Link>
                            </div>
                        </div>

                        {/* Class Invitations */}
                        {notifications.length > 0 && (
                            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-white flex items-center">
                                        <Bell className="h-5 w-5 mr-2 text-yellow-400" />
                                        Class Invitations
                                    </h3>
                                    <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                                        {notifications.length}
                                    </span>
                                </div>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {notifications.map((invitation) => (
                                        <div key={invitation.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-white">
                                                        {invitation.class.activity.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-400">
                                                        From: {invitation.instructor.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(invitation.class.startTime).toLocaleDateString()} at{' '}
                                                        {new Date(invitation.class.startTime).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-green-400 font-medium">
                                                    {invitation.class.activity.creditsRequired} credits
                                                </span>
                                            </div>
                                            
                                            {invitation.message && (
                                                <p className="text-xs text-gray-300 mb-3 italic">
                                                    "{invitation.message}"
                                                </p>
                                            )}
                                            
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleInvitationResponse(invitation.id, 'ACCEPTED')}
                                                    disabled={userCredits < invitation.class.activity.creditsRequired}
                                                    className={`flex-1 text-xs py-2 px-3 rounded font-medium transition-colors ${
                                                        userCredits >= invitation.class.activity.creditsRequired
                                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <CheckCircle className="h-3 w-3 mr-1 inline" />
                                                    {userCredits >= invitation.class.activity.creditsRequired ? 'Accept' : 'Need Credits'}
                                                </button>
                                                <button
                                                    onClick={() => handleInvitationResponse(invitation.id, 'DECLINED')}
                                                    className="flex-1 bg-red-600 text-white text-xs py-2 px-3 rounded font-medium hover:bg-red-700 transition-colors"
                                                >
                                                    <XCircle className="h-3 w-3 mr-1 inline" />
                                                    Decline
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Activity Summary */}
                        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-medium text-white mb-4">Activity Summary</h3>
                            <div className="space-y-3">
                                {activities.length > 0 ? (
                                    <>
                                        <div className="border border-gray-700 rounded-lg p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-medium text-white">Most Popular</h4>
                                                    <p className="text-sm text-gray-400">
                                                        {activities.reduce((prev, current) =>
                                                            (prev.classes.length > current.classes.length) ? prev : current
                                                        ).title}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-400">Classes</p>
                                                    <p className="text-lg font-semibold text-white">
                                                        {activities.reduce((prev, current) =>
                                                            (prev.classes.length > current.classes.length) ? prev : current
                                                        ).classes.length}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border border-gray-700 rounded-lg p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-medium text-white">Categories</h4>
                                                    <p className="text-sm text-gray-400">
                                                        {new Set(activities.map(a => a.category)).size} different types
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-400">Avg Credits</p>
                                                    <p className="text-lg font-semibold text-white">
                                                        {Math.round((activities.reduce((sum, a) => sum + a.creditsRequired, 0)) / (activities.length || 1))}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500">No activities to summarize</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
