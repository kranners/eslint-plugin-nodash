import { readFileSync } from "fs";
import { join } from "path";

const { version } = JSON.parse(
  readFileSync(join(__dirname, "package.json"))
);

const plugin = {
  meta: {
    name: "eslint-plugin-nodash",
    version,
  },
  rules: {},
};

export default plugin;

