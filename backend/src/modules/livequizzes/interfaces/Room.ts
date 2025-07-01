export interface Room {
  code: string;
  name: string;
  teacherId: string;
  createdAt: Date;
  status: 'active' | 'ended';
}
