
// Module
export { CoreAuthModule } from './auth.module';

// Service
export { AuthService } from './auth.service';

// Guard
export { AuthGuard } from './auth.guard';

// Interfaces & Enums
export {
    AuthClient
} from './auth.interfaces';
export type {
    JwtPayload,
    SignTokenOptions,
    TokenResult,
    ClientJwtConfig
} from './auth.interfaces';

// Decorators
export { Public, PUBLIC_KEY } from './decorators/public.decorator';
export { AllowClients, ALLOW_CLIENTS_KEY } from './decorators/roles.decorator';
export { CurrentUser } from './decorators/current-user.decorator';
