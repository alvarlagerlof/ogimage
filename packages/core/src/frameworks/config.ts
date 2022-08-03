import { Plugin } from "vite";

export interface FrameworkConfiguration {
  packages: string[];
  plugins: Plugin[];
}
