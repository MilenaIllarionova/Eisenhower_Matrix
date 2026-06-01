import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType =
  | 'task_assigned'
  | 'task_quadrant_changed'
  | 'task_status_changed'
  | 'task_deadline_soon'
  | 'task_review_requested'
  | 'task_completed'
  | 'team_invited'
  | 'team_joined'
  | 'project_invited';

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  message: string;
  isRead: boolean;
  taskId?: Types.ObjectId;
  teamId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    message: { type: String, required: true, maxlength: 500 },
    isRead: { type: Boolean, default: false, index: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
  },
  { timestamps: true },
);

notificationSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Notification = model<INotification>('Notification', notificationSchema);
