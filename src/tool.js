const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');
const token = core.getInput('token');
const octokit = new Octokit({ auth: `token ${token}` });

// **************************************************************************

async function queryContributors(owner, repo, page = 1) {
  let { data: contributors } = await octokit.repos.listContributors({
    owner,
    repo,
    per_page: 100,
    page,
  });

  if (contributors.length >= 100) {
    contributors = contributors.concat(await queryContributions(page +1))
  }

  return contributors;
}

async function queryUser(username) {
  const { data: user } = await octokit.users.getByUsername({
    username,
  });
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
  })
  body += `
`;
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
    <td width="150" align="center">${getUser(arr[(j-1)*5], w)}
    </td>
    <td width="150" align="center">${getUser(arr[(j-1)*5+1], w)}
    </td>
    <td width="150" align="center">${getUser(arr[(j-1)*5+2], w)}
    </td>
    <td width="150" align="center">${getUser(arr[(j-1)*5+3], w)}
    </td>
    <td width="150" align="center">${getUser(arr[(j-1)*5+4], w)}
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
  for (var i = o; i < arr.length; i ++) {
    let o = arr[i];
    const u = await queryUser(o.login);
    body += `<tr>
    <td>
      <img src="${o.avatar_url}" width="${w}" />
    </td>
    <td>
      <strong>User: </strong> <a href="${u.html_url}">${u.login}</a>
      <br />
      <strong>Company: </strong> ${getCompany(u.company)}
      <br />
      <strong>Location: </strong> ${u.location}
      <br />
      <strong>Followers: </strong> ${u.followers}
      <br />
      <strong>Created: </strong> ${u.created_at.substring(0, 9)}
    </td>
  </tr>`;
  }
  return body;
}

function getCompany(c) {
  if (c) {
    c = c.replace('@', '');
    return `[@${c}](https://github.com/${c})`;
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
      </a>`
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
