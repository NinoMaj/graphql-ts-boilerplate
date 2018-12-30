import { Connection } from "typeorm";
import * as faker from 'faker';

import { createTestConnection } from "../../../testUtils/createTestConnection";
import { User } from "../../../entity/User";
import { TestClient } from "../../../utils/TestClient";

let conn: Connection;
faker.seed(Math.random() + Date.now());
const email = faker.internet.email();
const password = faker.internet.password();

let userId: string;
beforeAll(async () => {
  conn = await createTestConnection();
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
});

afterAll(async () => {
  conn.close();
});

describe("logout", () => {
  test("multiple session", async () => {
    // device 1
    const session1 = new TestClient(process.env.TEST_HOST as string);
    // device 2
    const session2 = new TestClient(process.env.TEST_HOST as string);
    
    await session1.login(email, password);
    await session2.login(email, password);
    expect(await session1.me()).toEqual(await session2.me());

    // logout on device 1 should logout from all devices
    await session1.logout();
    expect(await session1.me()).toEqual(await session2.me());
  });

  test("single session", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    await client.login(email, password);

    const response = await client.me();

    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });

    await client.logout();

    const response2 = await client.me();

    expect(response2.data.me).toBeNull();
  });
});