import * as Redis from "ioredis";
import fetch from "node-fetch";
import { Connection } from "typeorm";
import * as faker from 'faker';

import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { createTestConnection } from "../../../testUtils/createTestConnection";
import { User } from "../../../entity/User";

let userId: string;
let redis: Redis.Redis;

let conn: Connection;
faker.seed(Math.random() + Date.now());

beforeAll(async () => {
  conn = await createTestConnection();
  const user = await User.create({
    email: faker.internet.email(),
    password: faker.internet.password(),
  }).save();
  userId = user.id;
  redis = new Redis();
});

afterAll(async () => {
  await conn.close();
  await redis.quit();
});

test("make sure it confirms user and clear key in redis", async () => {
  const url = await createConfirmEmailLink(
    process.env.TEST_HOST as string,
    userId,
    redis
  );

  const response = await fetch(url);
  const text = await response.text();
  expect(text).toBe('ok');

  const user = await User.findOne({ where: { id: userId } }) as User;
  expect(user.confirmed).toBeTruthy();

  const chunks = url.split('/');
  const key = chunks[chunks.length - 1];
  const value = await redis.get(key);
  expect(value).toBeNull();
});
