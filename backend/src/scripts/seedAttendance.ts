import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Attendance, AttendanceStatus } from '../models/Attendance';
import { User } from '../models/User';
import { Class } from '../models/Class';

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  // Find a student
  const student = await User.findOne({ role: 'STUDENT' });
  if (!student) {
      console.error('No student found');
      process.exit(1);
  }
  console.log(`Seeding for student: ${student.email} (${student._id})`);

  // Find a class
  const classDoc = await Class.findOne();
  if (!classDoc) {
      console.error('No class found');
      process.exit(1);
  }

  // Clear existing
  await Attendance.deleteMany({ studentId: student._id });

  // Create records for last 7 days
  const records = [];
  const now = new Date();
  
  for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const status = i % 3 === 0 ? AttendanceStatus.ABSENT : i % 3 === 1 ? AttendanceStatus.INCOMPLETE : AttendanceStatus.PRESENT;
      const duration = status === AttendanceStatus.PRESENT ? 45 : status === AttendanceStatus.INCOMPLETE ? 15 : 0;
      
      records.push({
          studentId: student._id,
          classId: classDoc._id,
          sessionId: `seed_sess_${i}`,
          date: date,
          joinTime: new Date(date.setHours(10, 0, 0)),
          leaveTime: new Date(date.setHours(10, duration, 0)),
          durationMinutes: duration,
          status: status,
          warnings: i
      });
  }

  await Attendance.insertMany(records);
  console.log(`Seeded ${records.length} records`);
  process.exit(0);
};

seed().catch(console.error);
