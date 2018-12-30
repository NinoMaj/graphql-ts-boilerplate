import { Request, Response } from "express";

import { redis } from "../redis";
import { User } from "../entity/User";

export const confirmEmail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = await redis.get(id) as string;
  if (userId) {
    await User.update({ id: userId }, { confirmed: true });
    redis.del(id);
    res.send('ok'); // TODO: redirect to homepage when client app is done
  } else {
    res.send('invalid');
  }
}