// Dashboard-specific GraphQL queries - Verified with Backend

export const GET_ME_QUERY = `
  query {
    me {
      id
      email
      type
      name
      phone
      city
      state
      businessHours
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($input: UpdateUserInput!) {
    updateProfile(input: $input) {
      id
      email
      type
      name
      phone
      businessHours
    }
  }
`;

/**
 * CREATE CAR MUTATION
 * Creates a new car and adds it to the business inventory
 */
export const CREATE_CAR_MUTATION = `
  mutation CreateCar($input: CreateCarInput!) {
    createCar(input: $input) {
      id
      licensePlate
      make
      model
      year
      vin
      color
      status
      mileage
      registrationDate
      insuranceExpiryDate
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
      city
      state
    }
  }
`;

/**
 * GET EMPLOYEES/TECHNICIANS QUERY
 * Fetches all employees (technicians) for the current business
 * 
 * Returns:
 * - id: Employee/technician ID
 * - email: Employee email
 * - name: Employee name
 * - type: User type (EMPLOYEE, TECHNICIAN, etc)
 * - businessId: Business this employee belongs to
 * - isActive: Is employee active
 * 
 * Use: Get dropdown list of available technicians for job assignment
 */
export const GET_EMPLOYEES_QUERY = `
  query GetEmployees {
    users {
      id
      email
      name
      type
      businessId
      isActive
    }
  }
`;

/**
 * GET EMPLOYEES BY BUSINESS QUERY
 * Fetches employees filtered by business ID
 * 
 * Returns same fields as GET_EMPLOYEES_QUERY but filtered for specific business
 */
