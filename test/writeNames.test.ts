import fileMock from 'mock-fs';
import { promisify } from 'util';
import fs from 'fs';
import { writeProjectNames } from '../cli/utils/writeNames';

const readFile = promisify(fs.readFile);

const filePath = 'path/to/mock/dir';
const fileNestedPath = 'path/to/mock/dir/nested';

const files = [
  {
    name: 'package.json',
    content: `
    {
      "name": "{{names.snake}}",
      "description": "{{defaultDescription}}"
    }
    `,
  },
  {
    name: 'README.md',
    content: `
    # {{names.title}}
    > {{defaultDescription}}
    `,
  },
  {
    name: 'tslint.json',
    content: 'this-content-includes-tslint-rules',
  },
  {
    name: '.eslintrc',
    content: 'this-content-includes-eslint-rules',
  },
];

const nestedFiles = [
  {
    name: 'index.tsx',
    content: `
    direflowComponent.configure({
      name: '{{names.snake}}',
      useShadow: true,
    });
    direflowComponent.create(App);
    `,
  },
]

const fileMocks = files.reduce((acc: any, current: any) => {
  return {
    ...acc,
    [current.name]: current.content,
  };
}, {});

const nestedFileMocks = nestedFiles.reduce((acc: any, current: any) => {
  return {
    ...acc,
    [current.name]: current.content,
  };
}, {});

describe('Write names to file #1', () => {
  beforeAll(async () => {
    fileMock({
      [filePath]: fileMocks,
      [fileNestedPath]: nestedFileMocks,
    });

    await writeProjectNames({
      names: {
        title: 'Cool Component',
        pascal: 'CoolComponent',
        snake: 'cool-component',
      },
      projectDirectoryPath: filePath,
      description: 'This component is cool',
      linter: 'eslint',
      packageVersion: '0.0.0',
      type: 'direflow-component',
    });
  });

  afterAll(() => {
    fileMock.restore();
  });

  it('should change package.json correctly', async () => {
    const changedFile = await readFile(`${filePath}/package.json`);
    expect(changedFile.toString()).toBe(`
    {
      "name": "cool-component",
      "description": "This component is cool"
    }
    `);
  });

  it('should change index.tsx correctly', async () => {
    const changedFile = await readFile(`${fileNestedPath}/index.tsx`);
    expect(changedFile.toString()).toBe(`
    direflowComponent.configure({
      name: 'cool-component',
      useShadow: true,
    });
    direflowComponent.create(App);
    `);
  });

  it('should change README.md correctly', async () => {
    const changedFile = await readFile(`${filePath}/README.md`);
    expect(changedFile.toString()).toBe(`
    # Cool Component
    > This component is cool
    `);
  });
});

describe('Write names to file #1', () => {
  beforeAll(async () => {
    fileMock({
      [filePath]: fileMocks,
    });

    await writeProjectNames({
      names: {
        title: 'Cool Component',
        pascal: 'CoolComponent',
        snake: 'cool-component',
      },
      projectDirectoryPath: filePath,
      description: '',
      linter: 'eslint',
      packageVersion: '0.0.0',
      type: 'direflow-component',
    });
  });

  afterAll(() => {
    fileMock.restore();
  });

  it('should use fallback description in package.json', async () => {
    const changedFile = await readFile(`${filePath}/package.json`);
    expect(changedFile.toString()).toBe(`
    {
      "name": "cool-component",
      "description": "This project is created using Direflow"
    }
    `);
  });

  it('should use fallback description in README.md', async () => {
    const changedFile = await readFile(`${filePath}/README.md`);
    expect(changedFile.toString()).toBe(`
    # Cool Component
    > This project is created using Direflow
    `);
  });
});

describe('Remove tslint file', () => {
  beforeAll(async () => {
    fileMock({
      [filePath]: fileMocks,
    });

    await writeProjectNames({
      names: {
        title: 'Cool Component',
        pascal: 'CoolComponent',
        snake: 'cool-component',
      },
      projectDirectoryPath: filePath,
      description: '',
      linter: 'eslint',
      packageVersion: '0.0.0',
      type: 'direflow-component',
    });
  });

  afterAll(() => {
    fileMock.restore();
  });

  it('should remove tslint file given eslint option', async () => {
    const getFile = async () => {
      return await readFile(`${filePath}/tslint.json`);
    }

    expect(getFile()).rejects.toEqual('ENOENT, no such file or directory \'path/to/mock/dir/tslint.json\'');
  });
});

describe('Remove eslint file', () => {
  beforeAll(async () => {
    fileMock({
      [filePath]: fileMocks,
    });

    await writeProjectNames({
      names: {
        title: 'Cool Component',
        pascal: 'CoolComponent',
        snake: 'cool-component',
      },
      projectDirectoryPath: filePath,
      description: '',
      linter: 'tslint',
      packageVersion: '0.0.0',
      type: 'direflow-component',
    });
  });

  afterAll(() => {
    fileMock.restore();
  });

  it('should remove eslint file given tslint option', async () => {
    const getFile = async () => {
      return await readFile(`${filePath}/.eslintrc`);
    }

    expect(getFile()).rejects.toEqual('ENOENT, no such file or directory \'path/to/mock/dir/.eslintrc\'');
  });
});
