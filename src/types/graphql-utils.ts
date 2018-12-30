import { Redis } from "ioredis";

export interface ISession extends Express.Session {
  userId?: string;
}

export interface IContext {
  redis: Redis;
  url: string;
  session: ISession;
  req: Express.Request;
}

export type Resolver = (
  parent: any,
  args: any,
  context: IContext,
  info: any,
) => any;

export type GraphQLMiddlewareFunc = (
  resolver: Resolver,
  parent: any,
  args: any,
  context: IContext,
  info: any,
) => any;

export interface IResolverMap {
  [key: string]: {
    [key: string]: Resolver;
  };
}
