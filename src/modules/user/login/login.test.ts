import { Connection } from "typeorm";
import * as faker from 'faker';

import { User } from "../../../entity/User";
import { createTestConnection } from "../../../testUtils/createTestConnection";
import { invalidLogin, confirmEmailError } from "./errorMessages";
import { TestClient } from "../../../utils/TestClient";

faker.seed(Math.random() + Date.now());
const email = faker.internet.email();
const password = faker.internet.password();

let conn: Connection;

beforeAll(async () => {
  conn = await createTestConnection();
});

afterAll(async () => {
  await conn.close();
});

const loginExpectError = async (e: string, p: string, errMsg: string, client: TestClient) => {
  const response = await client.login(e, p);

  expect(response.data).toEqual({
    login: [{
      path: "email",
      message: errMsg,
    }]
  });
}

describe("login", () => {
  test("email not found send back error", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    const invalidEmail = faker.internet.email();
    await loginExpectError(invalidEmail, password, invalidLogin, client);
  });

  test("email not confirmed", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.register(email, password)

    await loginExpectError(email, password, confirmEmailError, client);

    await User.update({ email }, { confirmed: true });

    const invalidPassword = faker.internet.password();
    await loginExpectError(email, invalidPassword, invalidLogin, client);

    const response = await client.login(email, password);

    expect(response.data).toEqual({ login: null });
  });
});
