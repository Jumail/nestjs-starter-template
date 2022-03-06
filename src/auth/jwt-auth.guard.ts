import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    console.log("There is an error");
    console.log(info)
    console.log(err)
    if (err || !user) {
        if (info.name === "TokenExpiredError") {
            return info;
        }
        
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
