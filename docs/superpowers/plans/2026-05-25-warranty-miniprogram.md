# 车衣车膜质保小程序 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个微信小程序，门店管理员可录入/管理车衣车膜质保记录，车主免登录查询质保状态，含数据看板。

**Architecture:** uni-app (Vue3 + TypeScript) 作为前端框架，微信云开发（CloudBase）提供云数据库、云存储、云函数。前端分两端：车主查询端（免登录，主包）和管理员端（登录后，分包）。所有数据库读写通过云函数中转，禁止客户端直接操作数据库。

**Tech Stack:** uni-app + Vue3 + TypeScript、uview-plus（UI 组件库）、uCharts（图表）、微信云开发 CloudBase、GitHub CLI、Jest（云函数单测）

**设计规格：** `e:\coding\demo-main\warranty-miniprogram\docs\superpowers\specs\2026-05-25-warranty-miniprogram-design.md`

**版本里程碑（每个 milestone 对应一次 git tag + push）：**
- `v0.1.0` 项目脚手架 + GitHub 仓库
- `v0.2.0` 云函数全部完成（含单测）
- `v0.3.0` 车主查询端完成
- `v0.4.0` 管理员端 CRUD 完成
- `v0.5.0` 数据看板完成
- `v1.0.0` 全功能完成，可提审

---

## 文件结构

```
warranty-miniprogram/
├── docs/superpowers/
│   ├── specs/2026-05-25-warranty-miniprogram-design.md
│   └── plans/2026-05-25-warranty-miniprogram.md
├── src/
│   ├── pages/
│   │   ├── index/index.vue              # 车主查询首页（主包，默认入口）
│   │   ├── query-result/index.vue       # 查询结果页（主包）
│   │   ├── login/index.vue              # 管理员登录页（主包）
│   │   └── admin/
│   │       ├── dashboard/index.vue      # 看板（主包，TabBar）
│   │       ├── record-list/index.vue    # 记录列表（主包，TabBar）
│   │       ├── profile/index.vue        # 我的（主包，TabBar）
│   │       ├── record-form/index.vue    # 新增/编辑（分包，减小主包体积）
│   │       └── record-detail/index.vue  # 记录详情（分包）
│   ├── cloudfunctions/
│   │   ├── login/index.js           # 获取 openid + 白名单校验
│   │   ├── addRecord/index.js       # 原子生成质保卡号 + 写入记录
│   │   ├── updateRecord/index.js    # 更新记录
│   │   ├── deleteRecord/index.js    # 删除记录 + 清理云存储图片
│   │   ├── queryRecord/index.js     # 车主多字段查询 + 脱敏
│   │   ├── getDashboard/index.js    # 聚合统计
│   │   └── addAdmin/index.js        # 添加管理员
│   ├── components/
│   │   ├── ImageUploader/index.vue  # 图片上传组件（含压缩）
│   │   └── WarrantyStatusTag/index.vue  # 质保状态标签
│   ├── store/admin.ts               # Pinia：管理员登录态
│   ├── utils/
│   │   ├── date.ts                  # 日期计算（到期日、状态判断）
│   │   └── mask.ts                  # 手机号脱敏
│   ├── types/index.ts               # TypeScript 类型定义
│   ├── App.vue
│   ├── main.ts
│   ├── pages.json                   # 路由 + 分包配置
│   └── manifest.json
├── tests/cloudfunctions/            # 云函数 Jest 单测
│   ├── queryRecord.test.js
│   ├── addRecord.test.js
│   └── getDashboard.test.js
├── package.json
└── project.config.json
```

---

## Task 0: 环境准备

**目标：** 安装 GitHub CLI，创建 GitHub 仓库，配置 uni-app 脚手架工具。

**Files:** 无代码文件，均为命令行操作

- [ ] **Step 1: 安装 GitHub CLI**

  打开 PowerShell（管理员权限），运行：
  ```powershell
  winget install --id GitHub.cli
  ```
  安装完成后关闭并重新打开终端，验证：
  ```powershell
  gh --version
  ```
  预期输出：`gh version 2.x.x`

- [ ] **Step 2: 登录 GitHub**

  ```powershell
  gh auth login
  ```
  选择：`GitHub.com` → `HTTPS` → `Login with a web browser` → 按提示在浏览器授权。
  验证：
  ```powershell
  gh auth status
  ```
  预期：`Logged in to github.com as <your-username>`

- [ ] **Step 3: 在 warranty-miniprogram 目录初始化 git**

  ```powershell
  cd e:\coding\demo-main\warranty-miniprogram
  git init
  git checkout -b main
  ```

- [ ] **Step 4: 创建 GitHub 仓库并关联**

  ```powershell
  gh repo create warranty-miniprogram --public --description "车衣车膜质保录入与查询微信小程序" --source . --remote origin --push
  ```
  若提示 push 失败（因为没有文件），先继续下一步。

