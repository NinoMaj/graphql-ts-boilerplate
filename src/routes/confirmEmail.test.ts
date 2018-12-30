import fetch from "node-fetch";
  
test("sends invalid back if bad id sent", async () => {
  const badId = '123';
  const response = await fetch(`${process.env.TEST_HOST}/confirm/${badId}`);
  const text = await response.text();
  expect(text).toBe('invalid');
});