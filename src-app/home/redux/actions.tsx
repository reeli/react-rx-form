import { createRequestAction } from "../../../src-modules/request";

export const fetchHomeData = createRequestAction("@@home/fetchHomeData", () => ({
  method: "GET",
  url: "/posts",
}));
