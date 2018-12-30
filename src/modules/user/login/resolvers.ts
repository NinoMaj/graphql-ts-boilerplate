import * as bcrypt from "bcryptjs";

import { IResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import { invalidLogin, confirmEmailError, forgotPasswordLockedError } from "./errorMessages";
import { userSessionIdPrefix } from "../../../constants";

const errorReponse = [{
  path: "email",
  message: invalidLogin,
}];

export const resolvers: IResolverMap = {
  Mutation: {
    login: async (
      _: any,
      { email, password }: any, // GQL.ILoginOnMutationArguments,
      { session, redis, req }
      ) => { 
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return errorReponse;
      }

      if (!user.confirmed) {
        return [{
          path: "email",
          message: confirmEmailError,
        }]
      }

      if (user.forgotPasswordLocked) {
        return [{
          path: "email",
          message: forgotPasswordLockedError,
        }]
      }

      const valid = await bcrypt.compare(password, user.password as string);
      
      
      if (!valid) {
        return errorReponse;
      }

      // login successful
      session.userId = user.id;
      if (req.sessionID) {
        await redis.lpush(`${userSessionIdPrefix}${user.id}`, req.sessionID)
      }

      return null;
    }
  }
};
