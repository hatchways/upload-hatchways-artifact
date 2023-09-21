import * as core from '@actions/core'
import * as github from '@actions/github'
import * as glob from '@actions/glob'
import {PullRequestEvent, PushEvent} from '@octokit/webhooks-types'
import * as jsyaml from 'js-yaml'
import {readFileSync} from 'fs'
import FormData from 'form-data'
import axios, {isAxiosError} from 'axios'

const SUPPORTED_FILE_TYPES: string[] = ['.mp4', '.png', '.jpg']

async function run(): Promise<void> {
  try {
    const apiKey: string = core.getInput('api_key', {required: true})
    const files: string = core.getInput('files', {required: true})
    const apiUrl: string = core.getInput('api_url')

    const parsedFiles = jsyaml.load(files) as string[]
    const allFiles: string[] = []
    for (const fileName of parsedFiles) {
      const globber = await glob.create(fileName)
      for await (const file of globber.globGenerator()) {
        if (SUPPORTED_FILE_TYPES.some(type => file.endsWith(type))) {
          allFiles.push(file)
        }
      }
    }

    core.notice(`Sending these files to Hatchways: ${allFiles}`)

    const formData = new FormData()
    let i = 0
    for (const file of allFiles) {
      const fileStream = readFileSync(file)
      formData.append(`file${i}`, fileStream, file)
      i += 1
    }

    formData.append(
      'repository',
      `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`
    )
    formData.append(
      'pipelineUrl',
      `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    )

    let commitSha = null
    let branch = null
    if (github.context.eventName === 'pull_request') {
      commitSha = (github.context.payload as PullRequestEvent).pull_request.head
        .sha
      branch = process.env.GITHUB_HEAD_REF
    } else if (github.context.eventName === 'push') {
      commitSha = (github.context.payload as PushEvent).after
      branch = process.env.GITHUB_REF_NAME
    } else {
      core.setFailed(
        'Only `push` and `pull_request` workflow triggers are supported by the Hatchways GitHub action.'
      )
      return
    }

    formData.append('commitSha', commitSha)
    formData.append('branch', branch)

    core.notice(
      `Updating Hatchways about ${process.env.GITHUB_REPOSITORY} on branch ${branch}`
    )

    let statusCode
    try {
      const response = await axios.post(apiUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'Hatchways-Action-Api-Key': apiKey
        }
      })
      statusCode = response.status
    } catch (error) {
      core.debug(`error: ${error}`)
      if (isAxiosError(error)) {
        statusCode = error.response?.status
      } else {
        throw error
      }
    }
    core.notice(`Hatchways API responded with status code: ${statusCode}`)
    core.setOutput('status_code', statusCode)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
