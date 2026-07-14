import prisma from "../prisma/client.js";
import logger from "../config/logger.js";

/**
 * Create route
 * @param {Object} data - Route data
 * @returns {Promise<Object>} - Created route
 */
const createRoute = async (data) => {
  const {
    name,
    transportId,
    startPoint,
    endPoint,
    distance = null,
    estimatedTime = null,
    schoolId,
    createdBy,
  } = data;

  const route = await prisma.route.create({
    data: {
      name,
      transportId,
      startPoint,
      endPoint,
      distance,
      estimatedTime,
      schoolId,
      createdBy,
    },
  });

  return route;
};

/**
 * Update route
 * @param {string} routeId - Route ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated route
 */
const updateRoute = async (routeId, data) => {
  const updateData = { ...data };
  delete updateData.routeId;

  const route = await prisma.route.update({
    where: { id: routeId },
    data: {
      ...updateData,
      updatedBy: data.updatedBy,
    },
  });

  return route;
};

/**
 * Get routes
 * @param {string} schoolId - School ID
 * @param {Object} filters - Filter options
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Routes with pagination
 */
const getRoutes = async (schoolId, filters = {}, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const where = {
    schoolId,
    deletedAt: null,
  };

  if (filters.transportId) {
    where.transportId = filters.transportId;
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  const [routes, total] = await Promise.all([
    prisma.route.findMany({
      where,
      include: {
        transport: true,
        stops: {
          where: { deletedAt: null },
          orderBy: { sequence: "asc" },
        },
      },
      orderBy: {
        name: "asc",
      },
      skip,
      take: limit,
    }),
    prisma.route.count({ where }),
  ]);

  return {
    routes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Add route stop
 * @param {Object} data - Stop data
 * @returns {Promise<Object>} - Created stop
 */
const addRouteStop = async (data) => {
  const {
    routeId,
    name,
    address = null,
    latitude = null,
    longitude = null,
    sequence,
    arrivalTime = null,
    schoolId,
    createdBy,
  } = data;

  const stop = await prisma.routeStop.create({
    data: {
      routeId,
      name,
      address,
      latitude,
      longitude,
      sequence,
      arrivalTime,
      schoolId,
      createdBy,
    },
  });

  return stop;
};

/**
 * Update route stop
 * @param {string} stopId - Stop ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated stop
 */
const updateRouteStop = async (stopId, data) => {
  const updateData = { ...data };
  delete updateData.stopId;

  const stop = await prisma.routeStop.update({
    where: { id: stopId },
    data: {
      ...updateData,
      updatedBy: data.updatedBy,
    },
  });

  return stop;
};

/**
 * Assign student to route
 * @param {string} routeId - Route ID
 * @param {string} studentId - Student user ID
 * @returns {Promise<void>}
 */
const assignStudentToRoute = async (routeId, studentId) => {
  // Update student profile with route
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    include: {
      studentProfile: true,
    },
  });

  if (!student || !student.studentProfile) {
    throw new Error("Student not found");
  }

  const route = await prisma.route.findUnique({
    where: { id: routeId },
    include: { transport: true },
  });

  if (!route) {
    throw new Error("Route not found");
  }

  // Update student profile with transport
  await prisma.studentProfile.update({
    where: { id: student.studentProfile.id },
    data: {
      transportId: route.transportId,
    },
  });
};

/**
 * Get route students
 * @param {string} routeId - Route ID
 * @returns {Promise<Array>} - List of students
 */
const getRouteStudents = async (routeId) => {
  const route = await prisma.route.findUnique({
    where: { id: routeId },
    include: {
      transport: {
        include: {
          students: {
            where: {
              deletedAt: null,
            },
            include: {
              studentProfile: {
                include: {
                  class: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!route) {
    throw new Error("Route not found");
  }

  return route.transport.students;
};

/**
 * Create vehicle maintenance record
 * @param {Object} data - Maintenance data
 * @returns {Promise<Object>} - Created maintenance record
 */
const createMaintenance = async (data) => {
  const {
    transportId,
    maintenanceType,
    description = null,
    cost = null,
    maintenanceDate,
    nextMaintenanceDate = null,
    serviceProvider = null,
    odometerReading = null,
    schoolId,
    createdBy,
  } = data;

  const maintenance = await prisma.vehicleMaintenance.create({
    data: {
      transportId,
      maintenanceType,
      description,
      cost,
      maintenanceDate: new Date(maintenanceDate),
      nextMaintenanceDate: nextMaintenanceDate ? new Date(nextMaintenanceDate) : null,
      serviceProvider,
      odometerReading,
      schoolId,
      createdBy,
    },
  });

  return maintenance;
};

/**
 * Get vehicle maintenance history
 * @param {string} transportId - Transport ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Maintenance records with pagination
 */
const getMaintenanceHistory = async (transportId, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [maintenance, total] = await Promise.all([
    prisma.vehicleMaintenance.findMany({
      where: {
        transportId,
        deletedAt: null,
      },
      orderBy: {
        maintenanceDate: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.vehicleMaintenance.count({
      where: {
        transportId,
        deletedAt: null,
      },
    }),
  ]);

  return {
    maintenance,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const transportEnhancedService = {
  createRoute,
  updateRoute,
  getRoutes,
  addRouteStop,
  updateRouteStop,
  assignStudentToRoute,
  getRouteStudents,
  createMaintenance,
  getMaintenanceHistory,
};

export default transportEnhancedService;

