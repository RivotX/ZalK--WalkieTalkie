// custom-types.d.ts
import 'express-session';
import { Users } from './path/to/your/users/model'; // Adjust the import path as necessary

declare module 'express-session' {
  interface SessionData {
    user?: Users; // Make it optional if it might not be present on every session
  }
}
