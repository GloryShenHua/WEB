# 算法与复杂度可视化学习平台 — 项目综合文档

> 版本 1.0.0 | 2026-06-06 | Angular 17 + Spring Boot 3.2 + MySQL

---

## 目录

1. [项目概述](#1-项目概述)
2. [需求分析](#2-需求分析)
3. [系统设计](#3-系统设计)
4. [实现细节](#4-实现细节)
5. [部署与运行](#5-部署与运行)
6. [使用指南](#6-使用指南)
7. [API 参考](#7-api-参考)
8. [数据库设计](#8-数据库设计)
9. [文件清单](#9-文件清单)

---

## 1. 项目概述

### 1.1 项目定位

算法与复杂度可视化学习平台（Algorithm Visualization Learning Platform）是一个交互式 Web 应用，通过**分步可视化**的方式展示经典算法的执行过程。平台覆盖排序、搜索、图遍历、动态规划、回溯、分治六大类共 17 种算法，并提供**教学阶段引导**、**对比模式**、**评估测试**和 **AI 复杂度分析**等教学辅助功能，将传统"看见结果"的可视化工具升级为"看见过程"的学习平台。

### 1.2 核心能力

| 能力 | 说明 |
|------|------|
| 算法执行过程可视化 | 17 种算法的每一步状态变化通过柱状图、SVG 图形、DP 表格、棋盘等直观展示 |
| 教学过程分解（Phase） | 每种算法的执行过程被划分为离散的教学阶段，以进度条形式向学习者展示"算法进行到哪一步了" |
| 双算法对比模式 | 同时运行两个同分类算法，左右并排展示，实时对比步数、比较次数、操作次数 |
| 评估测试系统 | 5 道算法理解题，覆盖 5 个分类，支持自动判分和解析展示 |
| AI 复杂度分析 | 接入大语言模型，对用户自定义算法代码进行时间/空间复杂度分析 |
| 3D 数据结构可视化 | 基于 Three.js 的 3D 渲染引擎，可视化数组、栈、队列、链表、二叉树、B+ 树 |
| 用户认证系统 | 注册/登录功能，SHA-256 加盐哈希存储密码 |
| 运行历史记录 | 自动保存每次算法运行的参数、结果和性能数据，可按分类筛选 |

### 1.3 技术栈

```
前端：Angular 17 (Standalone Components) + TypeScript 5.4 + Tailwind CSS 3.4 + Three.js 0.184
后端：Spring Boot 3.2.3 + Java 17 + Spring Data JPA + MySQL Connector
数据库：MySQL 8.0
AI 服务：并行智算云 DeepSeek-V3.2 (兼容 OpenAI 格式)
```

---

## 2. 需求分析

### 2.1 功能需求

#### FR1: 算法运行与可视化
- **FR1.1** 支持 6 大分类 17+ 种算法的运行，包括：快速排序、归并排序、冒泡排序、堆排序、插入排序、二分查找、Dijkstra 最短路、BFS 宽度优先搜索、DFS 深度优先搜索、Prim 最小生成树、Kruskal 最小生成树、A\* 寻路、0/1 背包、N 皇后问题、Karatsuba 大整数乘法、3D 数据结构可视化
- **FR1.2** 每种算法生成完整的分步执行序列，每步包含描述文本、关联的伪代码行、指标计数
- **FR1.3** 支持逐步前进/后退、自动播放（可调速度）、进度跳转
- **FR1.4** 每个分类配有专属的可视化渲染器：排序→柱状图、图→SVG 节点/边、搜索→数组高亮、DP→二维表格、回溯→棋盘网格、分治→递归树

#### FR2: 教学阶段引导（Learning Guidance）
- **FR2.1** 为每种算法定义离散的教学阶段（phase），如快速排序的 `select_pivot → compare → swap → pivot_placed → done`
- **FR2.2** 阶段进度条实时显示当前所处阶段、已完成阶段、未到达阶段
- **FR2.3** 每个阶段配有中文标签，降低理解门槛

#### FR3: 对比模式
- **FR3.1** 允许用户选择同一分类内的两个算法进行并排对比
- **FR3.2** 一个播放控制器同时推进两个算法的步骤
- **FR3.3** 对比指标面板实时显示步数、比较次数、操作次数，绿色高亮表现更优的一方

#### FR4: 评估测试
- **FR4.1** 5 道理解题，覆盖 sorting、search、graph、dp 四个分类
- **FR4.2** 支持多种题型：数值填空、状态填空、路径填空、表格填空
- **FR4.3** 自动判分：简单题型前端直接比对，复杂题型调用后端 verify-step 端点获取标准答案
- **FR4.4** 每题提交后显示正确/错误反馈和详细解析
- **FR4.5** 完成后总分卡片展示（满分 5 分），支持重新测试

#### FR5: AI 复杂度分析
- **FR5.1** 用户输入任意语言的算法代码，选择关注的分析场景（最坏/平均/最好情况）
- **FR5.2** 调用大语言模型分析时间和空间复杂度，返回结构化的 JSON 结果
- **FR5.3** 结果包含推理步骤、假设前提、优化建议、置信度

#### FR6: 3D 数据结构可视化
- **FR6.1** 基于 Three.js 渲染数组、栈、队列、链表、二叉树、B+ 树六种数据结构的 3D 模型
- **FR6.2** 每个结构有独立的 3D 渲染器和动画系统
- **FR6.3** 支持随机生成数据

#### FR7: 用户认证
- **FR7.1** 用户注册（用户名、显示名、密码）
- **FR7.2** 用户登录
- **FR7.3** 密码使用 SHA-256(salt + ":" + password) 加盐哈希存储

#### FR8: 运行历史
- **FR8.1** 自动记录每次算法运行的类别、算法名、输入参数、步数、比较次数、操作次数、耗时
- **FR8.2** 按分类筛选历史
- **FR8.3** 删除历史记录

### 2.2 非功能需求

| 类别 | 要求 |
|------|------|
| 性能 | 排序算法支持最多 100 个元素的实时可视化；图算法支持 20 节点以内的流畅渲染 |
| 可用性 | 响应式布局，支持现代浏览器（Chrome 90+, Edge 90+, Firefox 90+） |
| 可靠性 | 后端错误友好提示（"请确认后端服务已启动"），前端 loading/empty/error 三态覆盖 |
| 安全性 | 密码加盐哈希存储，CORS 限制 localhost:4200，N 皇后 N 上限 12 防止资源耗尽 |
| 可维护性 | 单体架构，分层清晰（Controller → Service → Repository），前后端分离 |

### 2.3 用户角色

- **学习者**：核心用户。通过可视化理解算法原理，使用评估测试自检学习效果
- **教师/助教**：可借助对比模式在课堂上演示不同算法的效率差异
- **开发者**：可使用 AI 复杂度分析快速估算自定义算法的复杂度

---

## 3. 系统设计

### 3.1 整体架构

```
┌────────────────────────────────────────────────────────────────────┐
│                     浏览器 (localhost:4200)                         │
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │  Sidebar │  │  Control │  │  Phase    │  │  Visualizers     │  │
│  │  算法选择 │  │  Panel   │  │  Guide    │  │  6 个可视化组件   │  │
│  │  对比开关 │  │  播放控制 │  │  阶段引导  │  │  + 3D VR 组件   │  │
│  └──────────┘  └──────────┘  └───────────┘  └──────────────────┘  │
│                                                                    │
│                 AlgorithmStore (Signal-based State)                 │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐   │
│  │  Assessment  │  │  History     │  │  AI Complexity         │   │
│  │  Component   │  │  Panel       │  │  Dialog                │   │
│  └──────────────┘  └──────────────┘  └────────────────────────┘   │
└──────────────────────────────┬─────────────────────────────────────┘
                               │ HTTP POST/GET (JSON)
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│                Spring Boot 3.2 (localhost:8080)                     │
│                                                                    │
│  ┌──────────────────┐  ┌──────────────────────────────────────┐   │
│  │  AuthController  │  │  AlgorithmController                  │   │
│  │  /api/auth       │  │  /api/algorithms                      │   │
│  │  register/login  │  │  sort|search|graph|dp|backtracking    │   │
│  │                  │  │  divide-conquer|verify-step|history   │   │
│  └──────────────────┘  └───────────────┬──────────────────────┘   │
│                                        │                           │
│  ┌─────────────────────────────────────┼──────────────────────┐   │
│  │                    Service Layer     │                       │   │
│  │  AuthService  SortingService  SearchService  GraphService  │   │
│  │  DPService  BacktrackingService  DivideConquerService      │   │
│  │  AlgorithmComplexityService                                │   │
│  └─────────────────────────────────────┼──────────────────────┘   │
│                                        │                           │
│  ┌─────────────────────────────────────┼──────────────────────┐   │
│  │              Repository / Entity     │                       │   │
│  │  AppUserRepository  RunHistoryRepository                    │   │
│  │  AppUser (JPA Entity)  RunHistory (JPA Entity)             │   │
│  └─────────────────────────────────────┼──────────────────────┘   │
│                                        │                           │
└────────────────────────────────────────┼───────────────────────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │   MySQL 8.0          │
                              │   algorithm_viz 库   │
                              │   - app_user         │
                              │   - run_history      │
                              └─────────────────────┘
```

### 3.2 架构决策记录（ADR）

#### ADR-1: 单 Controller 多 endpoint 模式

**决策**：所有算法相关端点集中在 `AlgorithmController`，按分类使用不同 endpoint（`/sort`, `/search`, `/graph`, `/dp`, `/backtracking`, `/divide-conquer`），而非每种算法一个端点。

**原因**：
- 同一分类的算法共享相同的输入/输出结构（如所有排序算法都接收 `int[]`，返回 `List<SortStep>`）
- 减少路由注册数量，降低 Controller 层维护成本
- 算法选择通过请求体中的 `algorithm` 字段区分，前端侧边栏直接绑定

#### ADR-2: 信号驱动的状态管理

**决策**：前端使用 Angular Signals 构建自定义 `AlgorithmStore`，不使用 NgRx 等第三方状态管理库。

**原因**：
- Angular 17+ 的 Signals API 已足够成熟，提供细粒度的响应式更新
- 减少依赖，降低打包体积
- `computed()` 天然适合派生状态（如 `currentStepData`、`phaseConfig`、`compareMetrics`）

#### ADR-3: Step 模型使用手动 Builder 模式

**决策**：后端所有 Step 模型类（SortStep、GraphStep 等）使用手动实现 Builder，不引入 Lombok `@Builder`。

**原因**：
- 避免与 Lombok 的过渡耦合（项目初期未引入 Lombok，后续添加但仅用于 `@Data` 等注解）
- 手动 Builder 对外部依赖零要求，Java 17 编译即用
- 每个 Step 字段约 10-15 个，手动维护 Builder 的工作量可控

#### ADR-4: Phase 使用字符串而非枚举

**决策**：教学阶段（phase）在后端 Step 模型和前端接口中统一使用 `String` 类型。

**原因**：
- 不同算法有不同的阶段集合，枚举不适合表达开放集合
- 字符串在 JSON 序列化中零转换成本
- 前端 `PHASE_CONFIG` 常量表负责阶段的中文翻译和顺序定义

#### ADR-5: 对比模式限制同分类

**决策**：对比模式仅允许选择与主算法同一 category 的算法。

**原因**：
- 不同分类共享不同的可视化器（柱状图 vs SVG vs 表格），跨分类对比需要同时渲染两种不同的可视化器
- 同分类限制保持了布局的简洁性（左右对半分割）
- 教学上也有意义：快速排序 vs 归并排序 是排序算法内部效率对比

### 3.3 数据流

```
用户操作                    Store                         HTTP                     Backend
─────────                  ──────                        ──────                   ───────
点击"快速排序"
  ─────────────────►  selectedAlgo.set('quick-sort')
                      category = computed → 'sorting'

点击"运行"
  ─────────────────►  runAlgorithm()
                      isLoading.set(true)
                            ───────────────────────────►  POST /sort
                                                         {algorithm, array}
                                                                              SortingService
                                                                              .generateSteps()
                                                                                 │
                                                                                 ▼
                                                                              返回 200
                                                                     { steps: [...], stepCount,
                                                                       comparisons, extra,
                                                                       executionTimeMs }
                         ◄─────────────────────────────
                      steps.set(response.steps)
                      currentStep.set(0)
                      isLoading.set(false)

点击"▶ 播放"
  ─────────────────►  togglePlay()
                      setInterval → stepForward()
                      currentStep.update(s → s+1)

currentStep 变化
  ─────────────────►  currentStepData (computed)
                          │
                          ▼
                      VisualizerComponent
                      读取 step 数据，更新渲染
                      (柱状图颜色、图节点状态等)

phase 变化检测
  ─────────────────►  currentPhase (computed)
                      phaseConfig (computed)
                          │
                          ▼
                      PhaseGuideComponent
                      更新阶段进度条
```

### 3.4 组件树

```
AppComponent
├── AuthComponent                          ← 登录/注册表单
├── Header                                 ← Logo + Tab导航 + 用户头像 + 退出
│   └── Tabs: [可视化 | 评估测试 | 历史记录 | AI复杂度分析]
├── ErrorBanner                            ← 错误提示横幅
├── SidebarComponent                       ← 算法分类列表
│   ├── 分类标题（排序/搜索/图/DP/回溯/分治/3D数据结构）
│   ├── 算法按钮列表
│   └── ⚖ 对比模式开关 + 对比算法选择器
├── Main Content
│   ├── ControlPanelComponent              ← 播放/暂停/上一步/下一步/速度/进度条
│   ├── InputConfigComponent               ← 输入编辑（数组/图/背包参数等）
│   ├── PhaseGuideComponent                ← 教学阶段进度条
│   ├── CompareMetricsPanel                ← 对比模式指标（条件显示）
│   ├── ComplexityPanelComponent           ← 复杂度信息卡片（非对比模式）
│   ├── Visualizer (7种, 按 category 条件渲染)
│   │   ├── SortingVisualizerComponent     ← 柱状图
│   │   ├── GraphVisualizerComponent       ← SVG 图
│   │   ├── SearchVisualizerComponent      ← 数组 + 搜索指示器
│   │   ├── DpVisualizerComponent          ← 二维 DP 表格
│   │   ├── NQueensVisualizerComponent     ← 棋盘 + 皇后
│   │   ├── DivideConquerVisualizerComponent ← 递归树
│   │   └── Vr3dVisualizerComponent        ← Three.js 3D 渲染
│   ├── HistoryPanelComponent              ← 运行历史列表（Tab 切换）
│   └── AssessmentComponent                ← 5 题评估测试（Tab 切换）
└── AiComplexityDialogComponent            ← AI 复杂度分析弹窗（条件显示）
```

### 3.5 后端分层设计

```
Controller 层
├── AlgorithmController
│   ├── POST /api/algorithms/sort           → SortingService
│   ├── POST /api/algorithms/search         → SearchService
│   ├── POST /api/algorithms/graph          → GraphService
│   ├── POST /api/algorithms/dp             → DPService
│   ├── POST /api/algorithms/backtracking   → BacktrackingService
│   ├── POST /api/algorithms/divide-conquer → DivideConquerService
│   ├── POST /api/algorithms/algorithm-complexity → AlgorithmComplexityService
│   ├── POST /api/algorithms/verify-step    → 各 Service (按需路由)
│   ├── GET  /api/algorithms/history        → RunHistoryRepository
│   ├── DELETE /api/algorithms/history/{id} → RunHistoryRepository
│   └── GET  /api/algorithms/health
├── AuthController
│   ├── POST /api/auth/register             → AuthService
│   └── POST /api/auth/login                → AuthService

Service 层
├── SortingService        → 5 种排序算法的步骤生成
├── SearchService         → 二分查找步骤生成
├── GraphService          → 6 种图算法步骤生成 (Dijkstra/BFS/DFS/Prim/Kruskal/A*)
├── DPService             → 0/1 背包 DP 步骤生成
├── BacktrackingService   → N 皇后回溯步骤生成
├── DivideConquerService  → Karatsuba 大整数乘法步骤生成
├── AlgorithmComplexityService → AI 大模型复杂度分析
└── AuthService           → 用户注册/登录 + SHA-256 加盐哈希

Model 层
├── SortStep.java         → 排序步骤（array, comparing, swapping, sorted, pivot, phase...）
├── SearchStep.java       → 搜索步骤（array, left, right, mid, found, eliminated, phase...）
├── GraphStep.java        → 图步骤（nodeStates, edgeStates, distances, queue, path, phase...）
├── DPStep.java           → DP 步骤（dp[][], currentItem, currentWeight, decision, phase...）
├── NQueensStep.java      → 回溯步骤（board[], currentRow, conflicts, solutions, phase...）
├── DivideConquerStep.java → 分治步骤（tree, currentNodeId, a/b/c/d, z2/z1/z0, phase...）
└── AlgorithmComplexityAnalysis.java → AI 复杂度分析结果

Entity 层
├── AppUser.java          → JPA 实体（id, username, displayName, passwordHash, passwordSalt）
└── RunHistory.java       → JPA 实体（id, category, algorithm, inputData, stepCount, comparisons...）

DTO 层
├── SortRequest.java
├── SearchRequest.java
├── GraphRequest.java     → 含内嵌 GraphData/GraphNodeDto/GraphEdgeDto
├── DPRequest.java        → 含内嵌 KnapsackItemDto
├── BacktrackingRequest.java
├── DivideConquerRequest.java
├── AlgorithmComplexityRequest.java
├── AuthRequest.java
├── AuthResponse.java
└── RegisterRequest.java

Repository 层
├── AppUserRepository.java     → findByUsername, existsByUsername
└── RunHistoryRepository.java  → findByCategoryOrderByCreatedAtDesc, findTop20ByOrderByCreatedAtDesc
```

---

## 4. 实现细节

### 4.1 算法步骤生成机制

每种算法的 Service 遵循统一的"步骤生成"模式：

1. **初始化步骤**：创建初始状态，定义空的计数器（comparisons, swaps, accesses 等），生成第一条描述步骤
2. **算法执行 + 步骤记录**：在算法的每次关键操作后，使用 Builder 构建一个 Step 对象并加入 steps 列表
3. **完成步骤**：生成最终状态步骤，通常包含 `"done"` phase
4. **返回步骤列表**：Controller 将 steps 包装为统一响应格式返回

以快速排序为例：

```
quickSort(input) {
  steps = []
  初始化计数器
  调用 quickSortHelper(arr, 0, n-1, sorted, cmp, swp, acc, steps)
    其中 partition() 在每个关键点构建 SortStep:
      - 选择基准值 (select_pivot)
      - 比较元素 (compare)
      - 交换元素 (swap)
      - 基准值归位 (pivot_placed)
  生成 done 步骤
  返回 steps
}
```

### 4.2 Phase 教学阶段系统

每种算法的 phase 在两端各定义一次：

- **后端**：在 Service 中构建 Step 时标注 `phase("xxx")`，确保每个步骤携带阶段标记
- **前端**：`AlgorithmStore` 中 `PHASE_CONFIG` 常量表定义每种算法的阶段序列和中文标签

```typescript
// 前端配置示例
'quick-sort': {
  sequence: ['select_pivot', 'compare', 'swap', 'pivot_placed', 'done'],
  labels: {
    select_pivot: '选择基准值', compare: '比较分区',
    swap: '交换元素', pivot_placed: '基准值归位', done: '排序完成',
  },
},
```

`PhaseGuideComponent` 读取 `store.currentPhase()` 确定当前阶段索引，渲染阶段进度条。

### 4.3 对比模式实现

对比模式的核心组件：

1. **第二套状态信号**（`compareSteps`, `compareCurrentStep`, `compareIsPlaying` 等）在 `AlgorithmStore` 中独立管理
2. **播放同步**：`togglePlay()` 同时启动/停止两个定时器
3. **双请求**：`runBothAlgorithms()` 同时向后端发送两个请求，前端用 `forkJoin` 或独立的 subscribe 处理
4. **可视化器复用**：每个 Visualizer 新增 `@Input() source: 'primary' | 'compare' = 'primary'`，通过 `source` 决定读取 `store.currentStepData()` 还是 `store.compareCurrentStepData()`
5. **布局切换**：AppComponent 在对比模式下将主内容区从全宽切换为左右 50% 分栏

### 4.4 评估测试系统

**题目数据**：5 道题定义在 `frontend/src/app/data/test-scenarios.ts` 的 `TEST_SCENARIOS` 数组中，每道题包含：

```typescript
interface TestScenario {
  id: number;           // 题目编号
  title: string;        // 题目标题
  category: AlgorithmCategory;  // 所属分类
  algorithm: AlgorithmId;      // 具体算法
  questionType: 'value-fill' | 'state-fill' | 'path-fill' | 'table-fill' | 'choice';
  description: string;  // 题目描述
  inputParams: Record<string, unknown>;  // 算法输入参数
  answer: unknown;      // 标准答案
  options?: string[];   // 选择题选项
  explanation: string;  // 解析
  targetStepIndex?: number;  // 后端验证取第几步
  verifyField?: string;      // 后端验证取哪个字段
}
```

**判分流程**：
- `value-fill` / `choice` → 前端直接比对，字符串标准化后比较
- `state-fill` / `table-fill` → 调用 `POST /api/algorithms/verify-step` 获取标准答案后比对
- `path-fill` → 标准化空白后比较路径字符串

**后端 `verify-step` 端点**：接收 `{ algorithm, params, targetStepIndex }`，运行为该算法，返回指定索引位置的步骤数据。

### 4.5 AI 复杂度分析

`AlgorithmComplexityService` 通过 RestClient 调用并行智算云提供的 LLM API（兼容 OpenAI 格式）：

1. 构造 System Prompt："你是算法复杂度分析助手..."
2. 构造 User Prompt：包含用户代码、语言类型、分析场景（最坏/平均/最好）
3. 请求 `response_format: { type: "json_object" }` 确保返回 JSON
4. 解析响应，提取 `timeComplexityWorst/Average/Best`, `spaceComplexity`, `reasoningSteps`, `assumptions`, `optimizationSuggestions`, `confidence`
5. 异常处理：API 不可用或解析失败时返回友好错误信息

### 4.6 用户认证系统

- **密码安全**：SHA-256(salt + ":" + password)，salt 为 `SecureRandom` 生成的 16 字节随机数
- **密码比较**：使用 `MessageDigest.isEqual()` 进行常量时间比较，防止时序攻击
- **会话管理**：前端 `AuthStore` 在内存中保存登录用户信息（id, username, displayName），不持久化 Token
- **简单设计**：无 JWT、无 Session Cookie，适合教学/学习场景

### 4.7 3D 数据结构可视化

采用分层架构：

```
Vr3dVisualizerComponent (Angular 容器)
  └── Three.js Scene (渲染管线)
      ├── ThreeObjectFactory.ts     — 3D 对象工厂（立方体、球体、连接线）
      ├── ArrayRenderer.ts          — 一维数组渲染
      ├── StackRenderer.ts           — 栈（垂直堆叠）
      ├── QueueRenderer.ts           — 队列（水平排列+出入动画）
      ├── LinkedListRenderer.ts      — 链表（节点+箭头）
      ├── BinaryTreeRenderer.ts      — 完全二叉树
      └── BPlusTreeRenderer.ts       — B+ 树
```

每个 Renderer 实现统一的 `StructureAnimator` 接口，负责：
- 根据输入数据生成 3D 对象
- 管理节点的增删改动画
- 处理鼠标交互（旋转、缩放）

### 4.8 统一响应格式

所有 POST 端点返回统一 JSON 结构：

```json
{
  "steps": [...],           // 步骤列表（类型随分类不同）
  "stepCount": 45,          // 步骤总数
  "comparisons": 120,       // 比较次数（核心指标）
  "extra": 15,              // 附加操作次数（排序→swaps, 回溯→backtracks, 分治→additions）
  "executionTimeMs": 12     // 后端计算耗时（毫秒）
}
```

### 4.9 错误处理策略

| 层级 | 策略 |
|------|------|
| 前端 HTTP | `AlgorithmService` 每个方法的 `.subscribe()` 均提供 error handler，设置 `store.error` 为中文提示 |
| 前端校验 | 输入参数（N 皇后 1-12、背包容量>0 等）在 InputConfig 组件中限制范围 |
| 后端校验 | DTO 使用 `jakarta.validation` 注解（`@NotNull`, `@NotEmpty`, `@Positive`, `@Min/@Max`） |
| 后端异常 | Service 层 `IllegalArgumentException` 返回 400 + 英文错误信息 |
| CORS | 仅允许 `http://localhost:4200`，防止跨站请求 |

---

## 5. 部署与运行

### 5.1 环境要求

| 组件 | 版本要求 | 说明 |
|------|---------|------|
| JDK | 17+ | 编译和运行 Spring Boot 3.2 |
| Maven | 3.8+ | 后端构建和依赖管理 |
| Node.js | 18+ | 前端构建和 Angular CLI |
| npm | 9+ | 前端依赖管理 |
| MySQL | 8.0+ | 持久化用户数据和运行历史 |
| Angular CLI | 17.x | 前端开发服务器和构建 |

### 5.2 数据库初始化

```bash
# 1. 启动 MySQL 服务
# 2. 创建数据库
mysql -u root -e "CREATE DATABASE IF NOT EXISTS algorithm_viz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

JPA 的 `ddl-auto=update` 会在应用启动时自动创建/更新数据表（`app_user`, `run_history`），无需手动执行 SQL 脚本。

### 5.3 后端配置

编辑 `backend/src/main/resources/application.properties`：

```properties
# 必填：数据库密码
spring.datasource.password=你的MySQL密码

# 可选：AI API Key（不配置则 AI 复杂度分析功能不可用）
ai.complexity.api-key=你的API密钥
```

### 5.4 后端启动

```bash
cd backend
mvn spring-boot:run
# 启动日志中看到：Tomcat started on port 8080
# 验证：curl http://localhost:8080/api/algorithms/health
```

### 5.5 前端配置

`frontend/src/environments/environment.ts`（开发环境）：

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
};
```

Angular CLI 开发服务器默认通过 `proxy.conf.json` 或将 `/api` 请求代理到 `localhost:8080`。注意：当前配置中前端直接请求完整 URL，不依赖代理。

### 5.6 前端启动

```bash
cd frontend
npm install        # 首次运行需安装依赖
npm start          # 启动于 http://localhost:4200
```

### 5.7 生产构建

```bash
# 后端
cd backend
mvn clean package -DskipTests
# 产物：backend/target/algorithm-viz-backend-1.0.0.jar
java -jar target/algorithm-viz-backend-1.0.0.jar &

# 前端
cd frontend
npm run build
# 产物：frontend/dist/algorithm-viz-frontend/
# 部署到 Nginx 或任何静态文件服务器
```

### 5.8 Docker 部署（推荐）

```bash
# 在项目根目录创建 docker-compose.yml:
```

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: algorithm_viz
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/algorithm_viz?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: root123
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

### 5.9 健康检查

```bash
# 后端
curl http://localhost:8080/api/algorithms/health
# 返回: {"status":"ok","service":"Algorithm Viz Backend"}

# 前端
curl http://localhost:4200
# 返回: HTML 页面内容

# 端到端测试
curl -X POST http://localhost:8080/api/algorithms/sort \
  -H "Content-Type: application/json" \
  -d '{"algorithm":"quick-sort","array":[64,34,25,12,22,11,90]}'
# 应返回包含 steps、stepCount 等字段的 JSON
```

---

## 6. 使用指南

### 6.1 首次使用

1. 浏览器打开 `http://localhost:4200`
2. 在认证页面注册账号（用户名 3-50 字符，密码至少 6 字符）
3. 登录后进入主界面

### 6.2 基本操作：运行算法

1. 在左侧边栏选择算法分类（排序/搜索/图/DP/回溯/分治/3D数据结构）
2. 点击具体算法名称（如"快速排序"）
3. 在 InputConfig 区域查看/编辑输入数据
4. 点击"▶ 运行"按钮
5. 观察可视化区域的变化

### 6.3 播放控制

| 控件 | 功能 |
|------|------|
| ◀◀ | 回到第一步 |
| ▶ | 前进一步 |
| ◀ | 后退一步 |
| ▶▶ | 自动播放（连续前进） |
| 速度选择器 | 调整播放速度（200ms / 500ms / 1000ms / 2000ms） |
| 进度条 | 点击跳转到任意步骤 |

### 6.4 教学阶段引导

算法运行后，ControlPanel 下方会显示教学阶段进度条：
- **已完成阶段**：绿色圆点 + ✓ 标记
- **当前阶段**：蓝色圆点 + 光晕高亮
- **未到达阶段**：灰色圆点 + 序号

底部显示当前阶段的中文名称，帮助理解"算法现在在做什么"。

### 6.5 对比模式

1. 选择一个算法（如"快速排序"）
2. 在侧边栏底部点击"⚖ 对比模式"开关
3. 在展开的对比算法列表中选择要对比的算法（如"归并排序"）
4. 点击 ControlPanel 中的"运行"按钮（此时按钮变为"运行对比"）
5. 界面分为左右两栏，同时展示两个算法的执行过程
6. 点击播放，两个可视化器同步推进
7. PhaseGuide 下方显示对比指标面板，绿色/红色标记表示优劣

**注意**：只能对比同一分类的算法（如排序类之间、图算法之间）。

### 6.6 输入数据编辑

点击 InputConfig 区域可编辑算法输入：

| 分类 | 可编辑内容 |
|------|-----------|
| 排序 | 数组元素（逗号分隔，如 `64,34,25,12,22,11,90`） |
| 搜索 | 有序数组 + 目标值 |
| 图 | 节点位置/标签 + 边和权重（文本编辑） |
| DP | 物品名称/重量/价值 + 背包容量 |
| 回溯 | 皇后数量 N（1-12） |
| 分治 | 两个乘数（大整数字符串，如 `12345678` × `87654321`） |
| 3D 结构 | 数据结构类型 + 元素值 |

### 6.7 评估测试

1. 点击顶部导航栏"📝 评估测试" Tab
2. 进入测试界面，顶部显示 5 个进度圆点，当前题目高亮
3. 阅读题目描述和输入参数
4. 在输入框中键入答案
5. 点击"✓ 提交答案"
6. 系统自动判分，显示正确/错误反馈和详细解析
7. 可使用"上一题"/"下一题"按钮或点击进度圆点导航
8. 完成全部 5 题后显示总分卡片和评价
9. 点击"重新测试"可重新作答

**5 道测试题概览**：

| # | 标题 | 分类 | 核心考察点 |
|---|------|------|-----------|
| 1 | 快速排序分区过程 | sorting | partition 操作的基准值归位后数组状态 |
| 2 | 归并排序合并过程 | sorting | 分治策略中第一次合并后的数组状态 |
| 3 | 二分查找过程分析 | search | mid 计算和边界收缩逻辑 |
| 4 | Dijkstra 最短路径 | graph | 贪心策略下的最短路径手动计算 |
| 5 | 0/1 背包 DP 计算 | dp | DP 状态转移和 dp[i][w] 值推算 |

### 6.8 AI 复杂度分析

1. 点击顶部导航栏"🤖 AI复杂度分析"按钮
2. 在弹出的对话框中粘贴算法代码
3. 选择编程语言和分析场景（最坏/平均/最好情况）
4. 点击"分析"
5. 等待 AI 返回结果（约 5-15 秒）
6. 查看分析结果：时间/空间复杂度、推理步骤、假设前提、优化建议、置信度

**注意**：需要配置 `ai.complexity.api-key`（并行智算云 API Key）才能使用此功能。

### 6.9 3D 数据结构可视化

1. 在侧边栏选择"3D数据结构"分类
2. 选择具体结构类型：数组、栈、队列、链表、二叉树、B+ 树
3. 点击"随机生成数据"可生成新的测试数据
4. 3D 渲染区域支持鼠标旋转和缩放

### 6.10 历史记录

1. 点击顶部导航栏"📋 历史记录" Tab
2. 查看所有历史运行记录（默认最近 20 条）
3. 使用分类下拉框筛选特定分类
4. 点击删除按钮移除单条记录

---

## 7. API 参考

### 7.1 算法执行端点

所有算法执行端点共享统一的**请求头**和**响应格式**。

#### POST /api/algorithms/sort

运行排序算法。

**请求体**：
```json
{
  "algorithm": "quick-sort",
  "array": [64, 34, 25, 12, 22, 11, 90]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| algorithm | string | 是 | quick-sort / merge-sort / bubble-sort / heap-sort / insertion-sort |
| array | number[] | 是 | 待排序数组 |

**响应**：
```json
{
  "steps": [
    {
      "array": [64, 34, 25, 12, 22, 11, 90],
      "comparing": [0, 6],
      "swapping": [],
      "sorted": [],
      "pivot": 6,
      "rangeLeft": 0,
      "rangeRight": 6,
      "description": "选择基准值 arr[6] = 90，开始分区 [0, 6]",
      "codeLine": 1,
      "comparisons": 0,
      "swaps": 0,
      "accesses": 1,
      "phase": "select_pivot"
    }
    // ... 更多步骤
  ],
  "stepCount": 45,
  "comparisons": 24,
  "extra": 12,
  "executionTimeMs": 8
}
```

#### POST /api/algorithms/search

运行搜索算法。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| algorithm | string | 是 | binary-search |
| array | number[] | 是 | 有序数组 |
| target | number | 是 | 目标值 |

#### POST /api/algorithms/graph

运行图算法。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| algorithm | string | 是 | dijkstra / bfs / dfs / prim / kruskal / astar |
| graph | GraphData | 是 | 图结构（节点列表 + 边列表 + 方向/权重标志） |
| startId | string | 否 | 起点节点 ID（Dijkstra/BFS/DFS/A\* 必填） |
| endId | string | 否 | 终点节点 ID（Dijkstra/BFS/DFS/A\* 必填） |

**GraphData 结构**：
```json
{
  "directed": false,
  "weighted": true,
  "nodes": [
    { "id": "A", "x": 150, "y": 80, "label": "A" },
    { "id": "B", "x": 300, "y": 50, "label": "B" }
  ],
  "edges": [
    { "from": "A", "to": "B", "weight": 4 }
  ]
}
```

#### POST /api/algorithms/dp

运行动态规划算法。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| algorithm | string | 是 | knapsack |
| items | KnapsackItem[] | 是 | 物品列表（name, weight, value） |
| capacity | number | 是 | 背包容量（>0） |

#### POST /api/algorithms/backtracking

运行回溯算法。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| algorithm | string | 是 | n-queens |
| n | number | 是 | 皇后数量（1-12） |

#### POST /api/algorithms/divide-conquer

运行分治算法。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| algorithm | string | 是 | karatsuba |
| x | string | 是 | 第一个乘数（数字字符串） |
| y | string | 是 | 第二个乘数（数字字符串） |

### 7.2 验证端点

#### POST /api/algorithms/verify-step

获取算法在指定步骤的状态数据（用于评估测试的自动判分）。

**请求体**：
```json
{
  "algorithm": "quick-sort",
  "params": { "array": [8, 3, 1, 6, 2, 5] },
  "targetStepIndex": 10
}
```

**响应**：
```json
{
  "algorithm": "quick-sort",
  "category": "sorting",
  "targetStepIndex": 10,
  "stepData": {
    "array": [3, 1, 2, 5, 8, 6],
    "comparing": [],
    "swapping": [],
    "sorted": [2],
    "pivot": 2,
    "phase": "pivot_placed"
  }
}
```

### 7.3 AI 分析端点

#### POST /api/algorithms/algorithm-complexity

使用 AI 分析算法复杂度。

**请求体**：
```json
{
  "code": "for (int i = 0; i < n; i++) { ... }",
  "language": "java",
  "caseType": "worst"
}
```

**响应**：
```json
{
  "timeComplexityWorst": "O(n²)",
  "timeComplexityAverage": "O(n log n)",
  "timeComplexityBest": "O(n)",
  "spaceComplexity": "O(1)",
  "reasoningSteps": ["外层循环 n 次...", "内层循环 n-1, n-2, ..."],
  "assumptions": ["假设输入数据随机分布"],
  "optimizationSuggestions": ["考虑使用堆排序优化..."],
  "confidence": 0.85
}
```

### 7.4 历史记录端点

#### GET /api/algorithms/history

获取运行历史。可选 `?category=sorting` 筛选。

**响应**：
```json
[
  {
    "id": 1,
    "category": "sorting",
    "algorithm": "quick-sort",
    "inputData": "{\"algorithm\":\"quick-sort\",\"array\":[64,34,...]}",
    "stepCount": 45,
    "comparisons": 24,
    "swaps": 12,
    "executionTimeMs": 8,
    "createdAt": "2026-06-06T10:30:00"
  }
]
```

#### DELETE /api/algorithms/history/{id}

删除单条历史记录。返回 204 No Content。

### 7.5 健康检查

#### GET /api/algorithms/health

```json
{ "status": "ok", "service": "Algorithm Viz Backend" }
```

### 7.6 认证端点

#### POST /api/auth/register

```json
// 请求
{ "username": "alice", "displayName": "Alice", "password": "123456" }

// 响应 (201 Created)
{ "id": 1, "username": "alice", "displayName": "Alice" }
```

#### POST /api/auth/login

```json
// 请求
{ "username": "alice", "password": "123456" }

// 响应 (200 OK)
{ "id": 1, "username": "alice", "displayName": "Alice" }
```

### 7.7 错误响应

所有端点遵循统一的错误格式：

| HTTP 状态码 | 场景 | 响应体示例 |
|------------|------|-----------|
| 400 Bad Request | 参数校验失败 | `{"error": "..."}` 或 Spring Validation 默认格式 |
| 401 Unauthorized | 登录失败 | `{"message": "用户名或密码不正确。"}` |
| 500 Internal Server Error | 服务端异常 | Spring Boot 默认错误格式 |

---

## 8. 数据库设计

### 8.1 数据库信息

```
数据库名：algorithm_viz
字符集：utf8mb4
排序规则：utf8mb4_unicode_ci
```

### 8.2 表结构

#### app_user — 用户表

```sql
CREATE TABLE app_user (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL,
    display_name  VARCHAR(80)  NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    password_salt VARCHAR(64)  NOT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_app_user_username UNIQUE (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 自增主键 |
| username | VARCHAR(50) | 登录用户名（唯一） |
| display_name | VARCHAR(80) | 显示名称 |
| password_hash | VARCHAR(128) | SHA-256(salt + ":" + password) 的 Hex 编码（64 字符） |
| password_salt | VARCHAR(64) | 随机盐值（16 字节 Hex 编码 = 32 字符） |
| created_at | DATETIME | 注册时间 |

#### run_history — 运行历史表

```sql
CREATE TABLE run_history (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    category          VARCHAR(50)   NOT NULL,
    algorithm         VARCHAR(50)   NOT NULL,
    input_data        TEXT,
    step_count        INT,
    comparisons       INT,
    swaps             INT,
    execution_time_ms BIGINT,
    created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 自增主键 |
| category | VARCHAR(50) | 算法分类（sorting/search/graph/dp/backtracking/divide-conquer） |
| algorithm | VARCHAR(50) | 具体算法名 |
| input_data | TEXT | 输入参数（JSON 格式） |
| step_count | INT | 步骤总数 |
| comparisons | INT | 比较次数 |
| swaps | INT | 操作次数（排序→交换，回溯→回溯次数等） |
| execution_time_ms | BIGINT | 后端计算耗时（毫秒） |
| created_at | DATETIME | 自动记录时间戳 |

### 8.3 索引

- `app_user.uk_app_user_username` — 唯一索引，加速登录查询
- `run_history` 表的 `category` 和 `created_at` 字段应建立复合索引以优化按分类查询历史（当前 JPA 默认无显式索引，建议生产环境添加）

---

## 9. 文件清单

### 9.1 后端文件（backend/src/main/java/com/algorithmviz/）

| 文件路径 | 职责 |
|---------|------|
| `AlgorithmVizApplication.java` | Spring Boot 应用入口 |
| `config/CorsConfig.java` | CORS 跨域配置（允许 localhost:4200） |
| `controller/AlgorithmController.java` | 核心控制器：6 个算法执行端点 + verify-step + history CRUD + health |
| `controller/AuthController.java` | 认证控制器：register + login |
| `service/SortingService.java` | 5 种排序算法步骤生成（quick/merge/bubble/heap/insertion） |
| `service/SearchService.java` | 二分查找步骤生成 |
| `service/GraphService.java` | 6 种图算法步骤生成（Dijkstra/BFS/DFS/Prim/Kruskal/A\*） |
| `service/DPService.java` | 0/1 背包 DP 步骤生成 |
| `service/BacktrackingService.java` | N 皇后回溯步骤生成 |
| `service/DivideConquerService.java` | Karatsuba 大整数乘法步骤生成 |
| `service/AlgorithmComplexityService.java` | AI 大模型复杂度分析服务 |
| `service/AuthService.java` | 用户认证服务（注册/登录 + SHA-256 加盐哈希） |
| `model/SortStep.java` | 排序步骤模型（含 Builder、phase） |
| `model/SearchStep.java` | 搜索步骤模型（含 Builder、phase） |
| `model/GraphStep.java` | 图步骤模型（含 Builder、phase） |
| `model/DPStep.java` | DP 步骤模型（含 Builder、phase） |
| `model/NQueensStep.java` | N 皇后步骤模型（含 Builder、phase） |
| `model/DivideConquerStep.java` | 分治步骤模型（含 Builder、phase、内嵌 TreeNode） |
| `model/AlgorithmComplexityAnalysis.java` | AI 分析结果模型（含 Builder） |
| `entity/RunHistory.java` | 运行历史 JPA 实体 |
| `entity/AppUser.java` | 用户 JPA 实体 |
| `dto/SortRequest.java` | 排序请求 DTO |
| `dto/SearchRequest.java` | 搜索请求 DTO |
| `dto/GraphRequest.java` | 图请求 DTO（内嵌 GraphData/GraphNodeDto/GraphEdgeDto） |
| `dto/DPRequest.java` | DP 请求 DTO（内嵌 KnapsackItemDto） |
| `dto/BacktrackingRequest.java` | 回溯请求 DTO |
| `dto/DivideConquerRequest.java` | 分治请求 DTO |
| `dto/AlgorithmComplexityRequest.java` | AI 分析请求 DTO |
| `dto/AuthRequest.java` | 登录请求 DTO |
| `dto/AuthResponse.java` | 认证响应 DTO |
| `dto/RegisterRequest.java` | 注册请求 DTO |
| `repository/RunHistoryRepository.java` | 运行历史 JPA Repository |
| `repository/AppUserRepository.java` | 用户 JPA Repository |

### 9.2 前端文件（frontend/src/app/）

| 文件路径 | 职责 |
|---------|------|
| `app.component.ts` | 根组件：Tab 导航、对比指标 computed、布局切换 |
| `app.component.html` | 根模板：header/main/sidebar 布局、三 Tab 内容区域 |
| `app.config.ts` | Angular 应用配置（HttpClient、路由） |
| `app.routes.ts` | 路由定义 |
| `store/algorithm.store.ts` | 核心状态管理：信号定义、算法运行、Phase 系统、对比模式、播放控制 |
| `store/auth.store.ts` | 认证状态管理 |
| `services/algorithm.service.ts` | 后端 API HTTP 客户端 |
| `services/auth.service.ts` | 认证 API HTTP 客户端 |
| `models/algorithm.models.ts` | TypeScript 类型定义（16 个接口 + 类型别名） |
| `data/test-scenarios.ts` | 5 道评估测试题数据 |
| `components/sidebar/sidebar.component.ts` | 侧边栏：算法选择列表、对比模式开关 |
| `components/control-panel/control-panel.component.ts` | 播放控制栏 |
| `components/input-config/input-config.component.ts` | 输入数据编辑面板 |
| `components/phase-guide/phase-guide.component.ts` | 教学阶段进度条 |
| `components/complexity-panel/complexity-panel.component.ts` | 复杂度信息卡片 |
| `components/history-panel/history-panel.component.ts` | 运行历史面板 |
| `components/assessment/assessment.component.ts` | 评估测试组件：答题/判分/导航/总分 |
| `components/auth/auth.component.ts` | 登录/注册表单 |
| `components/ai-complexity-dialog/ai-complexity-dialog.component.ts` | AI 复杂度分析弹窗 |
| `visualizers/sorting/sorting-visualizer.component.ts` | 排序可视化器（柱状图/Canvas） |
| `visualizers/graph/graph-visualizer.component.ts` | 图可视化器（SVG 节点/边） |
| `visualizers/search/search-visualizer.component.ts` | 搜索可视化器（数组高亮） |
| `visualizers/dp/dp-visualizer.component.ts` | DP 可视化器（二维表格） |
| `visualizers/n-queens/n-queens-visualizer.component.ts` | N 皇后可视化器（棋盘） |
| `visualizers/divide-conquer/divide-conquer-visualizer.component.ts` | 分治可视化器（递归树） |
| `visualizers/vr-3d/vr-3d-visualizer.component.ts` | 3D 可视化器容器组件 |
| `visualizers/vr-3d/renderers/three-object-factory.ts` | Three.js 3D 对象工厂 |
| `visualizers/vr-3d/renderers/array.renderer.ts` | 数组 3D 渲染器 |
| `visualizers/vr-3d/renderers/stack.renderer.ts` | 栈 3D 渲染器 |
| `visualizers/vr-3d/renderers/queue.renderer.ts` | 队列 3D 渲染器 |
| `visualizers/vr-3d/renderers/linked-list.renderer.ts` | 链表 3D 渲染器 |
| `visualizers/vr-3d/renderers/binary-tree.renderer.ts` | 二叉树 3D 渲染器 |
| `visualizers/vr-3d/renderers/b-plus-tree.renderer.ts` | B+ 树 3D 渲染器 |
| `visualizers/vr-3d/renderers/structure-renderer.types.ts` | 3D 渲染器类型定义 |
| `visualizers/vr-3d/animators/structure-animator.interface.ts` | 3D 动画器接口 |
| `visualizers/vr-3d/animators/b-plus-tree.animator.ts` | B+ 树动画器 |
| `visualizers/vr-3d/data/structure-info.ts` | 数据结构信息配置 |

### 9.3 配置文件

| 文件 | 说明 |
|------|------|
| `backend/pom.xml` | Maven 项目配置（Spring Boot 3.2.3, Java 17） |
| `backend/src/main/resources/application.properties` | Spring Boot 配置（数据源/JPA/Jackson/AI） |
| `frontend/package.json` | npm 依赖和脚本 |
| `frontend/angular.json` | Angular CLI 配置 |
| `frontend/tailwind.config.js` | Tailwind CSS 配置 |
| `frontend/src/environments/environment.ts` | 开发环境变量（apiUrl） |
| `frontend/src/styles.css` | 全局 Tailwind 样式入口 |
| `docs/learning-guidance-system.md` | 学习引导系统独立设计文档 |
| `CLAUDE.md` | Claude Code 项目指引文件 |

---

> **文档维护说明**：本文档描述项目截至 2026-06-06 的全貌。代码变更后请同步更新相关章节。
