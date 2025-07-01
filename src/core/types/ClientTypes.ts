export interface ClientTestSuite {
  name: string;
  description: string;
  tests: ClientTest[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

export interface ClientTest {
  name: string;
  description: string;
  tags: string[];
  execute: () => Promise<void>;
}

export interface ClientSelectors {
  [key: string]: string;
}

export interface ClientEndpoints {
  [key: string]: string;
}
