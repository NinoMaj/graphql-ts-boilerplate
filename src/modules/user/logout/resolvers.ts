import { IResolverMap } from "../../../types/graphql-utils";
import { removeAllUserSessions } from "../../../utils/removeAllUserSessions";

export const resolvers: IResolverMap = {
  Mutation: {
    logout: async (_, __, { session, redis }) => {
      const { userId } = session;
      if (userId) {
        removeAllUserSessions(userId, redis);
        session.destroy(err => {
          if (err) {
            console.log(err);
          }
        });

        return true;
      }

      return false;
    },
  }
};
