//id, userId , name , email , jwtpurpose , issuer , audience ,
import { JwtTokenPurpose } from '../enums/jwt-token-purpose';
export type JwtTokenPayload = {
  id: string;
  userId: number;
  name: string;
  email: string;
  purpose: JwtTokenPurpose;
  issuer: string;
  audience: string;
};