export const GET_EMPLOYEES_BY_BUSINESS = `
  query GetEmployeesByBusiness($businessId: ID!) {
    users {
      id
      email
      name
      type
      businessId
      isActive
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

export const GET_CLIENTS_QUERY = `
  query {
    clients {
      id
      firstName
      lastName
      email
      phone
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

/**
 * CREATE REPAIR SESSION MUTATION
 * Creates a new repair session for a car
 */
export const CREATE_REPAIR_SESSION_MUTATION = `
  mutation($input: CreateRepairSessionInput!) {
    createRepairSession(input: $input) {
      id
      sessionNumber
      customerRequest
      problemDescription
      status
      priority
      carId
      businessId
      createdAt
      displayName
    }
  }
`;

/**
 * GET ALL REPAIR SESSIONS QUERY
 * Fetches all repair sessions for a business with pagination
 */
export const GET_ALL_REPAIR_SESSIONS_QUERY = `
  query GetAllRepairSessions($businessId: ID!, $limit: Int, $offset: Int) {
    repairSessions(businessId: $businessId, limit: $limit, offset: $offset) {
      id
      sessionNumber
      customerRequest
      problemDescription
      status
      priority
      carId
      businessId
      createdAt
      updatedAt
      displayName
      isCompleted
      daysInProgress
      estimatedCost
      actualCost
      expectedDeliveryDate
      actualDeliveryDate
    }
  }
`;

/**
 * GET REPAIR SESSION DETAIL QUERY
 * Fetches a single repair session with full details
 */
export const GET_REPAIR_SESSION_DETAIL_QUERY = `
  query GetRepairSessionDetail($id: ID!) {
    repairSession(id: $id) {
      id
      sessionNumber
      customerRequest
      problemDescription
      status
      priority
      carId
      businessId
      createdAt
      updatedAt
      displayName
      isCompleted
      daysInProgress
      estimatedCost
      actualCost
      customerNotes
      internalNotes
      assignedTechnicianId
      createdById
      isActive
      expectedDeliveryDate
      actualDeliveryDate
    }
  }
`;

/**
 * UPDATE REPAIR SESSION STATUS MUTATION
 * Updates the status and notes of a repair session
 */
export const UPDATE_REPAIR_SESSION_STATUS_MUTATION = `
  mutation UpdateRepairSessionStatus($id: ID!, $input: UpdateRepairSessionStatusInput!) {
    updateRepairSessionStatus(id: $id, input: $input) {
      id
      sessionNumber
      status
      customerRequest
      displayName
    }
  }
`;

/**
 * GET CLIENT REPAIR SESSIONS QUERY
 * Fetches all repair sessions for a specific client
 * Works by fetching all cars for the client, then getting repair sessions
 */
export const GET_CLIENT_REPAIR_SESSIONS_QUERY_NEW = `
  query GetClientRepairSessions($clientId: ID!) {
    carsByClient(clientId: $clientId) {
      id
      licensePlate
      make
      model
      year
    }
    repairSessions(limit: 100) {
      id
      sessionNumber
      customerRequest
      problemDescription
      status
      priority
      carId
      createdAt
      updatedAt
      displayName
      isCompleted
      daysInProgress
      estimatedCost
      actualCost
      expectedDeliveryDate
      actualDeliveryDate
    }
  }
`;

/**
 * GET REPAIR SESSIONS WITH CAR AND CLIENT INFO
 * Fetches repair sessions with related car details
 * Note: We'll fetch cars separately and join on frontend to get client info
 */
export const GET_REPAIR_SESSIONS_WITH_DETAILS_QUERY = `
  query GetRepairSessionsWithDetails {
    repairSessions(limit: 100) {
      id
      sessionNumber
      customerRequest
      problemDescription
      status
      priority
      carId
      businessId
      createdAt
      updatedAt
      displayName
      isCompleted
      daysInProgress
      estimatedCost
      actualCost
      expectedDeliveryDate
      actualDeliveryDate
    }
    cars {
      id
      licensePlate
      make
      model
      year
      clientId
    }
    clients {
      id
      firstName
      lastName
      email
      phone
    }
  }
`;

/**
 * GET CARS IN GARAGE QUERY
 * Fetches cars currently in repair/garage with active repair sessions
 */
export const GET_CARS_IN_GARAGE_QUERY = `
  query GetCarsInGarage($businessId: ID!) {
    carsByBusiness(businessId: $businessId) {
      id
      licensePlate
      make
      model
      year
      status
      clientId
      displayName
    }
  }
`;

/**
 * GET REPAIR SESSION COMPLETE DETAILS QUERY
 * Fetches repair session with ALL related entities:
 * - Test Drives
 * - Job Card Reports
 * - Inspections
 * - Customer Requests
 * - Cost estimates and delivery dates
 */
export const GET_REPAIR_SESSION_COMPLETE_QUERY = `
  query GetRepairSessionComplete($id: ID!) {
    repairSession(id: $id) {
      id
      sessionNumber
      customerRequest
      problemDescription
      status
      priority
      carId
      businessId
      createdAt
      updatedAt
      displayName
      isCompleted
      daysInProgress
      estimatedCost
      actualCost
      customerNotes
      internalNotes
      assignedTechnicianId
      createdById
      isActive
      expectedDeliveryDate
      actualDeliveryDate
    }
    testDrives(repairSessionId: $id) {
      id
      sessionId
      driverId
      dateTime
      mileageStart
      mileageEnd
      distance
      observations
      status
      issues
      performanceRating
      notes
      createdAt
      updatedAt
    }
    jobCardReports(repairSessionId: $id) {
      id
      sessionId
      reportNumber
      workDescription
      partsUsed
      laborHours
      completionStatus
      assignedTechnicianId
      startDate
      endDate
      notes
      createdAt
      updatedAt
    }
    inspections(repairSessionId: $id) {
      id
      sessionId
      type
      title
      findings
      passed
      inspectionDate
      inspectorId
      status
      recommendations
      createdAt
      updatedAt
    }
    customerRequests(repairSessionId: $id) {
      id
      sessionId
      requestType
      description
      priority
      status
      requestedBy
      requestDate
      completedDate
      notes
      createdAt
      updatedAt
    }
  }
`;

/**
 * CREATE JOB CARD MUTATION
 * Creates a new job card for a repair session
 * Uses existing backend mutation: createJobCard
 * Note: businessId is required as a separate parameter (not in input object)
 * 
 * Input fields:
 * - title (required)
 * - description (optional)
 * - plannedStartDate (required)
 * - plannedEndDate (required)
 * - estimatedHours (required)
 * - workInstructions (optional)
 * - assignedTechnicianId (required - but made optional in form)
 * - repairSessionId (required)
 */
export const CREATE_JOB_CARD_MUTATION = `
  mutation CreateJobCard($input: CreateJobCardInput!, $businessId: ID!) {
    createJobCard(input: $input, businessId: $businessId) {
      id
      jobNumber
      title
      description
      status
      plannedStartDate
      plannedEndDate
      actualStartDate
      actualEndDate
      estimatedHours
      actualHours
      workInstructions
      completionNotes
      qualityCheckNotes
      qualityApproved
      qualityApprovedAt
      qualityApprovedById
      assignedTechnicianId
      createdById
      qualityApprovedById
      repairSessionId
      createdAt
      updatedAt
      progress
      isOverdue
      daysRemaining
    }
  }
`;

/**
 * CREATE INSPECTION MUTATION
 * Creates a new inspection record for a repair session
 * Uses existing backend mutation: createInspection
 * Note: businessId is required as a separate parameter (not in input object)
 */
export const CREATE_INSPECTION_MUTATION = `
  mutation CreateInspection($input: CreateInspectionInput!, $businessId: ID!) {
    createInspection(input: $input, businessId: $businessId) {
      id
      type
      title
      findings
      recommendations
      mileageAtInspection
      technicalNotes
      passed
      requiresFollowUp
      inspectionDate
      repairSessionId
      inspectorId
      summary
      createdAt
      updatedAt
    }
  }
`;

/**
 * ADD INSPECTION MEDIA MUTATION
 * Adds photos/documents to an inspection
 */
export const ADD_INSPECTION_MEDIA_MUTATION = `
  mutation AddInspectionMedia($inspectionId: ID!, $businessId: ID!, $base64File: String!, $filename: String!, $mimetype: String!) {
    addInspectionMedia(inspectionId: $inspectionId, businessId: $businessId, base64File: $base64File, filename: $filename, mimetype: $mimetype) {
      id
      inspectionId
      filename
      mimetype
      url
      createdAt
    }
  }
`;

/**
 * CREATE JOB TASK MUTATION
 * Creates a task within a job card
 */
export const CREATE_JOB_TASK_MUTATION = `
  mutation CreateJobTask($input: CreateJobTaskInput!) {
    createJobTask(input: $input) {
      id
      title
      description
      division
      status
      orderIndex
      estimatedHours
      actualHours
      startedAt
      completedAt
      workNotes
      issues
      requiresApproval
      isApproved
      jobCardId
      assignedTechnicianId
      approvedById
      duration
      isOverdue
      createdAt
      updatedAt
    }
  }
`;

/**
 * UPDATE JOB TASK STATUS MUTATION
 * Updates task status and notes
 */
export const UPDATE_JOB_TASK_STATUS_MUTATION = `
  mutation UpdateJobTaskStatus($taskId: ID!, $businessId: ID!, $input: UpdateJobTaskStatusInput!) {
    updateJobTaskStatus(taskId: $taskId, businessId: $businessId, input: $input) {
      id
      title
      status
      workNotes
      completedAt
      isApproved
      createdAt
      updatedAt
    }
  }
`;

/**
 * CREATE PART MUTATION
 * Creates a part associated with a job task
 */
export const CREATE_PART_MUTATION = `
  mutation CreatePart($input: CreatePartInput!) {
    createPart(input: $input) {
      id
      name
      partNumber
      description
      brand
      quantity
      unitPrice
      totalPrice
      supplier
      supplierPartNumber
      status
      orderedDate
      expectedDeliveryDate
      actualDeliveryDate
      installedDate
      warrantyPeriod
      warrantyExpiryDate
      notes
      jobTaskId
      isDelayed
      deliveryStatus
      createdAt
      updatedAt
    }
  }
`;

/**
 * UPDATE PART STATUS MUTATION
 * Updates part delivery and installation status
 */
export const UPDATE_PART_STATUS_MUTATION = `
  mutation UpdatePartStatus($partId: ID!, $businessId: ID!, $input: UpdatePartStatusInput!) {
    updatePartStatus(partId: $partId, businessId: $businessId, input: $input) {
      id
      name
      status
      actualDeliveryDate
      installedDate
      deliveryStatus
      isDelayed
      createdAt
      updatedAt
    }
  }
`;

/**
 * UPDATE JOB CARD MUTATION
 * Updates an existing job card with completion details, quality notes, and approvals
 *
 * Valid Input Fields (all optional for update):
 * - title: String - Update job title
 * - description: String - Update job description
 * - plannedStartDate: DateTime - Change planned start (ISO 8601 format)
 * - plannedEndDate: DateTime - Change planned end (ISO 8601 format)
 * - estimatedHours: Float - Adjust estimated hours
 * - workInstructions: String - Update work instructions
 * - completionNotes: String - NOW AVAILABLE - Add completion notes when job is done
 * - qualityCheckNotes: String - NOW AVAILABLE - Add quality check notes
 * - qualityApproved: Boolean - NOW AVAILABLE - Mark quality as approved/rejected
 *
 * Usage:
 * Use this mutation to:
 * 1. Update job card details during execution
 * 2. Add completion notes when work is finished
 * 3. Mark quality approval status
 * 4. Record any changes to planned dates/hours
 */
export const UPDATE_JOB_CARD_MUTATION = `
  mutation UpdateJobCard($jobCardId: ID!, $businessId: ID!, $input: UpdateJobCardInput!) {
    updateJobCard(jobCardId: $jobCardId, businessId: $businessId, input: $input) {
      id
      jobNumber
      title
      description
      status
      plannedStartDate
      plannedEndDate
      actualStartDate
      actualEndDate
      estimatedHours
      actualHours
      workInstructions
      completionNotes
      qualityCheckNotes
      qualityApproved
      qualityApprovedAt
      repairSessionId
      assignedTechnicianId
      createdById
      qualityApprovedById
      createdAt
      updatedAt
      progress
      isOverdue
      daysRemaining
    }
  }
`;

/**
 * UPDATE INSPECTION MUTATION
 * Updates an existing inspection with revised findings, recommendations, and results
 *
 * Valid Input Fields (all optional for update):
 * - findings: String - Update inspection findings
 * - recommendations: String - Update recommendations for repairs
 * - passed: Boolean - Update pass/fail status
 * - mileageAtInspection: Float - Update odometer reading
 * - technicalNotes: String - Update technical observations
 *
 * Usage:
 * Use this mutation to:
 * 1. Correct or add to inspection findings
 * 2. Update recommendations based on new information
 * 3. Change pass/fail status if needed
 * 4. Add technical notes or observations
 */
export const UPDATE_INSPECTION_MUTATION = `
  mutation UpdateInspection($inspectionId: ID!, $businessId: ID!, $input: UpdateInspectionInput!) {
    updateInspection(inspectionId: $inspectionId, businessId: $businessId, input: $input) {
      id
      type
      title
      findings
      recommendations
      mileageAtInspection
      technicalNotes
      passed
      requiresFollowUp
      inspectionDate
      repairSessionId
      inspectorId
      createdAt
      updatedAt
      summary
    }
  }
`;
