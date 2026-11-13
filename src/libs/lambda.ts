import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import { config } from 'dotenv';

config();

export const middyfy = (handler: any) => {
  return middy(handler).use(middyJsonBodyParser())
}
