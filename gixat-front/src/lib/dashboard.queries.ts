// Dashboard-specific GraphQL queries - Verified with Backend

export const GET_ME_QUERY = `
  query {
    me {
      id
      email
      type
    }
  }
`;

/**
 * Dashboard Statistics Query
 * Fetches all key metrics for the business dashboard
 * Returns businessId from businesses query to use in other queries
 */
export const GET_DASHBOARD_STATISTICS = `
  query GetDashboardStatistics($businessId: ID!) {
    jobCardStatistics(businessId: $businessId)
    clientStats(businessId: $businessId) {
      totalClients
      activeClients
      clientsWithCars
      totalCars
    }
    carStats(businessId: $businessId) {
      totalCars
    }
    appointmentStatistics(businessId: $businessId) {
      total
      completed
      pending
      today
    }
  }
`;

export const GET_MY_BUSINESSES_QUERY = `
  query {
    businesses {
      id
      name
      email
      phone
      address
      city
      state
    }
  }
`;

export const GET_BUSINESS_DETAILS = `
  query GetBusinessDetails($businessId: ID!) {
    business(id: $businessId) {
      id
      name
      email
      phone
      address
      city
      state
      createdAt
    }
  }
`;

/**
 * Get My Garages Query
 * Fetches garages for a specific business
 */
export const GET_MY_GARAGES_QUERY = `
  query GetMyGarages {
    myGarages {
      id
      name
      address
      city
      state
      phone
      email
    }
  }
`;

export const GET_GARAGE_CAPACITY_QUERY = `
  query {
    garageCapacity {
      totalCapacity
      currentCapacity
      availableCapacity
      utilizationPercentage
    }
  }
`;

/**
 * Recent Job Cards Query
 * Fetches latest job cards for dashboard overview
 */
export const GET_RECENT_JOB_CARDS = `
  query GetRecentJobCards($businessId: ID!) {
    jobCards(businessId: $businessId) {
      id
      title
      status
      createdAt
    }
  }
`;

/**
 * Upcoming Appointments Query
 * Fetches upcoming appointments for the business
 */
export const GET_UPCOMING_APPOINTMENTS_QUERY = `
  query GetUpcomingAppointments($businessId: ID!) {
    upcomingAppointments(businessId: $businessId) {
      id
      date
      time
      status
    }
  }
`;

/**
 * Todays Appointments Query
 */
export const GET_TODAYS_APPOINTMENTS_QUERY = `
  query GetTodaysAppointments($businessId: ID!) {
    todaysAppointments(businessId: $businessId) {
      id
      date
      time
      status
    }
  }
`;

/**
 * Clients List Query
 * Fetches all clients for a business with pagination
 */
export const GET_CLIENTS_LIST = `
  query GetClientsList($businessId: ID!) {
    clientsByBusiness(businessId: $businessId) {
      id
      firstName
      lastName
      email
      phone
      address
      city
    }
  }
`;

export const GET_CLIENT_STATS_QUERY = `
  query GetClientStats($businessId: ID!) {
    clientStats(businessId: $businessId) {
      totalClients
      activeClients
      clientsWithCars
      totalCars
    }
  }
`;

/**
 * Cars List Query
 * Fetches all cars for a business
 */
export const GET_CARS_LIST = `
  query GetCarsList($businessId: ID!) {
    carsByBusiness(businessId: $businessId) {
      id
      make
      model
      year
      licensePlate
      vin
      status
    }
  }
`;

export const GET_CAR_STATS_QUERY = `
  query GetCarStats($businessId: ID!) {
    carStats(businessId: $businessId) {
      totalCars
    }
  }
`;

/**
 * CLIENT DASHBOARD QUERIES
 */

export const GET_CLIENT_CARS_QUERY = `
  query {
    cars {
      id
      licensePlate
      make
      model
      year
      color
      status
      insuranceExpiryDate
      mileage
    }
  }
`;

export const GET_CLIENT_REPAIR_SESSIONS_QUERY = `
  query {
    repairSessions(limit: 50) {
      id
      status
      priority
      createdAt
    }
  }
`;

