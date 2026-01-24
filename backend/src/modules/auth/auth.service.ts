import bcrypt from 'bcryptjs';
import { User, UserRole } from '../../models/User';
import { generateToken, JWTPayload } from '../../utils/jwt';
import { AppError } from '../../middlewares/errorHandler';

interface RegisterInput {
  email: string;
  password: string;
  role: UserRole;
  name?: string;
  childEmail?: string;
}

export class AuthService {
  async register(input: RegisterInput) {
    const { email, password, role, name, childEmail } = input;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Handle Parent-Child linking
    let childrenIds: string[] = [];
    if (role === UserRole.PARENT) {
      if (!childEmail) {
        throw new AppError('Child email is required for Parent registration', 400);
      }
      const student = await User.findOne({ email: childEmail, role: UserRole.STUDENT });
      if (!student) {
        throw new AppError('Student with provided email not found', 404);
      }
      childrenIds = [student._id.toString()];
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      name,
      children: childrenIds.length > 0 ? childrenIds : undefined
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
