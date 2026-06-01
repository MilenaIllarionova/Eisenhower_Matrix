import { Schema, model, Document, Types } from 'mongoose';

export type Quadrant = 'urgent_important' | 'important_not_urgent' | 'urgent_not_important' | 'not_urgent_not_important';
export type TaskStatus = 'todo' | 'in_progress' | 'on_hold' | 'review' | 'done';

export const QUADRANTS: Quadrant[] = [
  'urgent_important',
  'important_not_urgent',
  'urgent_not_important',
  'not_urgent_not_important',
];

export const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'on_hold', 'review', 'done'];

export interface ITaskHistoryEntry {
  at: Date;
  by: Types.ObjectId;
  action: string;
  meta?: Record<string, unknown>;
}

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  quadrant: Quadrant;
  status: TaskStatus;
  deadline?: Date;
  assigneeId?: Types.ObjectId;
  projectId?: Types.ObjectId;
  teamId?: Types.ObjectId;
  createdBy: Types.ObjectId;
  history: ITaskHistoryEntry[];
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const historySchema = new Schema<ITaskHistoryEntry>(
  {
    at: { type: Date, default: () => new Date() },
    by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    meta: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, default: '', maxlength: 4000 },
    quadrant: { type: String, enum: QUADRANTS, required: true, index: true },
    status: { type: String, enum: STATUSES, default: 'todo', index: true },
    deadline: { type: Date },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    history: { type: [historySchema], default: [] },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

taskSchema.index({ teamId: 1, quadrant: 1 });
taskSchema.index({ assigneeId: 1, deadline: 1 });

taskSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Task = model<ITask>('Task', taskSchema);
