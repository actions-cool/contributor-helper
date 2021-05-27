const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require('@octokit/rest');
const { dealStringToArr } = require('actions-util');
const {
  queryContributors,
  formatSimple,
  formatBase,
  formatDeatil,
} = require('./tool');

// **************************************************************************
const token = core.getInput('token');
const octokit = new Octokit({ auth: `token ${token}` });
const context = github.context;

const STYLES = ['simple', 'base', 'detail'];
const DEFAULT_STYLE = 'base';
const DEFAULT_WIDTH = 50;

// **************************************************************************
async function run() {
  try {
    let owner, repo;
    if (core.getInput('repo')) {
      owner = core.getInput('repo').split('/')[0];
      repo = core.getInput('repo').split('/')[1];
    } else {
      owner = context.repo.owner;
      repo = context.repo.repo;
    }

    const updateFiles = core.getInput('update-files') || '';
    const updatePlaces= core.getInput('update-places') || '';
    const issueNumber = core.getInput('issue-number');

    if (updateFiles.length !== updatePlaces.length ) {
      core.setFailed(`[Error] "update-files" must keep the same quantity with "update-places"!`);
      return false;
    }

    const contributors = await queryContributors(owner, repo);
    core.info(`[Actions: Query] The ${owner/repo} has ${contributors.length} contributors.`);

    let avatarWidth = core.getInput('avatar-width') || DEFAULT_WIDTH;
    if (isNaN(Number(avatarWidth))) avatarWidth = Number(avatarWidth);

    let style = core.getInput('style');
    if (!STYLES.includes(style)) style = DEFAULT_STYLE;

    let body;
    if (style == 'simple') {
      body = formatSimple(contributors, avatarWidth);
    }

    if (style == 'base') {
      body = `
<table>
  ${formatBase(contributors, avatarWidth)}
</table>

`;
    }

    if (style == 'detail') {
      body = `
<table>
  ${formatDeatil(contributors, avatarWidth)}
</table>

`;
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
