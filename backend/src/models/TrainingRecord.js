import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['SOP', 'Sales', 'BCO Operations', 'HR Policies', 'Customer Service'], required: true },
  modules: [{
    title: String,
    videoUrl: String,
    durationMinutes: Number
  }],
  quizzes: [{
    question: String,
    options: [String],
    correctAnswerIndex: Number
  }]
});

const progressSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingRecord.courses', required: true },
  modulesCompleted: [String],
  quizScores: [{
    quizIndex: Number,
    score: Number,
    passed: Boolean
  }],
  status: { type: String, enum: ['Assigned', 'In Progress', 'Completed'], default: 'Assigned' },
  certificateIssued: { type: Boolean, default: false },
  certificateDate: Date
});

const trainingRecordSchema = new mongoose.Schema({
  courses: [courseSchema],
  progress: [progressSchema]
}, { timestamps: true });

export default mongoose.model('TrainingRecord', trainingRecordSchema);
