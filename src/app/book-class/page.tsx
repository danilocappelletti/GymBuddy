'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Users, MapPin, CreditCard } from 'lucide-react'

interface ClassData {
  id: string
  title: string
  description: string
  instructor: string
  duration: number
  date: string
  time: string
  location: string
  capacity: number
  enrolled: number
  credits: number
  price: number
}

const mockClasses: ClassData[] = [
  {
    id: '1',
    title: 'Morning Yoga Flow',
    description: 'Start your day with energizing yoga poses and breathing exercises.',
    instructor: 'Sarah Johnson',
    duration: 60,
    date: '2025-07-28',
    time: '08:00',
    location: 'Studio A',
    capacity: 20,
    enrolled: 15,
    credits: 1,
    price: 2500
  },
  {
    id: '2',
    title: 'HIIT Training',
    description: 'High-intensity interval training to boost your fitness level.',
    instructor: 'Mike Wilson',
    duration: 45,
    date: '2025-07-28',
    time: '10:00',
    location: 'Gym Floor',
    capacity: 15,
    enrolled: 12,
    credits: 2,
    price: 3500
  },
  {
    id: '3',
    title: 'Pilates Core',
    description: 'Strengthen your core with focused Pilates exercises.',
    instructor: 'Emma Davis',
    duration: 50,
    date: '2025-07-28',
    time: '14:00',
    location: 'Studio B',
    capacity: 12,
    enrolled: 12,
    credits: 1,
    price: 3000
  },
]

export default function BookClass() {
  const [selectedDate, setSelectedDate] = useState('2025-07-28')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
  }

  const handleBookClass = (classId: string) => {
    // TODO: Implement booking logic
    console.log('Booking class:', classId)
  }

  const handleJoinWaitingList = (classId: string) => {
    // TODO: Implement waiting list logic
    console.log('Joining waiting list for class:', classId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900">Book a Class</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Selector */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Select Date</h2>
          <div className="flex space-x-4">
            {['2025-07-28', '2025-07-29', '2025-07-30'].map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-2 rounded-md border ${
                  selectedDate === date
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </button>
            ))}
          </div>
        </div>

        {/* Classes List */}
        <div className="space-y-4">
          {mockClasses.map((classItem) => (
            <div key={classItem.id} className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {classItem.title}
                      </h3>
                      <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {classItem.credits} credit{classItem.credits > 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{classItem.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{classItem.instructor}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{classItem.time} ({classItem.duration}min)</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{classItem.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{classItem.enrolled}/{classItem.capacity} enrolled</span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col items-end">
                    <div className="text-right mb-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(classItem.price)}
                      </p>
                      <p className="text-sm text-gray-600">or {classItem.credits} credits</p>
                    </div>

                    {classItem.enrolled < classItem.capacity ? (
                      <button
                        onClick={() => handleBookClass(classItem.id)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Book Now
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinWaitingList(classItem.id)}
                        className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700"
                      >
                        Join Waiting List
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* User Credits Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                You have 18 credits available
              </p>
              <p className="text-sm text-blue-700">
                Need more credits? <Link href="/buy-credits" className="underline">Buy a credit package</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
