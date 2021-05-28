const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');
const token = core.getInput('token');
const randomSmiley = require('random-smiley');
const octokit = new Octokit({ auth: `token ${token}` });

const {
  DEFAULT_USER_EMOJI,
  DEFAULT_COMPANY_EMOJI,
  DEFAULT_LOCATION_EMOJI,
  DEFAULT_FOLLOWERS_EMOJI,
  DEFAULT_CREATED_EMOJI,
  DEFAULT_BIO_EMOJI,
} = require('./const');

// **************************************************************************

async function queryContributors(owner, repo, page = 1) {
  let { data: contributors } = await octokit.repos.listContributors({
    owner,
    repo,
    per_page: 100,
    page,
  });

  if (contributors.length >= 100) {
    contributors = contributors.concat(await queryContributions(page + 1));
  }

  return contributors;
}

async function queryUser(username) {
  const { data: user } = await octokit.users.getByUsername({
    username,
  });
  core.info(`[Actions: Query] Query ${username} success.`);
  return user;
}

function formatSimple(arr, w) {
  let body = '';
  if (arr.length === 0) return body;
  arr.forEach(o => {
    body += `
<a href="${o.html_url}" title="${o.login}">
  <img src="${o.avatar_url}" width="${w}" />
</a>`;
  });
  return body;
}

function formatBase(arr, w) {
  let body = '';
  if (arr.length === 0) return body;
  let row = arr.length / 5;
  const lastNo = arr.length % 5;
  if (lastNo != 0) row += 1;
  for (let j = 1; j <= row; j += 1) {
    let data = '';
    data = `<tr>
    <td width="150" align="center">${getUser(arr[(j - 1) * 5], w)}
    </td>
    <td width="150" align="center">${getUser(arr[(j - 1) * 5 + 1], w)}
    </td>
    <td width="150" align="center">${getUser(arr[(j - 1) * 5 + 2], w)}
    </td>
    <td width="150" align="center">${getUser(arr[(j - 1) * 5 + 3], w)}
    </td>
    <td width="150" align="center">${getUser(arr[(j - 1) * 5 + 4], w)}
    </td>
  </tr>`;
    body += data;
  }
  return body;
}

async function formatDeatil(arr, w) {
  let body = '';
  if (arr.length === 0) return body;
  if (!core.getInput('avatar-width')) w = 200;
  const userEmoji = core.getInput('user-emoji') || DEFAULT_USER_EMOJI;
  let emojis = [];
  if (userEmoji == 'random') {
    emojis = randomSmiley(arr.length);
  }
  const showEmoji = userEmoji != 'none';
  for (var i = 0; i < arr.length; i += 1) {
    let o = arr[i];
    let u = await queryUser(o.login);
    let emoji = userEmoji == 'random' ? emojis[i] : userEmoji;
    body += `<tr>
    <td rowspan="6">
      <img src="${o.avatar_url}" width="${w}" />
    </td>
    <td width="130" align="left">
      <strong>${showEmoji ? emoji : ''} User: </strong>
    </td>
    <td>
      <a href="${u.html_url}" target="_blank">${u.login}</a>
    </td>
  </tr>
  <tr>
    <td align="left">
      <strong>${showEmoji ? DEFAULT_COMPANY_EMOJI : ''} Company: </strong>
    </td>
    <td>
      ${getCompany(u.company)}
    </td>
  </tr>
  <tr>
    <td align="left">
      <strong>${showEmoji ? DEFAULT_LOCATION_EMOJI : ''} Location: </strong>
    </td>
    <td>
      ${u.location ? u.location : '-'}
    </td>
  </tr>
  <tr>
    <td align="left">
      <strong>${showEmoji ? DEFAULT_FOLLOWERS_EMOJI : ''} Followers: </strong>
    </td>
    <td>
      ${u.followers ? u.followers : '-'}
    </td>
  </tr>
  <tr>
    <td align="left">
      <strong>${showEmoji ? DEFAULT_CREATED_EMOJI : ''} Created: </strong>
    </td>
    <td>
      ${u.created_at.substring(0, 10)}
    </td>
  </tr>
  <tr>
    <td align="left">
      <strong>${showEmoji ? DEFAULT_BIO_EMOJI : ''} Bio: </strong>
    </td>
    <td>
      ${u.bio ? u.bio : '-'}
    </td>
  </tr>`;
  }
  return body;
}

function getCompany(c) {
  if (c) {
    c = c.replace('@', '');
    return `<a href="https://github.com/${c}">@${c}</a>`;
  }
  return `-`;
}

function getUser(user, w) {
  if (user) {
    return `
      <a href="${user.html_url}" title="${user.login}">
        <img src="${user.avatar_url}" width="${w}" />
        <br />
        ${user.login}
      </a>`;
  }
  return '';
}

// **************************************************************************
module.exports = {
  queryContributors,
  formatSimple,
  formatBase,
  formatDeatil,
};
