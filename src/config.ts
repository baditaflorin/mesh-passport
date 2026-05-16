import { createMeshConfig } from "@baditaflorin/mesh-common";

export const config = createMeshConfig({
  appName: "mesh-passport",
  description: "Collect a stamp for every person in the room — completionist passport book",
  accentHex: "#fbbf24",
  version: __APP_VERSION__,
  commit: __GIT_COMMIT__,
});
