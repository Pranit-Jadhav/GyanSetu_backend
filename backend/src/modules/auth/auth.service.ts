import bcrypt from 'bcryptjs';
import { User, UserRole } from '../../models/User';
import { generateToken, JWTPayload } from '../../utils/jwt';
import { AppError } from '../../middlewares/errorHandler';

interface RegisterInput {
  email: string;
  password: string;
  role: UserRole;
  name?: string;
}

export class AuthService {
  async register(input: RegisterInput) {
    const { email, password, role, name } = input;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      name
    });

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email
    });

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name
      }
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email
    });

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name
      }
    };
  }

  async getUserById(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };
  }
}
