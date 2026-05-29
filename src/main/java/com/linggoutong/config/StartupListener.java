package com.linggoutong.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * 启动监听器 - 输出服务信息
 */
@Slf4j
@Component
public class StartupListener {

    private final Environment environment;

    @Value("${server.port:8080}")
    private String port;

    @Value("${spring.datasource.url:}")
    private String datasourceUrl;

    @Value("${spring.datasource.username:}")
    private String datasourceUsername;

    @Value("${spring.data.redis.host:}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private String redisPort;

    @Value("${spring.data.redis.database:0}")
    private String redisDatabase;

    public StartupListener(Environment environment) {
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        String localUrl = "http://localhost:" + port;

        log.info("""

                ╔══════════════════════════════════════════════════════════════════╗
                ║                  领购通 App Server 启动成功！                    ║
                ╚══════════════════════════════════════════════════════════════════╝

                📦 服务信息：
                ├── 应用名称：{}
                ├── 端口：{}
                └── 访问地址：{}

                📚 API 文档：
                ├── Scalar UI：{}/api-docs
                └── OpenAPI JSON：{}/v3/api-docs

                💾 数据库配置：
                ├── MySQL 地址：{}
                └── MySQL 用户：{}

                🔴 Redis 配置：
                ├── Redis 地址：{}:{}
                └── Redis 数据库：{}

                ══════════════════════════════════════════════════════════════════
                """,
                environment.getProperty("spring.application.name", "linggoutong-app-server"),
                port,
                localUrl,
                localUrl,
                localUrl,
                datasourceUrl,
                datasourceUsername,
                redisHost,
                redisPort,
                redisDatabase
        );
    }
}