export const GET_CLIENT_APPOINTMENTS_QUERY = `
  query {
    appointments {
      id
      date
      time
      status
      title
    }
  }
`;

export const GET_CLIENT_INSPECTION_QUERY = `
  query($repairSessionId: ID!) {
    inspections(repairSessionId: $repairSessionId) {
      id
      type
      title
      findings
      passed
      inspectionDate
    }
  }
`;

export const GET_CLIENT_OFFERS_QUERY = `
  query {
    offers(limit: 50) {
      id
      title
      totalCost
      status
      createdAt
    }
  }
`;

/**
 * BUSINESS/OWNER DASHBOARD QUERIES
 */

export const GET_BUSINESS_REPAIR_SESSIONS_QUERY = `
  query($businessId: ID!) {
    repairSessions(businessId: $businessId) {
      id
      status
      priority
      createdAt
      updatedAt
    }
  }
`;

export const GET_BUSINESS_JOB_CARDS_QUERY = `
  query($businessId: ID!) {
    jobCards(businessId: $businessId) {
      id
      title
      status
      priority
      createdAt
    }
  }
`;

export const GET_BUSINESS_CARS_QUERY = `
  query($businessId: ID!) {
    carsByBusiness(businessId: $businessId) {
      id
      licensePlate
      make
      model
      year
      status
      mileage
      registrationDate
      insuranceExpiryDate
    }
  }
`;

export const GET_BUSINESS_CLIENTS_QUERY = `
  query($businessId: ID!) {
    clientsByBusiness(businessId: $businessId) {
      id
      firstName
      lastName
      email
      phone
      address
      city
    }
  }
`;

export const GET_BUSINESS_APPOINTMENTS_QUERY = `
  query($businessId: ID!) {
    appointments(businessId: $businessId) {
      id
      appointmentNumber
      title
      status
      type
      priority
      scheduledDate
      scheduledTime
      estimatedDuration
      actualStartTime
      actualEndTime
      clientId
      carId
      isUpcoming
      isOverdue
      reminderSent
      createdAt
    }
  }
`;

export const GET_BUSINESS_INSPECTIONS_QUERY = `
  query($businessId: ID!) {
    inspections(businessId: $businessId) {
      id
      type
      title
      findings
      passed
      inspectionDate
    }
  }
`;

export const GET_INSPECTION_STATISTICS_QUERY = `
  query($businessId: ID!) {
    inspectionStatistics(businessId: $businessId) {
      total
      passed
      failed
      requiresFollowUp
      averageFindingsPerInspection
    }
  }
`;

export const GET_BUSINESS_OFFERS_QUERY = `
  query($businessId: ID!) {
    offers(businessId: $businessId) {
      id
      title
      totalCost
      status
      createdAt
    }
  }
`;

export const GET_NOTIFICATIONS_QUERY = `
  query {
    notifications {
      id
      type
      subject
      content
      status
      createdAt
    }
  }
`;

export const GET_CUSTOMERS_QUERY = `
  query {
    customers(limit: 100) {
      id
      firstName
      lastName
      email
      phone
      type
      status
      createdAt
    }
  }
`;

export const GET_APPOINTMENT_AVAILABILITY_QUERY = `
  query GetAvailableSlots($date: String!) {
    availableTimeSlots(date: $date) {
      date
      slots
    }
  }
`;

export const GET_BUSINESS_STATS_QUERY = `
  query($businessId: ID!) {
    repairSessionStatistics(businessId: $businessId)
    jobCardStatistics(businessId: $businessId)
  }
`;

export const GET_GARAGE_STATISTICS_QUERY = `
  query($businessId: ID!) {
    repairSessionStatistics(businessId: $businessId)
  }
`;

export const GET_OFFER_STATISTICS_QUERY = `
  query($businessId: ID!) {
    jobCardStatistics(businessId: $businessId)
  }
`;

export const GET_NOTIFICATION_STATS_QUERY = `
  query {
    notifications {
      id
      type
      subject
      content
      status
      createdAt
    }
  }
`;
