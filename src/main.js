const core = require('@actions/core');
const github = require('@actions/github');
const { readFileSync, writeFileSync } = require('fs');
const { dealStringToArr } = require('actions-util');

const { queryContributors, formatSimple, formatBase, formatDeatil } = require('./tool');

const { STYLES, DEFAULT_STYLE, DEFAULT_WIDTH, DEFAULT_TOTAL_EMOJI } = require('./const');

const context = github.context;

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

    const updateFiles = core.getInput('update-files');
    const updatePlaces = core.getInput('update-places');

    const files = dealStringToArr(updateFiles);
    const places = dealStringToArr(updatePlaces);

    if (files.length !== places.length) {
      core.setFailed(`[Error] "update-files" must keep the same quantity with "update-places"!`);
      return false;
    }

    let contributors = await queryContributors(owner, repo);
    const blockUsers = core.getInput('block-users') || 'semantic-release-bot, x6-bot[bot]';

    if (blockUsers) {
      contributors = contributors.filter(c => {
        return !dealStringToArr(blockUsers).includes(c.login);
      });
    }
    core.info(`[Actions: Query] The ${owner}/${repo} has ${contributors.length} contributors.`);
    core.setOutput('contributors', contributors);
    if (files.length == 0) {
      return false;
    }

    let avatarWidth = core.getInput('avatar-width') || DEFAULT_WIDTH;
    if (isNaN(Number(avatarWidth))) avatarWidth = Number(avatarWidth);

    let style = core.getInput('style') || 'detail';
    const showTotal = core.getInput('show-total') || 'true';
    if (!STYLES.includes(style)) style = DEFAULT_STYLE;

    let body;
    if (style == 'simple') {
      body = `
${formatSimple(contributors, avatarWidth)}

`;
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
  ${await formatDeatil(contributors, avatarWidth)}
</table>

`;
    }

    if (showTotal == 'true') {
      body = `

> ${DEFAULT_TOTAL_EMOJI} Total: <kbd>**${contributors.length}**</kbd>${body}`;
    }

    for (var i = 0; i < files.length; i++) {
      let file = readFileSync(files[i], 'utf-8');
      let [piA, piB] = places[i].split('/');
      let inA = file.indexOf(piA);
      let inB = file.indexOf(piB);

      let bodyA = file.substring(0, inA + piA.length);
      let bodyB = file.substring(inB, file.length);
      writeFileSync(files[i], bodyA + body + bodyB);
      core.info(`[Actions: writeFileSync] The ${files[i]} updated!`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
