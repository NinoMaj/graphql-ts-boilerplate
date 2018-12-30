import { Resolver } from "../../../types/graphql-utils";
import { logger } from "../../../utils/logger";

export default async (
  resolver: Resolver,
  parent: any,
  args: any,
  context: any,
  info: any
) => {
  // middleware
  // e.g. do logging here
  // console.log('args given:', args);
  logger([args, context]);

  // user is not logged in
  if (!context.session || !context.session.userId) {
    return null;
  }

  // check if user is admin, when admin feature is implemented
  // const user = User.findOne({ where: { id: context.session.id } });
  // if (!user || !user.admin) {
  //   throw Error('Not an admin.'); or return null
  // }

  const result = await resolver(parent, args, context, info);
  // afterware

  // console.log('result:', result);

  return result;
};
