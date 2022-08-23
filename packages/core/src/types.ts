import * as vite from "vite";

export interface UserConfig {
  framework: FrameworkOptions;
  filePathPattern: string;
  projectPath: string;
  wrapper?: WrapperConfig;
  shooter: Shooter;
  vite?: vite.UserConfig;
}

export interface MetaData {
  meta: {
    title?: string;
    description?: string;
    author?: string;
    url?: string;
    og?: {
      title?: string;
      description?: string;
      author?: string;
      url?: string;
    };
  };
  layout: string;
  data?: string;
}

export interface FrameworkConfiguration {
  packages: string[];
  defaultImports: boolean;
  plugins: vite.Plugin[];
}

export type FrameworkOptions = {
  type: "react" | "preact" | "solid" | "svelte" | "vue";
};

export interface WrapperConfig {
  path: string;
  componentName: string;
}
export interface Shooter {
  shoot(url: string): Promise<string[]>;
}

export type Framework = "preact" | "react" | "solid" | "svelte" | "vue";

export interface Config {
  buildDir: string;
  layoutsDir: string;
  domain: string;
}
