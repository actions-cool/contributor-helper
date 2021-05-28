# Contributor Helper

简体中文 | [English](./README.en-US.md)

快捷查看贡献者列表。

![](https://img.shields.io/github/workflow/status/actions-cool/contributor-helper/CI?style=flat-square)
[![](https://img.shields.io/badge/marketplace-contributor--helper-blueviolet?style=flat-square)](https://github.com/marketplace/actions/contributor-helper)
[![](https://img.shields.io/github/v/release/actions-cool/contributor-helper?style=flat-square&color=orange)](https://github.com/actions-cool/contributor-helper/releases)

## 🏞 预览

当前采用 3 种方式来展示。

- [简易](./DEMO.simple.md)
- [基础](./DEMO.base.md)
- [详细](./DEMO.detail.md)

## 🚀 如果使用？

> 你可以参照当前项目的例子来使用：https://github.com/actions-cool/contributor-helper/blob/main/.github/workflows/contributor-help.yml
> 触发条件根据需要设置

```yml
name: Contributor Helper

on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  contributor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master

      - uses: actions-cool/contributor-helper@v1.0.0
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          update-files: 'DEMO.base.md, Demo.simple.md'
          update-places: '## Contributors List/## hi, ## Contributors List/## hello'
          style: 'simple'
          avatar-width: '66'

      - name: Commit and push if changed
        run: |-
          git diff
          git config --global user.email "actions@github.com"
          git config --global user.name "github-actions"
          git pull
          git add -A
          git commit -m "🤖 Auto update contributors" || exit 0
          git push
```

### Inputs

| 名称 | 描述 | 必填 |
| -- | -- | -- |
| token | GitHub token。如果不传，即为默认 token。 | ✖ |
| repo | 默认查询当前仓库。可设置查询其他库，例如：`actions-cool/contributor-helper`。 | ✖ |
| update-files | 更新文件列表，可填写多个，参照例子。 | ✖ |
| update-places | 更新文件地方，需和文件个数保持一直，需传入起始位置和终止位置，参照例子。 | ✖ |
| avatar-width | 头像大小，默认 50，详细样式固定 200。 | ✖ |
| style | 列表样式，默认为 `base`，可选 `simple` `detail`。 | ✖ |
| show-total | 是否显示总数，默认为 true。 | ✖ |
| user-emoji | 自定义详细样式 User 前的 emoji，当为 `random` 时，会随机选取。 | ✖ |

### Outputs

- `contributors`
  - 输出 `contributors`，这就允许了用户可以自定义生成该列表，这时可不传 `update-files`。
  - 注意输出的 `contributors` 是大字符串，需解析。

## ⚡ 反馈

欢迎你来尝试使用，并提出意见，你可以通过以下方式：

- 通过 [Issue](https://github.com/actions-cool/contributor-helper/issues) 报告 bug 或进行咨询
- 提交 [Pull Request](https://github.com/actions-cool/contributor-helper/pulls) 改进 `contributor-helper` 的代码

也欢迎加入 钉钉交流群

![](https://github.com/actions-cool/resources/blob/main/dingding.jpeg?raw=true)

## 更新日志

[CHANGELOG](./CHANGELOG.md)

## LICENSE

[MIT](./LICENSE)
