import { Schema, model, Document, Types } from 'mongoose';

export type TeamRole = 'admin' | 'member' | 'viewer';

export const TEAM_ROLES: TeamRole[] = ['admin', 'member', 'viewer'];

export interface ITeamMember extends Document {
  _id: Types.ObjectId;
  teamId: Types.ObjectId;
  userId: Types.ObjectId;
  role: TeamRole;
  joinedAt: Date;
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: TEAM_ROLES, default: 'member' },
    joinedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false },
);

teamMemberSchema.index({ teamId: 1, userId: 1 }, { unique: true });

teamMemberSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const TeamMember = model<ITeamMember>('TeamMember', teamMemberSchema);
