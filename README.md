# Send Artifacts to Hatchways

This actions sends media files to the Hatchways Platform.

Sending the media files to the Hatchways Platform allows you to see the integrated results in the same place where you're making decisions about candidates, as opposed to having to log into GitHub. It also allows you the ability to automate decisions about a candidate based on those test results (for example, to move them forward or not in the hiring process).

## Required Inputs

### `if: always()`

This key-value pair should always be added. Otherwise, if the tests fail, the action will stop. By adding this, you can make sure that the results of the tests are always sent to the Hatchways Platform, even if the tests fail.

### `with`

#### `api_key`

The value of the `api_key` should always be `${{ secrets.HATCHWAYS_API_KEY }}`.

This key is automatically added to the repository created when a candidate submits their assessment for review. For more information about this kind of automatically created repository, read the "Candidate Repositories and Marking Repositories" section in the [official platform documentation](https://docs.hatchways.io/docs/automating-an-assessment#4-optional-display-automated-tests-results-in-the-hatchways-platform).

#### `files`

The value of the `files` key is a list of the media test files (only `.mp4`, `.png` and `.jpg` files will be added) that you want to send to the Hatchways Platform.

You can use glob patterns to specify many different files in a single entry of the list.

## Usage

Here is an example of what the `upload-hatchways-artifact` section of the GitHub Actions file could look like:

```yaml
- uses: hatchways/upload-hatchways-artifact@v1
  if: always()
  with:
    api_key: ${{ secrets.HATCHWAYS_API_KEY }}
    files: |
      - client/cypress/*
```

## Official Docs

Coming soon!
