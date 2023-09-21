import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_API_KEY'] = '123456'
  process.env['INPUT_FILES'] = '- outputs/*'
  process.env['INPUT_API_URL'] =
    'http://127.0.0.1:8080/api/github/actions/upload-artifacts'
  process.env['GITHUB_REPOSITORY'] = 'hatchways/hatchways-action'
  process.env['GITHUB_SERVER_URL'] = 'https://github.com'
  process.env['GITHUB_RUN_ID'] = '1'

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})
