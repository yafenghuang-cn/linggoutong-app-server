# 领购通 - App Server

多端统一后端服务，基于 NestJS + TypeORM + MySQL + Redis + JWT 构建。

## 技术栈

- **框架**: NestJS 11
- **语言**: TypeScript 5
- **数据库**: MySQL (TypeORM)
- **缓存**: Redis (ioredis)
- **认证**: JWT (多端隔离)
- **文档**: Swagger + Scalar UI

## 项目结构

```
src/
├── core/                        # 基础设施层（全局模块）
│   ├── auth/                    # JWT 多端认证
│   │   ├── auth.service.ts      # 签发/验证 Token
│   │   ├── auth.guard.ts        # 全局认证守卫
│   │   ├── auth.config.ts       # 各端 JWT 配置
│   │   ├── auth.interfaces.ts   # 接口定义
│   │   └── decorators/          # @Public() @AllowClients() @CurrentUser()
│   ├── redis/                   # Redis 服务
│   │   └── redis.service.ts     # 封装 get/set/del/exists
│   └── user/                    # 用户认证服务（三端共用）
│       ├── entity/user.entity.ts
│       └── user-auth.service.ts # 登录/注册/查询/退出
│
├── apps/                        # 业务端
│   ├── controller/              # APP 端控制器
│   ├── dto/                     # 入参校验
│   └── vo/                      # 出参序列化
│
├── common/                      # 公共层
│   ├── common-errors.ts         # 错误码定义
│   ├── enterprise-exceptions.ts # 业务异常类
│   └── request-context.middleware.ts
│
└── shared/                      # 全局拦截器
    ├── global-response.interceptor.ts   # 统一响应包装
    ├── http-exception.interceptor.ts    # 统一异常处理
    ├── request-logging.interceptor.ts   # 请求日志
    └── serialize.interceptor.ts         # @Serialize() 序列化
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制并修改 `.env` 文件：

```env
# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=linggoutong
DB_SYNCHRONIZE=true
DB_LOGGING=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=

# JWT（各端独立密钥，生产环境务必修改）
JWT_APP_SECRET=dev-app-secret-change-me
JWT_APP_EXPIRES=30d
JWT_ADMIN_SECRET=dev-admin-secret-change-me
JWT_ADMIN_EXPIRES=2h
JWT_MERCHANT_SECRET=dev-merchant-secret-change-me
JWT_MERCHANT_EXPIRES=7d
```

### 3. 启动服务

```bash
# 开发模式（热更新）
npm run start

# 生产构建
npm run build
```

服务默认运行在 `http://localhost:9000`

### 4. API 文档

启动后访问：`http://localhost:9000/api-docs`

## 多端认证架构

三端（APP / ADMIN / MERCHANT）共用同一套用户账号，但 JWT Token 互相隔离：

| 端 | AuthClient | 默认过期时间 | Redis Key |
|---|---|---|---|
| App 端 | `APP` | 30 天 | `auth:app:user:{userId}` |
| 后台管理 | `ADMIN` | 2 小时 | `auth:admin:user:{userId}` |
| 商户端 | `MERCHANT` | 7 天 | `auth:merchant:user:{userId}` |

**扩展新端**：在 `AuthClient` 枚举加一个值，在 `auth.config.ts` 加对应配置即可。

## 接口概览

### APP 端 (`/app/user`)

| 方法 | 路径 | 说明 | 认证 |
|---|---|---|---|
| POST | `/app/user/login` | 登录（账号密码/手机号密码/手机号验证码） | 公开 |
| POST | `/app/user/register` | 注册（用户名密码/手机号密码/手机号验证码） | 公开 |
| GET | `/app/user/info` | 查询用户信息（userId/username/phone） | 需要登录 |

登录成功后 Token 通过 `Authorization` 响应头返回：`Bearer <token>`

## 统一响应格式

**成功响应**：
```json
{
  "code": 0,
  "data": { ... },
  "message": "success"
}
```

**错误响应**：
```json
{
  "code": 1003,
  "data": null,
  "message": "未授权"
}
```

### 错误码

| 范围 | 类型 | 示例 |
|---|---|---|
| 1xxx | 参数错误 | 1001 参数无效、1003 未授权 |
| 2xxx | 数据错误 | 2001 数据已存在、2002 数据未找到 |
| 3xxx | 业务错误 | 3001 业务逻辑错误 |
| 9xxx | 系统错误 | 9000 内部服务器错误 |

## 安全设计

- 密码使用 bcrypt 哈希存储（salt rounds = 10）
- Token 存储在 Redis，支持服务端主动失效（踢人/改密后旧 Token 失效）
- 登录失败 >= 5 次自动锁定账号 30 分钟
- Token 通过响应头返回，不在响应 body 中暴露
- 登录失败计数使用原子递增，避免并发问题

## License

UNLICENSED
