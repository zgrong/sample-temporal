// Add Activity Definitions here
import { exec } from 'child_process';

// @@@SNIPSTART typescript-activity-use-injected-logger
export async function greet(name: string): Promise<string> {
  const pp = exec('echo "The \\$HOME variable is $HOME"');
  console.log('after exec', process.pid, pp.pid);

  return `Hello, ${name}!`;
}
// @@@SNIPEND

export async function reverse(src: string): Promise<string> {
  return src.split('').reverse().join('');
}

export async function copyObj(src: object): Promise<object> {
  return { ...src, newKey: 'newValue' };
}
