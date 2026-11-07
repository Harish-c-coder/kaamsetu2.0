// Shifts configuration for KaamSetu Partner / Worker app

export const AVAILABLE_SHIFTS = [
  // Quick Hourly Shifts
  {
    id: 'shift_1hr',
    name: '1-Hour Quick Shift',
    category: 'hourly',
    durationHours: 1,
    badge: '⚡ 1-Hour Shift',
    startTime: 'Dynamic',
    endTime: '+1 Hr',
    description: 'Instant on-demand availability for 1 hour. Ideal for quick nearby local emergency tasks.',
  },
  {
    id: 'shift_2hr',
    name: '2-Hour Express Shift',
    category: 'hourly',
    durationHours: 2,
    badge: '⚡ 2-Hour Shift',
    startTime: 'Dynamic',
    endTime: '+2 Hrs',
    description: 'Available for 2 continuous hours in your neighborhood.',
  },
  {
    id: 'shift_3hr',
    name: '3-Hour Half Shift',
    category: 'hourly',
    durationHours: 3,
    badge: '⚡ 3-Hour Shift',
    startTime: 'Dynamic',
    endTime: '+3 Hrs',
    description: 'Short multi-tasking shift for 3 hours of customer bookings.',
  },
  {
    id: 'shift_4hr',
    name: '4-Hour Half-Day Shift',
    category: 'hourly',
    durationHours: 4,
    badge: '⏱️ 4-Hour Shift',
    startTime: 'Dynamic',
    endTime: '+4 Hrs',
    description: 'Half-day 4 hours on active duty.',
  },

  // Daily Scheduled Fixed Shifts
  {
    id: 'shift_morning',
    name: 'Morning Shift (8:00 AM – 2:00 PM)',
    startTime: '08:00 AM',
    endTime: '02:00 PM',
    category: 'daily',
    durationHours: 6,
    badge: '🌅 8 AM – 2 PM',
    description: 'Ideal for electricians, plumbers, and vegetable sellers during morning peak hours.',
  },
  {
    id: 'shift_general',
    name: 'General Day Shift (9:00 AM – 6:00 PM)',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    category: 'daily',
    durationHours: 9,
    badge: '☀️ 9 AM – 6 PM',
    description: 'Standard 9-hour daytime work shift.',
  },
  {
    id: 'shift_full_day_8pm',
    name: 'Full Day Shift (9:00 AM – 8:00 PM)',
    startTime: '09:00 AM',
    endTime: '08:00 PM',
    category: 'daily',
    durationHours: 11,
    badge: '🌇 9 AM – 8 PM',
    description: '11-hour comprehensive shift covering morning, afternoon, and evening rush.',
  },
  {
    id: 'shift_extended_10pm',
    name: 'Extended Night Shift (9:00 AM – 10:00 PM)',
    startTime: '09:00 AM',
    endTime: '10:00 PM',
    category: 'daily',
    durationHours: 13,
    badge: '🌙 9 AM – 10 PM',
    description: 'Full-day extended coverage for street vendors, artisans, and electricians.',
  },
  {
    id: 'shift_evening',
    name: 'Evening Peak Shift (5:00 PM – 10:00 PM)',
    startTime: '05:00 PM',
    endTime: '10:00 PM',
    category: 'daily',
    durationHours: 5,
    badge: '🌆 5 PM – 10 PM',
    description: '5 hours during after-work hours when residents need urgent repairs.',
  },
  {
    id: 'shift_emergency_night',
    name: 'Emergency Night Shift (8:00 PM – 2:00 AM)',
    startTime: '08:00 PM',
    endTime: '02:00 AM',
    category: 'daily',
    durationHours: 6,
    badge: '🌃 8 PM – 2 AM',
    description: 'Special night shift for urgent plumbing, electrical, and night assistance.',
  },
];

// Calculate remaining time for a shift
export function getShiftRemainingTime(activeShift) {
  if (!activeShift) return null;
  if (!activeShift.endsAt) {
    if (activeShift.startTime && activeShift.endTime) {
      return `${activeShift.startTime} - ${activeShift.endTime}`;
    }
    return activeShift.name || 'Active Shift';
  }

  const end = new Date(activeShift.endsAt).getTime();
  const now = Date.now();
  const diffMs = end - now;

  if (diffMs <= 0) {
    return 'Shift Ended';
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${mins}m left`;
  }
  return `${mins}m left`;
}
