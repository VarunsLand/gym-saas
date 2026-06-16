const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwtUtils');
const ApiError = require('../utils/ApiError');

class AuthService {
  /**
   * Registers a new business (Tenant) and its first admin User.
   * Uses an interactive transaction to ensure both are created simultaneously.
   */
  static async signup(payload) {
    const { business_name, industry, first_name, last_name, email, password } = payload;

    // In a multi-tenant system where email is scoped to tenant_id, we should ensure
    // the email isn't already used across the system if we want a global login page.
    const existingUser = await prisma.user.findFirst({
      where: { email, deleted_at: null }
    });

    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    const hashedPassword = await hashPassword(password);

    // Execute within a Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the tenant
      const tenant = await tx.tenant.create({
        data: {
          name: business_name,
          industry: industry
        }
      });

      // 2. Create the admin user for this tenant
      const user = await tx.user.create({
        data: {
          tenant_id: tenant.id,
          first_name,
          last_name,
          email,
          password_hash: hashedPassword,
          role: 'ADMIN' // Initial user is always ADMIN
        }
      });

      return { tenant, user };
    });

    // 3. Generate JWT Token
    const token = generateToken({
      user_id: result.user.id,
      tenant_id: result.tenant.id,
      role: result.user.role
    });

    // Strip sensitive data before returning
    delete result.user.password_hash;

    return {
      token,
      user: result.user,
      tenant: result.tenant
    };
  }

  /**
   * Authenticates a user and returns a JWT along with user and tenant details.
   */
  static async login(payload) {
    const { email, password } = payload;

    // Fetch user and ensure their associated tenant is ACTIVE
    const user = await prisma.user.findFirst({
      where: { 
        email,
        tenant: { status: 'ACTIVE' },
        deleted_at: null 
      },
      include: {
        tenant: true
      }
    });

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Fire-and-forget update for last login timestamp
    void prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    }).catch(err => console.error('Failed to update last_login_at', err));

    const token = generateToken({
      user_id: user.id,
      tenant_id: user.tenant_id,
      role: user.role
    });

    const tenant = user.tenant;
    delete user.password_hash;
    delete user.tenant; // Flatten response

    return {
      token,
      user,
      tenant
    };
  }

  /**
   * Fetches the current logged-in user profile, enforcing tenant boundary.
   */
  static async getCurrentUser(userId, tenantId) {
    const user = await prisma.user.findFirst({
      where: { 
        id: userId,
        tenant_id: tenantId, // Strict boundary check
        deleted_at: null
      },
      include: {
        tenant: true
      }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.tenant.status !== 'ACTIVE') {
      throw new ApiError(403, 'Tenant account is no longer active');
    }

    delete user.password_hash;
    return user;
  }
}

module.exports = AuthService;
