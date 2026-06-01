import { Schema, model, Document, Types } from 'mongoose';

export type ProjectRole = 'admin' | 'member' | 'viewer';

export const PROJECT_ROLES: ProjectRole[] = ['admin', 'member', 'viewer'];

export interface IProjectMember extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  role: ProjectRole;
  joinedAt: Date;
}

const projectMemberSchema = new Schema<IProjectMember>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: PROJECT_ROLES, default: 'member' },
    joinedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false },
);

projectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

projectMemberSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const ProjectMember = model<IProjectMember>('ProjectMember', projectMemberSchema);
