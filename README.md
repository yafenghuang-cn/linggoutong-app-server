# LingGouTong App Server

基于 Java 21 + Spring Boot 3.2 的单体服务

## 环境要求

- Java 21
- Maven 3.8+

## 快速启动

```bash
# 编译项目
mvn clean install

# 运行项目
mvn spring-boot:run

# 或者打包后运行
mvn clean package
java -jar target/linggoutong-app-server-1.0.0-SNAPSHOT.jar
```

## 验证服务

服务启动后，访问健康检查接口：

```bash
curl http://localhost:8080/health
```

预期返回：
```json
{
  "status": "UP",
  "service": "linggoutong-app-server"
}
```

## 项目结构

```
src/main/java/com/linggoutong/
├── LingGouTongApplication.java    # 主启动类
└── controller/
    └── HealthController.java      # 健康检查接口

src/main/resources/
└── application.yml                # 配置文件
```
