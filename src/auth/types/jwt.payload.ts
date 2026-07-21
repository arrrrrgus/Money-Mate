import { Role } from '@/database/generated/prisma/enums';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  username: string;
  role: Role;
};
