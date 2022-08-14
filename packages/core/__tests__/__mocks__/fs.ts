import path from "path";

export interface NodeFs {
  __setMockFiles: (newMockFiles) => void;
  readdirSync: any;
}

const fs = jest.createMockFromModule<NodeFs>("fs");

let mockFiles: unknown = Object.create(null);

fs.__setMockFiles = function __setMockFiles(newMockFiles) {
  mockFiles = Object.create(null);
  for (const file in newMockFiles) {
    const dir = path.dirname(file);

    if (!mockFiles[dir]) {
      mockFiles[dir] = [];
    }
    mockFiles[dir].push(path.basename(file));
  }
};

fs.readdirSync = function readdirSync(directoryPath) {
  return mockFiles[directoryPath] || [];
};

module.exports = fs;
