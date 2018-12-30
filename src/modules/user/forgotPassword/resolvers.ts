import * as yup from "yup";
import * as bcrypt from "bcryptjs";

import { IResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import { forgotPasswordLockAccount } from "../../../utils/forgotPasswordLockAccount";
import { createForgotPasswordLink } from "../../../utils/createForgotPasswordLink";
import { userNotFoundError, expiredKeyError } from "./errorMessages";
import { forgotPasswordPrefix } from "../../../constants";
import { registerPasswordValidation } from "../../../yupSchemas";
import { formatYupError } from "../../../utils/formatYupError";

const schema = yup.object().shape({
  newPassword: registerPasswordValidation,
});

export const resolvers: IResolverMap = {
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      __,
      { email }: any,
      { redis }) => {
      const user = await User.findOne({ where: { email }});
      if (!user) {
        return [{
          path: "email",
          message: userNotFoundError,
        }];
      }

      await forgotPasswordLockAccount(user.id, redis);
      // TODO: add front end url instead of empty string
      await createForgotPasswordLink('', user.id, redis);
      // TODO: send email with url

      return true;

    },
    forgotPasswordChange: async (_, { newPassword, key }: any, { redis }) => {
      const redisKey = `${forgotPasswordPrefix}${key}`;

      const userId = await redis.get(redisKey);
      if (!userId) {
        return [{
          path: "key",
          message: expiredKeyError,
        }];
      }

      try {
        await schema.validate({ newPassword }, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatePromise = User.update({ id: userId }, {
        forgotPasswordLocked: false,
        password: hashedPassword
      })

      const deleteKeyPromise = redis.del(redisKey);

      await Promise.all([updatePromise, deleteKeyPromise]);
      
      return null;
    }
  }
};