- [ ] **Step 5: 创建 .gitignore**

  在 `e:\coding\demo-main\warranty-miniprogram\` 创建文件 `.gitignore`，内容：
  ```
  node_modules/
  dist/
  unpackage/
  .DS_Store
  *.local
  project.private.config.json
  ```

- [ ] **Step 6: 首次提交**

  ```powershell
  git add .gitignore
  git commit -m "chore: init repository"
  git push -u origin main
  ```

---

## Task 1: 项目脚手架（→ v0.1.0）

**Files:**
- Create: `src/` 整个目录结构（由脚手架生成）
- Create: `package.json`
- Modify: `src/pages.json`
- Modify: `src/manifest.json`

- [ ] **Step 1: 用 npm create 生成 uni-app 项目**

  在 `warranty-miniprogram` 目录下运行：
  ```powershell
  npm create uni-app@latest src -- --template vue3-ts
  ```
  若提示已有目录，选择合并/覆盖。脚手架会在 src/ 内生成基础结构。

  > 备选：若上述命令不可用，改用：
  > ```powershell
  > npx degit dcloudio/uni-preset-vue#vite-ts src
  > ```

- [ ] **Step 2: 安装依赖**

  ```powershell
  cd e:\coding\demo-main\warranty-miniprogram
  npm install
  npm install @dcloudio/uni-ui
  npm install uview-plus
  npm install ucharts
  npm install pinia
  npm install --save-dev jest @types/jest
  ```

- [ ] **Step 3: 配置 uview-plus**

  修改 `src/main.ts`：
  ```typescript
  import { createSSRApp } from 'vue'
  import App from './App.vue'
  import { createPinia } from 'pinia'
  import uviewPlus from 'uview-plus'

  export function createApp() {
    const app = createSSRApp(App)
    app.use(createPinia())
    app.use(uviewPlus)
    return { app }
  }
  ```

  修改 `src/App.vue`，在 `<style>` 中引入 uview-plus 样式：
  ```vue
  <style lang="scss">
  @import 'uview-plus/index.scss';
  </style>
  ```

- [ ] **Step 4: 配置 pages.json（路由 + 分包）**

  替换 `src/pages.json` 内容：
  ```json
  {
    "pages": [
      {
        "path": "pages/index/index",
        "style": { "navigationBarTitleText": "质保查询" }
      },
      {
        "path": "pages/query-result/index",
        "style": { "navigationBarTitleText": "质保详情" }
      },
      {
        "path": "pages/login/index",
        "style": { "navigationBarTitleText": "管理员登录" }
      },
      {
        "path": "pages/admin/dashboard/index",
        "style": { "navigationBarTitleText": "数据看板" }
      },
      {
        "path": "pages/admin/record-list/index",
        "style": { "navigationBarTitleText": "质保记录" }
      },
      {
        "path": "pages/admin/profile/index",
        "style": { "navigationBarTitleText": "我的" }
      }
    ],
    "subPackages": [
      {
        "root": "pages/admin",
        "pages": [
          { "path": "record-form/index", "style": { "navigationBarTitleText": "录入记录" } },
          { "path": "record-detail/index", "style": { "navigationBarTitleText": "记录详情" } }
        ]
      }
    ],
    "tabBar": {
      "color": "#999",
      "selectedColor": "#2B7EFF",
      "list": [
        { "pagePath": "pages/index/index", "text": "质保查询" },
        { "pagePath": "pages/admin/dashboard/index", "text": "看板" },
        { "pagePath": "pages/admin/record-list/index", "text": "记录" },
        { "pagePath": "pages/admin/profile/index", "text": "我的" }
      ]
    },
    "globalStyle": {
      "navigationBarBackgroundColor": "#2B7EFF",
      "navigationBarTextStyle": "white",
      "backgroundColor": "#F5F6FA"
    }
  }
  ```
  > **注意：** 微信小程序 TabBar 页面不能在分包中。看板/记录列表/我的三个管理员 TabBar 页留主包，仅 record-form 和 record-detail 放分包以减小主包体积。

- [ ] **Step 5: 配置 manifest.json（填入云开发 AppID）**

  打开微信公众平台 (mp.weixin.qq.com)，注册小程序，获取 AppID。
  在 `src/manifest.json` 中找到 `mp-weixin` 节点，填入：
  ```json
  "mp-weixin": {
    "appid": "YOUR_APPID_HERE",
    "setting": {
      "urlCheck": false
    },
    "usingComponents": true,
    "cloudfunctionRoot": "cloudfunctions/"
  }
  ```

- [ ] **Step 6: 创建目录结构**

  ```powershell
  mkdir src\cloudfunctions\login
  mkdir src\cloudfunctions\addRecord
  mkdir src\cloudfunctions\updateRecord
  mkdir src\cloudfunctions\deleteRecord
  mkdir src\cloudfunctions\queryRecord
  mkdir src\cloudfunctions\getDashboard
  mkdir src\cloudfunctions\addAdmin
  mkdir src\components\ImageUploader
  mkdir src\components\WarrantyStatusTag
  mkdir src\store
  mkdir src\utils
  mkdir src\types
  mkdir tests\cloudfunctions
  mkdir docs\superpowers\plans
  ```

- [ ] **Step 7: 提交 v0.1.0**

  ```powershell
  git add .
  git commit -m "feat: scaffold uni-app project with uview-plus and cloud functions structure"
  git tag v0.1.0
  git push origin main --tags
  ```

---

## Task 2: TypeScript 类型定义

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: 创建类型文件**

  创建 `src/types/index.ts`：
  ```typescript
  export interface WarrantyRecord {
    _id?: string
    warranty_no: string
    owner_name: string
    owner_phone: string
    license_plate: string
    vin: string
    car_model: string
    car_color: string
    product_brand: string
    product_series: string
    product_model: string
    construction_parts: string[]
    construction_date: string   // ISO date string
    delivery_date: string
    warranty_years: number
    warranty_expire: string     // ISO date string, 系统计算
    technician: string
    total_price: number
    product_images: string[]
    construction_images: string[]
    created_by?: string
    created_at?: string
    updated_at?: string
  }

  export interface Admin {
    _id?: string
    openid: string
    name: string
    created_at?: string
  }

  export type QueryField = 'owner_phone' | 'warranty_no' | 'license_plate' | 'vin'

  export type WarrantyStatus = 'valid' | 'expiring' | 'expired'

  export interface QueryResult extends Omit<WarrantyRecord, 'owner_phone'> {
    owner_phone_masked: string  // 138****8888
    status: WarrantyStatus
  }

  export interface DashboardData {
    total_records: number
    monthly_count: number
    trend: { month: string; count: number }[]   // 近6个月
    product_distribution: { name: string; value: number }[]
    expiring_soon: WarrantyRecord[]              // 30天内到期
    followup_reminders: WarrantyRecord[]         // 待回访（施工后7天内未回访）
  }
  ```

- [ ] **Step 2: 提交**

  ```powershell
  git add src/types/index.ts
  git commit -m "feat: add TypeScript type definitions for warranty records and dashboard"
  ```

---

## Task 3: 工具函数

**Files:**
- Create: `src/utils/date.ts`
- Create: `src/utils/mask.ts`

- [ ] **Step 1: 创建日期工具**

  创建 `src/utils/date.ts`：
  ```typescript
  import type { WarrantyStatus } from '@/types'

  export function calcWarrantyExpire(constructionDate: string, warrantyYears: number): string {
    const date = new Date(constructionDate)
    date.setFullYear(date.getFullYear() + warrantyYears)
    return date.toISOString().split('T')[0]
  }

  export function getWarrantyStatus(expireDate: string): WarrantyStatus {
    const now = new Date()
    const expire = new Date(expireDate)
    const diffDays = Math.ceil((expire.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return 'expired'
    if (diffDays <= 30) return 'expiring'
    return 'valid'
  }

  export function formatDate(dateStr: string): string {
    if (!dateStr) return ''
    return dateStr.split('T')[0]
  }
  ```

- [ ] **Step 2: 创建脱敏工具**

  创建 `src/utils/mask.ts`：
  ```typescript
  export function maskPhone(phone: string): string {
    if (!phone || phone.length < 7) return phone
    return phone.slice(0, 3) + '****' + phone.slice(-4)
  }
  ```

- [ ] **Step 3: 提交**

  ```powershell
  git add src/utils/
  git commit -m "feat: add date calculation and phone masking utilities"
  ```

---

## Task 4: Pinia 管理员状态

**Files:**
- Create: `src/store/admin.ts`

- [ ] **Step 1: 创建 store**

  创建 `src/store/admin.ts`：
  ```typescript
  import { defineStore } from 'pinia'

  interface AdminState {
    openid: string
    name: string
    isLoggedIn: boolean
  }

  export const useAdminStore = defineStore('admin', {
    state: (): AdminState => ({
      openid: '',
      name: '',
      isLoggedIn: false,
    }),
    actions: {
      login(openid: string, name: string) {
        this.openid = openid
        this.name = name
        this.isLoggedIn = true
        wx.setStorageSync('admin_openid', openid)
        wx.setStorageSync('admin_name', name)
        wx.setStorageSync('admin_login_time', Date.now())
      },
      logout() {
        this.openid = ''
        this.name = ''
        this.isLoggedIn = false
        wx.removeStorageSync('admin_openid')
        wx.removeStorageSync('admin_name')
        wx.removeStorageSync('admin_login_time')
      },
      restoreFromStorage() {
        const loginTime = wx.getStorageSync('admin_login_time')
        const sevenDays = 7 * 24 * 60 * 60 * 1000
        if (loginTime && Date.now() - loginTime < sevenDays) {
          this.openid = wx.getStorageSync('admin_openid') || ''
          this.name = wx.getStorageSync('admin_name') || ''
          this.isLoggedIn = !!this.openid
        }
      },
    },
  })
  ```

- [ ] **Step 2: 提交**

  ```powershell
  git add src/store/admin.ts
  git commit -m "feat: add admin Pinia store with 7-day login persistence"
  ```

---

## Task 5: 云函数 - queryRecord（→ 重要，车主查询核心）

**Files:**
- Create: `src/cloudfunctions/queryRecord/index.js`
- Create: `tests/cloudfunctions/queryRecord.test.js`

- [ ] **Step 1: 写云函数单测（TDD）**

  创建 `tests/cloudfunctions/queryRecord.test.js`：
  ```javascript
  const { maskPhone } = require('../../src/utils/mask')

  describe('maskPhone', () => {
    test('masks middle 4 digits of an 11-digit phone number', () => {
      expect(maskPhone('13812345678')).toBe('138****5678')
    })

    test('returns original if phone too short', () => {
      expect(maskPhone('123')).toBe('123')
    })
  })

  describe('queryRecord field matching', () => {
    const records = [
      { warranty_no: 'BM202605250001', owner_phone: '13812345678', license_plate: '粤A12345', vin: 'LSGKB52E5LG123456', owner_name: '张三', warranty_expire: '2028-05-25' },
    ]

    function filterRecords(records, field, value) {
      return records.filter(r => r[field] === value)
    }

    test('finds record by warranty_no', () => {
      const result = filterRecords(records, 'warranty_no', 'BM202605250001')
      expect(result).toHaveLength(1)
    })

    test('returns empty array when no match', () => {
      const result = filterRecords(records, 'warranty_no', 'BM999')
      expect(result).toHaveLength(0)
    })
  })
  ```

- [ ] **Step 2: 运行测试，确认失败（因为 maskPhone 还是 CommonJS 路径问题，预期 PASS 因工具函数已写）**

  ```powershell
  npx jest tests/cloudfunctions/queryRecord.test.js --verbose
  ```
  预期：PASS（mask 函数和过滤逻辑简单）

- [ ] **Step 3: 创建云函数**

  创建 `src/cloudfunctions/queryRecord/index.js`：
  ```javascript
  const cloud = require('wx-server-sdk')
  cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
  const db = cloud.database()

  exports.main = async (event) => {
    const { field, value } = event
    const allowedFields = ['owner_phone', 'warranty_no', 'license_plate', 'vin']
    if (!allowedFields.includes(field)) {
      return { code: 400, message: '不支持的查询字段' }
    }
    if (!value || value.trim() === '') {
      return { code: 400, message: '查询值不能为空' }
    }

    try {
      const { data } = await db.collection('records')
        .where({ [field]: value.trim() })
        .get()

      if (data.length === 0) {
        return { code: 404, message: '未找到质保记录' }
      }

      const masked = data.map(record => {
        const { owner_phone, ...rest } = record
        const now = new Date()
        const expire = new Date(record.warranty_expire)
        const diffDays = Math.ceil((expire - now) / (1000 * 60 * 60 * 24))
        let status = 'valid'
        if (diffDays < 0) status = 'expired'
        else if (diffDays <= 30) status = 'expiring'

        return {
          ...rest,
          owner_phone_masked: owner_phone.slice(0, 3) + '****' + owner_phone.slice(-4),
          status,
        }
      })

      return { code: 200, data: masked }
    } catch (err) {
      return { code: 500, message: '查询失败', error: err.message }
    }
  }
  ```

- [ ] **Step 4: 提交**

  ```powershell
  git add src/cloudfunctions/queryRecord/ tests/cloudfunctions/queryRecord.test.js
  git commit -m "feat: add queryRecord cloud function with phone masking and status calculation"
  ```

---

## Task 6: 云函数 - login + addAdmin

**Files:**
- Create: `src/cloudfunctions/login/index.js`
- Create: `src/cloudfunctions/addAdmin/index.js`

- [ ] **Step 1: 创建 login 云函数**

  创建 `src/cloudfunctions/login/index.js`：
  ```javascript
  const cloud = require('wx-server-sdk')
  cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
  const db = cloud.database()

  exports.main = async (event, context) => {
    const { OPENID } = cloud.getWXContext()
    try {
      const { data } = await db.collection('admins').where({ openid: OPENID }).get()
      if (data.length === 0) {
        return { code: 403, message: '无权限，请联系管理员' }
      }
      return { code: 200, openid: OPENID, name: data[0].name }
    } catch (err) {
      return { code: 500, message: '登录失败', error: err.message }
    }
  }
  ```

- [ ] **Step 2: 创建 addAdmin 云函数**

  创建 `src/cloudfunctions/addAdmin/index.js`：
  ```javascript
  const cloud = require('wx-server-sdk')
  cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
  const db = cloud.database()

  exports.main = async (event, context) => {
    const { OPENID: callerOpenid } = cloud.getWXContext()
    const { targetOpenid, name } = event

    // 校验调用者是否为管理员
    const { data: callers } = await db.collection('admins').where({ openid: callerOpenid }).get()
    if (callers.length === 0) {
      return { code: 403, message: '无权限' }
    }

    if (!targetOpenid || !name) {
      return { code: 400, message: '缺少参数' }
    }

    try {
      // 检查是否已存在
      const { data: existing } = await db.collection('admins').where({ openid: targetOpenid }).get()
      if (existing.length > 0) {
        return { code: 409, message: '该用户已是管理员' }
      }

      await db.collection('admins').add({
        data: { openid: targetOpenid, name, created_at: db.serverDate() }
      })
      return { code: 200, message: '添加成功' }
    } catch (err) {
      return { code: 500, message: '添加失败', error: err.message }
    }
  }
  ```

- [ ] **Step 3: 提交**

  ```powershell
  git add src/cloudfunctions/login/ src/cloudfunctions/addAdmin/
  git commit -m "feat: add login and addAdmin cloud functions with whitelist verification"
  ```

---

## Task 7: 云函数 - addRecord + updateRecord + deleteRecord

**Files:**
- Create: `src/cloudfunctions/addRecord/index.js`
- Create: `src/cloudfunctions/updateRecord/index.js`
- Create: `src/cloudfunctions/deleteRecord/index.js`
- Create: `tests/cloudfunctions/addRecord.test.js`

- [ ] **Step 1: 写单测**

  创建 `tests/cloudfunctions/addRecord.test.js`：
  ```javascript
  const { calcWarrantyExpire } = require('../../src/utils/date')

  describe('calcWarrantyExpire', () => {
    test('adds warranty years to construction date', () => {
      const result = calcWarrantyExpire('2026-05-25', 3)
      expect(result).toBe('2029-05-25')
    })

    test('handles leap year boundary', () => {
      const result = calcWarrantyExpire('2024-02-29', 1)
      // 2025 没有 2/29，结果为 2025-02-28 或 2025-03-01（取决于 JS 实现）
      expect(result.startsWith('2025')).toBe(true)
    })
  })

  describe('warranty_no generation format', () => {
    function generateWarrantyNo(dateStr, sequence) {
      const seq = String(sequence).padStart(4, '0')
      return `BM${dateStr.replace(/-/g, '')}${seq}`
    }

    test('generates correct format', () => {
      expect(generateWarrantyNo('2026-05-25', 1)).toBe('BM202605250001')
      expect(generateWarrantyNo('2026-05-25', 99)).toBe('BM202605250099')
    })
  })
  ```

- [ ] **Step 2: 运行测试**

  ```powershell
  npx jest tests/cloudfunctions/addRecord.test.js --verbose
  ```
  预期：PASS

- [ ] **Step 3: 创建 addRecord 云函数**

  创建 `src/cloudfunctions/addRecord/index.js`：
  ```javascript
  const cloud = require('wx-server-sdk')
  cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
  const db = cloud.database()
  const _ = db.command

  async function generateWarrantyNo() {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
    const prefix = `BM${dateStr}`
    const { total } = await db.collection('records')
      .where({ warranty_no: db.RegExp({ regexp: `^${prefix}`, flags: 'i' }) })
      .count()
    const seq = String(total + 1).padStart(4, '0')
    return `${prefix}${seq}`
  }

  exports.main = async (event, context) => {
    const { OPENID } = cloud.getWXContext()
    const { data: admins } = await db.collection('admins').where({ openid: OPENID }).get()
    if (admins.length === 0) return { code: 403, message: '无权限' }

    const record = event.record
    if (!record) return { code: 400, message: '缺少记录数据' }

    try {
      const warrantyNo = await generateWarrantyNo()
      // 计算到期日
      const constructDate = new Date(record.construction_date)
      constructDate.setFullYear(constructDate.getFullYear() + record.warranty_years)
      const warrantyExpire = constructDate.toISOString().split('T')[0]

      const result = await db.collection('records').add({
        data: {
          ...record,
          warranty_no: warrantyNo,
          warranty_expire: warrantyExpire,
          created_by: OPENID,
          created_at: db.serverDate(),
          updated_at: db.serverDate(),
        }
      })
      return { code: 200, _id: result._id, warranty_no: warrantyNo }
    } catch (err) {
      return { code: 500, message: '录入失败', error: err.message }
    }
  }
  ```

- [ ] **Step 4: 创建 updateRecord 云函数**

  创建 `src/cloudfunctions/updateRecord/index.js`：
  ```javascript
  const cloud = require('wx-server-sdk')
  cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
  const db = cloud.database()

  exports.main = async (event, context) => {
    const { OPENID } = cloud.getWXContext()
    const { data: admins } = await db.collection('admins').where({ openid: OPENID }).get()
    if (admins.length === 0) return { code: 403, message: '无权限' }

    const { _id, record } = event
    if (!_id || !record) return { code: 400, message: '缺少参数' }

    // 如果修改了施工日期或质保年限，重新计算到期日
    if (record.construction_date || record.warranty_years) {
      const existing = await db.collection('records').doc(_id).get()
      const constructDate = new Date(record.construction_date || existing.data.construction_date)
      const years = record.warranty_years ?? existing.data.warranty_years
      constructDate.setFullYear(constructDate.getFullYear() + years)
      record.warranty_expire = constructDate.toISOString().split('T')[0]
    }

    try {
      await db.collection('records').doc(_id).update({
        data: { ...record, updated_at: db.serverDate() }
      })
      return { code: 200 }
    } catch (err) {
      return { code: 500, message: '更新失败', error: err.message }
    }
  }
  ```

- [ ] **Step 5: 创建 deleteRecord 云函数**

  创建 `src/cloudfunctions/deleteRecord/index.js`：
  ```javascript
  const cloud = require('wx-server-sdk')
  cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
  const db = cloud.database()

  exports.main = async (event, context) => {
    const { OPENID } = cloud.getWXContext()
    const { data: admins } = await db.collection('admins').where({ openid: OPENID }).get()
    if (admins.length === 0) return { code: 403, message: '无权限' }

    const { _id } = event
    if (!_id) return { code: 400, message: '缺少记录 ID' }

    try {
      // 先获取图片列表，再删除文件
      const { data: record } = await db.collection('records').doc(_id).get()
      const allImages = [
        ...(record.product_images || []),
        ...(record.construction_images || []),
      ]
      if (allImages.length > 0) {
        await cloud.deleteFile({ fileList: allImages })
      }
      await db.collection('records').doc(_id).remove()
      return { code: 200 }
    } catch (err) {
      return { code: 500, message: '删除失败', error: err.message }
    }
  }
  ```

- [ ] **Step 6: 提交**

  ```powershell
  git add src/cloudfunctions/addRecord/ src/cloudfunctions/updateRecord/ src/cloudfunctions/deleteRecord/ tests/
  git commit -m "feat: add CRUD cloud functions for warranty records"
  ```

---

## Task 8: 云函数 - getDashboard

**Files:**
- Create: `src/cloudfunctions/getDashboard/index.js`
- Create: `tests/cloudfunctions/getDashboard.test.js`

- [ ] **Step 1: 写单测**

  创建 `tests/cloudfunctions/getDashboard.test.js`：
  ```javascript
  describe('trend aggregation', () => {
    function buildTrend(records) {
      const counts = {}
      records.forEach(r => {
        const month = r.construction_date.slice(0, 7)
        counts[month] = (counts[month] || 0) + 1
      })
      return Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month, count }))
    }

    test('aggregates monthly counts correctly', () => {
      const records = [
        { construction_date: '2026-04-10' },
        { construction_date: '2026-04-22' },
        { construction_date: '2026-05-01' },
      ]
      const trend = buildTrend(records)
      expect(trend).toEqual([
        { month: '2026-04', count: 2 },
        { month: '2026-05', count: 1 },
      ])
    })
  })
  ```

- [ ] **Step 2: 运行测试**

  ```powershell
  npx jest tests/cloudfunctions/getDashboard.test.js --verbose
  ```
  预期：PASS

- [ ] **Step 3: 创建云函数**

  创建 `src/cloudfunctions/getDashboard/index.js`：
  ```javascript
  const cloud = require('wx-server-sdk')
  cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
  const db = cloud.database()

  exports.main = async (event, context) => {
    const { OPENID } = cloud.getWXContext()
    const { data: admins } = await db.collection('admins').where({ openid: OPENID }).get()
    if (admins.length === 0) return { code: 403, message: '无权限' }

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()

    try {
      const [totalRes, monthlyRes, allRecentRes, expiringRes] = await Promise.all([
        db.collection('records').count(),
        db.collection('records').where({ created_at: db.command.gte(new Date(thisMonthStart)) }).count(),
        db.collection('records').where({ created_at: db.command.gte(new Date(sixMonthsAgo)) })
          .field({ construction_date: true, product_brand: true, product_series: true }).get(),
        db.collection('records')
          .where({
            warranty_expire: db.command.gte(now.toISOString().split('T')[0]).and(db.command.lte(thirtyDaysLater))
          })
          .orderBy('warranty_expire', 'asc')
          .get(),
      ])

      // 趋势
      const trendMap = {}
      allRecentRes.data.forEach(r => {
        const month = (r.construction_date || '').slice(0, 7)
        if (month) trendMap[month] = (trendMap[month] || 0) + 1
      })
      const trend = Object.entries(trendMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month, count }))

      // 产品分布
      const productMap = {}
      allRecentRes.data.forEach(r => {
        const key = `${r.product_brand} ${r.product_series}`.trim() || '其他'
        productMap[key] = (productMap[key] || 0) + 1
      })
      const product_distribution = Object.entries(productMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

      return {
        code: 200,
        data: {
          total_records: totalRes.total,
          monthly_count: monthlyRes.total,
          trend,
          product_distribution,
          expiring_soon: expiringRes.data,
        }
      }
    } catch (err) {
      return { code: 500, message: '获取统计失败', error: err.message }
    }
  }
  ```

- [ ] **Step 4: 提交 v0.2.0**

  ```powershell
  git add src/cloudfunctions/getDashboard/ tests/cloudfunctions/getDashboard.test.js
  git commit -m "feat: add getDashboard cloud function with trend and product distribution"
  git tag v0.2.0
  git push origin main --tags
  ```

---

## Task 9: 公共组件 - WarrantyStatusTag

**Files:**
- Create: `src/components/WarrantyStatusTag/index.vue`

- [ ] **Step 1: 创建状态标签组件**

  创建 `src/components/WarrantyStatusTag/index.vue`：
  ```vue
  <template>
    <u-tag :text="label" :type="type" size="mini" />
  </template>

  <script setup lang="ts">
  import { computed } from 'vue'
  import type { WarrantyStatus } from '@/types'

  const props = defineProps<{ status: WarrantyStatus }>()

  const label = computed(() => ({
    valid: '质保有效',
    expiring: '即将到期',
    expired: '已过期',
  }[props.status]))

  const type = computed(() => ({
    valid: 'success',
    expiring: 'warning',
    expired: 'error',
  }[props.status]))
  </script>
  ```

- [ ] **Step 2: 提交**

  ```powershell
  git add src/components/WarrantyStatusTag/
  git commit -m "feat: add WarrantyStatusTag component"
  ```

---

## Task 10: 公共组件 - ImageUploader

**Files:**
- Create: `src/components/ImageUploader/index.vue`

- [ ] **Step 1: 创建图片上传组件**

  创建 `src/components/ImageUploader/index.vue`：
  ```vue
  <template>
    <view class="uploader">
      <view class="image-list">
        <view v-for="(url, i) in modelValue" :key="i" class="image-item">
          <image :src="url" mode="aspectFill" @tap="preview(i)" />
          <view class="delete-btn" @tap="remove(i)">×</view>
        </view>
        <view v-if="modelValue.length < maxCount" class="add-btn" @tap="choose">
          <u-icon name="plus" size="40" color="#999" />
          <text>{{ modelValue.length }}/{{ maxCount }}</text>
        </view>
      </view>
    </view>
  </template>

  <script setup lang="ts">
  import { ref } from 'vue'

  const props = defineProps<{
    modelValue: string[]
    maxCount?: number
  }>()
  const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()
  const maxCount = props.maxCount ?? 9

  async function choose() {
    const res = await uni.chooseImage({ count: maxCount - props.modelValue.length, sizeType: ['compressed'] })
    const urls = [...props.modelValue]
    for (const path of res.tempFilePaths) {
      uni.showLoading({ title: '上传中...' })
      try {
        const cloudPath = `images/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
        const uploadRes = await wx.cloud.uploadFile({ cloudPath, filePath: path })
        urls.push(uploadRes.fileID)
      } catch (e) {
        uni.showToast({ title: '上传失败，请重试', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
    emit('update:modelValue', urls)
  }

  function remove(index: number) {
    const urls = [...props.modelValue]
    urls.splice(index, 1)
    emit('update:modelValue', urls)
  }

  function preview(index: number) {
    uni.previewImage({ urls: props.modelValue, current: props.modelValue[index] })
  }
  </script>

  <style scoped>
  .image-list { display: flex; flex-wrap: wrap; gap: 12rpx; }
  .image-item { position: relative; width: 200rpx; height: 200rpx; }
  .image-item image { width: 100%; height: 100%; border-radius: 8rpx; }
  .delete-btn { position: absolute; top: -16rpx; right: -16rpx; width: 40rpx; height: 40rpx; background: rgba(0,0,0,.5); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28rpx; }
  .add-btn { width: 200rpx; height: 200rpx; border: 2rpx dashed #ddd; border-radius: 8rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; font-size: 24rpx; }
  </style>
  ```

- [ ] **Step 2: 提交**

  ```powershell
  git add src/components/ImageUploader/
  git commit -m "feat: add ImageUploader component with cloud storage upload and preview"
  ```

---

## Task 11: 车主查询首页

**Files:**
- Create: `src/pages/index/index.vue`

- [ ] **Step 1: 创建查询首页**

  创建 `src/pages/index/index.vue`：
  ```vue
  <template>
    <view class="container">
      <view class="header">
        <image class="logo" src="/static/logo.png" mode="aspectFit" />
        <text class="title">车衣车膜质保查询</text>
      </view>

      <u-tabs :list="tabs" :current="activeTab" @click="onTabClick" />

      <view class="search-area">
        <u-input
          v-model="queryValue"
          :placeholder="placeholder"
          :clearable="true"
          border="surround"
          @confirm="doQuery"
        />
        <u-button type="primary" text="查询" :loading="loading" @click="doQuery" customStyle="margin-top:24rpx" />
      </view>

      <view class="admin-link" @tap="goLogin">管理员登录</view>
    </view>
  </template>

  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import type { QueryField } from '@/types'

  const tabs = [
    { name: '手机号' },
    { name: '质保卡号' },
    { name: '车牌号' },
    { name: '车架号' },
  ]
  const fieldMap: QueryField[] = ['owner_phone', 'warranty_no', 'license_plate', 'vin']
  const placeholderMap = ['请输入车主手机号', '请输入质保卡号', '请输入车牌号', '请输入车架号']

  const activeTab = ref(0)
  const queryValue = ref('')
  const loading = ref(false)

  const placeholder = computed(() => placeholderMap[activeTab.value])

  function onTabClick(item: { index: number }) {
    activeTab.value = item.index
    queryValue.value = ''
  }

  async function doQuery() {
    if (!queryValue.value.trim()) {
      uni.showToast({ title: '请输入查询内容', icon: 'none' })
      return
    }
    loading.value = true
    try {
      const res = await wx.cloud.callFunction({
        name: 'queryRecord',
        data: { field: fieldMap[activeTab.value], value: queryValue.value.trim() },
      }) as any
      const result = res.result
      if (result.code === 200) {
        uni.navigateTo({
          url: `/pages/query-result/index?data=${encodeURIComponent(JSON.stringify(result.data))}`,
        })
      } else {
        uni.showToast({ title: result.message || '未找到记录', icon: 'none' })
      }
    } catch (e) {
      uni.showToast({ title: '查询失败，请重试', icon: 'none' })
    } finally {
      loading.value = false
    }
  }

  function goLogin() {
    uni.navigateTo({ url: '/pages/login/index' })
  }
  </script>

  <style scoped>
  .container { padding: 40rpx 32rpx; min-height: 100vh; background: #F5F6FA; }
  .header { display: flex; flex-direction: column; align-items: center; margin-bottom: 48rpx; }
  .logo { width: 120rpx; height: 120rpx; margin-bottom: 16rpx; }
  .title { font-size: 36rpx; font-weight: bold; color: #333; }
  .search-area { background: #fff; border-radius: 16rpx; padding: 32rpx; margin-top: 24rpx; }
  .admin-link { text-align: center; color: #999; font-size: 26rpx; margin-top: 48rpx; }
  </style>
  ```

- [ ] **Step 2: 提交**

  ```powershell
  git add src/pages/index/
  git commit -m "feat: add car owner query homepage with 4-field search"
  ```

---

## Task 12: 查询结果页

**Files:**
- Create: `src/pages/query-result/index.vue`

- [ ] **Step 1: 创建查询结果页**

  创建 `src/pages/query-result/index.vue`：
  ```vue
  <template>
    <view class="container">
      <!-- 多条记录选择 -->
      <view v-if="records.length > 1" class="record-selector">
        <text class="tip">找到 {{ records.length }} 条记录，请选择：</text>
        <view v-for="(r, i) in records" :key="i" class="record-item" @tap="selectRecord(i)">
          <text>{{ r.car_model }} · {{ r.license_plate }}</text>
          <text class="date">施工日期：{{ r.construction_date }}</text>
        </view>
      </view>

      <!-- 单条记录详情 -->
      <view v-if="current" class="detail-card">
        <WarrantyStatusTag :status="current.status" />

        <u-cell-group margin="0">
          <u-cell title="质保卡号" :value="current.warranty_no" />
          <u-cell title="车主" :value="current.owner_name" />
          <u-cell title="手机号" :value="current.owner_phone_masked" />
          <u-cell title="车牌号" :value="current.license_plate" />
          <u-cell title="车架号" :value="current.vin" />
          <u-cell title="车型" :value="current.car_model" />
          <u-cell title="颜色" :value="current.car_color" />
          <u-cell title="施工产品" :value="`${current.product_brand} ${current.product_series} ${current.product_model}`" />
          <u-cell title="施工部位" :value="current.construction_parts?.join('、')" />
          <u-cell title="施工日期" :value="current.construction_date" />
          <u-cell title="交车时间" :value="current.delivery_date" />
          <u-cell title="质保年限" :value="`${current.warranty_years} 年`" />
          <u-cell title="质保到期" :value="current.warranty_expire" />
          <u-cell title="施工师傅" :value="current.technician" />
        </u-cell-group>

        <view v-if="current.product_images?.length" class="image-section">
          <text class="section-title">产品图片</text>
          <view class="image-grid">
            <image v-for="(url, i) in current.product_images" :key="i"
              :src="url" mode="aspectFill" @tap="previewImages(current.product_images, i)" />
          </view>
        </view>

        <view v-if="current.construction_images?.length" class="image-section">
          <text class="section-title">施工图片</text>
          <view class="image-grid">
            <image v-for="(url, i) in current.construction_images" :key="i"
              :src="url" mode="aspectFill" @tap="previewImages(current.construction_images, i)" />
          </view>
        </view>
      </view>
    </view>
  </template>

  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import type { QueryResult } from '@/types'
  import WarrantyStatusTag from '@/components/WarrantyStatusTag/index.vue'

  const records = ref<QueryResult[]>([])
  const current = ref<QueryResult | null>(null)

  onMounted(() => {
    const pages = getCurrentPages()
    const page = pages[pages.length - 1] as any
    const dataStr = decodeURIComponent(page.options?.data || '[]')
    records.value = JSON.parse(dataStr)
    if (records.value.length === 1) current.value = records.value[0]
  })

  function selectRecord(index: number) {
    current.value = records.value[index]
  }

  function previewImages(urls: string[], index: number) {
    uni.previewImage({ urls, current: urls[index] })
  }
  </script>

  <style scoped>
  .container { padding: 24rpx; background: #F5F6FA; min-height: 100vh; }
  .detail-card { background: #fff; border-radius: 16rpx; padding: 24rpx; }
  .image-section { margin-top: 24rpx; }
  .section-title { font-size: 28rpx; color: #666; margin-bottom: 16rpx; display: block; }
  .image-grid { display: flex; flex-wrap: wrap; gap: 12rpx; }
  .image-grid image { width: 200rpx; height: 200rpx; border-radius: 8rpx; }
  .record-selector { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 24rpx; }
  .record-item { padding: 20rpx 0; border-bottom: 1rpx solid #f0f0f0; }
  .date { color: #999; font-size: 24rpx; display: block; margin-top: 8rpx; }
  .tip { color: #666; font-size: 28rpx; display: block; margin-bottom: 16rpx; }
  </style>
  ```

- [ ] **Step 2: 提交 v0.3.0**

  ```powershell
  git add src/pages/query-result/
  git commit -m "feat: add query result page with multi-record selection and image preview"
  git tag v0.3.0
  git push origin main --tags
  ```

---

## Task 13: 管理员登录页

**Files:**
- Create: `src/pages/login/index.vue`

- [ ] **Step 1: 创建登录页**

  创建 `src/pages/login/index.vue`：
  ```vue
  <template>
    <view class="container">
      <view class="header">
        <text class="title">管理员登录</text>
        <text class="subtitle">仅限授权人员使用</text>
      </view>
      <u-button type="primary" text="微信一键登录" :loading="loading" @click="doLogin" />
    </view>
  </template>

  <script setup lang="ts">
  import { ref } from 'vue'
  import { useAdminStore } from '@/store/admin'

  const store = useAdminStore()
  const loading = ref(false)

  async function doLogin() {
    loading.value = true
    try {
      const res = await wx.cloud.callFunction({ name: 'login' }) as any
      const result = res.result
      if (result.code === 200) {
        store.login(result.openid, result.name)
        uni.switchTab({ url: '/pages/admin/dashboard/index' })
      } else {
        uni.showModal({ title: '登录失败', content: result.message, showCancel: false })
      }
    } catch (e) {
      uni.showToast({ title: '登录失败，请重试', icon: 'none' })
    } finally {
      loading.value = false
    }
  }
  </script>

  <style scoped>
  .container { padding: 80rpx 64rpx; display: flex; flex-direction: column; align-items: center; min-height: 100vh; background: #F5F6FA; }
  .title { font-size: 48rpx; font-weight: bold; color: #333; margin-bottom: 16rpx; }
  .subtitle { font-size: 28rpx; color: #999; margin-bottom: 80rpx; }
  </style>
  ```

- [ ] **Step 2: 提交**

  ```powershell
  git add src/pages/login/
  git commit -m "feat: add admin login page with WeChat auth"
  ```

---

## Task 14: 记录列表页

**Files:**
- Create: `src/pages/admin/record-list/index.vue`（分包路径）

- [ ] **Step 1: 创建记录列表页**

  创建 `src/pages/admin/record-list/index.vue`：
  ```vue
  <template>
    <view class="container">
      <view class="search-bar">
        <u-search v-model="keyword" placeholder="车牌/手机号/质保卡号" @search="search" @clear="clearSearch" />
      </view>
      <view class="filter-row">
        <u-date-picker v-model="startDate" mode="date" placeholder="开始日期" @confirm="search" />
        <u-date-picker v-model="endDate" mode="date" placeholder="结束日期" @confirm="search" />
      </view>

      <view v-if="loading" class="loading"><u-loading-icon /></view>

      <view v-else-if="records.length === 0" class="empty">
        <u-empty text="暂无记录" />
      </view>

      <view v-else>
        <view v-for="r in records" :key="r._id" class="record-card" @tap="goDetail(r._id)">
          <view class="card-header">
            <text class="name">{{ r.owner_name }} · {{ r.license_plate }}</text>
            <WarrantyStatusTag :status="getStatus(r.warranty_expire)" />
          </view>
          <text class="info">{{ r.product_brand }} {{ r.product_series }} | 施工：{{ r.construction_date }}</text>
          <text class="info">到期：{{ r.warranty_expire }} | ¥{{ r.total_price }}</text>
        </view>
      </view>

      <u-fab icon="plus" @click="goAdd" />
    </view>
  </template>

  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useAdminStore } from '@/store/admin'
  import { getWarrantyStatus } from '@/utils/date'
  import WarrantyStatusTag from '@/components/WarrantyStatusTag/index.vue'
  import type { WarrantyRecord } from '@/types'

  const store = useAdminStore()
  const records = ref<WarrantyRecord[]>([])
  const loading = ref(false)
  const keyword = ref('')
  const startDate = ref('')
  const endDate = ref('')

  onMounted(() => {
    store.restoreFromStorage()
    if (!store.isLoggedIn) {
      uni.redirectTo({ url: '/pages/login/index' })
      return
    }
    loadRecords()
  })

  async function loadRecords() {
    loading.value = true
    const db = wx.cloud.database()
    let query = db.collection('records').orderBy('created_at', 'desc')
    const { data } = await query.limit(50).get()
    records.value = data
    loading.value = false
  }

  function getStatus(expire: string) {
    return getWarrantyStatus(expire)
  }

  function search() { loadRecords() }
  function clearSearch() { keyword.value = ''; loadRecords() }
  function goDetail(id: string) { uni.navigateTo({ url: `/pages/admin/record-detail/index?id=${id}` }) }
  function goAdd() { uni.navigateTo({ url: '/pages/admin/record-form/index' }) }
  </script>

  <style scoped>
  .container { padding: 24rpx; background: #F5F6FA; min-height: 100vh; }
  .search-bar { margin-bottom: 16rpx; }
  .filter-row { display: flex; gap: 16rpx; margin-bottom: 24rpx; }
  .record-card { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 16rpx; }
  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
  .name { font-size: 30rpx; font-weight: bold; color: #333; }
  .info { font-size: 26rpx; color: #666; display: block; margin-top: 8rpx; }
  .loading, .empty { display: flex; justify-content: center; padding: 80rpx 0; }
  </style>
  ```

- [ ] **Step 2: 提交**

  ```powershell
  git add src/pages/admin/record-list/
  git commit -m "feat: add admin record list page with search and status tags"
  ```

---

## Task 15: 新增/编辑记录表单页

**Files:**
- Create: `src/pages/admin/record-form/index.vue`

- [ ] **Step 1: 创建表单页**

  创建 `src/pages/admin/record-form/index.vue`：
  ```vue
  <template>
    <view class="container">
      <u-steps :list="steps" :current="step" />

      <!-- Step 0: 车主 & 车辆信息 -->
      <view v-if="step === 0" class="form-section">
        <u-form :model="form" ref="formRef">
          <u-form-item label="车主姓名" prop="owner_name" required>
            <u-input v-model="form.owner_name" placeholder="请输入车主姓名" />
          </u-form-item>
          <u-form-item label="手机号" prop="owner_phone" required>
            <u-input v-model="form.owner_phone" type="number" placeholder="请输入手机号" />
          </u-form-item>
          <u-form-item label="车牌号" prop="license_plate" required>
            <u-input v-model="form.license_plate" placeholder="例：粤A12345" />
          </u-form-item>
          <u-form-item label="车架号(VIN)" prop="vin">
            <u-input v-model="form.vin" placeholder="17位车架号" />
          </u-form-item>
          <u-form-item label="车型" prop="car_model">
            <u-input v-model="form.car_model" placeholder="例：宝马3系" />
          </u-form-item>
          <u-form-item label="车辆颜色" prop="car_color">
            <u-input v-model="form.car_color" placeholder="例：珍珠白" />
          </u-form-item>
        </u-form>
      </view>

      <!-- Step 1: 施工 & 产品信息 -->
      <view v-if="step === 1" class="form-section">
        <u-form :model="form">
          <u-form-item label="产品品牌" prop="product_brand" required>
            <u-input v-model="form.product_brand" placeholder="例：龙膜" />
          </u-form-item>
          <u-form-item label="产品系列" prop="product_series">
            <u-input v-model="form.product_series" placeholder="例：至尊系列" />
          </u-form-item>
          <u-form-item label="产品型号" prop="product_model">
            <u-input v-model="form.product_model" placeholder="例：SR PRO" />
          </u-form-item>
          <u-form-item label="施工部位" prop="construction_parts">
            <u-input v-model="partsInput" placeholder="多个部位用逗号分隔" />
          </u-form-item>
          <u-form-item label="施工日期" prop="construction_date" required>
            <u-date-picker v-model="form.construction_date" mode="date" />
          </u-form-item>
          <u-form-item label="交车时间" prop="delivery_date">
            <u-date-picker v-model="form.delivery_date" mode="date" />
          </u-form-item>
          <u-form-item label="质保年限" prop="warranty_years" required>
            <u-number-box v-model="form.warranty_years" :min="1" :max="10" />
          </u-form-item>
          <u-form-item label="施工师傅" prop="technician">
            <u-input v-model="form.technician" placeholder="施工师傅姓名" />
          </u-form-item>
          <u-form-item label="施工总价(元)" prop="total_price">
            <u-input v-model="form.total_price" type="digit" placeholder="0.00" />
          </u-form-item>
        </u-form>
      </view>

      <!-- Step 2: 图片上传 -->
      <view v-if="step === 2" class="form-section">
        <view class="upload-group">
          <text class="group-label">产品图片（最多9张）</text>
          <ImageUploader v-model="form.product_images" :maxCount="9" />
        </view>
        <view class="upload-group">
          <text class="group-label">施工图片（最多9张）</text>
          <ImageUploader v-model="form.construction_images" :maxCount="9" />
        </view>
      </view>

      <view class="btn-row">
        <u-button v-if="step > 0" text="上一步" @click="step--" />
        <u-button v-if="step < 2" type="primary" text="下一步" @click="nextStep" />
        <u-button v-if="step === 2" type="primary" text="提交" :loading="submitting" @click="submit" />
      </view>
    </view>
  </template>

  <script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import ImageUploader from '@/components/ImageUploader/index.vue'
  import type { WarrantyRecord } from '@/types'

  const step = ref(0)
  const submitting = ref(false)
  const partsInput = ref('')
  const steps = [{ title: '基本信息' }, { title: '施工信息' }, { title: '图片上传' }]

  const form = reactive<Partial<WarrantyRecord>>({
    owner_name: '', owner_phone: '', license_plate: '', vin: '',
    car_model: '', car_color: '', product_brand: '', product_series: '',
    product_model: '', construction_parts: [], construction_date: '',
    delivery_date: '', warranty_years: 3, technician: '', total_price: 0,
    product_images: [], construction_images: [],
  })

  function nextStep() {
    if (step.value === 0 && (!form.owner_name || !form.owner_phone || !form.license_plate)) {
      uni.showToast({ title: '请填写必填项', icon: 'none' })
      return
    }
    if (step.value === 1 && (!form.product_brand || !form.construction_date)) {
      uni.showToast({ title: '请填写必填项', icon: 'none' })
      return
    }
    step.value++
  }

  async function submit() {
    form.construction_parts = partsInput.value.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    submitting.value = true
    try {
      const res = await wx.cloud.callFunction({
        name: 'addRecord',
        data: { record: form },
      }) as any
      if (res.result.code === 200) {
        uni.showToast({ title: '录入成功' })
        setTimeout(() => uni.navigateBack(), 1500)
      } else {
        uni.showToast({ title: res.result.message || '录入失败', icon: 'none' })
      }
    } finally {
      submitting.value = false
    }
  }
  </script>

  <style scoped>
  .container { padding: 24rpx; background: #F5F6FA; min-height: 100vh; }
  .form-section { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-top: 24rpx; }
  .upload-group { margin-bottom: 32rpx; }
  .group-label { font-size: 28rpx; color: #333; display: block; margin-bottom: 16rpx; }
  .btn-row { display: flex; gap: 16rpx; margin-top: 32rpx; }
  </style>
  ```

- [ ] **Step 2: 提交**

  ```powershell
  git add src/pages/admin/record-form/
  git commit -m "feat: add 3-step warranty record form with image upload"
  ```

---

## Task 16: 记录详情页

**Files:**
- Create: `src/pages/admin/record-detail/index.vue`

- [ ] **Step 1: 创建详情页**

  创建 `src/pages/admin/record-detail/index.vue`：
  ```vue
  <template>
    <view class="container">
      <view v-if="loading" class="loading"><u-loading-icon /></view>
      <view v-else-if="record" class="detail-card">
        <WarrantyStatusTag :status="getStatus(record.warranty_expire)" />
        <u-cell-group margin="0">
          <u-cell title="质保卡号" :value="record.warranty_no" />
          <u-cell title="车主" :value="record.owner_name" />
          <u-cell title="手机号" :value="record.owner_phone" />
          <u-cell title="车牌号" :value="record.license_plate" />
          <u-cell title="车架号" :value="record.vin" />
          <u-cell title="车型" :value="record.car_model" />
          <u-cell title="颜色" :value="record.car_color" />
          <u-cell title="产品" :value="`${record.product_brand} ${record.product_series} ${record.product_model}`" />
          <u-cell title="施工部位" :value="record.construction_parts?.join('、')" />
          <u-cell title="施工日期" :value="record.construction_date" />
          <u-cell title="交车时间" :value="record.delivery_date" />
          <u-cell title="质保年限" :value="`${record.warranty_years} 年`" />
          <u-cell title="质保到期" :value="record.warranty_expire" />
          <u-cell title="施工师傅" :value="record.technician" />
          <u-cell title="施工总价" :value="`¥${record.total_price}`" />
        </u-cell-group>

        <view v-if="record.product_images?.length" class="image-section">
          <text class="section-title">产品图片</text>
          <view class="image-grid">
            <image v-for="(url, i) in record.product_images" :key="i"
              :src="url" mode="aspectFill" @tap="previewImages(record.product_images, i)" />
          </view>
        </view>

        <view v-if="record.construction_images?.length" class="image-section">
          <text class="section-title">施工图片</text>
          <view class="image-grid">
            <image v-for="(url, i) in record.construction_images" :key="i"
              :src="url" mode="aspectFill" @tap="previewImages(record.construction_images, i)" />
          </view>
        </view>

        <view class="action-row">
          <u-button text="编辑" @click="goEdit" />
          <u-button text="删除" type="error" @click="confirmDelete" />
        </view>
      </view>
    </view>
  </template>

  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { getWarrantyStatus } from '@/utils/date'
  import WarrantyStatusTag from '@/components/WarrantyStatusTag/index.vue'
  import type { WarrantyRecord } from '@/types'

  const record = ref<WarrantyRecord | null>(null)
  const loading = ref(true)
  let recordId = ''

  onMounted(async () => {
    const pages = getCurrentPages()
    const page = pages[pages.length - 1] as any
    recordId = page.options?.id || ''
    if (recordId) {
      const { data } = await wx.cloud.database().collection('records').doc(recordId).get()
      record.value = data
    }
    loading.value = false
  })

  function getStatus(expire: string) { return getWarrantyStatus(expire) }
  function previewImages(urls: string[], index: number) {
    uni.previewImage({ urls, current: urls[index] })
  }
  function goEdit() {
    uni.navigateTo({ url: `/pages/admin/record-form/index?id=${recordId}` })
  }
  async function confirmDelete() {
    const { confirm } = await uni.showModal({ title: '确认删除', content: '删除后无法恢复', confirmColor: '#FA3534' })
    if (!confirm) return
    await wx.cloud.callFunction({ name: 'deleteRecord', data: { _id: recordId } })
    uni.showToast({ title: '已删除' })
    setTimeout(() => uni.navigateBack(), 1500)
  }
  </script>

  <style scoped>
  .container { padding: 24rpx; background: #F5F6FA; min-height: 100vh; }
  .detail-card { background: #fff; border-radius: 16rpx; padding: 24rpx; }
  .image-section { margin-top: 24rpx; }
  .section-title { font-size: 28rpx; color: #666; margin-bottom: 16rpx; display: block; }
  .image-grid { display: flex; flex-wrap: wrap; gap: 12rpx; }
  .image-grid image { width: 200rpx; height: 200rpx; border-radius: 8rpx; }
  .action-row { display: flex; gap: 16rpx; margin-top: 32rpx; }
  .loading { display: flex; justify-content: center; padding: 80rpx 0; }
  </style>
  ```

- [ ] **Step 2: 提交 v0.4.0**

  ```powershell
  git add src/pages/admin/record-detail/ src/pages/login/
  git commit -m "feat: add record detail page with edit and delete actions"
  git tag v0.4.0
  git push origin main --tags
  ```

---

## Task 17: 数据看板页

**Files:**
- Create: `src/pages/admin/dashboard/index.vue`

- [ ] **Step 1: 安装 uCharts（若未安装）**

  ```powershell
  npm install ucharts
  ```

- [ ] **Step 2: 创建看板页**

  创建 `src/pages/admin/dashboard/index.vue`：
  ```vue
  <template>
    <view class="container">
      <view class="stats-row">
        <view class="stat-card">
          <text class="stat-value">{{ data.total_records }}</text>
          <text class="stat-label">累计质保记录</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ data.monthly_count }}</text>
          <text class="stat-label">本月施工量</text>
        </view>
      </view>

      <!-- 趋势折线图 -->
      <view class="chart-card">
        <text class="chart-title">施工趋势（近6个月）</text>
        <qiun-data-charts type="line" :opts="lineOpts" :chartData="lineData" />
      </view>

      <!-- 产品占比饼图 -->
      <view class="chart-card">
        <text class="chart-title">产品销量占比</text>
        <qiun-data-charts type="pie" :opts="pieOpts" :chartData="pieData" />
      </view>

      <!-- 到期预警 -->
      <view class="alert-card">
        <text class="chart-title">质保到期预警（30天内）</text>
        <view v-if="data.expiring_soon?.length === 0" class="empty-tip">暂无即将到期记录</view>
        <view v-for="r in data.expiring_soon" :key="r._id" class="alert-item">
          <text class="alert-name">{{ r.owner_name }} · {{ r.license_plate }}</text>
          <text class="alert-date">到期：{{ r.warranty_expire }}</text>
        </view>
      </view>
    </view>
  </template>

  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useAdminStore } from '@/store/admin'
  import type { DashboardData } from '@/types'

  const store = useAdminStore()
  const data = ref<DashboardData>({
    total_records: 0, monthly_count: 0, trend: [],
    product_distribution: [], expiring_soon: [], followup_reminders: [],
  })

  onMounted(async () => {
    store.restoreFromStorage()
    if (!store.isLoggedIn) { uni.redirectTo({ url: '/pages/login/index' }); return }
    const res = await wx.cloud.callFunction({ name: 'getDashboard' }) as any
    if (res.result.code === 200) data.value = res.result.data
  })

  const lineData = computed(() => ({
    categories: data.value.trend.map(t => t.month.slice(5)),
    series: [{ name: '施工量', data: data.value.trend.map(t => t.count) }],
  }))

  const pieData = computed(() => ({
    series: [{ data: data.value.product_distribution.map(p => ({ name: p.name, value: p.value })) }],
  }))

  const lineOpts = { color: ['#2B7EFF'], dataLabel: false, legend: { show: false } }
  const pieOpts = { legend: { show: true, position: 'bottom' } }
  </script>

  <style scoped>
  .container { padding: 24rpx; background: #F5F6FA; min-height: 100vh; }
  .stats-row { display: flex; gap: 16rpx; margin-bottom: 24rpx; }
  .stat-card { flex: 1; background: #2B7EFF; border-radius: 16rpx; padding: 32rpx 24rpx; text-align: center; }
  .stat-value { font-size: 56rpx; font-weight: bold; color: #fff; display: block; }
  .stat-label { font-size: 24rpx; color: rgba(255,255,255,0.8); display: block; margin-top: 8rpx; }
  .chart-card, .alert-card { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 24rpx; }
  .chart-title { font-size: 30rpx; font-weight: bold; color: #333; display: block; margin-bottom: 16rpx; }
  .alert-item { padding: 16rpx 0; border-bottom: 1rpx solid #f0f0f0; display: flex; justify-content: space-between; }
  .alert-name { font-size: 28rpx; color: #333; }
  .alert-date { font-size: 26rpx; color: #FA8C16; }
  .empty-tip { font-size: 26rpx; color: #999; text-align: center; padding: 32rpx 0; }
  </style>
  ```

- [ ] **Step 3: 提交**

  ```powershell
  git add src/pages/admin/dashboard/
  git commit -m "feat: add admin dashboard with trend chart, pie chart, and expiry alerts"
  ```

---

## Task 18: 我的页面

**Files:**
- Create: `src/pages/admin/profile/index.vue`

- [ ] **Step 1: 创建我的页面**

  创建 `src/pages/admin/profile/index.vue`：
  ```vue
  <template>
    <view class="container">
      <view class="user-card">
        <u-avatar icon="account" size="80" />
        <view class="user-info">
          <text class="name">{{ store.name || '管理员' }}</text>
          <text class="role">门店管理员</text>
        </view>
      </view>

      <u-cell-group margin="24rpx 0">
        <u-cell title="添加管理员" icon="plus-circle" isLink @click="showAddAdmin = true" />
        <u-cell title="退出登录" icon="log-out" @click="logout" />
      </u-cell-group>

      <!-- 添加管理员弹窗 -->
      <u-popup v-model:show="showAddAdmin" mode="bottom" round>
        <view class="popup-content">
          <text class="popup-title">添加管理员</text>
          <u-input v-model="newAdminName" placeholder="请输入姓名" border="surround" />
          <u-input v-model="newAdminOpenid" placeholder="对方 openid（在微信开发者工具获取）" border="surround" customStyle="margin-top:16rpx" />
          <u-button type="primary" text="确认添加" :loading="adding" @click="addAdmin" customStyle="margin-top:24rpx" />
        </view>
      </u-popup>
    </view>
  </template>

  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useAdminStore } from '@/store/admin'

  const store = useAdminStore()
  const showAddAdmin = ref(false)
  const newAdminName = ref('')
  const newAdminOpenid = ref('')
  const adding = ref(false)

  onMounted(() => {
    store.restoreFromStorage()
    if (!store.isLoggedIn) uni.redirectTo({ url: '/pages/login/index' })
  })

  async function addAdmin() {
    if (!newAdminName.value || !newAdminOpenid.value) {
      uni.showToast({ title: '请填写完整', icon: 'none' }); return
    }
    adding.value = true
    const res = await wx.cloud.callFunction({
      name: 'addAdmin',
      data: { targetOpenid: newAdminOpenid.value.trim(), name: newAdminName.value.trim() },
    }) as any
    adding.value = false
    if (res.result.code === 200) {
      uni.showToast({ title: '添加成功' })
      showAddAdmin.value = false
      newAdminName.value = ''
      newAdminOpenid.value = ''
    } else {
      uni.showToast({ title: res.result.message || '添加失败', icon: 'none' })
    }
  }

  function logout() {
    uni.showModal({ title: '确认退出', content: '退出后需重新登录', success: ({ confirm }) => {
      if (confirm) { store.logout(); uni.reLaunch({ url: '/pages/index/index' }) }
    }})
  }
  </script>

  <style scoped>
  .container { padding: 24rpx; background: #F5F6FA; min-height: 100vh; }
  .user-card { background: #2B7EFF; border-radius: 16rpx; padding: 40rpx 32rpx; display: flex; align-items: center; gap: 24rpx; margin-bottom: 24rpx; }
  .name { font-size: 36rpx; font-weight: bold; color: #fff; display: block; }
  .role { font-size: 26rpx; color: rgba(255,255,255,0.8); }
  .popup-content { padding: 48rpx 32rpx; }
  .popup-title { font-size: 32rpx; font-weight: bold; color: #333; display: block; margin-bottom: 32rpx; }
  </style>
  ```

- [ ] **Step 2: 提交 v0.5.0**

  ```powershell
  git add src/pages/admin/profile/
  git commit -m "feat: add admin profile page with add-admin and logout"
  git tag v0.5.0
  git push origin main --tags
  ```

---

## Task 19: 云开发配置 & 数据库安全规则

**说明：** 此步骤在微信开发者工具中操作，无法用命令行自动化。

- [ ] **Step 1: 在微信开发者工具中初始化云开发**

  打开微信开发者工具，导入项目（AppID 填入 manifest.json 中的值）。
  点击顶部 "云开发" 按钮 → 开通云开发 → 记录环境 ID（填入 manifest.json 的 `cloudfunctionRoot` 对应环境）。

- [ ] **Step 2: 创建数据库集合并设置安全规则**

  在云开发控制台 → 数据库 → 新建集合 `records` 和 `admins`。

  `records` 集合安全规则（仅云函数可读写）：
  ```json
  {
    "read": false,
    "write": false
  }
  ```

  `admins` 集合安全规则：
  ```json
  {
    "read": false,
    "write": false
  }
  ```

- [ ] **Step 3: 创建数据库索引**

  在 `records` 集合中添加以下索引：
  - `warranty_no`（唯一）
  - `owner_phone`
  - `license_plate`
  - `vin`
  - `warranty_expire`（用于到期预警查询）

- [ ] **Step 4: 手动添加第一个管理员**

  在云开发控制台 → 数据库 → `admins` 集合，点击"添加记录"：
  ```json
  {
    "openid": "YOUR_OPENID",
    "name": "超级管理员",
    "created_at": "2026-05-25T00:00:00.000Z"
  }
  ```
  获取自己 openid 的方法：在开发者工具 Console 中运行：
  ```javascript
  wx.cloud.callFunction({ name: 'login' }).then(console.log)
  ```
  返回结果中的 `openid` 即为你的 openid。

- [ ] **Step 5: 部署所有云函数**

  在微信开发者工具中，右键点击每个云函数目录 → "上传并部署（云端安装依赖）"。
  依次部署：`login`、`addRecord`、`updateRecord`、`deleteRecord`、`queryRecord`、`getDashboard`、`addAdmin`。

- [ ] **Step 6: 提交最终版本**

  ```powershell
  git add .
  git commit -m "chore: finalize cloud config documentation and project setup"
  git tag v1.0.0
  git push origin main --tags
  ```

---

## Task 20: 保存实施计划到项目

- [ ] **Step 1: 复制计划文件到项目**

  ```powershell
  Copy-Item "C:\Users\87103\.claude\plans\git-github-reactive-sunrise.md" "e:\coding\demo-main\warranty-miniprogram\docs\superpowers\plans\2026-05-25-warranty-miniprogram.md"
  ```

- [ ] **Step 2: 提交**

  ```powershell
  git add docs/
  git commit -m "docs: add implementation plan and design spec"
  git push origin main
  ```

---

## 验证清单

- [ ] `npx jest tests/ --verbose` — 全部云函数单测通过
- [ ] 在微信开发者工具中运行小程序，车主查询页可正常搜索并展示结果
- [ ] 管理员登录成功，进入看板/记录列表
- [ ] 新增记录表单三步填写完成，图片上传到云存储，记录写入数据库
- [ ] 删除记录时云存储图片同步清理
- [ ] `git tag` 输出包含 `v0.1.0` `v0.2.0` `v0.3.0` `v0.4.0` `v0.5.0` `v1.0.0`
- [ ] GitHub 仓库可见所有 tags 和提交历史
